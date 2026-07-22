import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Cat, CatData, Entry, Bloodwork } from '../api';
import { useI18n } from '../i18n';
import { PhaseBadge } from '../components/ui';
import { Overview } from './tabs/Overview';
import { Trends } from './tabs/Trends';

const DAYS = 14;

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// A plausible dry-FIP recovery arc: weight climbing, fever cycling early then
// settling, appetite and energy rising. Built fresh each visit relative to today.
function buildDemo(name: string): { cat: Cat; data: CatData } {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - (DAYS - 1));

  const entries: Entry[] = [];
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const earlyFever = i < 7 && i % 3 === 0;
    const temp = earlyFever ? 39.9 - i * 0.05 : Math.max(38.4, 39.2 - i * 0.06);
    const step = Math.min(5, 1 + Math.floor(i / 3));
    entries.push({
      date: ymd(d),
      weight_g: 3000 + i * 46,
      temp_c: Math.round(temp * 10) / 10,
      appetite: step,
      energy: Math.min(5, 1 + Math.floor(i / 4)),
      interest_toys: Math.min(5, Math.floor(i / 4)),
      interest_treats: step,
      poop_count: 1,
      poop_score: i < 4 ? 5 : 2,
      vomit_count: i === 1 ? 1 : 0,
      med_given: 1,
      med_dose_mg: 18 + i * 0.3,
      symptoms: earlyFever ? ['fever', 'lethargy'] : i < 5 ? ['lethargy'] : [],
      notes: i === 0 ? 'Day 1 of treatment. Quiet but ate a little.' : i === 6 ? 'Playing with the string toy again 🧶' : null,
    });
  }

  const bloodwork: Bloodwork[] = [
    { id: 1, date: entries[0].date, values: { albumin: 2.2, globulin: 6.0, hematocrit: 26, total_protein: 8.2, lymphocytes_pct: 14 }, notes: null },
    { id: 2, date: entries[DAYS - 1].date, values: { albumin: 3.0, globulin: 4.1, hematocrit: 33, total_protein: 7.1, lymphocytes_pct: 27 }, notes: null },
  ];

  const cat: Cat = {
    id: -1, name, sex: 'male', birth_date: null, breed: 'Ragdoll',
    fip_type: 'dry', phase: 'treatment',
    treatment_start: entries[0].date, treatment_days: 84,
    observation_start: null, observation_days: 84,
    med_name: 'GS-441524', med_form: 'injection', dose_mg_per_kg: 6, med_concentration_mg_ml: 15,
    notes: null,
  };

  return { cat, data: { entries, bloodwork } };
}

export function Demo() {
  const { t } = useI18n();
  const { cat, data } = useMemo(() => buildDemo(t('demo_cat_name')), [t]);

  return (
    <div style={{ paddingTop: 18 }}>
      <div className="callout" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '1.3rem' }}>🎬</span>
        <span className="small" style={{ flex: 1, minWidth: 180 }}>{t('demo_banner')}</span>
        <Link to="/login" className="btn btn-primary btn-sm">{t('demo_cta')}</Link>
      </div>

      <div className="row" style={{ margin: '14px 0 6px' }}>
        <h1 style={{ margin: 0 }}>{cat.name}</h1>
        <PhaseBadge phase={cat.phase} />
        <span className="small muted">{t('fip_dry')}</span>
      </div>
      <p className="muted small" style={{ marginTop: 0 }}>{t('demo_intro')}</p>

      <Overview cat={cat} data={data} onGoLog={() => {}} />
      <div style={{ marginTop: 20 }}>
        <Trends cat={cat} data={data} />
      </div>

      <div className="callout" style={{ marginTop: 22, textAlign: 'center' }}>
        <Link to="/login" className="btn btn-primary">{t('demo_cta')}</Link>
      </div>
    </div>
  );
}
