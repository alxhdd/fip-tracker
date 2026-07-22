import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, type Cat, type CatData } from '../api';
import { useI18n, type TKey } from '../i18n';
import { PhaseBadge } from '../components/ui';
import { phaseDay } from '../lib/stats';
import { todayStr } from '../api';
import { Overview } from './tabs/Overview';
import { DailyLog } from './tabs/DailyLog';
import { Trends } from './tabs/Trends';
import { BloodworkTab } from './tabs/BloodworkTab';
import { SettingsTab } from './tabs/SettingsTab';

const TABS = [
  { key: 'overview', label: 'tab_overview' },
  { key: 'log', label: 'tab_log' },
  { key: 'trends', label: 'tab_trends' },
  { key: 'bloodwork', label: 'tab_bloodwork' },
  { key: 'settings', label: 'tab_settings' },
] as const;

export function CatDashboard() {
  const { id } = useParams();
  const catId = Number(id);
  const { t } = useI18n();
  const navigate = useNavigate();
  const [cat, setCat] = useState<Cat | null>(null);
  const [data, setData] = useState<CatData | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('overview');
  const [notFound, setNotFound] = useState(false);

  const loadCat = useCallback(() => {
    api.cats().then((r) => {
      const c = r.cats.find((x) => x.id === catId);
      if (c) setCat(c); else setNotFound(true);
    });
  }, [catId]);

  const loadData = useCallback(() => {
    api.catData(catId).then(setData).catch(() => setNotFound(true));
  }, [catId]);

  useEffect(() => { loadCat(); loadData(); }, [loadCat, loadData]);

  if (notFound) return <div className="empty-state" style={{ paddingTop: 60 }}><p>🐾 Not found.</p><button onClick={() => navigate('/')}>{t('my_cats')}</button></div>;
  if (!cat || !data) return <p style={{ marginTop: 30 }}>{t('loading')}</p>;

  const pd = phaseDay(cat, todayStr());

  return (
    <div style={{ paddingTop: 20 }}>
      <button className="btn-ghost btn-sm" onClick={() => navigate('/')} style={{ marginBottom: 8 }}>← {t('my_cats')}</button>
      <div className="row">
        <h1 style={{ margin: 0 }}>{cat.name}</h1>
        <PhaseBadge phase={cat.phase} />
        {pd && <span className="small muted">{t('treatment_of_total', { n: Math.max(1, pd.day), total: pd.total })}</span>}
      </div>

      <div className="tabs" role="tablist">
        {TABS.map((tb) => (
          <button key={tb.key} className={tab === tb.key ? 'active' : ''} onClick={() => setTab(tb.key)} role="tab" aria-selected={tab === tb.key}>
            {t(tb.label as TKey)}
          </button>
        ))}
      </div>

      {tab === 'overview' && <Overview cat={cat} data={data} onGoLog={() => setTab('log')} />}
      {tab === 'log' && <DailyLog cat={cat} data={data} reload={loadData} />}
      {tab === 'trends' && <Trends cat={cat} data={data} />}
      {tab === 'bloodwork' && <BloodworkTab cat={cat} data={data} reload={loadData} />}
      {tab === 'settings' && <SettingsTab cat={cat} data={data} reloadCat={loadCat} />}
    </div>
  );
}
