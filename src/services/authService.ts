import * as repo from "../repositories/authRepository.js";
import { hashPassword } from "../lib/hash.js";
import type {
  CheckUserExistsInput,
  CheckUserExistsResult,
  CreateUserInput,
  CreateUserResult,
} from "../types/service/auth.service.types.js";

/** 이메일 또는 닉네임 중복 확인 */
export const checkUserExists = async ({
  email,
  nickname,
}: CheckUserExistsInput): Promise<CheckUserExistsResult> => {
  return repo.findUserByEmailOrNickname(email, nickname);
};

/** 사용자 생성 */
export const createUser = async ({
  email,
  nickname,
  password,
}: CreateUserInput): Promise<CreateUserResult> => {
  const hashedPassword = await hashPassword(password);

  return repo.createUserRepo({
    email,
    nickname,
    password: hashedPassword,
    provider: "local",
    providerId: email,
  });
};
