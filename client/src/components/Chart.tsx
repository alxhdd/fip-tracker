import { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { useI18n } from '../i18n';

export interface SeriesDef {
  key: string;
  label: string;
  color: string; // CSS var reference, e.g. 'var(--series-1)'
  points: { date: string; value: number }[];
}

export interface ChartProps {
  title: string;
  subtitle?: string;
  series: SeriesDef[];
  xDomain: [string, string]; // YYYY-MM-DD inclusive
  height?: number;
  yMin?: number;
  yMax?: number;
  band?: { min: number; max: number; label?: string }; // normal range
  refLines?: { value: number; label: string; tone?: 'critical' | 'good' | 'muted' }[];
  events?: { date: string; label: string }[]; // vertical markers (e.g. treatment start)
  valueFmt?: (v: number) => string;
  integerY?: boolean;
}

const dayMs = 86400_000;
const toT = (d: string) => new Date(`${d}T12:00:00`).getTime();

function niceTicks(min: number, max: number, count = 4, integer = false): number[] {
  if (!isFinite(min) || !isFinite(max)) return [];
  if (min === max) { min -= 1; max += 1; }
  const span = max - min;
  const step0 = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(step0)));
  let step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= count + 1) || mag * 10;
  if (integer && step < 1) step = 1;
  const start = Math.ceil(min / step) * step;
  const out: number[] = [];
  for (let v = start; v <= max + 1e-9; v += step) out.push(Math.round(v * 1000) / 1000);
  return out;
}

