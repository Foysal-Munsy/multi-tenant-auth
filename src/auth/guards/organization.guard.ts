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
    const token = authHeader.replace('Bearer ', '');

    // 7. Decode the JWT payload
    const payload = this.jwtService.decode(token);

    // 8. If token cannot be decoded, block request
    if (!payload) {
      throw new UnauthorizedException('Invalid token');
    }

    // 9. Extract organizations array from token
    const organizations = payload['organizations'];

    // 10. If organizations not present, block request
    if (!Array.isArray(organizations)) {
      throw new UnauthorizedException('No organizations found in token');
    }

    // 11. Check if requested organization exists in token
    const organization = organizations.find((org) => org.org_id === orgHeader);

    // 12. If not found, user does not belong to this org
    if (!organization) {
      throw new UnauthorizedException(
        'User is not affiliated with this organization',
      );
    }

    // 13. Attach user info to request
    request.user = {
      id: payload['sub'],
      email: payload['email'],
      role: payload['role'],
    };

    // 14. Attach active organization to request
    request.organization = organization;

    // 15. Allow request to proceed
    return true;
  }
}
