import jwt from "jsonwebtoken";
import {
  JWT_ACCESS_TOKEN_SECRET,
  JWT_REFRESH_TOKEN_SECRET,
} from "./constants.js";

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

// Access Token 생성
export function generateTokens(userId: number): Tokens {
  const accessToken = jwt.sign(
    { sub: userId.toString() },
    JWT_ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );

  const refreshToken = jwt.sign(
    { sub: userId.toString() },
    JWT_REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
}

// Access Token 검증
export function verifyAccessToken(token: string): { userId: number } {
  const payload = jwt.verify(token, JWT_ACCESS_TOKEN_SECRET) as { sub: string };
  return { userId: Number(payload.sub) };
}

// Refresh Token 검증
export function verifyRefreshToken(token: string): { userId: number } {
  const payload = jwt.verify(token, JWT_REFRESH_TOKEN_SECRET) as {
    sub: string;
  };
  return { userId: Number(payload.sub) };
}
