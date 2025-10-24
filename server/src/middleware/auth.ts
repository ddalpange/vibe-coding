import type { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken, type JwtPayload } from '../utils/auth';

// Extend FastifyRequest to include user property
declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header
 * Attaches user data to request object if valid
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return reply.code(401).send({
        error: 'Authorization header missing',
      });
    }

    // Check Bearer format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return reply.code(401).send({
        error: 'Invalid authorization header format. Use: Bearer <token>',
      });
    }

    const token = parts[1];

    // Verify token
    const payload = verifyToken(token);

    if (!payload) {
      return reply.code(401).send({
        error: 'Invalid or expired token',
      });
    }

    // Attach user data to request
    request.user = payload;
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      error: 'Authentication failed',
    });
  }
}

/**
 * Optional authentication middleware
 * Attaches user data if token is valid, but doesn't fail if missing
 * Useful for routes that have different behavior for authenticated users
 */
export async function optionalAuthenticate(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return;
    }

    const token = parts[1];
    const payload = verifyToken(token);

    if (payload) {
      request.user = payload;
    }
  } catch (error) {
    // Silently fail for optional authentication
    request.log.debug('Optional authentication failed', error);
  }
}
