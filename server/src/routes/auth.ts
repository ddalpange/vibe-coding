import type { FastifyPluginAsync } from 'fastify';
import Container from '../container';

// Request body types
interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

const authRoutes: FastifyPluginAsync = async (fastify) => {
  const authService = Container.getAuthService();

  // User Registration
  fastify.post<{ Body: RegisterRequest }>('/register', async (request, reply) => {
    try {
      const result = await authService.register(request.body);
      return reply.code(201).send(result);
    } catch (error) {
      const err = error as Error;
      fastify.log.error(error);

      // Handle specific error cases
      if (err.message.includes('required')) {
        return reply.code(400).send({ error: err.message });
      }
      if (err.message.includes('Invalid email')) {
        return reply.code(400).send({ error: err.message });
      }
      if (err.message.includes('Password must')) {
        return reply.code(400).send({ error: err.message });
      }
      if (err.message.includes('already exists')) {
        return reply.code(409).send({ error: err.message });
      }

      return reply.code(500).send({ error: 'Failed to create user' });
    }
  });

  // User Login
  fastify.post<{ Body: LoginRequest }>('/login', async (request, reply) => {
    try {
      const result = await authService.login(request.body);
      return reply.code(200).send(result);
    } catch (error) {
      const err = error as Error;
      fastify.log.error(error);

      // Handle specific error cases (order matters!)
      if (err.message.includes('required')) {
        return reply.code(400).send({ error: err.message });
      }
      if (err.message.includes('Invalid email or password')) {
        return reply.code(401).send({ error: err.message });
      }
      if (err.message.includes('Invalid email')) {
        return reply.code(400).send({ error: err.message });
      }

      return reply.code(500).send({ error: 'Login failed' });
    }
  });
};

export default authRoutes;
