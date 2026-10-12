import { describe, expect, it } from 'vitest';
import { cssVars } from './css-vars';

describe('cssVars', () => {
  it('turns custom properties into string style values', () => {
    expect(cssVars({ '--row': 2, '--rows': '5' })).toEqual({ '--row': '2', '--rows': '5' });
  });
});
