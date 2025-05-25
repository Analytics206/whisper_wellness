import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/schemas/user.schema';
import { AuthUser } from '../auth.types';

export interface JwtPayload {
  email: string;
  sub: string; // user ID
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'your-secret-key'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser | null> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      return null;
    }
    
    // Convert User to AuthUser
    // Cast to any first to access the _id property, then to UserDocument to access other properties
    const userDoc = user as any;
    return {
      _id: userDoc._id?.toString() || '',
      email: userDoc.email || '',
      firstName: userDoc.firstName || '',
      lastName: userDoc.lastName || '',
      roles: Array.isArray(userDoc.roles) ? userDoc.roles : ['user'],
      isActive: userDoc.isActive !== undefined ? userDoc.isActive : true,
      createdAt: userDoc.createdAt || new Date(),
      updatedAt: userDoc.updatedAt || new Date(),
      lastLogin: userDoc.lastLogin || null,
      preferences: userDoc.preferences || {},
      createdBy: userDoc.createdBy || '',
      updatedBy: userDoc.updatedBy || ''
    };
  }
}
