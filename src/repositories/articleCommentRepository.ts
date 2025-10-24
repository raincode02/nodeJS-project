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
  return prisma.articleComment.findMany({
    where: {
      articleId,
      deletedAt: null,
      ...(cursor
        ? {
            createdAt: {
              lt:
                cursor && !isNaN(Number(cursor))
                  ? new Date(Number(cursor))
                  : new Date(Date.parse(cursor)),
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    ...(take !== undefined ? { take } : {}),
  });
};
