import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { AuthUser } from '../auth.types';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<AuthUser> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // Convert User to AuthUser
    return {
      _id: (user as any)._id?.toString() || '',
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      roles: Array.isArray(user.roles) ? user.roles : ['user'],
      isActive: user.isActive !== undefined ? user.isActive : true,
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date(),
      lastLogin: user.lastLogin || null,
      preferences: {},
      createdBy: '',
      updatedBy: ''
    } as AuthUser;
  }
}
