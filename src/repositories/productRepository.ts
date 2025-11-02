import prisma from "../lib/prisma.js";
import type { Prisma, Product } from "@prisma/client";
import type {
  CreateProductInput,
  UpdateProductInput,
  ListProductInput,
  ListProductResult,
} from "../types/service/product.service.types.js";

// ---------------------------------------------
// Prisma Transaction 객체 or 일반 PrismaClient 모두 허용
// ---------------------------------------------
type PrismaClientOrTx = Prisma.TransactionClient | typeof prisma;

// ✅ 상품 생성
export const createProductRepo = async (
  tx: PrismaClientOrTx,
  data: CreateProductInput
): Promise<Product> => {
  return tx.product.create({ data });
};

// ✅ 상품 이미지 연결 생성
export const createProductImagesRepo = async (
  tx: PrismaClientOrTx,
  productId: number,
  images: { id: number; url: string }[]
): Promise<Prisma.BatchPayload> => {
  return tx.productImage.createMany({
    data: images.map((img) => ({
      productId,
      imageId: img.id,
    })),
  });
};

// ✅ 단일 상품 조회
export const findProductByIdRepo = async (id: number) => {
  return prisma.product.findFirst({
    where: { id, deletedAt: null },
    include: {
      User: { select: { id: true, nickname: true } },
      productImages: { include: { image: true } },
      productLikes: { select: { userId: true } },
      _count: { select: { productLikes: true } },
    },
  });
};

// ✅ 상품 수정
export const updateProductRepo = async (data: UpdateProductInput) => {
  return prisma.product.update({
    where: { id: data.id, deletedAt: null },
    data,
  });
};

// ✅ 상품 삭제
export const deleteProductRepo = async (id: number) => {
  return prisma.product.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

// ✅ 상품 목록 조회
export const listProductRepo = async (
  where: Prisma.ProductWhereInput = {},
  skip: number,
  take: number,
  orderBy: Prisma.ProductOrderByWithRelationInput[] = [
    { createdAt: "desc" },
    { id: "desc" },
  ]
): Promise<{
  total: number;
  data: (Product & { productImages: { image: { url: string } }[] })[];
}> => {
  const finalWhere = { ...where, deletedAt: null };
  const total = await prisma.product.count({ where: finalWhere });
  const data = await prisma.product.findMany({
    where: finalWhere,
    include: {
      productImages: {
        include: {
          image: {
            select: { url: true },
          },
        },
        take: 1, // 첫 번째 이미지만
      },
      productLikes: { select: { userId: true } },
      _count: { select: { productLikes: true } },
    },
    skip,
    take,
    orderBy,
  });
  return { data, total };
};

// ✅ 좋아요 여부 조회
export const findProductLikeRepo = async (
  userId: number,
  productId: number
) => {
  return prisma.productLike.findUnique({
    where: { userId_productId: { userId, productId } },
  });
};

// ✅ 좋아요 추가
export const createProductLikeRepo = async (
  userId: number,
  productId: number
) => {
  return prisma.productLike.create({
    data: { userId, productId },
  });
};

// ✅ 좋아요 삭제
export const deleteProductLikeRepo = async (
  userId: number,
  productId: number
) => {
  return prisma.productLike.delete({
    where: { userId_productId: { userId, productId } },
  });
};

// ✅ 좋아요 개수 조회
export const countProductLikesRepo = async (
  productId: number
): Promise<number> => {
  return prisma.productLike.count({
    where: { productId },
  });
};
