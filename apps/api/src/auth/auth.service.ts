import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../users/schemas/user.schema';
import { JwtPayload } from './strategies/jwt.strategy';
import { AuthUser } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private toAuthUser(user: any): AuthUser {
    return {
      _id: user._id?.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles || ['user'],
      isActive: user.isActive !== undefined ? user.isActive : true,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin,
      preferences: user.preferences || {},
      createdBy: user.createdBy,
      updatedBy: user.updatedBy
    };
  }

  async validateUser(email: string, password: string): Promise<AuthUser | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }
    
    // Get user with password for verification
    const userWithPassword = await this.usersService.findByEmailWithPassword(email);
    if (!userWithPassword || !(await bcrypt.compare(password, userWithPassword.password))) {
      return null;
    }
    
    // Convert to AuthUser
    return this.toAuthUser(user);
  }

  async login(user: AuthUser): Promise<{ access_token: string; user: AuthUser }> {
    const payload: JwtPayload = { 
      email: user.email, 
      sub: user._id.toString() 
    };
    
    // Update last login
    await this.usersService.updateLastLogin(user._id);
    
    // Get the updated user with the new lastLogin value
    const updatedUser = await this.usersService.findById(user._id);
    if (!updatedUser) {
      throw new Error('User not found after updating last login');
    }
    
    // Map the user to AuthUser type
    const authUser = this.toAuthUser(updatedUser);
    
    return {
      access_token: this.jwtService.sign(payload),
      user: authUser
    };
  }

  async register(registerUserDto: RegisterUserDto): Promise<{ access_token: string; user: AuthUser }> {
    try {
      const existingUser = await this.usersService.findByEmail(registerUserDto.email);
      if (existingUser) {
        throw new UnauthorizedException('Email already in use');
      }

      const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);
      const createdUser = await this.usersService.create({
        ...registerUserDto,
        password: hashedPassword,
        roles: registerUserDto.roles || ['user'],
        isActive: registerUserDto.isActive !== undefined ? registerUserDto.isActive : true,
        preferences: {},
        createdBy: 'system',
        updatedBy: 'system'
      });
      
      if (!createdUser) {
        throw new Error('Failed to create user');
      }

      // Fetch the complete user to ensure we have all fields
      const createdUserDoc = createdUser as any; // Cast to any to access _id
      const savedUser = await this.usersService.findById(createdUserDoc._id);
      if (!savedUser) {
        throw new Error('Failed to fetch created user');
      }

      // Convert to AuthUser and login
      const authUser = this.toAuthUser(savedUser);
      return this.login(authUser);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new Error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
