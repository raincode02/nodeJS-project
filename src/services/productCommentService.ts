import * as repo from "../repositories/productCommentRepository.js";
import type {
  CreateProductCommentInput,
  CreateProductCommentResult,
  UpdateProductCommentInput,
  UpdateProductCommentResult,
  DeleteProductCommentInput,
  DeleteProductCommentResult,
  ListProductCommentInput,
  ListProductCommentResult,
  GetProductCommentByIdInput,
  GetProductCommentByIdResult,
} from "../types/service/product-comment.service.types.js";

export const createProductComment = async (
  data: CreateProductCommentInput
): Promise<CreateProductCommentResult> => {
  if (!data.userId) {
    throw new Error("인증이 필요합니다.");
  }
  const productId = Number(data.productId);
  const productExists = await repo.getProductByIdRepo(productId);

  if (!productExists) {
    throw new Error("존재하지 않는 게시글입니다.");
  }

  return repo.createProductCommentRepo({ ...data, productId });
};

export const updateProductComment = async (
  data: UpdateProductCommentInput
): Promise<UpdateProductCommentResult> => {
  if (!data.userId) {
    throw new Error("인증이 필요합니다.");
  }

  // 기존 댓글 조회
  const input = { commentId: data.commentId, productId: data.productId };
  const comment = await getProductCommentById(input);
  if (!comment) {
    throw new Error("댓글을 찾을 수 없습니다.");
  }

  // 댓글 작성자 확인
  if (comment.userId !== data.userId) {
    throw new Error("수정 권한이 없습니다.");
  }

  return repo.updateProductCommentRepo(Number(data.commentId), data);
};

export const deleteProductComment = async (
  data: DeleteProductCommentInput
): Promise<DeleteProductCommentResult> => {
  if (!data.userId) {
    throw new Error("인증이 필요합니다.");
  }

  // 기존 댓글 조회
  const input = { commentId: data.commentId, productId: data.productId };
  const comment = await getProductCommentById(input);
  if (!comment) {
    throw new Error("댓글을 찾을 수 없습니다.");
  }

  // 댓글 작성자 확인
  if (comment.userId !== data.userId) {
    throw new Error("삭제 권한이 없습니다.");
  }

  return repo.deleteProductCommentRepo(Number(data.commentId));
};

export const listProductComment = async ({
  productId,
  cursor,
  limit,
}: ListProductCommentInput): Promise<ListProductCommentResult> => {
  const take = limit && /^\d+$/.test(limit) ? Number(limit) : undefined;

  const comments = await repo.listProductCommentRepo(
    Number(productId),
    cursor,
    take
  );

  const lastComment =
    comments.length > 0 ? comments[comments.length - 1] : undefined;
  return {
    comments,
    nextCursor: lastComment ? lastComment.createdAt.toISOString() : null,
  };
};

export const getProductCommentById = async (
  data: GetProductCommentByIdInput
): Promise<GetProductCommentByIdResult> => {
  const productComment = await repo.getProductCommentByIdRepo(
    Number(data.commentId)
  );
  if (!productComment) {
    throw new Error(`댓글 ${data.commentId}를 찾을 수 없습니다.`);
  }
  return productComment;
};
