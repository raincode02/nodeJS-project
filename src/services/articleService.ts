import * as repo from "../repositories/articleRepository.js";
import { DEFAULT_PAGE, MIN_PAGESIZE, MAX_PAGESIZE } from "../lib/constants.js";
import type {
  CreateArticleInput,
  CreateArticleResult,
  GetArticleByIdInput,
  GetArticleByIdResult,
  UpdateArticleInput,
  UpdateArticleResult,
  DeleteArticleInput,
  DeleteArticleResult,
  ListArticleInput,
  ListArticleResult,
  ToggleArticleLikeInput,
  ToggleArticleLikeResult,
} from "../types/service/article.service.types.js";

export const createArticle = async (
  data: CreateArticleInput
): Promise<CreateArticleResult> => {
  if (!data.userId) {
    throw new Error("인증이 필요합니다.");
  }

  return repo.createArticleRepo(data);
};

export const getArticleById = async (
  data: GetArticleByIdInput
): Promise<GetArticleByIdResult> => {
  const userId = Number(data.userId);

  const article = await repo.getArticleByIdRepo(data.id);
  if (!article) {
    throw new Error(`게시글 ${Number(data.id)}를 찾을 수 없습니다.`);
  }
  const likedUserIds = article.articleLikes.map((l) => l.userId);
  return {
    id: article.id,
    title: article.title,
    content: article.content,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    userId: article.userId,
    User: article.User,
    likeCount: article._count.articleLikes,
    likedUserIds,
    isLiked: userId ? likedUserIds.includes(userId) : false,
  };
};

export const updateArticle = async (
  data: UpdateArticleInput
): Promise<UpdateArticleResult> => {
  if (!data.userId) {
    throw new Error("인증이 필요합니다.");
  }

  // 기존 상품 조회
  const article = await getArticleById({ id: data.id, userId: data.userId });
  if (!article) {
    throw new Error("게시글을 찾을 수 없습니다.");
  }

  // 작성자 확인
  if (article.userId !== data.userId) {
    throw new Error("수정 권한이 없습니다.");
  }

  return repo.updateArticleRepo(data);
};

export const deleteArticle = async (
  data: DeleteArticleInput
): Promise<DeleteArticleResult> => {
  if (!data.userId) {
    throw new Error("인증이 필요합니다.");
  }
  const article = await getArticleById({ id: data.id, userId: data.userId });
  if (!article) throw new Error("게시글을 찾을 수 없습니다.");
  if (article.userId !== data.userId) throw new Error("삭제 권한이 없습니다.");

  await repo.deleteArticleRepo(data.id);
  return { message: "게시글이 삭제되었습니다." };
};

export const listArticle = async ({
  page = DEFAULT_PAGE,
  pageSize = MIN_PAGESIZE,
  keyword,
}: ListArticleInput): Promise<ListArticleResult> => {
  let where = {};

  const trimmedKeywords = Array.isArray(keyword)
    ? keyword.map((word) => word.trim()).filter((word) => word.length > 0)
    : [];

  if (trimmedKeywords.length > 0) {
    where = {
      OR: trimmedKeywords.flatMap((word) => [
        { title: { contains: word, mode: "insensitive" } },
        { content: { contains: word, mode: "insensitive" } },
      ]),
    };
  }

  const { data, total } = await repo.listArticleRepo(
    where,
    (page - 1) * pageSize,
    pageSize,
    [
      { createdAt: "desc" }, // 최신순
      { id: "desc" }, // createdAt이 같으면 id 큰 순서 먼저
    ]
  );
  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    hasNextPage: page * pageSize < total,
  };
};

// 게시글 좋아요 토글 기능
export const toggleArticleLike = async ({
  userId,
  id,
}: ToggleArticleLikeInput): Promise<ToggleArticleLikeResult> => {
  if (!userId) throw new Error("인증이 필요합니다.");

  const isLiked = await repo.toggleArticleLikeRepo(userId, id);
  const likeCount = await repo.countArticleLikesRepo(id);
  return { isLiked, likeCount };
};
