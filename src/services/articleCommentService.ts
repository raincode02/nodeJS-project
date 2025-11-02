import * as repo from "../repositories/articleCommentRepository.js";
import type {
  CreateArticleCommentInput,
  CreateArticleCommentResult,
  UpdateArticleCommentInput,
  UpdateArticleCommentResult,
  DeleteArticleCommentInput,
  DeleteArticleCommentResult,
  ListArticleCommentInput,
  ListArticleCommentResult,
  GetArticleCommentByIdInput,
  GetArticleCommentByIdResult,
} from "../types/service/article-comment.service.types.js";

export const createArticleComment = async (
  data: CreateArticleCommentInput
): Promise<CreateArticleCommentResult> => {
  if (!data.userId) {
    throw new Error("인증이 필요합니다.");
  }
  const articleId = Number(data.articleId);
  const articleExists = await repo.findArticleByIdRepo(articleId);
  if (!articleExists) {
    throw new Error("존재하지 않는 게시글입니다.");
  }
  return repo.createArticleCommentRepo({ ...data, articleId });
};

export const updateArticleComment = async (
  data: UpdateArticleCommentInput
): Promise<UpdateArticleCommentResult> => {
  if (!data.userId) {
    throw new Error("인증이 필요합니다.");
  }
  const commentId = Number(data.commentId);
  const content = data.content;
  const articleId = Number(data.articleId);
  // 기존 댓글 조회
  const input = { commentId, articleId };
  const comment = await getArticleCommentById(input);
  if (!comment) {
    throw new Error("댓글을 찾을 수 없습니다.");
  }

  // 댓글 작성자 확인
  if (comment.userId !== data.userId) {
    throw new Error("수정 권한이 없습니다.");
  }

  return repo.updateArticleCommentRepo({
    commentId,
    content,
    articleId,
  });
};

export const deleteArticleComment = async (
  data: DeleteArticleCommentInput
): Promise<DeleteArticleCommentResult> => {
  if (!data.userId) {
    throw new Error("인증이 필요합니다.");
  }
  const commentId = Number(data.commentId);
  const articleId = Number(data.articleId);
  // 기존 댓글 조회
  const input = { commentId, articleId };
  const comment = await getArticleCommentById(input);
  if (!comment) {
    throw new Error("댓글을 찾을 수 없습니다.");
  }

  // 댓글 작성자 확인
  if (comment.userId !== data.userId) {
    throw new Error("삭제 권한이 없습니다.");
  }

  return repo.deleteArticleCommentRepo(commentId);
};

export const listArticleComment = async ({
  articleId,
  cursor,
  limit,
}: ListArticleCommentInput): Promise<ListArticleCommentResult> => {
  const take = limit && /^\d+$/.test(limit) ? Number(limit) : undefined;

  const comments = await repo.listArticleCommentRepo(
    Number(articleId),
    cursor,
    take
  );

  const lastComment =
    comments.length > 0 ? comments[comments.length - 1] : undefined;

  const result = {
    comments,
    nextCursor: lastComment ? lastComment.createdAt.toISOString() : null,
  };

  return result;
};

export const getArticleCommentById = async (
  data: GetArticleCommentByIdInput
): Promise<GetArticleCommentByIdResult> => {
  const comment = await repo.getArticleCommentByIdRepo(Number(data.commentId));
  if (!comment) {
    throw new Error(`댓글 ${Number(data.commentId)}를 찾을 수 없습니다.`);
  }
  return comment;
};
