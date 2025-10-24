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
  cursor?: number,
  take?: number
) => {
  return prisma.productComment.findMany({
    where: {
      productId,
      deletedAt: null,
      ...(cursor
        ? {
            createdAt: {
              lt: new Date(cursor),
            },
          }
        : {}),
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
