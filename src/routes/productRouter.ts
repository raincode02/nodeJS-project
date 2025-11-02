import express from "express";
import passport from "../lib/passport/index.js";
import {
  createProductController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
  listProductController,
  toggleProductLikeController,
} from "../controllers/productController.js";
import {
  validateProductBody,
  validateProductParams,
  validateProductQuery,
  validateProductBodyAndParams,
} from "../middlewares/productValidation.js";
import { optionalAuth } from "../middlewares/optionalAuth.js";
import { withTypedHandler } from "../lib/typedRequestHandler.js";
import type {
  ProductBodyDto,
  ProductParamsDto,
  ProductQueryDto,
} from "../dto/request/product.request.dto.js";

const router = express.Router();

// 상품 목록 조회
router.get(
  "/",
  optionalAuth,
  validateProductQuery,
  withTypedHandler<{}, unknown, {}, ProductQueryDto>(listProductController)
);

// 상품 상세 조회
router.get(
  "/:id",
  optionalAuth,
  validateProductParams,
  withTypedHandler<ProductParamsDto, unknown, {}, {}>(getProductByIdController)
);

// 상품등록
router.post(
  "/",
  passport.authenticate("access-token", { session: false }),
  validateProductBody,
  withTypedHandler<{}, unknown, ProductBodyDto, {}>(createProductController)
);

// 상품수정
router.patch(
  "/:id",
  passport.authenticate("access-token", { session: false }),
  validateProductBodyAndParams,
  withTypedHandler<ProductParamsDto, unknown, ProductBodyDto, {}>(
    updateProductController
  )
);

// 상품삭제
router.delete(
  "/:id",
  passport.authenticate("access-token", { session: false }),
  validateProductParams,
  withTypedHandler<ProductParamsDto, unknown, {}, {}>(deleteProductController)
);

// 특정 상품 좋아요 및 좋아요 취소
router.post(
  "/:id/like",
  passport.authenticate("access-token", { session: false }),
  validateProductParams,
  withTypedHandler<ProductParamsDto, unknown, {}, {}>(
    toggleProductLikeController
  )
);

export default router;
