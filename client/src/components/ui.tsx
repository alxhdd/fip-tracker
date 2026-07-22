import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useI18n, type TKey } from '../i18n';
import type { Phase } from '../api';
import { BREEDS } from '../fipConfig';

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);
  // Portal to <body> so the fixed overlay escapes any ancestor that creates a
  // containing block (the topbar's backdrop-filter would otherwise trap it).
  return createPortal(
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '5vh 12px', overflowY: 'auto' }}
    >
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: wide ? 720 : 480, width: '100%', margin: 'auto 0' }}
      >
        <div className="row" style={{ marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button className="btn-ghost right" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

export function PhaseBadge({ phase }: { phase: Phase }) {
  const { t } = useI18n();
  return (
    <span className={`badge badge-${phase}`}>
      <span className="dot" />
      {t(`phase_${phase}` as TKey)}
    </span>
  );
}

// Segmented 0–5 score selector.
export function ScoreInput({ value, onChange, hintKey }: { value: number | null; onChange: (v: number | null) => void; hintKey?: TKey }) {
  const { t } = useI18n();
  const levelKeys: TKey[] = ['score_0', 'score_1', 'score_2', 'score_3', 'score_4', 'score_5'];
  return (
    <div>
      <div className="score-input" role="group">
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            className={value === n ? 'active' : ''}
            onClick={() => onChange(value === n ? null : n)}
            aria-pressed={value === n}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="score-hint">{value !== null ? t(levelKeys[value]) : t('not_recorded')}</div>
    </div>
  );
}

// Free-text breed input backed by a datalist of common breeds.
export function BreedInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useI18n();
  return (
    <>
      <input
        list="breed-list"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('breed_placeholder')}
        autoComplete="off"
      />
      <datalist id="breed-list">
        {BREEDS.map((b) => <option key={b} value={b} />)}
      </datalist>
    </>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      {label}
      {children}
    </label>
  );
}

export function useTheme() {
  useEffect(() => {
    const saved = localStorage.getItem('fip_theme');
    if (saved === 'dark' || saved === 'light') document.documentElement.setAttribute('data-theme', saved);
  }, []);
}
