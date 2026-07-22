import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Cat } from '../api';
import { useI18n, type TKey } from '../i18n';
import { Modal, PhaseBadge, Field, BreedInput } from '../components/ui';
import { ConsentBanner } from '../components/AccountModal';
import { FIP_TYPES, PHASES } from '../fipConfig';

export function CatsList() {
  const { t } = useI18n();
  const [cats, setCats] = useState<Cat[] | null>(null);
  const [editing, setEditing] = useState<Cat | 'new' | null>(null);

  const load = () => api.cats().then((r) => setCats(r.cats));
  useEffect(() => { load(); }, []);

  return (
    <div style={{ paddingTop: 22 }}>
      <ConsentBanner />
      <div className="row" style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>{t('my_cats')}</h1>
        <button className="btn-primary right" onClick={() => setEditing('new')}>+ {t('add_cat')}</button>
      </div>

      {cats && cats.length === 0 && (
        <div className="card empty-state">
          <div className="icon">🐾</div>
          <h2>{t('no_cats_title')}</h2>
          <p>{t('no_cats_body')}</p>
          <button className="btn-primary" onClick={() => setEditing('new')}>+ {t('add_cat')}</button>
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
    </div>
  );
}

function CatCard({ cat }: { cat: Cat }) {
  const { t } = useI18n();
  return (
    <Link to={`/cat/${cat.id}`} className="card" style={{ display: 'block', color: 'inherit' }}>
      <div className="row">
        <h2 style={{ margin: 0 }}>{cat.name}</h2>
        <span className="right"><PhaseBadge phase={cat.phase} /></span>
      </div>
      <p className="small muted" style={{ marginTop: 6, marginBottom: 0 }}>
        {cat.breed ? `${cat.breed} · ` : ''}
        {t(`fip_${cat.fip_type}` as TKey)}
        {cat.med_name ? ` · ${cat.med_name}` : ''}
      </p>
    </Link>
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
