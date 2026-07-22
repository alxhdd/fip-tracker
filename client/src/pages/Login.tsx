import { Link } from 'react-router-dom';
import { api } from '../api';
import { useI18n } from '../i18n';
import { useAuth } from '../App';

export function Login() {
  const { t } = useI18n();
  const { providers, reload } = useAuth();

  // Google button: real OAuth once GOOGLE_CLIENT_ID is set; until then it falls
  // back to the dev login, which just creates a throwaway account so the app can
  // be tested before OAuth is wired up.
  const googleReady = providers.google;
  const googleTestFallback = !providers.google && providers.dev;

  return (
    <div className="login-hero">
      <div className="paw">🐈</div>
      <h1>{t('login_title')}</h1>
      <p style={{ color: 'var(--text-secondary)' }}>{t('login_why')}</p>

      <div style={{ marginTop: 20 }}>
        {googleReady ? (
          <a href="/auth/google" className="btn btn-primary provider-btn">
            <GoogleIcon /> {t('login_google')}
          </a>
        ) : googleTestFallback ? (
          <button className="btn btn-primary provider-btn" onClick={() => api.devLogin('Test User').then(reload)}>
            <GoogleIcon /> {t('login_google')}
          </button>
        ) : null}

        {providers.facebook && (
          <a href="/auth/facebook" className="btn provider-btn" style={{ background: '#1877F2', color: '#fff', borderColor: '#1877F2' }}>
            <FacebookIcon /> {t('login_facebook')}
          </a>
        )}

        {googleTestFallback && (
          <p className="small muted" style={{ marginTop: 10 }}>{t('login_dev_note')}</p>
        )}

        {!providers.google && !providers.facebook && !providers.dev && (
          <p className="callout callout-warn small" style={{ textAlign: 'left' }}>
            No login provider is configured yet. Set <code>GOOGLE_CLIENT_ID</code> / <code>GOOGLE_CLIENT_SECRET</code> (or
            <code> ALLOW_DEV_LOGIN=1</code> for local testing) in the server’s <code>.env</code>.
          </p>
        )}
      </div>

      <p className="small muted" style={{ marginTop: 20 }}>{t('login_free')}</p>
      <p className="small" style={{ marginTop: 14 }}>
        <Link to="/demo">▶ {t('landing_cta_demo')}</Link>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 5.1 29.4 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 16 4 9.1 8.6 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 34.9 26.7 36 24 36c-5.3 0-9.7-3.6-11.3-8.4l-6.5 5C9.1 39.4 16 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.3l6.3 5.3C41.5 35.9 45 30.5 45 24c0-1.2-.1-2.4-.4-3.5z"/>
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" aria-hidden>
      <path d="M24 12c0-6.6-5.4-12-12-12S0 5.4 0 12c0 6 4.4 11 10.1 11.9v-8.4H7.1V12h3v-2.6c0-3 1.8-4.6 4.5-4.6 1.3 0 2.7.2 2.7.2v2.9h-1.5c-1.5 0-1.9.9-1.9 1.8V12h3.3l-.5 3.5h-2.8v8.4C19.6 23 24 18 24 12z"/>
    </svg>
  );
}
