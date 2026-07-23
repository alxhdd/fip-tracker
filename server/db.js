import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

// Thin shim over node:sqlite so the rest of the app reads like better-sqlite3.
const raw = new DatabaseSync(path.join(DATA_DIR, 'fip-tracker.db'));
export const db = {
  prepare: (sql) => raw.prepare(sql),
  exec: (sql) => raw.exec(sql),
  // pragma('user_version', {simple:true}) → value; pragma('foreign_keys = ON') → set.
  pragma(str, opts) {
    if (str.includes('=')) return raw.exec(`PRAGMA ${str}`);
    const row = raw.prepare(`PRAGMA ${str}`).get();
    const val = row ? Object.values(row)[0] : undefined;
    return opts?.simple ? val : row;
  },
  transaction(fn) {
    return (...args) => {
      raw.exec('BEGIN');
      try {
        const r = fn(...args);
        raw.exec('COMMIT');
        return r;
      } catch (e) {
        raw.exec('ROLLBACK');
        throw e;
      }
    };
  },
};
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const MIGRATIONS = [
  // v1 — initial schema
  `
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    email TEXT,
    name TEXT,
    avatar_url TEXT,
    locale TEXT DEFAULT 'en',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (provider, provider_id)
  );

  CREATE TABLE cats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sex TEXT,                       -- 'male' | 'female'
    birth_date TEXT,                -- YYYY-MM-DD
    fip_type TEXT DEFAULT 'unknown',-- unknown | wet | dry | ocular | neuro | mixed
    phase TEXT DEFAULT 'monitoring',-- monitoring | treatment | observation | recovered | memorial
    treatment_start TEXT,           -- YYYY-MM-DD
    treatment_days INTEGER DEFAULT 84,
    observation_start TEXT,         -- YYYY-MM-DD (usually treatment end)
    observation_days INTEGER DEFAULT 84,
    med_name TEXT,
    med_form TEXT,                  -- injection | oral
    dose_mg_per_kg REAL,
    med_concentration_mg_ml REAL,   -- for injections: mg per ml
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cat_id INTEGER NOT NULL REFERENCES cats(id) ON DELETE CASCADE,
    date TEXT NOT NULL,             -- YYYY-MM-DD, local date chosen by user
    weight_g INTEGER,
    temp_c REAL,
    appetite INTEGER,               -- 0..5
    energy INTEGER,                 -- 0..5
    interest_toys INTEGER,          -- 0..5
    interest_treats INTEGER,        -- 0..5
    poop_count INTEGER,
    poop_score INTEGER,             -- 1..7 (1 hard … 7 liquid), 4 ideal-ish
    vomit_count INTEGER,
    med_given INTEGER,              -- 0/1
    med_dose_mg REAL,
    symptoms TEXT,                  -- JSON array of symptom keys
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (cat_id, date)
  );

  CREATE TABLE bloodwork (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cat_id INTEGER NOT NULL REFERENCES cats(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    values_json TEXT NOT NULL DEFAULT '{}',  -- {marker_id: number}
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE shares (
    token TEXT PRIMARY KEY,
    cat_id INTEGER NOT NULL REFERENCES cats(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX idx_entries_cat_date ON entries(cat_id, date);
  CREATE INDEX idx_bloodwork_cat_date ON bloodwork(cat_id, date);
  CREATE INDEX idx_cats_user ON cats(user_id);
  `,
  // v2 — optional consent to use anonymised data for FIP research.
  // NULL = not yet decided, 0 = declined, 1 = consented.
  `
  ALTER TABLE users ADD COLUMN research_consent INTEGER;
  ALTER TABLE users ADD COLUMN research_consent_at TEXT;
  `,
  // v3 — cat breed (free text).
  `
  ALTER TABLE cats ADD COLUMN breed TEXT;
  `,
  // v4 — shared cat ownership: members, join requests, per-cat share code.
  `
  CREATE TABLE cat_members (
    cat_id INTEGER NOT NULL REFERENCES cats(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',   -- 'owner' | 'member'
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (cat_id, user_id)
  );
  INSERT INTO cat_members (cat_id, user_id, role) SELECT id, user_id, 'owner' FROM cats;

  CREATE TABLE cat_join_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cat_id INTEGER NOT NULL REFERENCES cats(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (cat_id, user_id)
  );

  ALTER TABLE cats ADD COLUMN share_code TEXT;
  CREATE INDEX idx_members_user ON cat_members(user_id);
  CREATE UNIQUE INDEX idx_cats_share_code ON cats(share_code) WHERE share_code IS NOT NULL;
  `,
];

function migrate() {
  const current = db.pragma('user_version', { simple: true });
  for (let v = current; v < MIGRATIONS.length; v++) {
    db.transaction(() => {
      db.exec(MIGRATIONS[v]);
      db.pragma(`user_version = ${v + 1}`);
    })();
  }
}
migrate();

export { DATA_DIR };
