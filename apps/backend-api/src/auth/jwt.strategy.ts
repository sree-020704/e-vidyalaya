import { Injectable, UnauthorizedException } from "@nestjs/common";

import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey:
        process.env.JWT_SECRET || "evidyalaya_super_secret_jwt_key_2026",
    });
  }

  async validate(payload: any) {
    if (!payload) {
      throw new UnauthorizedException("Invalid authentication token.");
    }

    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
  }
}
