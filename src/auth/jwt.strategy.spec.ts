import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy.validate', () => {
  let strategy: JwtStrategy;
  let prisma: any;
  let authService: any;

  const req: any = { headers: { authorization: 'Bearer the.jwt.token' } };
  const payload = { sub: 5, email: 'bob@example.com', role: 'USER' };

  beforeEach(() => {
    prisma = { user: { findUnique: jest.fn() } };
    authService = { isTokenRevoked: jest.fn().mockReturnValue(false) };
    strategy = new JwtStrategy(
      { get: () => 'test-secret' } as any,
      prisma,
      authService,
    );
  });

  it('rejects a token that has been revoked (logout)', async () => {
    authService.isTokenRevoked.mockReturnValue(true);

    await expect(strategy.validate(req, payload)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('rejects when the user referenced by the token no longer exists', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(strategy.validate(req, payload)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('returns a trimmed user object (id/email/role/isSubscribed) looked up by payload.sub', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 5,
      email: 'bob@example.com',
      role: 'EDITOR',
      isSubscribed: true,
      password: 'hash-should-not-leak',
    });

    const result = await strategy.validate(req, payload);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 5 } });
    expect(result).toEqual({
      id: 5,
      email: 'bob@example.com',
      role: 'EDITOR',
      isSubscribed: true,
    });
  });
});
