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
      // ✅ cursor 정제
      let cursor: string | undefined = undefined;
      if (req.query.cursor && typeof req.query.cursor === "string") {
        // 유효한 날짜 문자열인지 확인
        const testDate = new Date(req.query.cursor);
        if (!isNaN(testDate.getTime()) && testDate.getTime() > 946684800000) {
          // 2000-01-01 이후만 유효
          cursor = req.query.cursor;
        }
      }

      const productComments = await listProductComment({
        productId: req.params.productId,
        cursor: cursor,
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
