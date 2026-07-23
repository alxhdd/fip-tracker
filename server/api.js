import crypto from 'node:crypto';
import { db } from './db.js';
import { requireAuth, providersEnabled, clearSession } from './auth.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Share codes: 6 chars, unambiguous alphabet (no 0/O/1/I).
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function genCode(len = 6) {
  const bytes = crypto.randomBytes(len);
  let s = '';
  for (let i = 0; i < len; i++) s += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return s;
}
function ensureShareCode(catId) {
  const row = db.prepare('SELECT share_code FROM cats WHERE id = ?').get(catId);
  if (row?.share_code) return row.share_code;
  for (let i = 0; i < 6; i++) {
    const code = genCode();
    try {
      db.prepare('UPDATE cats SET share_code = ? WHERE id = ?').run(code, catId);
      return code;
    } catch { /* unique collision — retry */ }
  }
  return null;
}

const CAT_FIELDS = [
  'name', 'sex', 'birth_date', 'breed', 'fip_type', 'phase',
  'treatment_start', 'treatment_days', 'observation_start', 'observation_days',
  'med_name', 'med_form', 'dose_mg_per_kg', 'med_concentration_mg_ml', 'notes',
];

const ENTRY_FIELDS = [
  'weight_g', 'temp_c', 'appetite', 'energy', 'interest_toys', 'interest_treats',
  'poop_count', 'poop_score', 'vomit_count', 'med_given', 'med_dose_mg', 'symptoms', 'notes',
];

// Access is by membership now, not sole ownership. Any member can view/edit a
// cat's data; owner-only actions (delete cat, manage members) pass { owner: true }.
function memberCat(req, res, { owner = false } = {}) {
  const cat = db.prepare('SELECT * FROM cats WHERE id = ?').get(Number(req.params.id));
  const m = cat && db.prepare('SELECT role FROM cat_members WHERE cat_id = ? AND user_id = ?').get(cat.id, req.user.id);
  if (!cat || !m) {
    res.status(404).json({ error: 'not_found' });
    return null;
  }
  if (owner && m.role !== 'owner') {
    res.status(403).json({ error: 'forbidden' });
    return null;
  }
  cat.role = m.role;
  return cat;
}
const ownCat = memberCat; // data routes below accept any member

function catPayload(catId) {
  const entries = db.prepare('SELECT * FROM entries WHERE cat_id = ? ORDER BY date ASC').all(catId);
  const bloodwork = db.prepare('SELECT * FROM bloodwork WHERE cat_id = ? ORDER BY date ASC').all(catId);
  return {
    entries: entries.map((e) => ({ ...e, symptoms: JSON.parse(e.symptoms || '[]') })),
    bloodwork: bloodwork.map((b) => ({ ...b, values: JSON.parse(b.values_json || '{}'), values_json: undefined })),
  };
}

