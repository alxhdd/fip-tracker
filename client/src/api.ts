export interface User {
  id: number;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  locale: 'en' | 'pl';
  research_consent: 0 | 1 | null;
}

export interface Providers {
  google: boolean;
  facebook: boolean;
  dev: boolean;
}

export type FipType = 'unknown' | 'wet' | 'dry' | 'ocular' | 'neuro' | 'mixed';
export type Phase = 'monitoring' | 'treatment' | 'observation' | 'recovered' | 'memorial';

export interface Cat {
  id: number;
  name: string;
  sex: 'male' | 'female' | null;
  birth_date: string | null;
  breed: string | null;
  fip_type: FipType;
  phase: Phase;
  treatment_start: string | null;
  treatment_days: number;
  observation_start: string | null;
  observation_days: number;
  med_name: string | null;
  med_form: 'injection' | 'oral' | null;
  dose_mg_per_kg: number | null;
  med_concentration_mg_ml: number | null;
  notes: string | null;
}

export interface Entry {
  id?: number;
  date: string;
  weight_g: number | null;
  temp_c: number | null;
  appetite: number | null;
  energy: number | null;
  interest_toys: number | null;
  interest_treats: number | null;
  poop_count: number | null;
  poop_score: number | null;
  vomit_count: number | null;
  med_given: number | null;
  med_dose_mg: number | null;
  symptoms: string[];
  notes: string | null;
}

export interface Bloodwork {
  id: number;
  date: string;
  values: Record<string, number>;
  notes: string | null;
}

export interface CatData {
  entries: Entry[];
  bloodwork: Bloodwork[];
}

async function req<T>(url: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    ...opts,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.error || `HTTP ${res.status}`), { status: res.status });
  }
  return res.json();
}

export const api = {
  me: () => req<{ user: User | null; providers: Providers }>('/api/me'),
  setLocale: (locale: string) => req('/api/me', { method: 'PATCH', body: JSON.stringify({ locale }) }),
  setResearchConsent: (consent: boolean) => req('/api/me', { method: 'PATCH', body: JSON.stringify({ research_consent: consent ? 1 : 0 }) }),
  devLogin: (name: string) => req('/auth/dev', { method: 'POST', body: JSON.stringify({ name }) }),
  logout: () => req('/auth/logout', { method: 'POST' }),

  cats: () => req<{ cats: Cat[] }>('/api/cats'),
  createCat: (data: Partial<Cat>) => req<{ cat: Cat }>('/api/cats', { method: 'POST', body: JSON.stringify(data) }),
  updateCat: (id: number, data: Partial<Cat>) =>
    req<{ cat: Cat }>(`/api/cats/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCat: (id: number) => req(`/api/cats/${id}`, { method: 'DELETE' }),

  catData: (id: number) => req<CatData>(`/api/cats/${id}/entries`),
  saveEntry: (catId: number, date: string, entry: Partial<Entry>) =>
    req<{ entry: Entry }>(`/api/cats/${catId}/entries/${date}`, { method: 'PUT', body: JSON.stringify(entry) }),
  deleteEntry: (catId: number, date: string) => req(`/api/cats/${catId}/entries/${date}`, { method: 'DELETE' }),

  addBloodwork: (catId: number, data: { date: string; values: Record<string, number>; notes?: string }) =>
    req(`/api/cats/${catId}/bloodwork`, { method: 'POST', body: JSON.stringify(data) }),
  updateBloodwork: (catId: number, bwId: number, data: { date: string; values: Record<string, number>; notes?: string }) =>
    req(`/api/cats/${catId}/bloodwork/${bwId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteBloodwork: (catId: number, bwId: number) =>
    req(`/api/cats/${catId}/bloodwork/${bwId}`, { method: 'DELETE' }),

  createShare: (catId: number) => req<{ token: string }>(`/api/cats/${catId}/share`, { method: 'POST' }),
  deleteShare: (catId: number) => req(`/api/cats/${catId}/share`, { method: 'DELETE' }),
  shared: (token: string) => req<{ cat: Cat } & CatData>(`/api/share/${token}`),
};

export const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
