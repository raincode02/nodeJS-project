// services/userService.js
import prisma from "../lib/prisma.js";
import { hashPassword, verifyPassword } from "../lib/hash.js";
import * as repo from "../repositories/userRepository.js";
import type {
  GetUserByIdInput,
  GetUserByIdResult,
  UpdateProfileInput,
  UpdateProfileResult,
  ChangePasswordInput,
  ChangePasswordResult,
  DeleteUserByIdInput,
  DeleteUserByIdResult,
  GetUserProductsInput,
  GetUserProductsResult,
  GetLikedProductsInput,
  GetLikedProductsResult,
  GetLikedArticlesInput,
  GetLikedArticlesResult,
} from "../types/service/user.service.types.js";

// 프로필 조회
export const getUserById = async (
  data: GetUserByIdInput
): Promise<GetUserByIdResult | null> => {
  const user = await repo.findUserById(data.userId);
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
};

// 프로필 수정
export const updateUserProfile = async (
  data: UpdateProfileInput
): Promise<UpdateProfileResult> => {
  const updateData: Partial<{ nickname: string; image: string }> = {};
  if (data.nickname !== undefined) updateData.nickname = data.nickname;
  if (data.image !== undefined) updateData.image = data.image;

  return repo.updateUserProfileRepo(data.userId, updateData);
};

// 비밀번호 변경
export const changeUserPassword = async ({
  userId,
  currentPassword,
  newPassword,
}: ChangePasswordInput): Promise<ChangePasswordResult> => {
  // 유저 조회
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.password)
    throw new Error("User not found or no password set");

  // 현재 비밀번호 확인
  const isMatch = await verifyPassword(currentPassword, user.password);
  if (!isMatch) throw new Error("Current password is incorrect");

  // 새 비밀번호 해싱
  const hashedNewPassword = await hashPassword(newPassword);

  // 업데이트 후 필요한 필드만 반환
  return repo.updateUserPasswordRepo(userId, hashedNewPassword);
};

// 사용자 삭제
export const deleteUserById = async (
  data: DeleteUserByIdInput
): Promise<DeleteUserByIdResult> => {
  return repo.deleteUserByIdRepo(data.userId);
};

// 유저가 등록한 상품 목록 조회
export const getUserProducts = async (
  data: GetUserProductsInput
): Promise<GetUserProductsResult> => {
  return repo.findUserProductsRepo(data.userId);
};

// 유저가 좋아요한 상품 목록 조회
export const getLikedProducts = async (
  data: GetLikedProductsInput
): Promise<GetLikedProductsResult> => {
  return repo.findLikedProductsRepo(data.userId);
};

// 유저가 좋아요한 게시글 목록 조회
export const getLikedArticles = async (
  data: GetLikedArticlesInput
): Promise<GetLikedArticlesResult> => {
  return repo.findLikedArticlesRepo(data.userId);
};
