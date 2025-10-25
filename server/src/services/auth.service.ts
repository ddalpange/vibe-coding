import {
  hashPassword,
  verifyPassword,
  generateToken,
  isValidEmail,
  validatePasswordStrength,
} from '../utils/auth';
import { UserRepository } from '../repositories/user.repository';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
  };
  token: string;
}

export class AuthService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async register(input: RegisterInput): Promise<AuthResponse> {
    const { name, email, password } = input;

    // Validation
    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required');
    }

    if (!isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.error);
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email.toLowerCase());
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await this.userRepository.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Generate JWT token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
    });

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
      token,
    };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;

    // Validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (!isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    // Find user by email
    const user = await this.userRepository.findByEmail(email.toLowerCase());
    if (!user) {
      // Don't reveal whether email exists or not (security best practice)
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  }

  async getUserById(userId: number) {
    return this.userRepository.findById(userId);
  }
}
