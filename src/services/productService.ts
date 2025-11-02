import * as repo from "../repositories/productRepository.js";
import prisma from "../lib/prisma.js";
import { saveUploadedImages } from "./imageUploadService.js";
import { DEFAULT_PAGE, MIN_PAGESIZE, MAX_PAGESIZE } from "../lib/constants.js";
import type {
  CreateProductInput,
  CreateProductResult,
  GetProductByIdInput,
  GetProductByIdResult,
  UpdateProductInput,
  UpdateProductResult,
  DeleteProductInput,
  DeleteProductResult,
  ListProductInput,
  ListProductResult,
  ToggleProductLikeInput,
  ToggleProductLikeResult,
} from "../types/service/product.service.types.js";

export async function createProduct(
  data: CreateProductInput
): Promise<CreateProductResult> {
  return await prisma.$transaction(async (tx) => {
    const { files = [] } = data;

    // 1. 상품 생성
    const createData: any = {
      name: data.name,
      description: data.description,
      price: data.price,
      userId: data.userId,
    };

    if (data.tags?.length) {
      createData.tags = data.tags;
    }

    const newProduct = await repo.createProductRepo(tx, createData);

    // 2. 이미지 저장 + ProductImage 연결
    const filesArray = Array.isArray(data.files)
      ? data.files
      : data.files
      ? Object.values(data.files).flat()
      : [];

    if (filesArray.length > 0) {
      const images: { id: number; url: string }[] = await saveUploadedImages(
        tx,
        filesArray
      );

      await repo.createProductImagesRepo(tx, newProduct.id, images);
    }

    // 3. 최종 반환 (연결된 이미지까지 포함)
    return await repo.findProductByIdRepo(newProduct.id);
  });
}

export async function getProductById(
  data: GetProductByIdInput
): Promise<GetProductByIdResult> {
  return await repo.findProductByIdRepo(data.id);
}

export async function updateProduct(
  data: UpdateProductInput
): Promise<UpdateProductResult> {
  return await repo.updateProductRepo(data);
}

export async function deleteProduct(
  data: DeleteProductInput
): Promise<DeleteProductResult> {
  return await repo.deleteProductRepo(data.id);
}

export async function listProduct({
  page = DEFAULT_PAGE,
  pageSize = MIN_PAGESIZE,
  keyword,
}: ListProductInput): Promise<ListProductResult> {
  let where = {};

  const trimmedKeywords = Array.isArray(keyword)
    ? keyword.map((word) => word.trim()).filter((word) => word.length > 0)
    : [];

  if (trimmedKeywords.length > 0) {
    where = {
      OR: trimmedKeywords.flatMap((word) => [
        { name: { contains: word, mode: "insensitive" } },
        { description: { contains: word, mode: "insensitive" } },
      ]),
    };
  }

  const { data, total } = await repo.listProductRepo(
    where,
    (page - 1) * pageSize,
    pageSize,
    [
      { createdAt: "desc" }, // 최신순
      { id: "desc" }, // createdAt이 같으면 id 큰 순서 먼저
    ]
  );
  if (!data) {
    return {
      data: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
      hasNextPage: false,
    };
  }

  const transformedData = data.map((p) => ({
    ...p,
    productImages: p.productImages.map((pi) => ({
      image: { url: pi.image.url },
    })),
  }));

  return {
    data: transformedData,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    hasNextPage: page * pageSize < total,
  };
}

// 상품 좋아요 토글 (이미 좋아요 했다면 취소, 아니라면 좋아요 추가)
export async function toggleProductLike({
  userId,
  id,
}: ToggleProductLikeInput): Promise<ToggleProductLikeResult> {
  const existing = await repo.findProductLikeRepo(userId, id);

  if (existing) {
    // 이미 좋아요를 눌렀다면 → 좋아요 취소
    await repo.deleteProductLikeRepo(userId, id);
  } else {
    // 아직 좋아요하지 않았다면 → 좋아요 추가
    await repo.createProductLikeRepo(userId, id);
  }

  // ✅ 토글 후 최신 좋아요 개수 조회
  const likeCount = await repo.countProductLikesRepo(id);

  return { isLiked: !existing, likeCount };
}
