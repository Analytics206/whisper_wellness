import { User } from '../users/schemas/user.schema';

export type JwtPayload = {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
};

export interface UserPreferences {
  theme?: string;
  language?: string;
  // Add other preference fields as needed
}

export interface AuthUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date | null;
  preferences: Record<string, any>;
  createdBy?: string;
  updatedBy?: string;
}
