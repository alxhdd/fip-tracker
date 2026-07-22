import type { Cat, Entry, Bloodwork } from '../api';
import { TEMP } from '../fipConfig';

export const daysBetween = (a: string, b: string) =>
  Math.round((new Date(`${b}T12:00`).getTime() - new Date(`${a}T12:00`).getTime()) / 86400_000);

export function phaseDay(cat: Cat, today: string): { day: number; total: number } | null {
  if (cat.phase === 'treatment' && cat.treatment_start) {
    return { day: daysBetween(cat.treatment_start, today) + 1, total: cat.treatment_days };
  }
  if (cat.phase === 'observation' && cat.observation_start) {
    return { day: daysBetween(cat.observation_start, today) + 1, total: cat.observation_days };
  }
  return null;
}

const num = (v: number | null | undefined): v is number => typeof v === 'number' && !isNaN(v);

export function lastWith<T>(arr: Entry[], pick: (e: Entry) => number | null): { date: string; value: number } | null {
  for (let i = arr.length - 1; i >= 0; i--) {
    const v = pick(arr[i]);
    if (num(v)) return { date: arr[i].date, value: v };
  }
  return null;
}

export function firstWith(arr: Entry[], pick: (e: Entry) => number | null): { date: string; value: number } | null {
  for (const e of arr) {
    const v = pick(e);
    if (num(v)) return { date: e.date, value: v };
  }
  return null;
}

export function feverCount(entries: Entry[], sinceDays = 14, today: string): number {
  return entries.filter((e) => num(e.temp_c) && e.temp_c! > TEMP.fever && daysBetween(e.date, today) <= sinceDays).length;
}

export function recentSymptoms(entries: Entry[], days: number, today: string): string[] {
  const set = new Set<string>();
  for (const e of entries) {
    if (daysBetween(e.date, today) <= days) e.symptoms.forEach((s) => set.add(s));
  }
  return [...set];
}

export function computeAG(bw: Bloodwork): number | null {
  if (num(bw.values.ag_ratio)) return bw.values.ag_ratio;
  if (num(bw.values.albumin) && num(bw.values.globulin) && bw.values.globulin !== 0) {
    return Math.round((bw.values.albumin / bw.values.globulin) * 100) / 100;
  }
  return null;
}

export function loggingStreak(entries: Entry[], today: string): number {
  const dates = new Set(entries.map((e) => e.date));
  let streak = 0;
  const d = new Date(`${today}T12:00`);
  // Allow today to be missing without breaking the streak.
  if (!dates.has(today)) d.setDate(d.getDate() - 1);
  for (;;) {
    const s = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (dates.has(s)) { streak++; d.setDate(d.getDate() - 1); } else break;
  }
  return streak;
}

export function fmtWeight(g: number): string {
  return g >= 1000 ? `${(g / 1000).toFixed(2)} kg` : `${g} g`;
}
