import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, todayStr, type Cat, type CatData, type Member, type JoinRequest } from '../../api';
import { useI18n, type TKey } from '../../i18n';
import { Field, BreedInput } from '../../components/ui';
import { FIP_TYPES, PHASES, DOSING } from '../../fipConfig';
import { lastWith } from '../../lib/stats';

export function SettingsTab({ cat, data, reloadCat }: { cat: Cat; data: CatData; reloadCat: () => void }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [form, setForm] = useState<Cat>({ ...cat });
  const [savedAt, setSavedAt] = useState(0);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const set = (k: keyof Cat, v: any) => setForm((f) => ({ ...f, [k]: v === '' ? null : v }));

  const save = async () => {
    await api.updateCat(cat.id, form);
    setSavedAt(Date.now());
    reloadCat();
  };

  const lastWeight = lastWith(data.entries, (e) => e.weight_g);
  const doseMg = lastWeight && form.dose_mg_per_kg ? (lastWeight.value / 1000) * form.dose_mg_per_kg : null;
  const doseMl = doseMg && form.med_concentration_mg_ml ? doseMg / form.med_concentration_mg_ml : null;

  const createShare = async () => setShareToken((await api.createShare(cat.id)).token);
  const disableShare = async () => { await api.deleteShare(cat.id); setShareToken(null); };
  const shareUrl = shareToken ? `${location.origin}/share/${shareToken}` : '';
  const copy = () => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  const del = async () => {
    if (!confirm(t('confirm_delete_cat', { name: cat.name }))) return;
    await api.deleteCat(cat.id);
    navigate('/');
  };

  return (
    <div className="grid" style={{ gap: 14 }}>
      {/* Basics */}
      <div className="card">
        <h3>{t('basics')}</h3>
        <div className="grid" style={{ gap: 12 }}>
          <Field label={t('cat_name')}><input value={form.name} onChange={(e) => set('name', e.target.value)} /></Field>
          <Field label={t('breed')}><BreedInput value={form.breed ?? ''} onChange={(v) => set('breed', v)} /></Field>
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
      </div>

      {/* Treatment plan */}
      <div className="card">
        <h3>{t('treatment_plan')}</h3>
        <div className="grid" style={{ gap: 12 }}>
          <div className="field-row">
            <Field label={t('treatment_start')}><input type="date" value={form.treatment_start ?? ''} onChange={(e) => set('treatment_start', e.target.value)} /></Field>
            <Field label={t('treatment_days')}><input type="number" value={form.treatment_days ?? DOSING.minTreatmentDays} onChange={(e) => set('treatment_days', Number(e.target.value))} /></Field>
          </div>
          <div className="field-row">
            <Field label={t('observation_start')}><input type="date" value={form.observation_start ?? ''} onChange={(e) => set('observation_start', e.target.value)} /></Field>
            <Field label={t('observation_days')}><input type="number" value={form.observation_days ?? DOSING.observationDays} onChange={(e) => set('observation_days', Number(e.target.value))} /></Field>
          </div>
          <Field label={t('med_name')}><input value={form.med_name ?? ''} onChange={(e) => set('med_name', e.target.value)} placeholder="e.g. GS-441524" /></Field>
          <div className="field-row">
            <Field label={t('med_form_label')}>
              <select value={form.med_form ?? ''} onChange={(e) => set('med_form', e.target.value)}>
                <option value="">—</option>
                <option value="injection">{t('med_injection')}</option>
                <option value="oral">{t('med_oral')}</option>
              </select>
            </Field>
            <Field label={t('dose_mg_per_kg')}><input type="number" step="0.1" value={form.dose_mg_per_kg ?? ''} onChange={(e) => set('dose_mg_per_kg', e.target.value === '' ? null : Number(e.target.value))} /></Field>
          </div>
          {form.med_form === 'injection' && (
            <Field label={t('med_concentration')}><input type="number" step="0.1" value={form.med_concentration_mg_ml ?? ''} onChange={(e) => set('med_concentration_mg_ml', e.target.value === '' ? null : Number(e.target.value))} placeholder="e.g. 15" /></Field>
          )}

          <div className="callout">
            <strong>{t('dose_calc_title')}</strong>
            <div className="small" style={{ marginTop: 4 }}>
              {doseMg && lastWeight ? (
                t('dose_calc_body', {
                  weight: lastWeight.value >= 1000 ? `${(lastWeight.value / 1000).toFixed(2)} kg` : `${lastWeight.value} g`,
                  dose: form.dose_mg_per_kg!,
                  mg: doseMg.toFixed(1),
                  vol: doseMl ? t('dose_calc_volume', { ml: doseMl.toFixed(2) }) : '',
                })
              ) : t('dose_calc_need_weight')}
            </div>
            <div className="small muted" style={{ marginTop: 6 }}>{t('dose_disclaimer')}</div>
          </div>
        </div>
      </div>

      <div className="row">
        <button className="btn-primary" onClick={save}>{t('save')}</button>
        {savedAt > 0 && <span className="small delta-up">{t('entry_saved')} ✓</span>}
      </div>

      {/* Vet report */}
      <div className="card">
        <h3>{t('vet_report')}</h3>
        <p className="small muted">{t('vet_report_body')}</p>
        <button onClick={() => navigate(`/cat/${cat.id}/report`)}>🖨 {t('open_report')}</button>
      </div>

      {/* Co-owners */}
      <CoOwners cat={cat} />

      {/* Sharing */}
      <div className="card">
        <h3>{t('share_title')}</h3>
        <p className="small muted">{t('share_body')}</p>
        {!shareToken ? (
          <button onClick={createShare}>{t('share_create')}</button>
        ) : (
          <div className="grid" style={{ gap: 8 }}>
            <div className="row" style={{ gap: 8 }}>
              <input readOnly value={shareUrl} onFocus={(e) => e.target.select()} />
              <button className="btn-sm" onClick={copy} style={{ whiteSpace: 'nowrap' }}>{copied ? t('copied') : t('copy_link')}</button>
            </div>
            <div><button className="btn-danger btn-sm" onClick={disableShare}>{t('share_disable')}</button></div>
          </div>
        )}
      </div>

      {/* Danger zone — owner only (co-owners leave via the Co-owners section) */}
      {cat.role !== 'member' && (
        <div className="card" style={{ borderColor: 'color-mix(in srgb, var(--status-critical) 35%, transparent)' }}>
          <h3>{t('danger_zone')}</h3>
          <button className="btn-danger" onClick={del}>{t('delete')} — {cat.name}</button>
        </div>
      )}
    </div>
  );
}

