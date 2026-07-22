import { useState } from 'react';
import { api, todayStr, type Cat, type CatData, type Bloodwork } from '../../api';
import { useI18n, type TKey } from '../../i18n';
import { Modal, Field } from '../../components/ui';
import { MARKERS, AG_RECOVERY_TARGET, AGP_RECOVERY } from '../../fipConfig';
import { computeAG } from '../../lib/stats';
import { TimeSeriesChart, type SeriesDef } from '../../components/Chart';

export function BloodworkTab({ cat, data, reload }: { cat: Cat; data: CatData; reload: () => void }) {
  const { t } = useI18n();
  const [editing, setEditing] = useState<Bloodwork | 'new' | null>(null);
  const bw = data.bloodwork;

  const withAG = bw.map((b) => ({ ...b, ag: computeAG(b) }));
  const xDomain: [string, string] = bw.length ? [bw[0].date, bw[bw.length - 1].date] : [todayStr(), todayStr()];

  const agSeries: SeriesDef[] = [{ key: 'ag', label: t('marker_ag_ratio'), color: 'var(--series-1)', points: withAG.filter((b) => b.ag != null).map((b) => ({ date: b.date, value: b.ag! })) }];
  const proteinSeries: SeriesDef[] = [
    { key: 'glob', label: t('marker_globulin'), color: 'var(--series-2)', points: bw.filter((b) => b.values.globulin != null).map((b) => ({ date: b.date, value: b.values.globulin })) },
    { key: 'alb', label: t('marker_albumin'), color: 'var(--series-1)', points: bw.filter((b) => b.values.albumin != null).map((b) => ({ date: b.date, value: b.values.albumin })) },
  ];
  const hasAG = agSeries[0].points.length > 0;
  const hasProtein = proteinSeries.some((s) => s.points.length > 0);

  return (
    <div>
      <div className="row" style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>{t('bloodwork_title')}</h2>
        <div className="right row" style={{ gap: 8 }}>
          {bw.length > 0 && <a className="btn btn-sm" href={`/api/cats/${cat.id}/export/bloodwork.csv`}>{t('export_csv')}</a>}
          <button className="btn-primary" onClick={() => setEditing('new')}>+ {t('add_bloodwork')}</button>
        </div>
      </div>

      {(hasAG || hasProtein) && (
        <div className="grid grid-2" style={{ marginBottom: 14 }}>
          {hasAG && (
            <TimeSeriesChart title={t('chart_ag')} subtitle={t('chart_ag_sub')} series={agSeries} xDomain={xDomain}
              refLines={[{ value: AG_RECOVERY_TARGET, label: t('recovery_target'), tone: 'good' }]} valueFmt={(v) => v.toFixed(2)} height={200} />
          )}
          {hasProtein && (
            <TimeSeriesChart title={t('chart_globulin_albumin')} subtitle={t('chart_globulin_albumin_sub')} series={proteinSeries} xDomain={xDomain} valueFmt={(v) => v.toFixed(1)} height={200} />
          )}
        </div>
      )}

      {bw.length === 0 ? (
        <div className="card empty-state"><div className="icon">🩸</div><p>{t('bloodwork_none')}</p></div>
      ) : (
        <div className="table-wrap card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>{t('bloodwork_date')}</th>
                {MARKERS.filter((m) => m.primary).map((m) => <th key={m.key}>{t(`marker_${m.key}` as TKey)}</th>)}
                <th>{t('notes')}</th>
              </tr>
            </thead>
            <tbody>
              {[...withAG].reverse().map((b) => (
                <tr key={b.id} className="clickable" onClick={() => setEditing(b)}>
                  <td>{b.date}</td>
                  {MARKERS.filter((m) => m.primary).map((m) => {
                    const v = m.key === 'ag_ratio' ? b.ag : b.values[m.key];
                    return <td key={m.key}>{v != null ? <MarkerCell marker={m.key} value={v} /> : '—'}</td>;
                  })}
                  <td style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.notes || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <BloodworkForm cat={cat} existing={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />
      )}
    </div>
  );
}

function MarkerCell({ marker, value }: { marker: string; value: number }) {
  const def = MARKERS.find((m) => m.key === marker)!;
  let cls = '';
  if (marker === 'ag_ratio') cls = value >= AG_RECOVERY_TARGET ? 'delta-up' : value < 0.6 ? 'delta-down' : '';
  else if (marker === 'agp') cls = value <= AGP_RECOVERY ? 'delta-up' : 'delta-down';
  else if (def.refMin != null && def.refMax != null) {
    const out = value < def.refMin || value > def.refMax;
    cls = out ? 'delta-down' : 'delta-up';
  }
  return <span className={cls}>{value.toFixed(def.decimals)}</span>;
}

function BloodworkForm({ cat, existing, onClose, onSaved }: { cat: Cat; existing: Bloodwork | null; onClose: () => void; onSaved: () => void }) {
  const { t } = useI18n();
  const [date, setDate] = useState(existing?.date ?? todayStr());
  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    if (existing) for (const [k, val] of Object.entries(existing.values)) v[k] = String(val);
    return v;
  });
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [busy, setBusy] = useState(false);

  const set = (k: string, val: string) => setValues((v) => ({ ...v, [k]: val }));

  // Auto A:G preview
  const alb = parseFloat(values.albumin), glob = parseFloat(values.globulin);
  const autoAG = !isNaN(alb) && !isNaN(glob) && glob !== 0 ? (alb / glob).toFixed(2) : null;

  const submit = async () => {
    setBusy(true);
    const numeric: Record<string, number> = {};
    for (const [k, val] of Object.entries(values)) {
      const n = parseFloat(val);
      if (val !== '' && !isNaN(n)) numeric[k] = n;
    }
    try {
      const payload = { date, values: numeric, notes };
      if (existing) await api.updateBloodwork(cat.id, existing.id, payload);
      else await api.addBloodwork(cat.id, payload);
      onSaved();
    } finally { setBusy(false); }
  };

  const remove = async () => { if (existing) { await api.deleteBloodwork(cat.id, existing.id); onSaved(); } };

  return (
    <Modal title={existing ? t('edit_bloodwork') : t('add_bloodwork')} onClose={onClose} wide>
      <p className="small muted">{t('bloodwork_intro')}</p>
      <Field label={t('bloodwork_date')}>
        <input type="date" value={date} max={todayStr()} onChange={(e) => setDate(e.target.value)} />
      </Field>
      <div className="grid grid-2" style={{ marginTop: 12 }}>
        {MARKERS.map((m) => {
          const isAG = m.key === 'ag_ratio';
          return (
            <div key={m.key}>
              <label className="field">
                {t(`marker_${m.key}` as TKey)} {m.unit && <span className="muted">({m.unit})</span>}
              </label>
              <input
                type="number" step="any" inputMode="decimal"
                value={isAG && autoAG && !values.ag_ratio ? '' : (values[m.key] ?? '')}
                placeholder={isAG && autoAG ? `${autoAG} (${t('ag_auto')})` : ''}
                onChange={(e) => set(m.key, e.target.value)}
              />
              {isAG && <div className="score-hint">{t('ag_recovery_hint')}</div>}
              {m.key === 'agp' && <div className="score-hint">{t('agp_recovery_hint')}</div>}
            </div>
          );
        })}
      </div>
      <Field label={t('notes')}>
        <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
      <div className="row" style={{ marginTop: 16 }}>
        {existing && <button className="btn-danger btn-sm" onClick={remove}>{t('delete')}</button>}
        <button className="btn-ghost right" onClick={onClose}>{t('cancel')}</button>
        <button className="btn-primary" onClick={submit} disabled={busy}>{t('save')}</button>
      </div>
    </Modal>
  );
}
