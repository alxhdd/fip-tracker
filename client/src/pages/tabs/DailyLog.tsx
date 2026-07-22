import { useState } from 'react';
import { api, todayStr, type Cat, type CatData, type Entry } from '../../api';
import { useI18n, type TKey } from '../../i18n';
import { Modal, ScoreInput, Field } from '../../components/ui';
import { SCORE_METRICS, SYMPTOMS, TEMP, POOP_MIN, POOP_MAX } from '../../fipConfig';
import { fmtWeight } from '../../lib/stats';

export function DailyLog({ cat, data, reload }: { cat: Cat; data: CatData; reload: () => void }) {
  const { t, locale } = useI18n();
  const [editDate, setEditDate] = useState<string | null>(null);

  const dateFmt = new Intl.DateTimeFormat(locale === 'pl' ? 'pl-PL' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const entries = [...data.entries].reverse();

  return (
    <div>
      <div className="row" style={{ marginBottom: 14 }}>
        <button className="btn-primary" onClick={() => setEditDate(todayStr())}>+ {t('add_todays_log')}</button>
      </div>

      {entries.length === 0 && (
        <div className="card empty-state"><div className="icon">📋</div><p>{t('start_logging')}</p></div>
      )}

      <div className="table-wrap card" style={{ padding: 0 }}>
        {entries.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>{t('entry_date')}</th>
                <th>{t('weight')}</th>
                <th>{t('temperature')}</th>
                <th>{t('appetite')}</th>
                <th>{t('energy')}</th>
                <th>{t('symptoms')}</th>
                <th>{t('notes')}</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.date} className="clickable" onClick={() => setEditDate(e.date)}>
                  <td>{dateFmt.format(new Date(`${e.date}T12:00`))}</td>
                  <td>{e.weight_g != null ? fmtWeight(e.weight_g) : '—'}</td>
                  <td className={e.temp_c != null && e.temp_c > TEMP.fever ? 'fever-flag' : ''}>
                    {e.temp_c != null ? `${e.temp_c.toFixed(1)}°` : '—'}
                  </td>
                  <td>{e.appetite ?? '—'}</td>
                  <td>{e.energy ?? '—'}</td>
                  <td>{e.symptoms.length ? `${e.symptoms.length} ⚑` : '—'}</td>
                  <td style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.notes || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editDate && (
        <EntryForm
          cat={cat}
          date={editDate}
          existing={data.entries.find((e) => e.date === editDate) ?? null}
          onClose={() => setEditDate(null)}
          onSaved={() => { setEditDate(null); reload(); }}
        />
      )}
    </div>
  );
}

const EMPTY: Omit<Entry, 'date'> = {
  weight_g: null, temp_c: null, appetite: null, energy: null, interest_toys: null, interest_treats: null,
  poop_count: null, poop_score: null, vomit_count: null, med_given: null, med_dose_mg: null, symptoms: [], notes: null,
};

