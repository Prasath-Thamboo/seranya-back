import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';

describe('JwtAuthGuard.handleRequest', () => {
  const guard = new JwtAuthGuard();

  it('throws the passport error when one is present', () => {
    const err = new Error('jwt expired');

    expect(() => guard.handleRequest(err, null)).toThrow(err);
  });

  it('throws UnauthorizedException when there is no user', () => {
    expect(() => guard.handleRequest(null, null)).toThrow(
      UnauthorizedException,
    );
  });

  it('throws UnauthorizedException when the user has no id', () => {
    expect(() => guard.handleRequest(null, { email: 'a@b.c' })).toThrow(
      /User ID not found/,
    );
  });

  it('returns the user when the token is valid', () => {
    const user = { id: 5, email: 'a@b.c', role: 'USER' };

    expect(guard.handleRequest(null, user)).toBe(user);
  });
});

describe('OptionalJwtAuthGuard.handleRequest', () => {
  const guard = new OptionalJwtAuthGuard();

  it('returns null instead of throwing for an anonymous / invalid-token request', () => {
    expect(guard.handleRequest(new Error('no token'), undefined)).toBeNull();
    expect(guard.handleRequest(null, false)).toBeNull();
  });

  it('passes the authenticated user through untouched', () => {
    const user = { id: 5, role: 'EDITOR' };

    expect(guard.handleRequest(null, user)).toBe(user);
  });
});
