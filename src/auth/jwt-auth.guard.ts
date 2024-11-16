import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user) {
    if (err || !user) {
      console.error('JwtAuthGuard - Error:', err);
      throw err || new UnauthorizedException('Invalid token');
    }

    console.log('JwtAuthGuard - User:', user);

    if (!user.id) {
      // Use 'id' instead of 'userId' because 'id' is returned by JwtStrategy
      throw new UnauthorizedException('User ID not found in token');
    }

    return user;
  }
}
