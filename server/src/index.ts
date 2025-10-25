import Fastify from 'fastify';
import cors from '@fastify/cors';
import Container from './container';
import authRoutes from './routes/auth';
import { authenticate } from './middleware/auth';

const fastify = Fastify({
  logger: true,
});

// Register CORS
await fastify.register(cors, {
  origin: true,
});

// Register auth routes
await fastify.register(authRoutes, { prefix: '/api/auth' });

// Health check route
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Public route - get all users (without passwords)
fastify.get('/api/users', async () => {
  const userRepository = Container.getUserRepository();
  const allUsers = await userRepository.findAll();
  return allUsers;
});

// Protected route example - get current user profile
fastify.get(
  '/api/me',
  { preHandler: authenticate },
  async (request) => {
    const authService = Container.getAuthService();
    const user = await authService.getUserById(request.user!.userId);

    if (!user) {
      return {
        error: 'User not found',
      };
    }

    return {
      message: 'This is a protected route',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  },
);

// Start server
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });
    console.log(`Server is running on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
