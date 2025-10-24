import {
  createProductComment,
  updateProductComment,
  deleteProductComment,
  listProductComment,
  getProductCommentById,
} from "../services/productCommentService.js";
import type {
  CreateProductCommentController,
  UpdateProductCommentController,
  DeleteProductCommentController,
  ListProductCommentController,
  GetProductCommentByIdController,
} from "../types/controller/product-comment.controller.types.js";

export const createProductCommentController: CreateProductCommentController =
  async (req, res, next) => {
    try {
      const productComment = await createProductComment({
        content: req.body.content,
        productId: Number(req.params.productId),
        ...(req.user?.id && { userId: req.user.id }),
      });
      res.status(201).json(productComment);
    } catch (error) {
      next(error);
    }
  };

export const updateProductCommentController: UpdateProductCommentController =
  async (req, res, next) => {
    try {
      const pdCommentPatched = await updateProductComment({
        content: req.body.content,
        commentId: Number(req.params.commentId!),
        productId: Number(req.params.productId),
      });
      res.status(200).json(pdCommentPatched);
    } catch (error) {
      next(error);
    }
  };

export const deleteProductCommentController: DeleteProductCommentController =
  async (req, res, next) => {
    try {
      await deleteProductComment({
        commentId: Number(req.params.commentId!),
        productId: Number(req.params.productId),
      });
      res.status(200).json({ message: "댓글이 삭제되었습니다." });
    } catch (error) {
      next(error);
    }
  };

export const listProductCommentController: ListProductCommentController =
  async (req, res, next) => {
    try {
      const productComments = await listProductComment({
        productId: req.params.productId,
        cursor: req.query.cursor,
        limit: req.query.limit,
      });

      res.status(200).json(productComments);
    } catch (error) {
      next(error);
    }
  };

export const getProductCommentByIdController: GetProductCommentByIdController =
  async (req, res, next) => {
    try {
      const productComment = await getProductCommentById({
        commentId: Number(req.params.commentId!),
        productId: Number(req.params.productId),
      });

      res.status(200).json(productComment);
    } catch (error) {
      next(error);
    }
  };