function csvEscape(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function registerApiRoutes(app) {
  app.get('/api/me', (req, res) => {
    res.json({
      user: req.user
        ? {
            id: req.user.id, name: req.user.name, email: req.user.email, avatar_url: req.user.avatar_url,
            locale: req.user.locale, research_consent: req.user.research_consent ?? null,
          }
        : null,
      providers: providersEnabled(),
    });
  });

  app.patch('/api/me', requireAuth, (req, res) => {
    const { locale, research_consent } = req.body || {};
    if (locale && ['en', 'pl'].includes(locale)) {
      db.prepare('UPDATE users SET locale = ? WHERE id = ?').run(locale, req.user.id);
    }
    if (research_consent === 0 || research_consent === 1) {
      db.prepare("UPDATE users SET research_consent = ?, research_consent_at = datetime('now') WHERE id = ?").run(research_consent, req.user.id);
    }
    res.json({ ok: true });
  });

  // ---- Cats ----
  app.get('/api/cats', requireAuth, (req, res) => {
    const cats = db.prepare(`
      SELECT c.*, m.role AS role FROM cats c
      JOIN cat_members m ON m.cat_id = c.id AND m.user_id = ?
      ORDER BY c.created_at ASC`).all(req.user.id);
    for (const c of cats) {
      c.member_count = db.prepare('SELECT COUNT(*) AS n FROM cat_members WHERE cat_id = ?').get(c.id).n;
      if (c.role === 'owner') {
        if (!c.share_code) c.share_code = ensureShareCode(c.id);
        c.pending_count = db.prepare('SELECT COUNT(*) AS n FROM cat_join_requests WHERE cat_id = ?').get(c.id).n;
      } else {
        delete c.share_code; // only owners see the code
        c.pending_count = 0;
      }
    }
    res.json({ cats });
  });

  app.post('/api/cats', requireAuth, (req, res) => {
    const name = (req.body?.name || '').toString().trim().slice(0, 80);
    if (!name) return res.status(400).json({ error: 'name_required' });
    const info = db.prepare('INSERT INTO cats (user_id, name) VALUES (?, ?)').run(req.user.id, name);
    const cat = db.prepare('SELECT * FROM cats WHERE id = ?').get(info.lastInsertRowid);
    db.prepare('INSERT INTO cat_members (cat_id, user_id, role) VALUES (?, ?, ?)').run(cat.id, req.user.id, 'owner');
    ensureShareCode(cat.id);
    // Apply any other provided fields via the same path as PATCH.
    const sets = [];
    const vals = [];
    for (const f of CAT_FIELDS) {
      if (f !== 'name' && f in (req.body || {})) {
        sets.push(`${f} = ?`);
        vals.push(req.body[f] === '' ? null : req.body[f]);
      }
    }
    if (sets.length) {
      db.prepare(`UPDATE cats SET ${sets.join(', ')} WHERE id = ?`).run(...vals, cat.id);
    }
    res.json({ cat: db.prepare('SELECT * FROM cats WHERE id = ?').get(cat.id) });
  });

  app.patch('/api/cats/:id', requireAuth, (req, res) => {
    const cat = ownCat(req, res);
    if (!cat) return;
    const sets = [];
    const vals = [];
    for (const f of CAT_FIELDS) {
      if (f in (req.body || {})) {
        sets.push(`${f} = ?`);
        vals.push(req.body[f] === '' ? null : req.body[f]);
      }
    }
    if (sets.length) db.prepare(`UPDATE cats SET ${sets.join(', ')} WHERE id = ?`).run(...vals, cat.id);
    res.json({ cat: db.prepare('SELECT * FROM cats WHERE id = ?').get(cat.id) });
  });

  app.delete('/api/cats/:id', requireAuth, (req, res) => {
    const cat = memberCat(req, res, { owner: true });
    if (!cat) return;
    db.prepare('DELETE FROM cats WHERE id = ?').run(cat.id);
    res.json({ ok: true });
  });

  // ---- Daily entries ----
  app.get('/api/cats/:id/entries', requireAuth, (req, res) => {
    const cat = ownCat(req, res);
    if (!cat) return;
    res.json(catPayload(cat.id));
  });

  app.put('/api/cats/:id/entries/:date', requireAuth, (req, res) => {
    const cat = ownCat(req, res);
    if (!cat) return;
    const date = req.params.date;
    if (!DATE_RE.test(date)) return res.status(400).json({ error: 'bad_date' });
    const body = req.body || {};
    const cols = ['cat_id', 'date'];
    const vals = [cat.id, date];
    for (const f of ENTRY_FIELDS) {
      cols.push(f);
      let v = f in body ? body[f] : null;
      if (v === '' || v === undefined) v = null;
      if (f === 'symptoms') v = JSON.stringify(Array.isArray(v) ? v : []);
      if (f === 'med_given' && v !== null) v = v ? 1 : 0;
      vals.push(v);
    }
    const placeholders = cols.map(() => '?').join(', ');
    const updates = ENTRY_FIELDS.map((f) => `${f} = excluded.${f}`).join(', ');
    db.prepare(
      `INSERT INTO entries (${cols.join(', ')}) VALUES (${placeholders})
       ON CONFLICT (cat_id, date) DO UPDATE SET ${updates}, updated_at = datetime('now')`
    ).run(...vals);
    const entry = db.prepare('SELECT * FROM entries WHERE cat_id = ? AND date = ?').get(cat.id, date);
    res.json({ entry: { ...entry, symptoms: JSON.parse(entry.symptoms || '[]') } });
  });

  app.delete('/api/cats/:id/entries/:date', requireAuth, (req, res) => {
    const cat = ownCat(req, res);
    if (!cat) return;
    db.prepare('DELETE FROM entries WHERE cat_id = ? AND date = ?').run(cat.id, req.params.date);
    res.json({ ok: true });
  });

  // ---- Bloodwork ----
  app.post('/api/cats/:id/bloodwork', requireAuth, (req, res) => {
    const cat = ownCat(req, res);
    if (!cat) return;
    const { date, values, notes } = req.body || {};
    if (!DATE_RE.test(date || '')) return res.status(400).json({ error: 'bad_date' });
    const info = db
      .prepare('INSERT INTO bloodwork (cat_id, date, values_json, notes) VALUES (?, ?, ?, ?)')
      .run(cat.id, date, JSON.stringify(values || {}), notes || null);
    res.json({ id: info.lastInsertRowid });
  });

  app.patch('/api/cats/:id/bloodwork/:bwId', requireAuth, (req, res) => {
    const cat = ownCat(req, res);
    if (!cat) return;
    const bw = db.prepare('SELECT * FROM bloodwork WHERE id = ? AND cat_id = ?').get(Number(req.params.bwId), cat.id);
    if (!bw) return res.status(404).json({ error: 'not_found' });
    const { date, values, notes } = req.body || {};
    db.prepare('UPDATE bloodwork SET date = ?, values_json = ?, notes = ? WHERE id = ?').run(
      DATE_RE.test(date || '') ? date : bw.date,
      JSON.stringify(values ?? JSON.parse(bw.values_json)),
      notes ?? bw.notes,
      bw.id
    );
    res.json({ ok: true });
  });

  app.delete('/api/cats/:id/bloodwork/:bwId', requireAuth, (req, res) => {
    const cat = ownCat(req, res);
    if (!cat) return;
    db.prepare('DELETE FROM bloodwork WHERE id = ? AND cat_id = ?').run(Number(req.params.bwId), cat.id);
    res.json({ ok: true });
  });

  // ---- Sharing (read-only public link) ----
  app.post('/api/cats/:id/share', requireAuth, (req, res) => {
    const cat = ownCat(req, res);
    if (!cat) return;
    let share = db.prepare('SELECT * FROM shares WHERE cat_id = ?').get(cat.id);
    if (!share) {
      const token = crypto.randomBytes(16).toString('base64url');
      db.prepare('INSERT INTO shares (token, cat_id) VALUES (?, ?)').run(token, cat.id);
      share = { token };
    }
    res.json({ token: share.token });
  });

  app.delete('/api/cats/:id/share', requireAuth, (req, res) => {
    const cat = ownCat(req, res);
    if (!cat) return;
    db.prepare('DELETE FROM shares WHERE cat_id = ?').run(cat.id);
    res.json({ ok: true });
  });

  app.get('/api/share/:token', (req, res) => {
    const share = db.prepare('SELECT * FROM shares WHERE token = ?').get(req.params.token);
    if (!share) return res.status(404).json({ error: 'not_found' });
    const cat = db.prepare('SELECT * FROM cats WHERE id = ?').get(share.cat_id);
    delete cat.share_code; // never expose the join code on a public link
    res.json({ cat, ...catPayload(cat.id) });
  });

  // ---- Account deletion ----
  app.delete('/api/me', requireAuth, (req, res) => {
    // Deleting the user cascades to cats they created (cats.user_id ON DELETE
    // CASCADE) and to their memberships in other people's cats.
    db.prepare('DELETE FROM users WHERE id = ?').run(req.user.id);
    clearSession(res);
    res.json({ ok: true });
  });

  // ---- Shared ownership: join by code, members, requests ----
  app.post('/api/join', requireAuth, (req, res) => {
    const code = (req.body?.code || '').toString().trim().toUpperCase();
    if (!code) return res.status(400).json({ error: 'code_required' });
    const cat = db.prepare('SELECT * FROM cats WHERE share_code = ?').get(code);
    if (!cat) return res.status(404).json({ error: 'invalid_code' });
    if (db.prepare('SELECT 1 FROM cat_members WHERE cat_id = ? AND user_id = ?').get(cat.id, req.user.id))
      return res.status(409).json({ error: 'already_member' });
    try {
      db.prepare('INSERT INTO cat_join_requests (cat_id, user_id) VALUES (?, ?)').run(cat.id, req.user.id);
    } catch {
      return res.status(409).json({ error: 'already_requested', cat_name: cat.name });
    }
    res.json({ ok: true, cat_name: cat.name });
  });

  // Pending join requests for cats the current user OWNS (surfaced on the dashboard).
  app.get('/api/requests', requireAuth, (req, res) => {
    const requests = db.prepare(`
      SELECT r.id, r.cat_id, c.name AS cat_name, u.name AS user_name, u.email AS user_email, u.avatar_url
      FROM cat_join_requests r
      JOIN cat_members m ON m.cat_id = r.cat_id AND m.user_id = ? AND m.role = 'owner'
      JOIN cats c ON c.id = r.cat_id
      JOIN users u ON u.id = r.user_id
      ORDER BY r.created_at ASC`).all(req.user.id);
    res.json({ requests });
  });

  app.post('/api/requests/:id/:action', requireAuth, (req, res) => {
    const action = req.params.action;
    if (action !== 'approve' && action !== 'deny') return res.status(400).json({ error: 'bad_action' });
    const r = db.prepare('SELECT * FROM cat_join_requests WHERE id = ?').get(Number(req.params.id));
    if (!r) return res.status(404).json({ error: 'not_found' });
    const isOwner = db.prepare("SELECT 1 FROM cat_members WHERE cat_id = ? AND user_id = ? AND role = 'owner'").get(r.cat_id, req.user.id);
    if (!isOwner) return res.status(403).json({ error: 'forbidden' });
    if (action === 'approve') {
      db.prepare('INSERT OR IGNORE INTO cat_members (cat_id, user_id, role) VALUES (?, ?, ?)').run(r.cat_id, r.user_id, 'member');
    }
    db.prepare('DELETE FROM cat_join_requests WHERE id = ?').run(r.id);
    res.json({ ok: true });
  });

  // Members of a cat (+ pending requests & share code for the owner).
  app.get('/api/cats/:id/members', requireAuth, (req, res) => {
    const cat = memberCat(req, res);
    if (!cat) return;
    const members = db.prepare(`
      SELECT m.user_id, m.role, u.name, u.email, u.avatar_url
      FROM cat_members m JOIN users u ON u.id = m.user_id
      WHERE m.cat_id = ? ORDER BY m.role = 'owner' DESC, m.created_at ASC`).all(cat.id);
    const requests = cat.role === 'owner'
      ? db.prepare(`SELECT r.id, u.name AS user_name, u.email AS user_email, u.avatar_url
                    FROM cat_join_requests r JOIN users u ON u.id = r.user_id
                    WHERE r.cat_id = ? ORDER BY r.created_at ASC`).all(cat.id)
      : [];
    res.json({
      members,
      requests,
      share_code: cat.role === 'owner' ? ensureShareCode(cat.id) : null,
      my_role: cat.role,
      my_user_id: req.user.id,
    });
  });

  app.delete('/api/cats/:id/members/:userId', requireAuth, (req, res) => {
    const cat = memberCat(req, res, { owner: true });
    if (!cat) return;
    const target = Number(req.params.userId);
    const trow = db.prepare('SELECT role FROM cat_members WHERE cat_id = ? AND user_id = ?').get(cat.id, target);
    if (!trow) return res.status(404).json({ error: 'not_found' });
    if (trow.role === 'owner') return res.status(400).json({ error: 'cannot_remove_owner' });
    db.prepare('DELETE FROM cat_members WHERE cat_id = ? AND user_id = ?').run(cat.id, target);
    res.json({ ok: true });
  });

  app.post('/api/cats/:id/leave', requireAuth, (req, res) => {
    const cat = memberCat(req, res);
    if (!cat) return;
    if (cat.role === 'owner') return res.status(400).json({ error: 'owner_cannot_leave' });
    db.prepare('DELETE FROM cat_members WHERE cat_id = ? AND user_id = ?').run(cat.id, req.user.id);
    res.json({ ok: true });
  });

  // ---- CSV export ----
  app.get('/api/cats/:id/export/entries.csv', requireAuth, (req, res) => {
    const cat = ownCat(req, res);
    if (!cat) return;
    const { entries } = catPayload(cat.id);
    const header = ['date', ...ENTRY_FIELDS];
    const rows = entries.map((e) =>
      header.map((f) => csvEscape(f === 'symptoms' ? e.symptoms.join('; ') : e[f])).join(',')
    );
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${cat.name}-entries.csv"`);
    res.send([header.join(','), ...rows].join('\n'));
  });

  app.get('/api/cats/:id/export/bloodwork.csv', requireAuth, (req, res) => {
    const cat = ownCat(req, res);
    if (!cat) return;
    const { bloodwork } = catPayload(cat.id);
    const markers = [...new Set(bloodwork.flatMap((b) => Object.keys(b.values)))];
    const header = ['date', ...markers, 'notes'];
    const rows = bloodwork.map((b) => [csvEscape(b.date), ...markers.map((m) => csvEscape(b.values[m])), csvEscape(b.notes)].join(','));
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${cat.name}-bloodwork.csv"`);
    res.send([header.join(','), ...rows].join('\n'));
  });
}
