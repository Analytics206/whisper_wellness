import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class RegisterUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  @IsString({ each: true })
  roles?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
