import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { db, DATA_DIR } from './db.js';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const SESSION_DAYS = 30;

// A stable secret means sessions survive restarts. Prefer env; otherwise
// generate once and keep it next to the database.
function getSecret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  const file = path.join(DATA_DIR, '.session-secret');
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, crypto.randomBytes(32).toString('hex'), { mode: 0o600 });
  }
  return fs.readFileSync(file, 'utf8').trim();
}
const SECRET = getSecret();

const b64u = (buf) => Buffer.from(buf).toString('base64url');
const sign = (payload) => crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');

export function createSessionToken(userId) {
  const payload = b64u(JSON.stringify({ uid: userId, exp: Date.now() + SESSION_DAYS * 86400_000 }));
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token) {
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (typeof data.uid !== 'number' || Date.now() > data.exp) return null;
    return data.uid;
  } catch {
    return null;
  }
}

function parseCookies(req) {
  const out = {};
  for (const part of (req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

const secureCookies = BASE_URL.startsWith('https://');

function setCookie(res, name, value, maxAgeSec) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSec}`,
  ];
  if (secureCookies) parts.push('Secure');
  res.append('Set-Cookie', parts.join('; '));
}

export function sessionMiddleware(req, res, next) {
  const uid = verifySessionToken(parseCookies(req).fip_session);
  req.user = uid ? db.prepare('SELECT * FROM users WHERE id = ?').get(uid) ?? null : null;
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  next();
}

export function clearSession(res) {
  setCookie(res, 'fip_session', '', 0);
}

function loginUser(res, { provider, providerId, email, name, avatarUrl }) {
  let user = db.prepare('SELECT * FROM users WHERE provider = ? AND provider_id = ?').get(provider, providerId);
  if (!user) {
    const info = db
      .prepare('INSERT INTO users (provider, provider_id, email, name, avatar_url) VALUES (?, ?, ?, ?, ?)')
      .run(provider, providerId, email ?? null, name ?? null, avatarUrl ?? null);
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
  } else {
    db.prepare('UPDATE users SET email = COALESCE(?, email), name = COALESCE(?, name), avatar_url = COALESCE(?, avatar_url) WHERE id = ?')
      .run(email ?? null, name ?? null, avatarUrl ?? null, user.id);
  }
  setCookie(res, 'fip_session', createSessionToken(user.id), SESSION_DAYS * 86400);
  return user;
}

export const providersEnabled = () => ({
  google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  facebook: Boolean(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET),
  dev: process.env.ALLOW_DEV_LOGIN === '1',
});

export function registerAuthRoutes(app) {
  // ---- Google ----
  app.get('/auth/google', (req, res) => {
    if (!providersEnabled().google) return res.status(404).send('Google login not configured');
    const state = crypto.randomBytes(16).toString('hex');
    setCookie(res, 'oauth_state', state, 600);
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.search = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: `${BASE_URL}/auth/google/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      state,
    }).toString();
    res.redirect(url.toString());
  });

  app.get('/auth/google/callback', async (req, res) => {
    try {
      const { code, state } = req.query;
      if (!code || state !== parseCookies(req).oauth_state) return res.status(400).send('Invalid OAuth state');
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: `${BASE_URL}/auth/google/callback`,
          grant_type: 'authorization_code',
        }),
      });
      const tokens = await tokenRes.json();
      if (!tokens.access_token) throw new Error('No access token from Google');
      const infoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const info = await infoRes.json();
      loginUser(res, {
        provider: 'google',
        providerId: info.sub,
        email: info.email,
        name: info.name,
        avatarUrl: info.picture,
      });
      res.redirect('/');
    } catch (err) {
      console.error('Google OAuth error:', err);
      res.status(500).send('Login failed. Please try again.');
    }
  });

  // ---- Facebook ----
  app.get('/auth/facebook', (req, res) => {
    if (!providersEnabled().facebook) return res.status(404).send('Facebook login not configured');
    const state = crypto.randomBytes(16).toString('hex');
    setCookie(res, 'oauth_state', state, 600);
    const url = new URL('https://www.facebook.com/v19.0/dialog/oauth');
    url.search = new URLSearchParams({
      client_id: process.env.FACEBOOK_CLIENT_ID,
      redirect_uri: `${BASE_URL}/auth/facebook/callback`,
      scope: 'email,public_profile',
      state,
    }).toString();
    res.redirect(url.toString());
  });

  app.get('/auth/facebook/callback', async (req, res) => {
    try {
      const { code, state } = req.query;
      if (!code || state !== parseCookies(req).oauth_state) return res.status(400).send('Invalid OAuth state');
      const tokenUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token');
      tokenUrl.search = new URLSearchParams({
        client_id: process.env.FACEBOOK_CLIENT_ID,
        client_secret: process.env.FACEBOOK_CLIENT_SECRET,
        redirect_uri: `${BASE_URL}/auth/facebook/callback`,
        code,
      }).toString();
      const tokens = await (await fetch(tokenUrl)).json();
      if (!tokens.access_token) throw new Error('No access token from Facebook');
      const infoUrl = new URL('https://graph.facebook.com/me');
      infoUrl.search = new URLSearchParams({
        fields: 'id,name,email,picture.width(200)',
        access_token: tokens.access_token,
      }).toString();
      const info = await (await fetch(infoUrl)).json();
      loginUser(res, {
        provider: 'facebook',
        providerId: info.id,
        email: info.email,
        name: info.name,
        avatarUrl: info.picture?.data?.url,
      });
      res.redirect('/');
    } catch (err) {
      console.error('Facebook OAuth error:', err);
      res.status(500).send('Login failed. Please try again.');
    }
  });

  // ---- Dev login (local testing before OAuth is configured) ----
  app.post('/auth/dev', (req, res) => {
    if (!providersEnabled().dev) return res.status(404).json({ error: 'not_enabled' });
    const name = (req.body?.name || 'Dev User').toString().slice(0, 80);
    const user = loginUser(res, { provider: 'dev', providerId: name.toLowerCase(), name });
    res.json({ user });
  });

  app.post('/auth/logout', (req, res) => {
    setCookie(res, 'fip_session', '', 0);
    res.json({ ok: true });
  });
}
