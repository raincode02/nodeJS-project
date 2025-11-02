import prisma from "../lib/prisma.js";
import type {
  CreateArticleCommentInput,
  UpdateArticleCommentInput,
} from "../types/service/article-comment.service.types.js";

export const createArticleCommentRepo = async (
  data: CreateArticleCommentInput
) => {
  return prisma.articleComment.create({ data });
};

export const findArticleByIdRepo = async (articleId: number) => {
  return prisma.article.findFirst({
    where: { id: articleId, deletedAt: null },
  });
};

export const getArticleCommentByIdRepo = async (commentId: number) => {
  return prisma.articleComment.findFirst({
    where: { id: commentId, deletedAt: null },
    include: {
      User: {
        select: { id: true, nickname: true },
      },
    },
  });
};

export const updateArticleCommentRepo = async (
  data: UpdateArticleCommentInput
) => {
  return prisma.articleComment.update({
    where: { id: data.commentId, deletedAt: null },
    data,
  });
};

export const deleteArticleCommentRepo = async (commentId: number) => {
  return prisma.articleComment.update({
    where: { id: commentId },
    data: { deletedAt: new Date() },
  });
};

export const listArticleCommentRepo = async (
  articleId: number,
  cursor?: string,
  take?: number
) => {
  const where: any = {
    articleId: Number(articleId),
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

  const comments = await prisma.articleComment.findMany({
    where,
    include: {
      User: {
        select: { id: true, nickname: true },
      },
    },
    orderBy: { createdAt: "desc" },
    ...(take !== undefined ? { take } : {}),
  });

  return comments;
};
