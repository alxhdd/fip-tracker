import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, type Cat, type CatData } from '../api';
import { useI18n, type TKey } from '../i18n';
import { PhaseBadge } from '../components/ui';
import { Trends } from './tabs/Trends';
import { Overview } from './tabs/Overview';

export function SharedView() {
  const { token } = useParams();
  const { t, locale, setLocale } = useI18n();
  const [d, setD] = useState<({ cat: Cat } & CatData) | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => { api.shared(token!).then(setD).catch(() => setErr(true)); }, [token]);

  if (err) return <div className="container empty-state" style={{ paddingTop: 60 }}><div className="icon">🔗</div><p>Link not found or disabled.</p></div>;
  if (!d) return <div className="container"><p style={{ marginTop: 40 }}>{t('loading')}</p></div>;

  return (
    <div>
      <header className="topbar">
        <div className="topbar-inner">
          <span className="brand">🐈 {t('app_name')}</span>
          <span className="spacer" />
          <select value={locale} onChange={(e) => setLocale(e.target.value as 'en' | 'pl')} style={{ width: 'auto', padding: '5px 8px', fontSize: '0.85rem' }}>
            <option value="en">EN</option>
            <option value="pl">PL</option>
          </select>
        </div>
      </header>
      <main className="container" style={{ paddingTop: 18 }}>
        <div className="callout small">{t('shared_view_banner')}</div>
        <div className="row" style={{ margin: '10px 0 16px' }}>
          <h1 style={{ margin: 0 }}>{d.cat.name}</h1>
          <PhaseBadge phase={d.cat.phase} />
          <span className="small muted">{d.cat.breed ? `${d.cat.breed} · ` : ''}{t(`fip_${d.cat.fip_type}` as TKey)}</span>
        </div>
        <Overview cat={d.cat} data={d} onGoLog={() => {}} />
        <div style={{ marginTop: 20 }}>
          <Trends cat={d.cat} data={d} />
        </div>
      </main>
    </div>
  );
}
