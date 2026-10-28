import { z } from "zod";
import { NonBlankString } from "./non-blank-string.js";

/** The closed list of error codes the API returns. A client keeps a generic fallback for an unexpected response. */
export const ApiErrorCode = z
  .enum([
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
  ])
  .meta({
    description:
      "Machine-readable code of an API error. invalid_request: the body or a parameter does not match its schema. unauthorized: not signed in or invalid credentials. forbidden: signed in but not allowed. not_found: the resource does not exist or is not yours. payload_too_large: an input exceeds a server limit. rate_limited: too many requests in a short time. quota_exceeded: the usage quota of the plan is used up. unsupported_language: a well-formed language code the server has no profile for. ai_unavailable: the AI provider could not be reached or refused the call. ai_output_invalid: the model output was rejected at the boundary. internal_error: anything else. The list is closed: a client on an older contract version rejects a code added later.",
    examples: ["invalid_request", "quota_exceeded"],
  });
/** Machine-readable code of an API error. */
export type ApiErrorCode = z.infer<typeof ApiErrorCode>;

/** Body of an error response. `details` never holds user content nor internal details. */
export const ApiError = z
  .strictObject({
    error: z
      .strictObject({
        code: ApiErrorCode.meta({
          description: "Machine-readable code of the error.",
        }),
        message: NonBlankString.meta({
          description:
            "Human-readable message, safe to show to the user. Non-blank. Internal details go to the server logs only.",
        }),
        details: z.record(z.string(), z.unknown()).optional().meta({
          description:
            "Optional machine-readable context a client can act on, such as the field at fault or the limit that was exceeded: a record of string keys to any JSON value. It never contains user content (submitted text, epub excerpt, model output) nor internal details (stack traces, SQL, provider names, file paths).",
        }),
      })
      .meta({
        description:
          "The error itself: a code, a message and optional details.",
      }),
  })
  .meta({
    description:
      "Body of an error response: an object with a single error key. Unknown keys are rejected.",
    examples: [
      {
        error: {
          code: "unsupported_language",
          message: "This language is not available on this server.",
        },
      },
      {
        error: {
          code: "payload_too_large",
          message: "The text is too long.",
          details: { field: "text", limit: 2000 },
        },
      },
    ],
  });
/** Body of an error response. */
export type ApiError = z.infer<typeof ApiError>;
