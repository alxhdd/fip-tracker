import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useI18n } from '../i18n';
import { useAuth } from '../App';
import { Modal } from './ui';

export function AccountModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const { user, reload } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const setConsent = async (v: boolean) => { await api.setResearchConsent(v); reload(); };
  const signOut = () => api.logout().then(() => { onClose(); reload(); navigate('/'); });
  const deleteAccount = async () => {
    if (!confirm(t('delete_account_confirm'))) return;
    await api.deleteAccount();
    onClose();
    reload();
    navigate('/');
  };

  return (
    <Modal title={t('account_title')} onClose={onClose}>
      <div className="row" style={{ gap: 10, marginBottom: 12 }}>
        {user.avatar_url && <img className="avatar" src={user.avatar_url} alt="" style={{ width: 40, height: 40 }} />}
        <div>
          <div className="small muted">{t('signed_in_as')}</div>
          <div style={{ fontWeight: 600 }}>{user.name || user.email}</div>
        </div>
      </div>

      <hr className="divider" />

      <h3 style={{ marginBottom: 6 }}>{t('research_title')}</h3>
      <p className="small" style={{ color: 'var(--text-secondary)' }}>{t('research_body')}</p>

      <label className="row" style={{ gap: 10, cursor: 'pointer', alignItems: 'flex-start', margin: '10px 0' }}>
        <input
          type="checkbox"
          style={{ width: 'auto', marginTop: 3 }}
          checked={user.research_consent === 1}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span className="small">{t('research_optin_label')}</span>
      </label>

      <p className={`small ${user.research_consent === 1 ? 'delta-up' : 'muted'}`}>
        {user.research_consent === 1 ? t('research_on') : user.research_consent === 0 ? t('research_off') : t('research_undecided')}
      </p>

      <hr className="divider" />
      <details>
        <summary style={{ cursor: 'pointer', color: 'var(--status-critical)', fontSize: '0.85rem' }}>{t('delete_account')}</summary>
        <p className="small muted" style={{ margin: '8px 0' }}>{t('delete_account_body')}</p>
        <button className="btn-danger btn-sm" onClick={deleteAccount}>{t('delete_account')}</button>
      </details>

      <hr className="divider" />
      <div className="row">
        <Link to="/faq" className="btn btn-sm" onClick={onClose}>{t('nav_faq')}</Link>
        <button className="btn-sm" onClick={signOut}>{t('sign_out')}</button>
        <button className="btn-primary right" onClick={onClose}>{t('close')}</button>
      </div>
    </Modal>
  );
}

// One-time banner on the cats list when the user hasn't decided about research use.
export function ConsentBanner() {
  const { t } = useI18n();
  const { user, reload } = useAuth();
  if (!user || user.research_consent !== null) return null;

  const decide = async (v: boolean) => { await api.setResearchConsent(v); reload(); };

  return (
    <div className="card" style={{ borderColor: 'color-mix(in srgb, var(--accent) 40%, transparent)', marginBottom: 16 }}>
      <div className="row" style={{ alignItems: 'flex-start', gap: 10 }}>
        <span style={{ fontSize: '1.4rem' }}>🔬</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <strong>{t('consent_banner_title')}</strong>
          <p className="small" style={{ margin: '4px 0 10px', color: 'var(--text-secondary)' }}>{t('consent_banner_body')}</p>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn-primary btn-sm" onClick={() => decide(true)}>{t('consent_yes')}</button>
            <button className="btn-sm" onClick={() => decide(false)}>{t('consent_no')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
