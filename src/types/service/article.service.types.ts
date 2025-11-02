import type { Article, ArticleLike } from "@prisma/client";
import type {
  listArticleDto,
  getArticleByIdDto,
  createArticleDto,
  updateArticleDto,
  deleteArticleDto,
  toggleArticleLikeDto,
} from "../../dto/service/article.service.dto.js";

/** CREATE */
export type CreateArticleInput = createArticleDto;
export type CreateArticleResult = Article;

/** GET by ID */
export type GetArticleByIdInput = getArticleByIdDto;
export interface GetArticleByIdResult {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number | null;
  User: { id: number; nickname: string } | null;
  likeCount: number;
  likedUserIds: number[];
  isLiked: boolean;
}

/** UPDATE */
export type UpdateArticleInput = updateArticleDto;
export type UpdateArticleResult = Article;

/** DELETE */
export type DeleteArticleInput = deleteArticleDto;
export type DeleteArticleResult = {
  message: string;
  article?: Article;
};

/** LIST */
export type ListArticleInput = listArticleDto;
export interface ListArticleResult {
  data: Article[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
}

/** LIKE */
export type ToggleArticleLikeInput = toggleArticleLikeDto;
export type ToggleArticleLikeResult = {
  isLiked: boolean;
  likeCount: number;
};