function EntryForm({ cat, date, existing, onClose, onSaved }: { cat: Cat; date: string; existing: Entry | null; onClose: () => void; onSaved: () => void }) {
  const { t } = useI18n();
  const [d, setD] = useState(date);
  const [form, setForm] = useState<Omit<Entry, 'date'>>(existing ? { ...existing } : { ...EMPTY });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));
  const numOrNull = (s: string) => (s === '' ? null : Number(s));

  const toggleSymptom = (key: string) =>
    setForm((f) => ({ ...f, symptoms: f.symptoms.includes(key) ? f.symptoms.filter((x) => x !== key) : [...f.symptoms, key] }));

  const submit = async () => {
    setBusy(true); setErr(false);
    try {
      await api.saveEntry(cat.id, d, form);
      onSaved();
    } catch { setErr(true); } finally { setBusy(false); }
  };

  const remove = async () => {
    await api.deleteEntry(cat.id, d);
    onSaved();
  };

  const tempWarn =
    form.temp_c == null ? null
    : form.temp_c >= TEMP.urgent ? { cls: 'fever-flag', key: 'urgent_temp_note' as TKey }
    : form.temp_c > TEMP.fever ? { cls: 'fever-flag', key: 'fever_note' as TKey }
    : form.temp_c < TEMP.normalMin ? { cls: 'muted', key: 'low_temp_note' as TKey }
    : null;

  // Symptoms grouped; dry-relevant ones bubble up first when this cat's form warrants it.
  const emphasizeDry = ['dry', 'ocular', 'neuro', 'mixed'].includes(cat.fip_type) || cat.phase === 'observation';
  const groups = ['general', 'ocular', 'neuro', 'abdominal'] as const;

  return (
    <Modal title={t('edit_entry')} onClose={onClose} wide>
      <div className="grid" style={{ gap: 14 }}>
        <div className="field-row">
          <Field label={t('entry_date')}><input type="date" value={d} onChange={(e) => setD(e.target.value)} max={todayStr()} /></Field>
          <Field label={t('weight_g')}>
            <input type="number" inputMode="numeric" value={form.weight_g ?? ''} onChange={(e) => set('weight_g', numOrNull(e.target.value))} placeholder="e.g. 3200" />
          </Field>
        </div>

        <div>
          <Field label={t('temp_c')}>
            <input type="number" step="0.1" inputMode="decimal" value={form.temp_c ?? ''} onChange={(e) => set('temp_c', numOrNull(e.target.value))} placeholder="38.5" />
          </Field>
          {tempWarn && <p className={`small ${tempWarn.cls}`} style={{ marginTop: 4 }}>{t(tempWarn.key)}</p>}
        </div>

        <div className="grid grid-2">
          {SCORE_METRICS.map((m) => (
            <div key={m.key}>
              <label className="field">{m.icon} {t(m.key as TKey)}</label>
              <ScoreInput value={form[m.key] as number | null} onChange={(v) => set(m.key, v as any)} />
            </div>
          ))}
        </div>

        <div className="field-row">
          <Field label={t('poop_count')}>
            <input type="number" inputMode="numeric" min={0} value={form.poop_count ?? ''} onChange={(e) => set('poop_count', numOrNull(e.target.value))} />
          </Field>
          <Field label={t('poop_score')}>
            <select value={form.poop_score ?? ''} onChange={(e) => set('poop_score', numOrNull(e.target.value))}>
              <option value="">—</option>
              {Array.from({ length: POOP_MAX - POOP_MIN + 1 }, (_, i) => POOP_MIN + i).map((n) => (
                <option key={n} value={n}>{n} – {t(`poop_${n}` as TKey)}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="field-row">
          <Field label={t('vomit_count')}>
            <input type="number" inputMode="numeric" min={0} value={form.vomit_count ?? ''} onChange={(e) => set('vomit_count', numOrNull(e.target.value))} />
          </Field>
          <Field label={t('med_dose_mg')}>
            <input type="number" step="0.1" inputMode="decimal" value={form.med_dose_mg ?? ''} onChange={(e) => { const v = numOrNull(e.target.value); setForm((f) => ({ ...f, med_dose_mg: v, med_given: v != null ? 1 : f.med_given })); }} />
          </Field>
        </div>

        <label className="row" style={{ gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" style={{ width: 'auto' }} checked={!!form.med_given} onChange={(e) => set('med_given', e.target.checked ? 1 : 0)} />
          {t('med_given')}
        </label>

        <div>
          <label className="field">{t('symptoms')}</label>
          {groups.map((g) => {
            let syms = SYMPTOMS.filter((s) => s.group === g);
            if (emphasizeDry) syms = [...syms].sort((a, b) => Number(!!b.dry) - Number(!!a.dry));
            return (
              <div key={g} style={{ marginTop: 8 }}>
                <div className="small muted" style={{ fontWeight: 600 }}>{t(`sym_group_${g}` as TKey)}</div>
                <div className="chips">
                  {syms.map((s) => (
                    <button type="button" key={s.key} className={`chip ${form.symptoms.includes(s.key) ? 'active' : ''}`} onClick={() => toggleSymptom(s.key)}>
                      {t(`sym_${s.key}` as TKey)}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <Field label={t('notes')}>
          <textarea rows={3} value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value)} placeholder={t('notes_placeholder')} />
        </Field>
      </div>

      {err && <p className="small fever-flag" style={{ marginTop: 8 }}>{t('save_failed')}</p>}
      <div className="row" style={{ marginTop: 16 }}>
        {existing && <button className="btn-danger btn-sm" onClick={remove}>{t('delete_entry')}</button>}
        <button className="btn-ghost right" onClick={onClose}>{t('cancel')}</button>
        <button className="btn-primary" onClick={submit} disabled={busy}>{t('save_entry')}</button>
      </div>
    </Modal>
  );
}
