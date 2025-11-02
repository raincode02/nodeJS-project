import prisma from "../lib/prisma.js";
import type { Prisma } from "@prisma/client";
import type {
  CreateArticleInput,
  UpdateArticleInput,
} from "../types/service/article.service.types.js";

export const createArticleRepo = async (data: CreateArticleInput) => {
  return prisma.article.create({ data });
};

export const getArticleByIdRepo = async (id: number) => {
  return prisma.article.findFirst({
    where: { id: id, deletedAt: null },
    include: {
      User: { select: { id: true, nickname: true } },
      articleLikes: { select: { userId: true } },
      _count: { select: { articleLikes: true } },
    },
  });
};

export const updateArticleRepo = async (data: UpdateArticleInput) => {
  return prisma.article.update({
    where: { id: data.id, deletedAt: null },
    data: {
      title: data.title,
      content: data.content,
    },
  });
};

export const deleteArticleRepo = async (id: number) => {
  return prisma.article.update({
    where: { id: id },
    data: { deletedAt: new Date() },
  });
};

export const listArticleRepo = async (
  where: Prisma.ArticleWhereInput = {},
  skip: number,
  take: number,
  orderBy: Prisma.ArticleOrderByWithRelationInput[] = [
    { createdAt: "desc" },
    { id: "desc" },
  ]
) => {
  const finalWhere = { ...where, deletedAt: null };
  const total = await prisma.article.count({ where: finalWhere });
  const data = await prisma.article.findMany({
    where: finalWhere,
    include: {
      User: { select: { id: true, nickname: true } },
      articleLikes: { select: { userId: true } },
      _count: { select: { articleLikes: true } },
    },
    skip,
    take,
    orderBy,
  });
  return { data, total };
};

export const toggleArticleLikeRepo = async (
  userId: number,
  articleId: number
) => {
  const existing = await prisma.articleLike.findUnique({
    where: { userId_articleId: { userId, articleId } },
  });

  if (existing) {
    await prisma.articleLike.delete({
      where: { userId_articleId: { userId, articleId } },
    });
    return false;
  } else {
    await prisma.articleLike.create({ data: { userId, articleId } });
    return true;
  }
};

export const countArticleLikesRepo = async (articleId: number) => {
  return prisma.articleLike.count({ where: { articleId } });
};
