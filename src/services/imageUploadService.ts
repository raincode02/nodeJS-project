import prisma from "../lib/prisma.js";
import type { Prisma } from "@prisma/client";
import * as imageRepo from "../repositories/imageUploadRepository.js";

/**
 * DB에 이미지 저장 후 반환
 * @param tx - Prisma 트랜잭션 객체
 * @param files - 업로드된 파일 배열
 */
export async function saveUploadedImages(
  tx: Prisma.TransactionClient | typeof prisma,
  files: Express.Multer.File[]
) {
  if (!files || files.length === 0) {
    throw new Error("파일이 업로드되지 않았습니다.");
  }

  // MIME 타입 체크
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  for (const file of files) {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`${file.originalname}은 지원되지 않는 파일 형식입니다.`);
    }
  }

  // DB에 저장할 URL 배열 생성
  const urls = files.map((file) => `/images/${file.filename}`);

  // DB 호출
  const images = await imageRepo.createImages(tx, urls);

  return images;
}
