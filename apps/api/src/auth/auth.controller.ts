import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthUser } from './auth.types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'User successfully registered',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        user: { $ref: '#/components/schemas/User' }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Bad request' 
  })
  @ApiBody({ type: RegisterUserDto })
  async register(@Body() registerUserDto: RegisterUserDto): Promise<{ access_token: string; user: AuthUser }> {
    return this.authService.register(registerUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User successfully logged in',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        user: { $ref: '#/components/schemas/User' }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Unauthorized' 
  })
  @ApiBody({ type: LoginUserDto })
  async login(@Request() req: { user: AuthUser }): Promise<{ access_token: string; user: AuthUser }> {
    return this.authService.login(req.user);
  }
}
