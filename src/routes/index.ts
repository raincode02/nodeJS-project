import express from "express";
import articleRouter from "./articleRouter.js";
import productRouter from "./productRouter.js";
import authRouter from "./authRouter.js";
import userRouter from "./userRouter.js";
import articleCommentRouter from "./articleCommentRouter.js";
import productCommentRouter from "./productCommentRouter.js";
import imageRouter from "./imageRouter.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

router.get("/", (req, res) => {
  res.send();
});

// ------------------ Rate Limiter ------------------
// 로그인/회원가입 라우트에만 적용
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // IP당 최대 100 요청
  standardHeaders: true,
  legacyHeaders: false,
});

// ------------------ 라우터 ------------------

router.use("/auth", authLimiter, authRouter);
router.use("/users", userRouter);
router.use("/articles", articleRouter);
router.use("/products", productRouter);
router.use("/", articleCommentRouter);
router.use("/", productCommentRouter);
router.use("/api/images", imageRouter);

export default router;
