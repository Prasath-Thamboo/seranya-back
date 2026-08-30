import { toBoolean } from './coerce.util';

describe('toBoolean', () => {
  it('passes real booleans through unchanged', () => {
    expect(toBoolean(true)).toBe(true);
    expect(toBoolean(false)).toBe(false);
  });

  it('returns undefined only for undefined (so "field absent" stays absent for Prisma)', () => {
    expect(toBoolean(undefined)).toBeUndefined();
  });

  it('coerces the multipart string "true" to true and everything else to false', () => {
    expect(toBoolean('true')).toBe(true);
    expect(toBoolean('false')).toBe(false);
    expect(toBoolean('TRUE')).toBe(false);
    expect(toBoolean('1')).toBe(false);
    expect(toBoolean(null)).toBe(false);
    expect(toBoolean(0)).toBe(false);
  });
});
