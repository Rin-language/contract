import { z } from "zod";
import { NonBlankString } from "./non-blank-string.js";

export const ApiErrorCode = z.enum([
  "invalid_request",
  "unauthorized",
  "forbidden",
  "not_found",
  "payload_too_large",
  "rate_limited",
  "quota_exceeded",
  "unsupported_language",
  "ai_unavailable",
  "ai_output_invalid",
  "internal_error",
]);
export type ApiErrorCode = z.infer<typeof ApiErrorCode>;

export const ApiError = z.strictObject({
  error: z.strictObject({
    code: ApiErrorCode,
    // Safe to show to the user: internal details go to the server logs only.
    message: NonBlankString,
  }),
});
export type ApiError = z.infer<typeof ApiError>;
