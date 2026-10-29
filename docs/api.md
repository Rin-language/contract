# API conventions

Cross-cutting conventions of `@rin-language/contract`, its error codes and examples of valid and invalid payloads.

**This page does not list fields.** The schemas carry their own documentation, and the field-by-field reference is generated from them, so it cannot drift from the code:

- **JSON Schemas**, one per exported schema, in `dist/json-schema/<Name>.json` and importable as `@rin-language/contract/json-schema/<Name>.json` (for example `.../json-schema/Edit.json`). Each schema, each field and the rules that JSON Schema cannot express (for example `start <= end` in `Edit`) have a `description`.
- **JSDoc** on every export, shown by the IDE where the package is used.
- **Changes between versions:** [CHANGELOG.md](../CHANGELOG.md).

The package defines **payload shapes only**. Routes, authentication and rate limiting belong to the server that implements the API (`core`). `API_VERSION` (`"v1"`) is the version of the API these shapes belong to and is meant to be used as the route prefix.

`Page` is a factory, not a schema, so no JSON Schema is generated for it. Instantiate it for the items you serve, then convert: `z.toJSONSchema(Page(Item), { io: "output" })`.

## Conventions

- **Strict objects.** Unknown keys are rejected, in requests and in responses.
- **Keys are camelCase.** Enum values and ids (error types) are lowercase `snake_case`. Levels are written in the language's own scale (`N5`, `B2`, ...).
- **Language-neutral.** Nothing that depends on the learned language is frozen here: error types, level scales, grammar and prompts live in the language profile of the `core` configuration. The schemas check shape only, and `GET /v1/capabilities` tells a client which values exist. A consumer keeps a default branch for an id it does not know (`ErrorType`, `ActivityKind`).
- **Language codes** are two lowercase letters (`ja`, `zh`, `fr`), format only. A well-formed code the server has no profile for is refused with `unsupported_language`.
- **Positions.** `start` and `end` are UTF-16 code units, the indices `String.prototype.slice` uses, counted from the beginning of the submitted `text`. `end` is exclusive. There is no `correctedText`: apply the edits to the original text, from the last to the first.
- **Days and instants.** An instant is an `IsoDateTime` with `Z` or an offset. A `DayKey` (`YYYY-MM-DD`) is computed by the server in the user's time zone; a client never decides which day an activity counts for.
- **Read and write shapes.** `UserProfile` is what the server returns; a client changes its profile with `UserProfileUpdate`. Never validate a client request with `UserProfile`: its defaults would reset stored values.
- **No size limits here.** The schemas check shape, not size. Limits come from the server configuration and are published through `LimitsResponse`. Enforce them before spending any model call.
- **Untrusted input.** Validate every request body and every model output with these schemas at the boundary, before using it.

## Error codes

Body of an error response: `{ "error": { "code", "message", "details"? } }` (`ApiError`). `details` **never contains user content** (the submitted text, an epub excerpt, a model output) **nor internal details** (stack traces, SQL, provider names, file paths). It holds what the client already sent the key of, or a public limit.

| Code | Meaning |
|---|---|
| `invalid_request` | The body or a parameter does not match its schema. |
| `unauthorized` | Not signed in, or the credentials are not valid. |
| `forbidden` | Signed in, but not allowed to do this. |
| `not_found` | The resource does not exist (or is not yours). |
| `payload_too_large` | An input exceeds a server limit (see `LimitsResponse`). |
| `rate_limited` | Too many requests in a short time. |
| `quota_exceeded` | The usage quota of the plan is used up. |
| `unsupported_language` | A well-formed `LanguageCode` the server has no profile for. |
| `ai_unavailable` | The AI provider could not be reached or refused the call. |
| `ai_output_invalid` | The model's output was rejected at the boundary. |
| `internal_error` | Anything else. |

The list is closed, so a client on an older contract version rejects a code added later: treat that as "client needs an update", and keep a generic fallback for an unexpected response.

```json
{ "error": { "code": "payload_too_large", "message": "The text is too long.", "details": { "field": "text", "limit": 2000 } } }
```

## Examples

The examples declared in the schemas (`.meta({ examples })`) are parsed by the test suite, so they are always valid. Here are a few more, with the reason invalid ones are rejected.

### CorrectionRequest

Valid:

```json
{ "text": "学校で行きます", "language": "ja", "level": "N5" }
```

```json
{ "text": "こんにちは" }
```

Invalid:

| Payload | Why |
|---|---|
| `{ "text": "   " }` | The text is blank. |
| `{ "text": "こんにちは", "language": "ja-JP" }` | Not a two-letter lowercase language code. |
| `{ "text": "こんにちは", "level": null }` | `null` is rejected: omit the key instead. |
| `{ "text": "こんにちは", "jlptLevel": "N5" }` | Unknown key (renamed `level` in 0.2.0). |

### CorrectionResponse

Valid (the edit applies to `"学校で行きます"`, whose struck-through original is `text.slice(0, 3)`):

```json
{
  "edits": [
    {
      "start": 0,
      "end": 3,
      "replacement": "学校に",
      "errorType": "particles",
      "level": "N5",
      "grammarPointId": "ni_particle",
      "explanation": "Utilisation de la mauvaise particule de destination."
    }
  ],
  "score": 85
}
```

Invalid:

| Payload | Why |
|---|---|
| An `Edit` with `"start": 5, "end": 2` | `start` is greater than `end`. |
| Two edits `{start: 0, end: 5}` then `{start: 3, end: 6}` | Edits overlap: each `start` must be at least the previous `end`. |
| An `Edit` without the `grammarPointId` key | The key is required, `null` means "no match". |
| `"score": 101` or `"score": 85.5` | The score is an integer from 0 to 100. |

### UserProfileUpdate

Valid:

```json
{ "targetLanguage": "fr", "declaredLevel": "A1" }
```

```json
{ "timezone": "Asia/Tokyo" }
```

Invalid:

| Payload | Why |
|---|---|
| `{}` | An update changes at least one field. |
| `{ "targetLanguage": "fr" }` | A new target language comes with its `declaredLevel` (the lowest of the language when unknown). |
| `{ "skillRatings": [] }` | Ratings are computed by the server only. |
| `{ "displayName": null }` | A field cannot be cleared, only changed. |

### CapabilitiesResponse

Invalid:

| Payload | Why |
|---|---|
| A language without `skills` | `skills` is required since 0.2.1. |
| Two entries with `"code": "ja"` | Language codes are unique. |
| `"levels": ["N5", "N5"]` | No duplicates, and the order is meaningful (lowest to highest). |

## What the contract does not check

These checks need information the contract does not have, so they live in `core`:

- Sizes: text length, number of edits, explanation length, `replacement` length.
- That `start` and `end` lie within the submitted text, and that the faulty span is really present in it.
- That `errorType`, `level` and `declaredLevel` belong to the profile of the language, and that `language` is one the server has a profile for.
- That `grammarPointId` exists in the language's grammar pack and belongs to the type in `errorType`.
- That `timezone` is a valid IANA name.
- That `declaredLevel` in a `UserProfileUpdate` belongs to the scale of the resulting target language (the stored one when the update does not change it).
- That `SkillRating.skill` is one of the language's `skills`, and that an `ActivityKind` is one the server knows.
- Which day a `DayKey` should be: the server computes it in the user's time zone.
- That `score` is consistent with the edits.
