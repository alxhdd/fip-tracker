import { useEffect, useState, createContext, useContext } from 'react';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { api, type User, type Providers } from './api';
import { useI18n } from './i18n';
import { useTheme } from './components/ui';
import { AccountModal } from './components/AccountModal';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Demo } from './pages/Demo';
import { CatsList } from './pages/CatsList';
import { CatDashboard } from './pages/CatDashboard';
import { SharedView } from './pages/SharedView';
import { Guide } from './pages/Guide';
import { Faq } from './pages/Faq';
import { Privacy } from './pages/Privacy';
import { Report } from './pages/Report';

interface Auth { user: User | null; providers: Providers; reload: () => void; }
const AuthCtx = createContext<Auth>(null as unknown as Auth);
export const useAuth = () => useContext(AuthCtx);

export function App() {
  useTheme();
  const [state, setState] = useState<{ user: User | null; providers: Providers } | null>(null);
  const { t, locale, setLocale } = useI18n();

  const reload = () => api.me().then(setState).catch(() => setState({ user: null, providers: { google: false, facebook: false, dev: false } }));
  useEffect(() => { reload(); }, []);

  // Sync locale from the signed-in user's saved preference once.
  useEffect(() => {
    if (state?.user && (state.user.locale === 'en' || state.user.locale === 'pl') && state.user.locale !== locale) {
      setLocale(state.user.locale);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.user?.id]);

  useEffect(() => { document.documentElement.lang = locale; }, [locale]);

  if (!state) return <div className="container"><p style={{ marginTop: 40 }}>{t('loading')}</p></div>;

  const { user } = state;

  return (
    <AuthCtx.Provider value={{ ...state, reload }}>
      <Routes>
        {/* Full-bleed, no app chrome */}
        <Route path="/share/:token" element={<SharedView />} />
        <Route path="/cat/:id/report" element={user ? <Report /> : <Navigate to="/login" replace />} />

        {/* Everything else gets the standard chrome */}
        <Route path="*" element={<Chrome />} />
      </Routes>
    </AuthCtx.Provider>
  );
}

function Chrome() {
  const { user } = useAuth();
  return (
    <>
      <TopBar />
      <main className="container">
        <Routes>
          <Route path="/" element={user ? <CatsList /> : <Landing />} />
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/cat/:id" element={user ? <CatDashboard /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

function Footer() {
  const { t } = useI18n();
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <span>🐈 {t('app_name')}</span>
        <span className="sep">·</span>
        <Link to="/privacy">{t('nav_privacy')}</Link>
        <Link to="/faq">{t('nav_faq')}</Link>
        <Link to="/guide">{t('nav_guide')}</Link>
        <span className="footer-spacer" />
        <span className="muted">{t('footer_not_medical')}</span>
      </div>
    </footer>
  );
}

function TopBar() {
  const { user, reload } = useAuth();
  const { t, locale, setLocale } = useI18n();
  const navigate = useNavigate();
  const [accountOpen, setAccountOpen] = useState(false);

  const changeLocale = (l: 'en' | 'pl') => {
    setLocale(l);
    if (user) api.setLocale(l).catch(() => {});
  };

  const toggleTheme = () => {
    const cur = document.documentElement.getAttribute('data-theme');
    const isDark = cur === 'dark' || (!cur && matchMedia('(prefers-color-scheme: dark)').matches);
    const next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('fip_theme', next);
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="brand">🐈 {t('app_name')}</Link>
        <Link to="/faq" className="btn-ghost btn-sm hide-narrow" style={{ borderRadius: 8 }}>{t('nav_faq')}</Link>
        <Link to="/guide" className="btn-ghost btn-sm hide-narrow" style={{ borderRadius: 8 }}>{t('nav_guide')}</Link>
        <span className="spacer" />
        <select
          value={locale}
          onChange={(e) => changeLocale(e.target.value as 'en' | 'pl')}
          aria-label={t('language')}
          style={{ width: 'auto', padding: '5px 8px', fontSize: '0.85rem' }}
        >
          <option value="en">EN</option>
          <option value="pl">PL</option>
        </select>
        <button className="btn-ghost btn-sm" onClick={toggleTheme} aria-label="Toggle theme">◐</button>
        {user ? (
          <button className="btn-ghost btn-sm" onClick={() => setAccountOpen(true)} aria-label={t('account')}>
            {user.avatar_url ? <img className="avatar" src={user.avatar_url} alt="" /> : '⚙'}
          </button>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm">{t('log_in')}</Link>
        )}
      </div>
      {accountOpen && <AccountModal onClose={() => setAccountOpen(false)} />}
    </header>
  );
}
