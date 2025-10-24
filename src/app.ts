import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import cookieParser from "cookie-parser";
import router from "./routes/index.js";
import errorHandler from "./middlewares/errorHandler.js";
import path from "path";
import helmet from "helmet";

dotenv.config(); // .env 파일 로드 → process.env에 환경변수 등록

const app = express();

// CORS 적용 → 다른 도메인에서 API 호출 허용/제한, 자격증명(쿠키) 포함 허용
app.use(
  cors({
    origin: process.env.NEXT_PUBLIC_FRONT_URL || "http://localhost:3000", // 허용 출처
    credentials: true, // 쿠키 등 자격증명 포함 허용
  })
);

// Body Parser 적용 → 요청 body를 JSON / URL-encoded로 변환
app.use(express.json({ limit: "10kb" })); // JSON body 최대 10KB 제한 → DoS 공격 완화
app.use(express.urlencoded({ extended: true, limit: "10kb" })); // form-urlencoded body 최대 10KB 제한

// Cookie Parser → 요청 쿠키를 읽어서 req.cookies에 넣음
app.use(cookieParser());

// Passport 초기화 → 인증 미들웨어 사용 가능
app.use(passport.initialize());

// 보안 헤더 적용 (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"], // 기본 리소스는 자기 도메인만 허용 → XSS, 데이터 탈취 방지
        scriptSrc: ["'self'"], // 스크립트는 자기 도메인만 허용 → 외부 악성 스크립트 실행 방지
        styleSrc: ["'self'"], // CSS는 자기 도메인만 허용 → 외부 스타일로 인한 UI 조작 방지
        fontSrc: ["'self'"], // 폰트는 자기 도메인만 허용 → 외부 폰트로 인한 공격 방지
        imgSrc: ["'self'", "data:"], // 이미지 자기 도메인 + inline(base64) 허용 → 외부 이미지 공격 방지
        objectSrc: ["'none'"], // 플러그인(object/embed) 사용 금지 → 클릭재킹, 악성 플러그인 방지
        upgradeInsecureRequests: ["upgrade-insecure-requests"], // HTTP 요청 자동 HTTPS 업그레이드 → mixed content 방지
      },
    },
    crossOriginEmbedderPolicy: true, // Cross-Origin Embedder Policy 적용 → 안전한 cross-origin 리소스만 허용
    crossOriginOpenerPolicy: true, // Cross-Origin Opener Policy 적용 → 브라우저 window 객체 공유 제한, 탭 간 공격 방지
    frameguard: { action: "deny" }, // iframe 등으로 페이지 삽입 금지 → 클릭재킹 방지
    hidePoweredBy: true, // X-Powered-By 헤더 제거 → 서버 정보 노출 방지
    hsts: { maxAge: 31536000, includeSubDomains: true }, // HTTPS 강제, 하위 도메인 포함 → MITM 공격 방지
    noSniff: true, // Content-Type 강제 → MIME 타입 스니핑 공격 방지
    referrerPolicy: { policy: "no-referrer" }, // referrer 정보 노출 최소화 → 개인정보/세션 정보 보호
  })
);

// 정적 파일 제공 → /images 경로에서 uploads 폴더 제공
app.use("/images", express.static(path.join(process.cwd(), "uploads")));

// 라우터 연결 → API 요청 처리
app.use("/", router);

// 404 처리 → 정의되지 않은 라우트 접근 시
app.use((req, res, next) => {
  res.status(404).json({ error: "존재하지 않는 주소입니다." });
});

// 에러 핸들러 미들웨어 → 라우트/미들웨어에서 발생한 오류 처리
app.use(errorHandler);

// 서버 시작
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`서버가 ${port}에서 시작되었습니다.`);
});
