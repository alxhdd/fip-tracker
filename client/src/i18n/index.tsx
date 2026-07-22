import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { en } from './en';
import { pl } from './pl';

export type Locale = 'en' | 'pl';
export type TKey = keyof typeof en;

const dicts: Record<Locale, Record<TKey, string>> = { en, pl };

interface I18nCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TKey, vars?: Record<string, string | number>) => string;
}

const Ctx = createContext<I18nCtx>(null as unknown as I18nCtx);

function detectLocale(): Locale {
  const saved = localStorage.getItem('fip_locale');
  if (saved === 'en' || saved === 'pl') return saved;
  return navigator.language.toLowerCase().startsWith('pl') ? 'pl' : 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('fip_locale', l);
    document.documentElement.lang = l;
  }, []);

  const t = useCallback(
    (key: TKey, vars?: Record<string, string | number>) => {
      let s = dicts[locale][key] ?? dicts.en[key] ?? key;
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
      return s;
    },
    [locale]
  );

  return <Ctx.Provider value={{ locale, setLocale, t }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
