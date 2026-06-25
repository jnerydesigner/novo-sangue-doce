import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ??
        'http://localhost:3011/auth/google/callback',
      clientID: process.env.GOOGLE_CLIENT_ID ?? 'missing-google-client-id',
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET ?? 'missing-google-client-secret',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      done(new UnauthorizedException('Google account has no e-mail.'), false);
      return;
    }

    const name =
      profile.displayName ||
      [profile.name?.givenName, profile.name?.familyName]
        .filter(Boolean)
        .join(' ') ||
      email;

    const user = await this.authService.validateGoogleUser({
      email,
      googleId: profile.id,
      name,
    });

    done(null, user);
  }
}
