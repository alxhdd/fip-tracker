import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Cat, type JoinRequest } from '../api';
import { useI18n, type TKey } from '../i18n';
import { Modal, PhaseBadge, Field, BreedInput } from '../components/ui';
import { ConsentBanner } from '../components/AccountModal';
import { FIP_TYPES, PHASES } from '../fipConfig';

export function CatsList() {
  const { t } = useI18n();
  const [cats, setCats] = useState<Cat[] | null>(null);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [editing, setEditing] = useState<Cat | 'new' | null>(null);
  const [joining, setJoining] = useState(false);

  const load = () => {
    api.cats().then((r) => setCats(r.cats));
    api.requests().then((r) => setRequests(r.requests)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const respond = async (id: number, action: 'approve' | 'deny') => {
    await api.respondRequest(id, action);
    load();
  };

  return (
    <div style={{ paddingTop: 22 }}>
      <ConsentBanner />

      {requests.length > 0 && (
        <div className="card" style={{ marginBottom: 16, borderColor: 'color-mix(in srgb, var(--accent) 40%, transparent)' }}>
          <h3 style={{ marginTop: 0 }}>🐾 {t('pending_requests')}</h3>
          {requests.map((r) => (
            <div key={r.id} className="row" style={{ gap: 8, padding: '6px 0', borderTop: '1px solid var(--grid)' }}>
              {r.avatar_url && <img className="avatar" src={r.avatar_url} alt="" />}
              <span className="small">
                <strong>{r.user_name || r.user_email}</strong> {t('wants_to_join')} <strong>{r.cat_name}</strong>
              </span>
              <span className="right row" style={{ gap: 6 }}>
                <button className="btn-primary btn-sm" onClick={() => respond(r.id, 'approve')}>{t('approve')}</button>
                <button className="btn-sm" onClick={() => respond(r.id, 'deny')}>{t('deny')}</button>
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="row" style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>{t('my_cats')}</h1>
        <span className="right row" style={{ gap: 8 }}>
          <button className="btn-sm" onClick={() => setJoining(true)}>{t('join_cat')}</button>
          <button className="btn-primary" onClick={() => setEditing('new')}>+ {t('add_cat')}</button>
        </span>
      </div>

      {cats && cats.length === 0 && (
        <div className="card empty-state">
          <div className="icon">🐾</div>
          <h2>{t('no_cats_title')}</h2>
          <p>{t('no_cats_body')}</p>
          <div className="row" style={{ justifyContent: 'center', gap: 8 }}>
            <button className="btn-primary" onClick={() => setEditing('new')}>+ {t('add_cat')}</button>
            <button onClick={() => setJoining(true)}>{t('join_cat')}</button>
          </div>
        </div>
      )}

      <div className="grid grid-2">
        {cats?.map((cat) => <CatCard key={cat.id} cat={cat} />)}
      </div>

      {editing && (
        <CatForm
          cat={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
      {joining && <JoinModal onClose={() => setJoining(false)} onDone={() => { setJoining(false); load(); }} />}
    </div>
  );
}

function CatCard({ cat }: { cat: Cat }) {
  const { t } = useI18n();
  const shared = (cat.member_count ?? 1) > 1 || cat.role === 'member';
  return (
    <Link to={`/cat/${cat.id}`} className="card" style={{ display: 'block', color: 'inherit' }}>
      <div className="row">
        <h2 style={{ margin: 0 }}>{cat.name}</h2>
        <span className="right row" style={{ gap: 6 }}>
          {cat.pending_count ? <span className="badge" style={{ color: 'var(--accent)' }}><span className="dot" />{cat.pending_count}</span> : null}
          {shared && <span className="badge badge-observation" title={t('members_n', { n: cat.member_count ?? 2 })}>👥 {t('badge_shared')}</span>}
          <PhaseBadge phase={cat.phase} />
        </span>
      </div>
      <p className="small muted" style={{ marginTop: 6, marginBottom: 0 }}>
        {cat.breed ? `${cat.breed} · ` : ''}
        {t(`fip_${cat.fip_type}` as TKey)}
        {cat.med_name ? ` · ${cat.med_name}` : ''}
      </p>
    </Link>
  );
}

function JoinModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { t } = useI18n();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async () => {
    setBusy(true); setMsg(null);
    try {
      const r = await api.joinCat(code.trim());
      setMsg({ ok: true, text: t('join_sent', { name: r.cat_name }) });
      setTimeout(onDone, 1600);
    } catch (e: any) {
      const key = { invalid_code: 'err_invalid_code', already_member: 'err_already_member', already_requested: 'err_already_requested' }[e.message as string] || 'err_invalid_code';
      setMsg({ ok: false, text: t(key as TKey) });
    } finally { setBusy(false); }
  };

  return (
    <Modal title={t('join_title')} onClose={onClose}>
      <p className="small muted">{t('join_body')}</p>
      <Field label={t('share_code_label')}>
        <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder={t('share_code_ph')}
          style={{ letterSpacing: '0.15em', fontWeight: 600 }} maxLength={8} autoFocus onKeyDown={(e) => e.key === 'Enter' && submit()} />
      </Field>
      {msg && <p className={`small ${msg.ok ? 'delta-up' : 'fever-flag'}`} style={{ marginTop: 8 }}>{msg.text}</p>}
      <div className="row" style={{ marginTop: 16 }}>
        <button className="btn-ghost" onClick={onClose}>{t('cancel')}</button>
        <button className="btn-primary right" onClick={submit} disabled={busy || !code.trim()}>{t('join_send')}</button>
      </div>
    </Modal>
  );
}

export function CatForm({ cat, onClose, onSaved }: { cat: Cat | null; onClose: () => void; onSaved: (c: Cat) => void }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: cat?.name ?? '',
    sex: cat?.sex ?? '',
    birth_date: cat?.birth_date ?? '',
    breed: cat?.breed ?? '',
    fip_type: cat?.fip_type ?? 'unknown',
    phase: cat?.phase ?? 'monitoring',
  });
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name.trim()) return;
    setBusy(true);
    try {
      const res = cat ? await api.updateCat(cat.id, form as any) : await api.createCat(form as any);
      onSaved(res.cat);
    } finally { setBusy(false); }
  };

  return (
    <Modal title={cat ? t('edit') : t('new_cat')} onClose={onClose}>
      <div className="grid" style={{ gap: 12 }}>
        <Field label={t('cat_name')}>
          <input value={form.name} onChange={(e) => set('name', e.target.value)} autoFocus />
        </Field>
        <Field label={t('breed')}>
          <BreedInput value={form.breed} onChange={(v) => set('breed', v)} />
        </Field>
        <div className="field-row">
          <Field label={t('cat_sex')}>
            <select value={form.sex} onChange={(e) => set('sex', e.target.value)}>
              <option value="">—</option>
              <option value="male">{t('sex_male')}</option>
              <option value="female">{t('sex_female')}</option>
            </select>
          </Field>
          <Field label={t('birth_date')}>
            <input type="date" value={form.birth_date} onChange={(e) => set('birth_date', e.target.value)} />
          </Field>
        </div>
        <div className="field-row">
          <Field label={t('fip_form_label')}>
            <select value={form.fip_type} onChange={(e) => set('fip_type', e.target.value)}>
              {FIP_TYPES.map((x) => <option key={x} value={x}>{t(`fip_${x}` as TKey)}</option>)}
            </select>
          </Field>
          <Field label={t('phase_label')}>
            <select value={form.phase} onChange={(e) => set('phase', e.target.value)}>
              {PHASES.map((x) => <option key={x} value={x}>{t(`phase_${x}` as TKey)}</option>)}
            </select>
          </Field>
        </div>
      </div>
      <div className="row" style={{ marginTop: 18 }}>
        <button className="btn-ghost" onClick={onClose}>{t('cancel')}</button>
        <button className="btn-primary right" onClick={submit} disabled={busy || !form.name.trim()}>{t('save')}</button>
      </div>
    </Modal>
  );
}
