import type { JwtPayload } from "@app/auth/types/jwt-payload.type";
import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { fromNodeHeaders } from "better-auth/node";
import type { Request } from "express";
import { auth } from "../../auth/better-auth/better-auth.instance";
import { IS_PUBLIC_KEY } from "../../auth/decorators/public.decorator";

export type AuthenticatedRequest = Omit<Request, "user"> & {
  user?: JwtPayload;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);

    try {
      const payload = token
        ? await this.jwtService.verifyAsync<JwtPayload>(token)
        : await this.getBetterAuthPayload(request);

      if (!payload) {
        throw new UnauthorizedException();
      }

      request.user = payload;
    } catch {
      const payload = await this.getBetterAuthPayload(request);

      if (!payload) {
        throw new UnauthorizedException();
      }

      request.user = payload;
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];

    return type === "Bearer" ? token : undefined;
  }

  private async getBetterAuthPayload(request: Request): Promise<JwtPayload | null> {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });
    const user = session?.user;

    if (!user?.id || !user.email) {
      return null;
    }

    const role = user.role === "ADMIN" ? "ADMIN" : "USER";
    const now = new Date().toISOString();

    return {
      sub: user.id,
      name: user.name ?? user.email,
      email: user.email,
      avatarUrl: user.avatarUrl ?? user.image ?? undefined,
      birthDate: typeof user.birthDate === "string" ? user.birthDate : undefined,
      diabetesType: typeof user.diabetesType === "string" ? user.diabetesType : "UNKNOWN",
      role,
      roles: [role],
      passwordSetupRequired: false,
      createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : now,
      updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : now,
    };
  }
}
