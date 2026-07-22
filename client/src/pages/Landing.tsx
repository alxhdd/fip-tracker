import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

export function Landing() {
  const { t } = useI18n();
  return (
    <div style={{ paddingTop: 8 }}>
      <section className="landing-hero">
        <div className="landing-paw">🐈‍⬛</div>
        <h1 className="landing-h1">{t('landing_headline')}</h1>
        <p className="landing-lead">{t('landing_sub')}</p>
        <div className="landing-cta">
          <Link to="/login" className="btn btn-primary landing-btn">{t('landing_cta_login')}</Link>
          <Link to="/demo" className="btn landing-btn">▶ {t('landing_cta_demo')}</Link>
        </div>
        <p className="small muted" style={{ marginTop: 8 }}>{t('landing_demo_hint')}</p>
      </section>

      <section className="grid grid-3 landing-cards">
        <Card icon="📈" title={t('landing_what_title')} body={t('landing_what_body')} />
        <Card icon="🐾" title={t('landing_for_title')} body={t('landing_for_body')} />
        <Card icon="🔒" title={t('landing_privacy_title')} body={t('landing_privacy_body')} />
      </section>

      <div className="callout" style={{ marginTop: 22, textAlign: 'center' }}>
        {t('landing_faq_pre')} <Link to="/faq">{t('landing_faq_link')} →</Link>
      </div>
    </div>
  );
}

function Card({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="card">
      <div style={{ fontSize: '1.7rem', marginBottom: 4 }}>{icon}</div>
      <h3>{title}</h3>
      <p className="small" style={{ color: 'var(--text-secondary)', margin: 0 }}>{body}</p>
    </div>
  );
}
