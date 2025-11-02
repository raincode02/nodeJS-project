import prisma from "../lib/prisma.js";
import type {
  CreateProductCommentInput,
  UpdateProductCommentInput,
} from "../types/service/product-comment.service.types.js";

export const createProductCommentRepo = async (
  data: CreateProductCommentInput
) => {
  return prisma.productComment.create({
    data: {
      ...data,
      productId: data.productId,
    },
  });
};

export const updateProductCommentRepo = async (
  commentId: number,
  data: UpdateProductCommentInput
) => {
  return prisma.productComment.update({
    where: { id: commentId, deletedAt: null },
    data: {
      content: data.content,
      productId: data.productId,
    },
  });
};

export const deleteProductCommentRepo = async (commentId: number) => {
  return prisma.productComment.update({
    where: { id: commentId },
    data: { deletedAt: new Date() },
  });
};

export const listProductCommentRepo = async (
  productId: number,
  cursor?: string,
  take?: number
) => {
  const where: any = {
    productId: Number(productId),
    deletedAt: null,
  };

  // ✅ cursor 검증 강화
  if (cursor && cursor !== "undefined" && cursor !== "null") {
    try {
      const cursorDate = new Date(cursor);

      // ✅ 유효한 날짜이고, 1970년 이후인지 확인
      if (!isNaN(cursorDate.getTime()) && cursorDate.getTime() > 0) {
        where.createdAt = { lt: cursorDate };
      }
    } catch (err) {
      console.error("커서 파싱 에러:", err);
    }
  }

  return prisma.productComment.findMany({
    where: {
      productId,
      deletedAt: null,
      ...(cursor && cursor !== "null"
        ? {
            createdAt: {
              lt: /^\d+$/.test(cursor)
                ? new Date(Number(cursor))
                : new Date(cursor),
            },
          }
        : {}),
    },
    include: {
      User: { select: { id: true, nickname: true } },
    },
    orderBy: { createdAt: "desc" },
    ...(take !== undefined ? { take } : {}),
  });
};

export const getProductCommentByIdRepo = async (commentId: number) => {
  return prisma.productComment.findFirst({
    where: { id: commentId, deletedAt: null },
    include: {
      User: {
        select: {
          id: true,
          nickname: true,
        },
      },
    },
  });
};

export const getProductByIdRepo = async (productId: number) => {
  return prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
  });
};
