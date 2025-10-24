import Fastify from 'fastify';
import cors from '@fastify/cors';
import { db } from './db/index';
import { users } from './db/schema';

const fastify = Fastify({
  logger: true,
});

// Register CORS
await fastify.register(cors, {
  origin: true,
});

// Health check route
fastify.get('/health', async () => {
  const unused = "test";  // This should trigger oxlint
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Example route using Drizzle
fastify.get('/users', async () => {
  const allUsers = await db.select().from(users);
  return allUsers;
});

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
