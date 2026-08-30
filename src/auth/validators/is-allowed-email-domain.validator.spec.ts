import { validate } from 'class-validator';
import {
  IsAllowedEmailDomain,
  ALLOWED_EMAIL_DOMAINS,
} from './is-allowed-email-domain.validator';

class Dto {
  @IsAllowedEmailDomain()
  email: any;
}

const check = async (email: any) => {
  const dto = new Dto();
  dto.email = email;
  const errors = await validate(dto);
  return errors.length === 0;
};

describe('IsAllowedEmailDomain', () => {
  it('accepts an address from every whitelisted provider', async () => {
    for (const domain of ALLOWED_EMAIL_DOMAINS) {
      expect(await check(`user@${domain}`)).toBe(true);
    }
  });

  it('is case-insensitive on the domain', async () => {
    expect(await check('User@GMAIL.com')).toBe(true);
  });

  it('rejects an unknown / disposable domain', async () => {
    expect(await check('user@mailinator.com')).toBe(false);
    expect(await check('user@seranya-blog.com')).toBe(false);
  });

  it('rejects malformed values', async () => {
    expect(await check('not-an-email')).toBe(false);
    expect(await check('')).toBe(false);
    expect(await check(42)).toBe(false);
    expect(await check(null)).toBe(false);
  });
});
