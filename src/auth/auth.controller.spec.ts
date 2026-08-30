import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;

  beforeEach(() => {
    authService = {
      register: jest.fn().mockResolvedValue({ message: 'ok', user: { id: 1 } }),
      login: jest.fn().mockResolvedValue('jwt-token'),
      logout: jest.fn().mockResolvedValue({ message: 'Logout successful' }),
      getUser: jest.fn().mockResolvedValue({ id: 7 }),
      deleteAccount: jest
        .fn()
        .mockResolvedValue({ message: 'Account deleted successfully' }),
      generateResetToken: jest.fn().mockResolvedValue(undefined),
      resetPassword: jest.fn().mockResolvedValue({ id: 7 }),
      confirmEmail: jest.fn().mockResolvedValue({ user: { id: 7 } }),
    };
    controller = new AuthController(authService);
  });

  it('delegates registration to the service', async () => {
    await controller.register({
      email: 'a@b.c',
      password: 'x',
      pseudo: 'a',
    } as any);
    expect(authService.register).toHaveBeenCalled();
  });

  it('wraps the raw token into a { message, token } payload on login', async () => {
    const res = await controller.login({
      email: 'a@b.c',
      password: 'x',
    } as any);
    expect(res).toEqual({ message: 'Login successful', token: 'jwt-token' });
  });

  it('extracts the bearer token from the Authorization header on logout', async () => {
    await controller.logout('Bearer abc.def.ghi');
    expect(authService.logout).toHaveBeenCalledWith('abc.def.ghi');
  });

  it('reads the user id from the token (not the body) for /me', async () => {
    await controller.getMe({ user: { id: 7 } });
    expect(authService.getUser).toHaveBeenCalledWith(7);
  });

  it('only ever deletes the authenticated account', async () => {
    await controller.deleteAccount({ user: { id: 7 } });
    expect(authService.deleteAccount).toHaveBeenCalledWith(7);
  });

  it('returns a neutral message for a reset request regardless of the email', async () => {
    const res = await controller.generateResetToken('whoever@example.com');
    expect(res.message).toMatch(/Si cet email est enregistré/);
  });

  it('turns any confirmEmail failure into an UnauthorizedException', async () => {
    authService.confirmEmail.mockRejectedValue(new Error('token expired'));
    await expect(controller.confirmEmail('bad')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
