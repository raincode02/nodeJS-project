import { z } from "zod";

// 제어문자·제로폭·Bidi 차단용 정규식
const CONTROL_OR_INVISIBLE =
  /[\u0000-\u001F\u007F\u200B-\u200D\u2060\uFEFF\u202A-\u202E]/;

const safeInt = (min: number, max: number, message?: string) =>
  z
    .number()
    .int({ message: "정수여야 합니다" })
    .superRefine((n, ctx) => {
      if (!Number.isSafeInteger(n)) {
        ctx.addIssue({
          code: "custom",
          message: "안전한 정수 범위를 벗어났습니다",
        });
      }
    })
    .refine((n) => n >= min && n <= max, {
      message: message ?? `정수 범위는 ${min} ~ ${max} 입니다`,
    });

const stringToInt = (schema: z.ZodTypeAny) =>
  z.preprocess(
    (val) => (typeof val === "string" && /^\d+$/.test(val) ? Number(val) : val),
    schema
  );

/**
 * 상품 댓글 스키마
 */
export const ProductCommentBodySchema = z
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

export const ProductCommentQuerySchema = z
  .object({
    cursor: z
      .string()
      .trim()
      .max(100, { message: "cursor는 100자를 초과할 수 없습니다" }) // 100자 제한으로 DoS 공격 방어
      .refine(
        (val) => {
          const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
          return isoDateRegex.test(val);
        },
        { message: "유효한 ISO 8601 날짜 형식이어야 합니다" } // ISO 8601 형식만 엄격하게 허용
      )
      .refine(
        (val) => {
          const date = new Date(val);
          if (isNaN(date.getTime())) return false;

          const minDate = new Date("2000-01-01T00:00:00.000Z");
          const maxDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 2000년 ~ 현재+1일만 허용

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

export const ProductCommentParamsSchema = z
  .object({
    commentId: stringToInt(safeInt(1, Number.MAX_SAFE_INTEGER)).optional(),
    productId: stringToInt(safeInt(1, Number.MAX_SAFE_INTEGER)),
  })
  .strict()
  .superRefine((obj, ctx) => {
    for (const k of Object.keys(obj)) {
      if (["__proto__", "constructor", "prototype"].includes(k)) {
        ctx.addIssue({ code: "custom", message: `허용되지 않은 키: ${k}` });
      }
    }
  });