function CoOwners({ cat }: { cat: Cat }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [data, setData] = useState<Awaited<ReturnType<typeof api.members>> | null>(null);
  const [copied, setCopied] = useState(false);

  const load = () => api.members(cat.id).then(setData).catch(() => {});
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [cat.id]);
  if (!data) return null;

  const isOwner = data.my_role === 'owner';
  const copyCode = () => { if (data.share_code) { navigator.clipboard.writeText(data.share_code); setCopied(true); setTimeout(() => setCopied(false), 1500); } };
  const respond = async (id: number, action: 'approve' | 'deny') => { await api.respondRequest(id, action); load(); };
  const remove = async (userId: number) => { await api.removeMember(cat.id, userId); load(); };
  const leave = async () => {
    if (!confirm(t('leave_confirm', { name: cat.name }))) return;
    await api.leaveCat(cat.id);
    navigate('/');
  };

  return (
    <div className="card">
      <h3>{t('co_owners')}</h3>
      {isOwner && <p className="small muted">{t('co_owners_body')}</p>}

      {isOwner && data.share_code && (
        <div style={{ margin: '4px 0 12px' }}>
          <label className="field">{t('share_code_label')}</label>
          <div className="row" style={{ gap: 8, marginTop: 4 }}>
            <code style={{ fontSize: '1.3rem', fontWeight: 700, letterSpacing: '0.15em', background: 'var(--wash)', padding: '6px 14px', borderRadius: 8 }}>{data.share_code}</code>
            <button className="btn-sm" onClick={copyCode}>{copied ? t('copied') : t('copy_code')}</button>
          </div>
        </div>
      )}

      {isOwner && data.requests.length > 0 && (
        <div style={{ margin: '10px 0' }}>
          <label className="field">{t('pending_requests')}</label>
          {data.requests.map((r: JoinRequest) => (
            <div key={r.id} className="row" style={{ gap: 8, padding: '6px 0' }}>
              {r.avatar_url && <img className="avatar" src={r.avatar_url} alt="" />}
              <span className="small">{r.user_name || r.user_email}</span>
              <span className="right row" style={{ gap: 6 }}>
                <button className="btn-primary btn-sm" onClick={() => respond(r.id, 'approve')}>{t('approve')}</button>
                <button className="btn-sm" onClick={() => respond(r.id, 'deny')}>{t('deny')}</button>
              </span>
            </div>
          ))}
        </div>
      )}

      <label className="field" style={{ marginTop: 8 }}>{t('people_with_access')}</label>
      <div style={{ marginTop: 4 }}>
        {data.members.map((m: Member) => (
          <div key={m.user_id} className="row" style={{ gap: 8, padding: '6px 0', borderTop: '1px solid var(--grid)' }}>
            {m.avatar_url && <img className="avatar" src={m.avatar_url} alt="" />}
            <span className="small">
              {m.name || m.email} {m.user_id === data.my_user_id && <span className="muted">{t('you_label')}</span>}
            </span>
            <span className="right small muted">{t(m.role === 'owner' ? 'role_owner' : 'role_member')}</span>
            {isOwner && m.role !== 'owner' && (
              <button className="btn-danger btn-sm" onClick={() => remove(m.user_id)}>{t('remove')}</button>
            )}
          </div>
        ))}
      </div>

      {!isOwner && (
        <div style={{ marginTop: 12 }}>
          <button className="btn-danger btn-sm" onClick={leave}>{t('leave_cat')}</button>
        </div>
      )}
    </div>
  );
}
