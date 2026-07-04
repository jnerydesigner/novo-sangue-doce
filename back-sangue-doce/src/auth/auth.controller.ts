import { type AuthenticatedRequest, AuthGuard } from "@app/@infra/guard/auth.guard";
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard as PassportAuthGuard } from "@nestjs/passport";
import type { Request as ExpressRequest, Response } from "express";
import { AuthService } from "./auth.service";
import type { LoginDto } from "./dto/login.dto";
import type { RequestEmailLoginCodeDto } from "./dto/request-email-login-code.dto";
import type { SetPasswordDto } from "./dto/set-password.dto";
import type { UpdateProfileDto } from "./dto/update-profile.dto";
import type { VerifyEmailLoginCodeDto } from "./dto/verify-email-login-code.dto";
import type { GoogleAuthUser } from "./types/google-auth-user.type";
import type { JwtPayload } from "./types/jwt-payload.type";

type GoogleAuthenticatedRequest = ExpressRequest & {
  user?: GoogleAuthUser;
};

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  login(@Body() loginDto: LoginDto) {
    return this.authService.validateUser(loginDto.email, loginDto.password);
  }

  @Post("email-code/request")
  requestEmailLoginCode(@Body() requestEmailLoginCodeDto: RequestEmailLoginCodeDto) {
    return this.authService.requestEmailLoginCode(requestEmailLoginCodeDto);
  }

  @Post("email-code/verify")
  verifyEmailLoginCode(@Body() verifyEmailLoginCodeDto: VerifyEmailLoginCodeDto) {
    return this.authService.verifyEmailLoginCode(verifyEmailLoginCodeDto);
  }

  @Get("google")
  @UseGuards(PassportAuthGuard("google"))
  googleLogin() {
    return;
  }

  @Get("google/callback")
  @UseGuards(PassportAuthGuard("google"))
  googleCallback(@Request() req: GoogleAuthenticatedRequest, @Res() res: Response) {
    if (!req.user?.access_token) {
      throw new UnauthorizedException();
    }

    const redirectUrl = new URL(
      "/api/auth/google/callback",
      process.env.FRONTEND_URL ?? "http://localhost:3010",
    );
    redirectUrl.searchParams.set("token", req.user.access_token);

    return res.redirect(redirectUrl.toString());
  }

  @UseGuards(AuthGuard)
  @Get("profile")
  getProfile(@Request() req: AuthenticatedRequest): Promise<JwtPayload> {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    return this.authService.getProfile(req.user);
  }

  @UseGuards(AuthGuard)
  @Patch("profile")
  updateProfile(@Request() req: AuthenticatedRequest, @Body() updateProfileDto: UpdateProfileDto) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    return this.authService.updateProfile(req.user, updateProfileDto);
  }

  @UseGuards(AuthGuard)
  @Patch("password")
  setInitialPassword(@Request() req: AuthenticatedRequest, @Body() setPasswordDto: SetPasswordDto) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    return this.authService.setInitialPassword(req.user, setPasswordDto);
  }
}
