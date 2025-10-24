import Fastify from 'fastify';
import cors from '@fastify/cors';
import { db } from './db/index';
import { users } from './db/schema';
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
  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(users);
  return allUsers;
});

// Protected route example - get current user profile
fastify.get(
  '/api/me',
  { preHandler: authenticate },
  async (request) => {
    // request.user is available because of authenticate middleware
    return {
      message: 'This is a protected route',
      user: request.user,
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
