import {
  createArticle,
  getArticleById,
  updateArticle,
  deleteArticle,
  listArticle,
  toggleArticleLike,
} from "../services/articleService.js";
import { DEFAULT_PAGE, MIN_PAGESIZE, MAX_PAGESIZE } from "../lib/constants.js";
import type {
  CreateArticleController,
  GetArticleByIdController,
  UpdateArticleController,
  DeleteArticleController,
  ListArticleController,
  ToggleArticleLikeController,
} from "../types/controller/article.controller.types.js";

export const createArticleController: CreateArticleController = async (
  req,
  res,
  next
) => {
  try {
    const newArticle = await createArticle({
      title: req.body.title,
      content: req.body.content,
      ...(req.user?.id && { userId: req.user.id }),
    });
    res.status(201).json(newArticle);
  } catch (error) {
    next(error);
  }
};

export const getArticleByIdController: GetArticleByIdController = async (
  req,
  res,
  next
) => {
  try {
    const article = await getArticleById({
      id: Number(req.params.id),
      userId: req.user?.id,
    });

    res.status(200).json(article);
  } catch (error) {
    next(error);
  }
};

export const updateArticleController: UpdateArticleController = async (
  req,
  res,
  next
) => {
  try {
    const data = {
      id: Number(req.params.id),
      title: req.body.title,
      content: req.body.content,
    };
    const articlePatched = await updateArticle(data);
    res.status(200).json(articlePatched);
  } catch (error) {
    next(error);
  }
};

export const deleteArticleController: DeleteArticleController = async (
  req,
  res,
  next
) => {
  try {
    const id = Number(req.params.id);

    const result = await deleteArticle({ id });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const listArticleController: ListArticleController = async (
  req,
  res,
  next
) => {
  try {
    const result = await listArticle({
      page: Number(req.query?.page),
      pageSize: Number(req.query?.pageSize),
      ...(req.query?.keyword && { keyword: req.query.keyword }),
    });

    // ✅ userId 기반으로 isLiked 추가
    const userId = req.user?.id; // optionalAuth 미들웨어 필요

    const dataWithLiked = result.data.map((article) => ({
      ...article,
      likeCount: article._count.articleLikes,
      isLiked: userId
        ? article.articleLikes.some((like) => like.userId === userId)
        : false,
    }));

    res.status(200).json({
      ...result,
      data: dataWithLiked,
    });
  } catch (error) {
    next(error);
  }
};

// 게시글 좋아요 또는 좋아요 취소 (toggle)
export const toggleArticleLikeController: ToggleArticleLikeController = async (
  req,
  res,
  next
) => {
  try {
    const result = await toggleArticleLike({
      ...(req.user?.id && { userId: req.user.id }),
      id: Number(req.params.id),
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
