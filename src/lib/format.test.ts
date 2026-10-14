import { describe, expect, it } from 'vitest';
import { displayName, formatMonthYear, padIndex, projectGradient, splitWords, toTitleCase } from './format';

describe('toTitleCase', () => {
  it('capitalises the first letter of every word', () => {
    expect(toTitleCase('CHRISTOPHER EVAN')).toBe('Christopher Evan');
  });
});

describe('displayName', () => {
  it('prefers the explicit full name', () => {
    expect(displayName({ firstName: 'A', lastName: 'B', fullName: 'Alice Bob' })).toBe('Alice Bob');
  });

  it('falls back to the title-cased first and last name', () => {
    expect(displayName({ firstName: 'CHRISTOPHER', lastName: 'EVAN' })).toBe('Christopher Evan');
  });
});

describe('splitWords', () => {
  it('splits text into words and the whitespace between them', () => {
    expect(splitWords('Hi  there\nyou')).toEqual([
      { kind: 'word', value: 'Hi' },
      { kind: 'space', value: '  ' },
      { kind: 'word', value: 'there' },
      { kind: 'space', value: '\n' },
      { kind: 'word', value: 'you' },
    ]);
  });

  it('returns nothing for empty text', () => {
    expect(splitWords('')).toEqual([]);
  });
});

describe('padIndex', () => {
  it('numbers items from 01', () => {
    expect(padIndex(0)).toBe('01');
    expect(padIndex(9)).toBe('10');
  });
});

describe('projectGradient', () => {
  it('builds a radial gradient from the project colours', () => {
    expect(projectGradient(['#111111', '#222222'])).toBe(
      'radial-gradient(circle at 30% 20%, #111111, #222222 75%)',
    );
  });

  it('uses the default purple gradient when no colours are given', () => {
    expect(projectGradient()).toBe('radial-gradient(circle at 30% 20%, #7c3aed, #1e1b4b 75%)');
  });
});

describe('formatMonthYear', () => {
  it('formats an ISO date as a short month and year, whatever the time zone', () => {
    expect(formatMonthYear('2025-03-01')).toBe('Mar 2025');
    expect(formatMonthYear('2024-12-31')).toBe('Dec 2024');
  });

  it('returns the input unchanged when it is not a date', () => {
    expect(formatMonthYear('soon')).toBe('soon');
  });
});
