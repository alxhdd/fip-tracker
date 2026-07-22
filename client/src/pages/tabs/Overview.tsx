import { todayStr, type Cat, type CatData } from '../../api';
import { useI18n, type TKey } from '../../i18n';
import { lastWith, firstWith, feverCount, recentSymptoms, phaseDay, loggingStreak, fmtWeight, daysBetween } from '../../lib/stats';
import { TEMP, DOSING } from '../../fipConfig';

export function Overview({ cat, data, onGoLog }: { cat: Cat; data: CatData; onGoLog: () => void }) {
  const { t } = useI18n();
  const today = todayStr();
  const entries = data.entries;

  const lastWeight = lastWith(entries, (e) => e.weight_g);
  const firstWeight = firstWith(entries, (e) => e.weight_g);
  const lastTemp = lastWith(entries, (e) => e.temp_c);
  const fever14 = feverCount(entries, 14, today);
  const streak = loggingStreak(entries, today);
  const pd = phaseDay(cat, today);
  const syms = recentSymptoms(entries, 7, today);

  const weightDelta = lastWeight && firstWeight && lastWeight.date !== firstWeight.date
    ? lastWeight.value - firstWeight.value : null;

  // Two most-recent weights for a short-term delta.
  const weightSeries = entries.filter((e) => e.weight_g != null);
  const shortDelta = weightSeries.length >= 2
    ? weightSeries[weightSeries.length - 1].weight_g! - weightSeries[weightSeries.length - 2].weight_g! : null;

  if (entries.length === 0) {
    return (
      <div className="card empty-state">
        <div className="icon">📊</div>
        <h2>{t('no_entries_yet')}</h2>
        <p>{t('start_logging')}</p>
        <button className="btn-primary" onClick={onGoLog}>+ {t('add_todays_log')}</button>
      </div>
    );
  }

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="grid grid-4">
        <StatTile label={t('latest_weight')} value={lastWeight ? fmtWeight(lastWeight.value) : '—'}
          sub={shortDelta != null ? <Delta g={shortDelta} suffix={t('vs_previous')} /> : undefined} />
        <StatTile label={t('weight_change')} value={weightDelta != null ? `${weightDelta >= 0 ? '+' : ''}${fmtWeight(Math.abs(weightDelta)).replace(/^/, weightDelta < 0 ? '−' : '')}` : '—'}
          sub={<span className="muted small">{t('since_start')}</span>}
          valueClass={weightDelta == null ? '' : weightDelta >= 0 ? 'delta-up' : 'delta-down'} />
        <StatTile label={t('latest_temp')} value={lastTemp ? `${lastTemp.value.toFixed(1)}°C` : '—'}
          valueClass={lastTemp && lastTemp.value > TEMP.fever ? 'delta-down' : ''}
          sub={lastTemp && lastTemp.value > TEMP.fever ? <span className="fever-flag small">{t('sym_fever')}</span> : undefined} />
        <StatTile label={t('fever_days')} value={String(fever14)} sub={<span className="muted small">14d</span>}
          valueClass={fever14 > 0 ? 'delta-down' : ''} />
      </div>

      {/* Phase-aware guidance */}
      {(cat.fip_type === 'dry' || cat.fip_type === 'ocular' || cat.fip_type === 'neuro') && cat.phase !== 'recovered' && (
        <div className="callout callout-warn">
          <strong>{t('watch_dry')}</strong>
          <div className="small" style={{ marginTop: 4 }}>{t('watch_dry_body')}</div>
        </div>
      )}
      {cat.phase === 'observation' && (
        <ObservationCallout cat={cat} today={today} />
      )}

      <div className="grid grid-2">
        <div className="card">
          <h3>{t('recent_symptoms')}</h3>
          {syms.length === 0 ? (
            <p className="muted small">{t('none_last_7')}</p>
          ) : (
            <div className="chips">
              {syms.map((s) => <span key={s} className="chip active">{t(`sym_${s}` as TKey)}</span>)}
            </div>
          )}
        </div>
        <div className="card">
          <h3>{t('quick_status')}</h3>
          <p className="small" style={{ margin: '4px 0' }}>
            {t('last_entry')}: <strong>{entries[entries.length - 1].date}</strong>
          </p>
          {streak > 0 && <p className="small muted" style={{ margin: '4px 0' }}>🔥 {t('streak', { n: streak })}</p>}
          {pd && <p className="small muted" style={{ margin: '4px 0' }}>{t('treatment_of_total', { n: Math.max(1, pd.day), total: pd.total })} · {t('days_left', { n: Math.max(0, pd.total - pd.day) })}</p>}
        </div>
      </div>
    </div>
  );
}

function ObservationCallout({ cat, today }: { cat: Cat; today: string }) {
  const { t } = useI18n();
  const inHighRisk = cat.observation_start && daysBetween(cat.observation_start, today) <= DOSING.highRiskRelapseDays;
  return (
    <div className={`callout ${inHighRisk ? 'callout-warn' : ''}`}>
      <strong>{t('relapse_watch')}</strong>
      <div className="small" style={{ marginTop: 4 }}>{t('relapse_watch_body')}</div>
    </div>
  );
}

function StatTile({ label, value, sub, valueClass }: { label: string; value: string; sub?: React.ReactNode; valueClass?: string }) {
  return (
    <div className="card stat-tile">
      <div className="label">{label}</div>
      <div className={`value ${valueClass ?? ''}`}>{value}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}

function Delta({ g, suffix }: { g: number; suffix: string }) {
  const cls = g > 0 ? 'delta-up' : g < 0 ? 'delta-down' : 'muted';
  const sign = g > 0 ? '+' : g < 0 ? '−' : '';
  return <span className={`small ${cls}`}>{sign}{Math.abs(g)} g <span className="muted">{suffix}</span></span>;
}
