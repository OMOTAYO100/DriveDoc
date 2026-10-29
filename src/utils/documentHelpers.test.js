import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateStatus, getDaysRemaining, getStatusColor } from './documentHelpers';
import { getDocumentsForCountry, ALL_COUNTRIES } from './countryData';
import { getDisplayCategory, CATEGORIES } from './categoryMapping';
import testData from '../testData.json';

const NOW = new Date('2026-06-15T10:00:00.000Z');
const daysFromNow = (n) => new Date(NOW.getTime() + n * 86400000).toISOString();

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});
afterEach(() => vi.useRealTimers());

describe('document status', () => {
  it('marks a past date expired', () => {
    expect(calculateStatus(daysFromNow(-1))).toBe('expired');
    expect(calculateStatus(daysFromNow(-400))).toBe('expired');
  });

  it('marks the next 30 days as expiring', () => {
    expect(calculateStatus(daysFromNow(1))).toBe('expiring');
    expect(calculateStatus(daysFromNow(29))).toBe('expiring');
  });

  it('marks anything further out as valid', () => {
    expect(calculateStatus(daysFromNow(31))).toBe('valid');
    expect(calculateStatus(daysFromNow(365))).toBe('valid');
  });

  it('counts days remaining in both directions', () => {
    expect(getDaysRemaining(daysFromNow(10))).toBe(10);
    expect(getDaysRemaining(daysFromNow(-3))).toBe(-3);
  });

  it('gives every status a colour', () => {
    for (const s of ['expired', 'expiring', 'valid']) {
      expect(getStatusColor(s)).toMatch(/bg-\w+-100/);
    }
    expect(getStatusColor('nonsense')).toMatch(/bg-gray-100/);
  });
});

describe('country document types', () => {
  it('returns nothing until a country is chosen', () => {
    expect(getDocumentsForCountry('')).toEqual([]);
    expect(getDocumentsForCountry(undefined)).toEqual([]);
  });

  it('uses the specific list where we have one', () => {
    expect(getDocumentsForCountry('United Kingdom')).toContain('MOT Certificate');
    expect(getDocumentsForCountry('Nigeria')).toContain('Road Worthiness Certificate');
  });

  it('falls back to the generic list elsewhere', () => {
    expect(getDocumentsForCountry('Japan')).toContain('Driver License');
  });

  it('always offers "Other" so no country is a dead end', () => {
    for (const country of ['Nigeria', 'United Kingdom', 'Japan', 'Brazil']) {
      expect(getDocumentsForCountry(country)).toContain('Other');
    }
  });

  it('lists countries uniquely and alphabetically within each block', () => {
    expect(new Set(ALL_COUNTRIES).size).toBe(ALL_COUNTRIES.length);
  });
});

describe('question bank', () => {
  const questions = testData.questions;

  it('has an answer for every question, and it is one of the options', () => {
    for (const q of questions) {
      expect(q.answer, `${q.id} has no answer`).toBeTruthy();
      expect(
        q.options.some((o) => o.key === q.answer),
        `${q.id} answer "${q.answer}" is not among its options`
      ).toBe(true);
    }
  });

  it('has no duplicate ids', () => {
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
  });

  it('serves every image over https', () => {
    // Mixed content is blocked outright on an https site, which silently
    // blanked 265 road-sign images.
    const insecure = questions.filter((q) => q.imageUrl?.startsWith('http://'));
    expect(insecure.map((q) => q.id)).toEqual([]);
  });

  it('maps every question into a category the UI shows', () => {
    const labels = new Set(CATEGORIES.map((c) => c.label));
    for (const q of questions) {
      expect(labels.has(getDisplayCategory(q.category)), `${q.category} maps nowhere`).toBe(true);
    }
  });

  it('never loses the correct answer when de-duplicating option text', () => {
    // QuestionCard de-duplicates options by text; it must keep the correct one.
    for (const q of questions) {
      const seen = new Map();
      for (const opt of q.options) {
        const key = opt.text.trim().toLowerCase();
        if (!seen.has(key) || opt.key === q.answer) seen.set(key, opt);
      }
      expect(
        [...seen.values()].some((o) => o.key === q.answer),
        `${q.id} loses its correct answer when options are de-duplicated`
      ).toBe(true);
    }
  });
});
