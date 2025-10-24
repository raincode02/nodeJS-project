import {
  createArticleComment,
  updateArticleComment,
  deleteArticleComment,
  listArticleComment,
  getArticleCommentById,
} from "../services/articleCommentService.js";
import type {
  CreateArticleCommentController,
  UpdateArticleCommentController,
  DeleteArticleCommentController,
  ListArticleCommentController,
  GetArticleCommentByIdController,
} from "../types/controller/article-comment.controller.types.js";

export const createArticleCommentController: CreateArticleCommentController =
  async (req, res, next) => {
    try {
      const articleComment = await createArticleComment({
        content: req.body.content,
        articleId: Number(req.params.articleId),
        ...(req.user?.id && { userId: req.user.id }),
      });
      res.status(201).json(articleComment);
    } catch (error) {
      next(error);
    }
  };

export const updateArticleCommentController: UpdateArticleCommentController =
  async (req, res, next) => {
    try {
      const atcCommentPatched = await updateArticleComment({
        content: req.body.content,
        commentId: Number(req.params.commentId),
        articleId: Number(req.params.articleId),
        ...(req.user?.id && { userId: req.user.id }),
      });
      res.status(200).json(atcCommentPatched);
    } catch (error) {
      next(error);
    }
  };

export const deleteArticleCommentController: DeleteArticleCommentController =
  async (req, res, next) => {
    try {
      await deleteArticleComment({
        commentId: Number(req.params.commentId!),
        articleId: Number(req.params.articleId),
        ...(req.user?.id && { userId: req.user.id }),
      });
      res.status(200).json({ message: "댓글이 삭제되었습니다." });
    } catch (error) {
      next(error);
    }
  };

export const listArticleCommentController: ListArticleCommentController =
  async (req, res, next) => {
    try {
      const articleComments = await listArticleComment({
        articleId: req.params.articleId,
        cursor: req.query.cursor,
        limit: req.query.limit,
      });

      res.status(200).json(articleComments);
    } catch (error) {
      next(error);
    }
  };

export const getArticleCommentByIdController: GetArticleCommentByIdController =
  async (req, res, next) => {
    try {
      const articleComment = await getArticleCommentById({
        commentId: Number(req.params.commentId!),
        articleId: Number(req.params.articleId),
      });

      res.status(200).json(articleComment);
    } catch (error) {
      next(error);
    }
  };
