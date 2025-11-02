import { z } from "zod";

// 제어문자·제로폭·Bidi 차단용 정규식
const CONTROL_OR_INVISIBLE =
  /[\u0000-\u001F\u007F\u200B-\u200D\u2060\uFEFF\u202A-\u202E]/;

export const ArticleCommentBodySchema = z
  .object({
    content: z
      .string({ required_error: "content: required" })
      .min(1, { message: "content: 최소 1자 이상" })
      .max(500, { message: "content: 최대 500자 이하" })
      .transform((v) => v.trim().normalize("NFC"))
      .superRefine((val, ctx) => {
        if (CONTROL_OR_INVISIBLE.test(val)) {
          ctx.addIssue({ code: "custom", message: "content: 제어문자 불가" });
        }
        if (!/^[^<>]*$/.test(val)) {
          ctx.addIssue({ code: "custom", message: "content: 금지 패턴 포함" });
        }
        // allowed 패턴 추가 (예: 한글/영문/숫자/공백만 허용)
        const allowed = /^[\p{L}\p{N}\s.,!?'"-]*$/u;
        if (!allowed.test(val)) {
          ctx.addIssue({
            code: "custom",
            message: "content: 허용되지 않은 문자",
          });
        }
      }),
  })
  .strict()
  .superRefine((obj, ctx) => {
    for (const k of Object.keys(obj)) {
      if (["__proto__", "constructor", "prototype"].includes(k)) {
        ctx.addIssue({ code: "custom", message: `허용되지 않은 키: ${k}` });
      }
    }
  });

export const ArticleCommentQuerySchema = z
  .object({
    cursor: z
      .string()
      .trim()
      .max(100, { message: "cursor는 100자를 초과할 수 없습니다" })
      .refine(
        (val) => {
          // ✅ ISO 8601 날짜 형식만 허용 (YYYY-MM-DDTHH:mm:ss.sssZ)
          const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
          return isoDateRegex.test(val);
        },
        { message: "유효한 ISO 8601 날짜 형식이어야 합니다" }
      )
      .refine(
        (val) => {
          const date = new Date(val);
          // ✅ 유효한 날짜인지 확인
          if (isNaN(date.getTime())) return false;

          // ✅ 2000-01-01 이후 날짜만 허용
          const minDate = new Date("2000-01-01T00:00:00.000Z");
          // ✅ 미래 날짜 + 1일까지만 허용 (시간대 차이 고려)
          const maxDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

          return date >= minDate && date <= maxDate;
        },
        { message: "유효한 날짜 범위를 벗어났습니다 (2000년 이후 ~ 현재)" }
      )
      .optional(),

    limit: z
      .preprocess(
        (val) =>
          typeof val === "string" && /^\d+$/.test(val) ? Number(val) : val,
        z
          .number()
          .int({ message: "정수여야 합니다" })
          .refine((n) => Number.isSafeInteger(n), {
            message: "안전한 정수 범위를 벗어났습니다",
          })
          .refine((n) => n >= 1 && n <= 10, {
            message: "정수 범위는 1 ~ 10 입니다",
          })
      )
      .default(10),
  })
  .strict()
  .superRefine((obj, ctx) => {
    // Prototype pollution 방어
    for (const k of Object.keys(obj)) {
      if (["__proto__", "constructor", "prototype"].includes(k)) {
        ctx.addIssue({
          code: "custom",
          message: `허용되지 않은 키: ${k}`,
          path: [k],
        });
      }
    }
  });

export const ArticleCommentParamsSchema = z
  .object({
    commentId: z
      .preprocess(
        (val) =>
          typeof val === "string" && /^\d+$/.test(val) ? Number(val) : val,
        z
          .number()
          .int({ message: "정수여야 합니다" })
          .refine((n) => Number.isSafeInteger(n), {
            message: "안전한 정수 범위를 벗어났습니다",
          })
          .refine((n) => n >= 1 && n <= Number.MAX_SAFE_INTEGER, {
            message: `정수 범위는 1 ~ ${Number.MAX_SAFE_INTEGER} 입니다`,
          })
      )
      .optional(),
    articleId: z.preprocess(
      (val) =>
        typeof val === "string" && /^\d+$/.test(val) ? Number(val) : val,
      z
        .number()
        .int({ message: "정수여야 합니다" })
        .refine((n) => Number.isSafeInteger(n), {
          message: "안전한 정수 범위를 벗어났습니다",
        })
        .refine((n) => n >= 1 && n <= Number.MAX_SAFE_INTEGER, {
          message: `정수 범위는 1 ~ ${Number.MAX_SAFE_INTEGER} 입니다`,
        })
    ),
  })
  .strict()
  .superRefine((obj, ctx) => {
    for (const k of Object.keys(obj)) {
      if (["__proto__", "constructor", "prototype"].includes(k)) {
        ctx.addIssue({ code: "custom", message: `허용되지 않은 키: ${k}` });
      }
    }
  });
