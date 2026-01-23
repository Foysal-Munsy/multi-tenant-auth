import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Read roles metadata from route
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 2. If no roles specified, allow access
    if (!requiredRoles) {
      return true;
    }

    // 3. Get request
    const request = context.switchToHttp().getRequest();

    // 4. OrganizationGuard must already attach this
    const organization = request.organization;

    if (!organization) {
      throw new ForbiddenException('Organization context missing');
    }

    // 5. Check role
    const userRole = organization.role;

    if (!requiredRoles.includes(userRole)) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}

/**
 * Read required roles from decorator
 * Compares with user role
 * Blocks request if role does not match
 * ------
 * ExecutionContext: a wrapper to access the current request (HTTP/WebSocket/GraphQL)
 *  Reflector: utility for reading metadata (the stuff set by setMetadata)
 *  getAllAndOverride behavior:
    If both class + method have roles, method-level usually overrides class-level.
  * includes(): checks if the user’s role     matches any allowed role.
    If not, block with 403 and show which roles were required.

 */
