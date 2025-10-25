import { UserRepository } from './repositories/user.repository';
import { AuthService } from './services/auth.service';

// Simple dependency injection container
class Container {
  private static userRepository: UserRepository;
  private static authService: AuthService;

  static getUserRepository(): UserRepository {
    if (!this.userRepository) {
      this.userRepository = new UserRepository();
    }
    return this.userRepository;
  }

  static getAuthService(): AuthService {
    if (!this.authService) {
      this.authService = new AuthService(this.getUserRepository());
    }
    return this.authService;
  }

  // For testing: reset container
  static reset() {
    this.userRepository = undefined as any;
    this.authService = undefined as any;
  }
}

export default Container;
