import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, todayStr, type Cat, type CatData } from '../api';
import { useI18n, type TKey } from '../i18n';
import { TimeSeriesChart, type SeriesDef } from '../components/Chart';
import { TEMP, MARKERS, AG_RECOVERY_TARGET } from '../fipConfig';
import { lastWith, firstWith, feverCount, phaseDay, computeAG, fmtWeight, daysBetween } from '../lib/stats';

// A clean, single-purpose page for printing or saving as PDF for the vet.
// Uses the browser's own print-to-PDF — no extra dependency.
export function Report() {
  const { id } = useParams();
  const catId = Number(id);
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [cat, setCat] = useState<Cat | null>(null);
  const [data, setData] = useState<CatData | null>(null);

  useEffect(() => {
    api.cats().then((r) => setCat(r.cats.find((c) => c.id === catId) ?? null));
    api.catData(catId).then(setData).catch(() => {});
  }, [catId]);

  if (!cat || !data) return <div className="container"><p style={{ marginTop: 40 }}>{t('loading')}</p></div>;

  const today = todayStr();
  const entries = data.entries;
  const bw = data.bloodwork;
  const lastWeight = lastWith(entries, (e) => e.weight_g);
  const firstWeight = firstWith(entries, (e) => e.weight_g);
  const lastTemp = lastWith(entries, (e) => e.temp_c);
  const pd = phaseDay(cat, today);
  const weightDelta = lastWeight && firstWeight ? lastWeight.value - firstWeight.value : null;

  const dateFmt = new Intl.DateTimeFormat(locale === 'pl' ? 'pl-PL' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const xDomain: [string, string] = [entries.length ? entries[0].date : today, today];
  const events = [
    cat.treatment_start ? { date: cat.treatment_start, label: '💊' } : null,
    cat.observation_start ? { date: cat.observation_start, label: '👁' } : null,
  ].filter(Boolean) as { date: string; label: string }[];
  const pts = (pick: (e: typeof entries[number]) => number | null) =>
    entries.filter((e) => pick(e) != null).map((e) => ({ date: e.date, value: pick(e)! }));

  const weightSeries: SeriesDef[] = [{ key: 'w', label: t('chart_weight'), color: 'var(--series-1)', points: pts((e) => e.weight_g) }];
  const tempSeries: SeriesDef[] = [{ key: 't', label: t('chart_temp'), color: 'var(--series-2)', points: pts((e) => e.temp_c) }];
  const agPoints = bw.map((b) => ({ b, ag: computeAG(b) })).filter((x) => x.ag != null).map((x) => ({ date: x.b.date, value: x.ag! }));
  const agSeries: SeriesDef[] = [{ key: 'ag', label: t('marker_ag_ratio'), color: 'var(--series-1)', points: agPoints }];

  const recentEntries = [...entries].slice(-21).reverse();
  const bwMarkers = [...new Set(bw.flatMap((b) => Object.keys(b.values)))];

  return (
    <div className="report">
      <div className="report-toolbar no-print">
        <button className="btn-ghost btn-sm" onClick={() => navigate(`/cat/${cat.id}`)}>← {cat.name}</button>
        <button className="btn-primary" onClick={() => window.print()}>🖨 {t('print_report')}</button>
      </div>

      <div className="report-page">
        <header className="report-head">
          <div>
            <h1 style={{ margin: 0 }}>{cat.name}</h1>
            <p className="muted small" style={{ margin: '2px 0' }}>
              {cat.breed ? `${cat.breed} · ` : ''}{t(`fip_${cat.fip_type}` as TKey)} · {t(`phase_${cat.phase}` as TKey)}
              {pd ? ` · ${t('treatment_of_total', { n: Math.max(1, pd.day), total: pd.total })}` : ''}
            </p>
          </div>
          <div className="report-brand small muted" style={{ textAlign: 'right' }}>
            🐈 {t('app_name')}<br />
            {t('report_generated', { date: dateFmt.format(new Date(`${today}T12:00`)) })}
          </div>
        </header>

        {(cat.med_name || cat.treatment_start) && (
          <p className="small" style={{ margin: '4px 0 10px' }}>
            {cat.med_name && <><strong>{t('med_name')}:</strong> {cat.med_name} </>}
            {cat.med_form && <>({t(cat.med_form === 'injection' ? 'med_injection' : 'med_oral')}) </>}
            {cat.dose_mg_per_kg && <>· {cat.dose_mg_per_kg} mg/kg </>}
            {cat.treatment_start && <>· {t('treatment_start')}: {cat.treatment_start}</>}
          </p>
        )}

        {/* Key figures */}
        <div className="report-stats">
          <RStat label={t('latest_weight')} value={lastWeight ? fmtWeight(lastWeight.value) : '—'} />
          <RStat label={t('weight_change')} value={weightDelta != null ? `${weightDelta >= 0 ? '+' : '−'}${Math.abs(weightDelta)} g` : '—'} />
          <RStat label={t('latest_temp')} value={lastTemp ? `${lastTemp.value.toFixed(1)} °C` : '—'} />
          <RStat label={t('fever_days')} value={`${feverCount(entries, 14, today)} / 14d`} />
          <RStat label={t('marker_ag_ratio')} value={agPoints.length ? agPoints[agPoints.length - 1].value.toFixed(2) : '—'} />
        </div>

        {/* Charts */}
        <div className="report-charts">
          <TimeSeriesChart title={t('chart_weight')} series={weightSeries} xDomain={xDomain} events={events} integerY valueFmt={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(Math.round(v)))} height={170} />
          <TimeSeriesChart title={t('chart_temp')} series={tempSeries} xDomain={xDomain} events={events} band={{ min: TEMP.normalMin, max: TEMP.normalMax }} refLines={[{ value: TEMP.fever, label: t('sym_fever'), tone: 'critical' }]} valueFmt={(v) => v.toFixed(1)} height={170} />
          {agPoints.length > 0 && (
            <TimeSeriesChart title={t('chart_ag')} series={agSeries} xDomain={xDomain} refLines={[{ value: AG_RECOVERY_TARGET, label: t('recovery_target'), tone: 'good' }]} valueFmt={(v) => v.toFixed(2)} height={170} />
          )}
        </div>

        {/* Bloodwork table */}
        {bw.length > 0 && (
          <section>
            <h2 className="report-h2">{t('bloodwork_title')}</h2>
            <table className="report-table">
              <thead>
                <tr>
                  <th>{t('bloodwork_date')}</th>
                  <th>{t('marker_ag_ratio')}</th>
                  {bwMarkers.map((m) => <th key={m}>{t(`marker_${m}` as TKey)}</th>)}
                </tr>
              </thead>
              <tbody>
                {bw.map((b) => (
                  <tr key={b.id}>
                    <td>{b.date}</td>
                    <td>{computeAG(b)?.toFixed(2) ?? '—'}</td>
                    {bwMarkers.map((m) => {
                      const def = MARKERS.find((x) => x.key === m);
                      return <td key={m}>{b.values[m] != null ? b.values[m].toFixed(def?.decimals ?? 1) : '—'}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Recent daily log */}
        <section>
          <h2 className="report-h2">{t('tab_log')} · {t('range_all')}</h2>
          <table className="report-table">
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
              {recentEntries.map((e) => (
                <tr key={e.date}>
                  <td>{e.date}</td>
                  <td>{e.weight_g != null ? `${e.weight_g} g` : '—'}</td>
                  <td className={e.temp_c != null && e.temp_c > TEMP.fever ? 'fever-flag' : ''}>{e.temp_c != null ? `${e.temp_c.toFixed(1)}°` : '—'}</td>
                  <td>{e.appetite ?? '—'}</td>
                  <td>{e.energy ?? '—'}</td>
                  <td className="small">{e.symptoms.map((s) => t(`sym_${s}` as TKey)).join(', ')}</td>
                  <td className="small">{e.notes || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <footer className="report-foot small muted">{t('report_footer')}</footer>
      </div>
    </div>
  );
}

function RStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="report-stat">
      <div className="label">{label}</div>
      <div className="val">{value}</div>
    </div>
  );
}
