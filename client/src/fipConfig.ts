// Clinical constants for FIP tracking. Grounded in UC Davis / Pedersen protocols
// and FIP-community guides. These are TRACKING AIDS — dosing/medical decisions
// belong to the treating vet or FIP-group admin, not to this app.
import type { TKey } from './i18n';

// ---- Daily qualitative scores (0 worst … 5 best) ----
export const SCORE_METRICS = [
  { key: 'appetite', icon: '🍽️' },
  { key: 'energy', icon: '⚡' },
  { key: 'interest_toys', icon: '🧶' },
  { key: 'interest_treats', icon: '🐟' },
] as const;

export type ScoreMetricKey = (typeof SCORE_METRICS)[number]['key'];

// Labels for each 0–5 level, keyed into i18n as `score_<n>`.
export const SCORE_LEVEL_KEYS: TKey[] = ['score_0', 'score_1', 'score_2', 'score_3', 'score_4', 'score_5'];

// ---- Stool scale (1 hard … 7 liquid; ~2 ideal) ----
export const POOP_MIN = 1;
export const POOP_MAX = 7;

// ---- Temperature (Celsius). Normal 38.1–39.2; fever >39.2; urgent >41. ----
export const TEMP = {
  normalMin: 38.1,
  normalMax: 39.2,
  fever: 39.2,
  urgent: 41.0,
};

// ---- Symptom checklist. `dry` flags signs emphasised for dry / neuro / ocular
// watch, where blood can look near-normal. ----
export interface SymptomDef {
  key: string;
  group: 'general' | 'ocular' | 'neuro' | 'abdominal';
  dry?: boolean;
}
export const SYMPTOMS: SymptomDef[] = [
  { key: 'fever', group: 'general', dry: true },
  { key: 'lethargy', group: 'general', dry: true },
  { key: 'weight_loss', group: 'general', dry: true },
  { key: 'inappetence', group: 'general' },
  { key: 'jaundice', group: 'general', dry: true },
  { key: 'poor_coat', group: 'general' },
  { key: 'dehydration', group: 'general' },
  { key: 'effusion_belly', group: 'abdominal' },
  { key: 'breathing_difficulty', group: 'abdominal' },
  { key: 'enlarged_lymph', group: 'abdominal', dry: true },
  { key: 'abdominal_mass', group: 'abdominal', dry: true },
  { key: 'eye_cloudiness', group: 'ocular', dry: true },
  { key: 'iris_color_change', group: 'ocular', dry: true },
  { key: 'anisocoria', group: 'ocular', dry: true },
  { key: 'vision_change', group: 'ocular', dry: true },
  { key: 'wobbly_gait', group: 'neuro', dry: true },
  { key: 'tremors', group: 'neuro', dry: true },
  { key: 'behavior_change', group: 'neuro', dry: true },
  { key: 'seizures', group: 'neuro', dry: true },
  { key: 'incontinence', group: 'neuro', dry: true },
  { key: 'hypersensitivity', group: 'neuro', dry: true },
  { key: 'injection_site_sore', group: 'general' },
];

// ---- Bloodwork markers. Reference ranges are lab-dependent defaults the user
// can mentally override; we only flag against these to hint direction. ----
export interface MarkerDef {
  key: string;
  unit: string;
  refMin?: number;
  refMax?: number;
  fipDir: 'low' | 'high' | 'ratio'; // direction that suggests active FIP
  primary?: boolean; // shown as a headline trend chart
  decimals: number;
}
export const MARKERS: MarkerDef[] = [
  { key: 'ag_ratio', unit: '', refMin: 0.6, refMax: 1.2, fipDir: 'ratio', primary: true, decimals: 2 },
  { key: 'globulin', unit: 'g/dL', refMin: 2.3, refMax: 5.3, fipDir: 'high', primary: true, decimals: 1 },
  { key: 'albumin', unit: 'g/dL', refMin: 2.4, refMax: 3.9, fipDir: 'low', primary: true, decimals: 1 },
  { key: 'total_protein', unit: 'g/dL', refMin: 5.7, refMax: 8.0, fipDir: 'high', decimals: 1 },
  { key: 'hematocrit', unit: '%', refMin: 29, refMax: 48, fipDir: 'low', primary: true, decimals: 0 },
  { key: 'lymphocytes_pct', unit: '%', refMin: 20, refMax: 45, fipDir: 'low', decimals: 0 },
  { key: 'neutrophils_pct', unit: '%', refMin: 35, refMax: 75, fipDir: 'high', decimals: 0 },
  { key: 'wbc', unit: '10⁹/L', refMin: 5.5, refMax: 19.5, fipDir: 'high', decimals: 1 },
  { key: 'bilirubin', unit: 'mg/dL', refMin: 0, refMax: 0.4, fipDir: 'high', decimals: 2 },
  { key: 'alt', unit: 'U/L', refMin: 10, refMax: 100, fipDir: 'high', decimals: 0 },
  { key: 'ast', unit: 'U/L', refMin: 10, refMax: 50, fipDir: 'high', decimals: 0 },
  { key: 'agp', unit: 'µg/mL', refMin: 0, refMax: 500, fipDir: 'high', decimals: 0 },
];

// A:G recovery target; globulin/A:G are the most caregiver-legible response signals.
export const AG_RECOVERY_TARGET = 0.8;
export const AGP_RECOVERY = 500;

// ---- Dosing reference (SC = subcutaneous injection; PO = oral). mg/kg q24h,
// min 84 days. Displayed as guidance only. ----
export const DOSING = {
  minTreatmentDays: 84,
  observationDays: 84, // 12-week relapse watch
  highRiskRelapseDays: 60,
  forms: [
    { key: 'wet', sc: '4–6', po: '10' },
    { key: 'dry', sc: '6', po: '10' },
    { key: 'ocular', sc: '8', po: '16' },
    { key: 'neuro', sc: '10', po: '20' },
  ],
};

export const FIP_TYPES = ['unknown', 'wet', 'dry', 'ocular', 'neuro', 'mixed'] as const;
export const PHASES = ['monitoring', 'treatment', 'observation', 'recovered', 'memorial'] as const;

// Common breeds shown as free-text suggestions (a datalist). Users can type anything.
// Ordered with the everyday choices first, then purebreds alphabetically.
export const BREEDS = [
  'Domestic Shorthair', 'Domestic Longhair', 'Mixed breed',
  'Abyssinian', 'American Shorthair', 'Bengal', 'Birman', 'British Shorthair',
  'Burmese', 'Devon Rex', 'Exotic Shorthair', 'Maine Coon', 'Norwegian Forest Cat',
  'Oriental Shorthair', 'Persian', 'Ragdoll', 'Russian Blue', 'Scottish Fold',
  'Siamese', 'Siberian', 'Sphynx', 'Turkish Angora',
];
