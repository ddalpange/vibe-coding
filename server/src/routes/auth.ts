import type { FastifyPluginAsync } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../db/index';
import { users } from '../db/schema';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  isValidEmail,
  validatePasswordStrength,
} from '../utils/auth';

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

// Response types
interface AuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
  };
  token: string;
}

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // User Registration
  fastify.post<{ Body: RegisterRequest }>('/register', async (request, reply) => {
    const { name, email, password } = request.body;

    // Validation
    if (!name || !email || !password) {
      return reply.code(400).send({
        error: 'Name, email, and password are required',
      });
    }

    if (!isValidEmail(email)) {
      return reply.code(400).send({
        error: 'Invalid email format',
      });
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return reply.code(400).send({
        error: passwordValidation.error,
      });
    }

    try {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      if (existingUser.length > 0) {
        return reply.code(409).send({
          error: 'User with this email already exists',
        });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
        })
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
        });

      // Generate JWT token
      const token = generateToken({
        userId: newUser.id,
        email: newUser.email,
      });

      const response: AuthResponse = {
        user: newUser,
        token,
      };

      return reply.code(201).send(response);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Failed to create user',
      });
    }
  });

  // User Login
  fastify.post<{ Body: LoginRequest }>('/login', async (request, reply) => {
    const { email, password } = request.body;

    // Validation
    if (!email || !password) {
      return reply.code(400).send({
        error: 'Email and password are required',
      });
    }

    if (!isValidEmail(email)) {
      return reply.code(400).send({
        error: 'Invalid email format',
      });
    }

    try {
      // Find user by email
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      if (!user) {
        // Don't reveal whether email exists or not (security best practice)
        return reply.code(401).send({
          error: 'Invalid email or password',
        });
      }

      // Verify password
      const isPasswordValid = await verifyPassword(password, user.password);

      if (!isPasswordValid) {
        return reply.code(401).send({
          error: 'Invalid email or password',
        });
      }

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
      });

      const response: AuthResponse = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      };

      return reply.code(200).send(response);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Login failed',
      });
    }
  });
};

export default authRoutes;
