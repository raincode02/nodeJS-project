import prisma from "../lib/prisma.js";
import type { User } from "@prisma/client";
import type {
  GetUserByIdResult,
  UpdateProfileResult,
  ChangePasswordResult,
  DeleteUserByIdResult,
  GetUserProductsResult,
  GetLikedProductsResult,
  GetLikedArticlesResult,
} from "../types/service/user.service.types.js";

// 유저 조회
export const findUserById = async (
  userId: number
): Promise<GetUserByIdResult | null> => {
  return prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: {
      id: true,
      email: true,
      nickname: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      password: true,
    },
  });
};

// 유저 프로필 업데이트
export const updateUserProfileRepo = async (
  userId: number,
  data: Partial<Pick<User, "nickname" | "image">>
): Promise<UpdateProfileResult> => {
  return prisma.user.update({
    where: { id: userId, deletedAt: null },
    data,
    select: {
      id: true,
      email: true,
      nickname: true,
      image: true,
      updatedAt: true,
    },
  });
};

// 유저 비밀번호 업데이트
export const updateUserPasswordRepo = async (
  userId: number,
  hashedPassword: string
): Promise<ChangePasswordResult> => {
  return prisma.user.update({
    where: { id: userId, deletedAt: null },
    data: { password: hashedPassword },
    select: {
      id: true,
      email: true,
      nickname: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

// 유저 삭제
export const deleteUserByIdRepo = async (
  userId: number
): Promise<DeleteUserByIdResult> => {
  return prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() },
  });
};

// 유저가 등록한 상품
export const findUserProductsRepo = async (
  userId: number
): Promise<GetUserProductsResult> => {
  return prisma.product.findMany({
    where: { userId, deletedAt: null },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

// 유저가 좋아요한 상품
export const findLikedProductsRepo = async (
  userId: number
): Promise<GetLikedProductsResult> => {
  return prisma.product.findMany({
    where: { productLikes: { some: { userId } }, deletedAt: null },
    include: {
      User: { select: { id: true, nickname: true } },
      _count: { select: { productLikes: true } },
    },
  });
};

// 유저가 좋아요한 게시글
export const findLikedArticlesRepo = async (
  userId: number
): Promise<GetLikedArticlesResult> => {
  return prisma.article.findMany({
    where: { articleLikes: { some: { userId } }, deletedAt: null },
    include: {
      User: { select: { id: true, nickname: true } },
      _count: { select: { articleLikes: true } },
    },
  });
};
