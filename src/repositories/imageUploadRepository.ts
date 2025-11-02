import prisma from "../lib/prisma.js";
import type { Prisma } from "@prisma/client";

export const createImages = async (
  tx: Prisma.TransactionClient | typeof prisma,
  imageUrls: string[]
) => {
  // 여러 이미지 삽입 후 생성된 레코드 반환
  return Promise.all(
    imageUrls.map((url) => tx.image.create({ data: { url } }))
  );
};
