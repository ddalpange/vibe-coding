import { eq } from 'drizzle-orm';
import { db } from '../db/index';
import { users } from '../db/schema';

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user || null;
  }

  async findById(id: number): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user || null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values({
        name: input.name,
        email: input.email,
        password: input.password,
      })
      .returning();

    return newUser;
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    return db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users);
  }

  async deleteByEmail(email: string): Promise<void> {
    await db.delete(users).where(eq(users.email, email));
  }
}