export function TimeSeriesChart(props: ChartProps) {
  const { locale } = useI18n();
  const { series, xDomain, height = 190, band, refLines = [], events = [] } = props;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [hover, setHover] = useState<{ t: number; px: number; py: number } | null>(null);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const pad = { l: 42, r: 12, t: 10, b: 22 };
  const iw = Math.max(60, width - pad.l - pad.r);
  const ih = height - pad.t - pad.b;

  const t0 = toT(xDomain[0]);
  const t1 = Math.max(toT(xDomain[1]), t0 + dayMs);
  const x = (t: number) => pad.l + ((t - t0) / (t1 - t0)) * iw;

  const allVals = series.flatMap((s) => s.points.map((p) => p.value));
  let yMin = props.yMin ?? Math.min(...allVals, band ? band.min : Infinity);
  let yMax = props.yMax ?? Math.max(...allVals, band ? band.max : -Infinity);
  if (!isFinite(yMin) || !isFinite(yMax)) { yMin = 0; yMax = 1; }
  if (props.yMin === undefined || props.yMax === undefined) {
    const spanPad = (yMax - yMin || 1) * 0.12;
    if (props.yMin === undefined) yMin -= spanPad;
    if (props.yMax === undefined) yMax += spanPad;
  }
  for (const r of refLines) { yMin = Math.min(yMin, r.value); yMax = Math.max(yMax, r.value); }
  const y = (v: number) => pad.t + ih - ((v - yMin) / (yMax - yMin || 1)) * ih;

  const yTicks = niceTicks(yMin, yMax, 4, props.integerY);
  const xTicks = useMemo(() => {
    const days = Math.round((t1 - t0) / dayMs);
    const step = Math.max(1, Math.ceil(days / 5));
    const ticks: number[] = [];
    for (let d = 0; d <= days; d += step) ticks.push(t0 + d * dayMs);
    return ticks;
  }, [t0, t1]);

  const dateFmt = new Intl.DateTimeFormat(locale === 'pl' ? 'pl-PL' : 'en-GB', { day: 'numeric', month: 'short' });
  const fmt = props.valueFmt ?? ((v: number) => (Math.round(v * 100) / 100).toString());

  // Hover: nearest recorded date across all series.
  const hoverData = useMemo(() => {
    if (!hover) return null;
    const dates = [...new Set(series.flatMap((s) => s.points.map((p) => p.date)))];
    if (!dates.length) return null;
    let best: string | null = null;
    let bestDist = Infinity;
    for (const d of dates) {
      const dist = Math.abs(toT(d) - hover.t);
      if (dist < bestDist) { bestDist = dist; best = d; }
    }
    if (!best || bestDist > 20 * dayMs) return null;
    const rows = series
      .map((s) => ({ s, p: s.points.find((p) => p.date === best) }))
      .filter((r) => r.p)
      .map((r) => ({ label: r.s.label, color: r.s.color, value: r.p!.value }));
    return rows.length ? { date: best, rows } : null;
  }, [hover, series]);

  const hasData = allVals.length > 0;

  return (
    <div className="card chart-card">
      <p className="chart-title">{props.title}</p>
      {props.subtitle && <p className="chart-sub">{props.subtitle}</p>}
      {series.length > 1 && (
        <div className="chart-legend">
          {series.map((s) => (
            <span className="key" key={s.key}>
              <span className="swatch" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      )}
      <div className="chart-wrap" ref={wrapRef}>
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={props.title}
          onPointerMove={(e) => {
            const rect = wrapRef.current!.getBoundingClientRect();
            const px = e.clientX - rect.left;
            const py = e.clientY - rect.top;
            const t = t0 + ((px - pad.l) / iw) * (t1 - t0);
            setHover({ t, px, py });
          }}
          onPointerLeave={() => setHover(null)}
        >
          {/* normal-range band */}
          {band && (
            <rect x={pad.l} width={iw} y={y(band.max)} height={Math.max(0, y(band.min) - y(band.max))} fill="var(--band)" />
          )}
          {/* gridlines + y labels */}
          {yTicks.map((v) => (
            <g key={v}>
              <line x1={pad.l} x2={pad.l + iw} y1={y(v)} y2={y(v)} stroke="var(--grid)" strokeWidth={1} />
              <text x={pad.l - 6} y={y(v) + 3.5} textAnchor="end" fontSize={10.5} fill="var(--text-muted)">
                {fmt(v)}
              </text>
            </g>
          ))}
          {/* x ticks */}
          {xTicks.map((t) => (
            <text key={t} x={x(t)} y={height - 6} textAnchor="middle" fontSize={10.5} fill="var(--text-muted)">
              {dateFmt.format(new Date(t))}
            </text>
          ))}
          {/* baseline */}
          <line x1={pad.l} x2={pad.l + iw} y1={pad.t + ih} y2={pad.t + ih} stroke="var(--baseline)" strokeWidth={1} />
          {/* reference lines */}
          {refLines.map((r) => {
            const color = r.tone === 'critical' ? 'var(--status-critical)' : r.tone === 'good' ? 'var(--good-text)' : 'var(--text-muted)';
            return (
              <g key={r.label}>
                <line x1={pad.l} x2={pad.l + iw} y1={y(r.value)} y2={y(r.value)} stroke={color} strokeWidth={1} strokeDasharray="4 4" opacity={0.7} />
                <text x={pad.l + iw} y={y(r.value) - 4} textAnchor="end" fontSize={10} fill={color}>{r.label}</text>
              </g>
            );
          })}
          {/* event markers */}
          {events.filter((ev) => toT(ev.date) >= t0 && toT(ev.date) <= t1).map((ev) => (
            <g key={ev.date + ev.label}>
              <line x1={x(toT(ev.date))} x2={x(toT(ev.date))} y1={pad.t} y2={pad.t + ih} stroke="var(--text-muted)" strokeWidth={1} strokeDasharray="2 3" />
              <text x={x(toT(ev.date)) + 4} y={pad.t + 10} fontSize={10} fill="var(--text-muted)">{ev.label}</text>
            </g>
          ))}
          {/* series */}
          {series.map((s) => {
            const pts = s.points
              .filter((p) => toT(p.date) >= t0 && toT(p.date) <= t1)
              .sort((a, b) => a.date.localeCompare(b.date));
            const dAttr = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(toT(p.date)).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
            return (
              <g key={s.key}>
                {pts.length > 1 && <path d={dAttr} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />}
                {pts.map((p) => (
                  <circle
                    key={p.date}
                    cx={x(toT(p.date))}
                    cy={y(p.value)}
                    r={hoverData?.date === p.date ? 4.5 : pts.length > 1 ? 2.5 : 4}
                    fill={s.color}
                    stroke="var(--surface-1)"
                    strokeWidth={hoverData?.date === p.date ? 2 : 1}
                  />
                ))}
              </g>
            );
          })}
          {/* crosshair */}
          {hoverData && (
            <line x1={x(toT(hoverData.date))} x2={x(toT(hoverData.date))} y1={pad.t} y2={pad.t + ih} stroke="var(--baseline)" strokeWidth={1} />
          )}
        </svg>
        {!hasData && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="muted small">
            <NoDataLabel />
          </div>
        )}
        {hoverData && hover && (
          <div
            className="chart-tooltip"
            style={{
              left: Math.min(Math.max(hover.px + 12, 0), width - 150),
              top: Math.max(hover.py - 40, 0),
            }}
          >
            <div className="tt-date">{dateFmt.format(new Date(toT(hoverData.date)))}</div>
            {hoverData.rows.map((r) => (
              <div className="tt-row" key={r.label}>
                <span className="swatch" style={{ background: r.color, width: 10, height: 3, borderRadius: 2, display: 'inline-block' }} />
                {r.label}
                <b>{fmt(r.value)}</b>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NoDataLabel() {
  const { t } = useI18n();
  return <span>{t('chart_no_data')}</span>;
}
