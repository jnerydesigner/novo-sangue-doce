import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { type LoginDto } from './dto/login.dto';
import type { JwtPayload } from './types/jwt-payload.type';
import {
  type AuthenticatedRequest,
  AuthGuard,
} from '@app/@infra/guard/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.validateUser(loginDto.email, loginDto.password);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req: AuthenticatedRequest): JwtPayload {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    return req.user;
  }
}
