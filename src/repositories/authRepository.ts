import prisma from "../lib/prisma.js";
import type { User } from "@prisma/client";

export const findUserByEmailOrNickname = async (
  email: string,
  nickname: string
): Promise<User | null> => {
  return prisma.user.findFirst({
    where: {
      OR: [{ email }, { nickname }],
      deletedAt: null,
    },
  });
};

export const createUserRepo = async (data: {
  email: string;
  nickname: string;
  password: string;
  provider?: string;
  providerId?: string;
}): Promise<User> => {
  return prisma.user.create({
    data,
  });
};
