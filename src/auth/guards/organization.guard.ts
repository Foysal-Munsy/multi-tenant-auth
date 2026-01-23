import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class OrganizationGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Get the incoming HTTP request
    const request = context.switchToHttp().getRequest();

    // 2. Read Authorization header
    const authHeader = request.headers['authorization'];

    // 3. Read Organization header
    const orgHeader = request.headers['x-organization-id'];

    // 4. If token is missing, block request
    if (!authHeader) {
      throw new UnauthorizedException('Authorization token missing');
    }

    // 5. If organization header is missing, block request
    if (!orgHeader) {
      throw new UnauthorizedException('X-Organization-Id header missing');
    }

    // 6. Extract raw JWT (remove "Bearer ")
    // Expected format: Authorization: Bearer <token>
    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      throw new UnauthorizedException('Authorization token missing');
    }

    // 7. Verify JWT (checks signature + expiration)
    // NOTE: verify() is the secure alternative to decode(); decode() does NOT validate.
    let payload: any;
    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    // 8. Extract organizations array from token
    const organizations = payload['organizations'];

    // 9. If organizations not present, block request
    if (!Array.isArray(organizations)) {
      throw new UnauthorizedException('No organizations found in token');
    }

    // 10. Check if requested organization exists in token
    const organization = organizations.find((org) => org.org_id === orgHeader);

    // 11. If not found, user does not belong to this org
    if (!organization) {
      throw new UnauthorizedException(
        'User is not affiliated with this organization',
      );
    }

    // 12. Attach minimal user identity to request for downstream handlers
    request.user = {
      id: payload['sub'],
      email: payload['email'],
    };

    // 13. Attach active organization (tenant context + org-scoped role)
    request.organization = organization;

    // 14. Allow request to proceed
    return true;
  }
}
