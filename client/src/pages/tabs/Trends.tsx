import { useState, useMemo } from 'react';
import { todayStr, type Cat, type CatData } from '../../api';
import { useI18n, type TKey } from '../../i18n';
import { TimeSeriesChart, type SeriesDef } from '../../components/Chart';
import { TEMP } from '../../fipConfig';
import { daysBetween } from '../../lib/stats';

const RANGES = [
  { key: 'range_14', days: 14 },
  { key: 'range_30', days: 30 },
  { key: 'range_90', days: 90 },
  { key: 'range_all', days: Infinity },
] as const;

export function Trends({ cat, data }: { cat: Cat; data: CatData }) {
  const { t } = useI18n();
  const [range, setRange] = useState<number>(30);
  const today = todayStr();
  const entries = data.entries;

  const inRange = useMemo(
    () => (range === Infinity ? entries : entries.filter((e) => daysBetween(e.date, today) <= range)),
    [entries, range, today]
  );

  const firstDate = inRange.length ? inRange[0].date : today;
  const startDate = range === Infinity
    ? firstDate
    : (() => { const d = new Date(`${today}T12:00`); d.setDate(d.getDate() - (range - 1)); return d.toISOString().slice(0, 10); })();
  const xDomain: [string, string] = [inRange.length && range === Infinity ? firstDate : startDate, today];

  const events = [
    cat.treatment_start ? { date: cat.treatment_start, label: '💊' } : null,
    cat.observation_start ? { date: cat.observation_start, label: '👁' } : null,
  ].filter(Boolean) as { date: string; label: string }[];

  const pts = (pick: (e: typeof entries[number]) => number | null) =>
    inRange.filter((e) => pick(e) != null).map((e) => ({ date: e.date, value: pick(e)! }));

  const weightSeries: SeriesDef[] = [{ key: 'w', label: t('chart_weight'), color: 'var(--series-1)', points: pts((e) => e.weight_g) }];
  const tempSeries: SeriesDef[] = [{ key: 't', label: t('chart_temp'), color: 'var(--series-2)', points: pts((e) => e.temp_c) }];
  const scoreSeries: SeriesDef[] = [
    { key: 'appetite', label: t('appetite'), color: 'var(--series-1)', points: pts((e) => e.appetite) },
    { key: 'energy', label: t('energy'), color: 'var(--series-2)', points: pts((e) => e.energy) },
    { key: 'toys', label: t('interest_toys'), color: 'var(--series-3)', points: pts((e) => e.interest_toys) },
    { key: 'treats', label: t('interest_treats'), color: 'var(--series-4)', points: pts((e) => e.interest_treats) },
  ];
  const stoolSeries: SeriesDef[] = [
    { key: 'count', label: t('poop_count'), color: 'var(--series-1)', points: pts((e) => e.poop_count) },
    { key: 'score', label: t('poop_score'), color: 'var(--series-3)', points: pts((e) => e.poop_score) },
  ];

  return (
    <div>
      <div className="row" style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>{t('trends_title')}</h2>
        <div className="range-picker right">
          {RANGES.map((r) => (
            <button key={r.key} className={range === r.days ? 'active' : ''} onClick={() => setRange(r.days)}>{t(r.key as TKey)}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-2">
        <TimeSeriesChart
          title={t('chart_weight')} subtitle={t('chart_weight_sub')}
          series={weightSeries} xDomain={xDomain} events={events}
          valueFmt={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(Math.round(v)))}
          integerY
        />
        <TimeSeriesChart
          title={t('chart_temp')} subtitle={t('chart_temp_sub')}
          series={tempSeries} xDomain={xDomain} events={events}
          band={{ min: TEMP.normalMin, max: TEMP.normalMax }}
          refLines={[{ value: TEMP.fever, label: t('sym_fever'), tone: 'critical' }]}
          valueFmt={(v) => v.toFixed(1)}
        />
        <TimeSeriesChart
          title={t('chart_scores')} subtitle={t('chart_scores_sub')}
          series={scoreSeries} xDomain={xDomain} events={events}
          yMin={0} yMax={5} integerY
        />
        <TimeSeriesChart
          title={t('chart_stool')} subtitle={t('chart_stool_sub')}
          series={stoolSeries} xDomain={xDomain} events={events}
          yMin={0} integerY
        />
      </div>
    </div>
  );
}
