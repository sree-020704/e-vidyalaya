import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class JwtStrategy {
  validateToken(token: string) {
    if (!token || !token.startsWith("jwt-session-token-")) {
      throw new UnauthorizedException(
        "Invalid or expired authentication token",
      );
    }
    const userId = token.replace("jwt-session-token-", "");
    return { userId: Number(userId) };
  }
}
