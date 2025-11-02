import { Strategy as JwtStrategy } from "passport-jwt";
import prisma from "../prisma.js";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  JWT_ACCESS_TOKEN_SECRET,
  JWT_REFRESH_TOKEN_SECRET,
} from "../constants.js";
import type { Request } from "express";
import type { VerifiedCallback } from "passport-jwt";
import { verifyAccessToken, verifyRefreshToken } from "../token.js";

// Access Token 전략
export const accessTokenStrategy = new JwtStrategy(
  {
    jwtFromRequest: (req: Request) => req.cookies?.[ACCESS_TOKEN_COOKIE_NAME],
    secretOrKey: JWT_ACCESS_TOKEN_SECRET,
    passReqToCallback: false,
  },
  async (payload: { sub: string }, done: VerifiedCallback) => {
    try {
      const userId = Number(payload.sub);
      const user = await prisma.user.findUnique({
        where: { id: userId, deletedAt: null },
      });

      done(null, user || false);
    } catch (err) {
      done(err as Error, false);
    }
  }
);

// Refresh Token 전략
export const refreshTokenStrategy = new JwtStrategy(
  {
    jwtFromRequest: (req: Request) => req.cookies?.[REFRESH_TOKEN_COOKIE_NAME],
    secretOrKey: JWT_REFRESH_TOKEN_SECRET,
    passReqToCallback: false,
  },
  async (payload: { sub: string }, done: VerifiedCallback) => {
    try {
      const userId = Number(payload.sub);
      const user = await prisma.user.findUnique({
        where: { id: userId, deletedAt: null },
      });

      done(null, user || false);
    } catch (err) {
      done(err as Error, false);
    }
  }
);
