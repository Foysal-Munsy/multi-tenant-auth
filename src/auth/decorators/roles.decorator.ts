import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

/**
 * This tells which roles are allowed on an endpoint
 * This only stores metadata.
 * ---------
 * SetMetadata is a Nest helper that attached "metadata" to a route handler/class.
 * Metadata is like hidden labels stored on your endpoint(not sent to client)
 * ---------
 * Roles us a decorator factory –> it returns a decorator created by metadata
 */
