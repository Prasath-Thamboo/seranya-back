import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user) {
    // Never rejects: request.user stays null for anonymous/invalid-token requests
    // instead of throwing like JwtAuthGuard does.
    return user || null;
  }
}
