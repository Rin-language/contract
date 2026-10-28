# API reference

Reference for the schemas exported by `@rin-language/contract`. The schemas are the source of truth: if this page and a schema ever disagree, the schema wins and this page has a bug.

The package defines **payload shapes only**. Routes, authentication and rate limiting belong to `core` and `cloud`. `API_VERSION` (`"v1"`) is the version of the API these shapes belong to and is meant to be used as the route prefix.

## Breaking changes in 0.2.0

0.2.0 makes the contract independent of the learned language. These changes are **breaking on purpose** (allowed in 0.x), and 0.1.0 stays published unchanged.

| Before (0.1.0) | Now (0.2.0) |
|---|---|
| `ErrorType` was a closed enum of 21 values | `ErrorType` is a non-blank string. The valid ids come from the language profile in the `core` configuration and are published by `CapabilitiesResponse`. |
| `JlptLevel` enum and `Edit.jlptLevel` | `Level` (non-blank string) and `Edit.level`. The scale comes from the language: `N5` to `N1`, `A1` to `C2`, and so on. |
| `CorrectionRequest.level` was a `JlptLevel` | Same key, now a `Level`. |
| A request had no language | `CorrectionRequest.language`, optional. |

New schemas: `LanguageCode`, `CapabilitiesResponse` (and `LanguageCapabilities`), `Page`, `ApiError` (and `ApiErrorCode`), `UserProfile`.

Migrating: rename `jlptLevel` to `level`, drop the `JlptLevel` import (use `Level`), and stop switching exhaustively on `ErrorType`: it is a free string now, so keep a default branch.

## Additions in 0.2.1

Additive, except for two fields that become **required**: `LanguageCapabilities.skills` and `UserProfile.declaredLevel`. No server returns capabilities or profiles yet, so no existing response breaks, but a server built against 0.2.0 must send both.

- Common primitives: `Id`, `IsoDateTime`, `DayKey`, `ActivityKind`.
- `SkillRating`, and `UserProfile.skillRatings` (read-only, defaults to `[]`).
- `UserProfileUpdate`: what a client sends to change its profile.
- `UserProfile.declaredLevel` is required: the server starts it at the lowest level of the language.
- `LanguageCapabilities.skills`.
- `HealthResponse`.
- `ApiError`: optional `error.details`.

## Conventions

- **Strict objects.** Unknown keys are rejected, in requests and in responses.
- **Keys are camelCase.** Enum values and ids (error types) are lowercase `snake_case`. Levels are written in the language's own scale (`N5`, `B2`, ...).
- **Language-neutral.** Nothing that depends on the learned language is frozen here: error types, level scales, grammar and prompts live in the language profile of the `core` configuration. The schemas check shape only, and `GET /v1/capabilities` tells a client which values exist.
- **Language codes** are two-letter lowercase ISO 639-1 codes (`ja`, `zh`, `fr`), see `LanguageCode`.
- **Positions.** `start` and `end` are UTF-16 code units, the indices `String.prototype.slice` uses, counted from the beginning of the submitted `text`. `end` is exclusive.
- **No size limits here.** The schemas check shape, not size. Limits come from the server configuration and are published through `LimitsResponse`. Enforce them before spending any model call.
- **Untrusted input.** Validate every request body and every model output with these schemas at the boundary, before using it.

## LanguageCode

A string of exactly two lowercase ASCII letters: `ja`, `zh`, `fr`, `ko`, `en`. No region or script suffix (`zh-CN` and `zh-Hans` are rejected), no uppercase.

Only the **format** is checked, not membership in the ISO 639-1 list: which languages exist is the decision of the server configuration. A well-formed code the server has no profile for is refused by the server with the `unsupported_language` error code. Format and rationale: `core/docs/language-data.md`.

## Common primitives

Building blocks reused by the other schemas. Each one checks a format only.

| Schema | Type | Rules |
|---|---|---|
| `Id` | string | Not blank. Opaque: a client stores it and sends it back, never parses it or builds one. |
| `IsoDateTime` | string | ISO 8601 date-time **with** `Z` or a numeric offset (`2026-10-28T09:32:00Z`, `2026-10-28T16:32:00+07:00`). Fractional seconds are allowed. A date alone, a time without a zone and a day that does not exist (`2026-02-30T10:00:00Z`) are rejected. |
| `DayKey` | string | `YYYY-MM-DD`, zero-padded, and the day must exist: `2026-02-30`, `2026-02-29` (common year), `2026-13-01` and `2026-1-5` are rejected, `2028-02-29` is accepted. |
| `ActivityKind` | string | Not blank. An open list, never a closed enum: each slice adds its kind (`writing`, `reading`, ...). Keep a default branch for an unknown kind, as for `ErrorType`. |

### DayKey is computed by the server

A `DayKey` is the calendar day an activity counts for, in the user's `timezone`. Only the server computes it, from the instant and the profile's time zone, so streaks and goals never depend on a client clock. A client displays it and may send one back to query a day, but the contract only checks the format: the server decides which day an activity belongs to.

## CorrectionRequest

What a client sends to have a text corrected.

| Field | Type | Required | Rules |
|---|---|---|---|
| `text` | string | yes | Not blank: at least one character that is not whitespace after `trim()`. The text is never trimmed or altered. |
| `language` | `LanguageCode` | no | Language of the text. When omitted, the server uses the `targetLanguage` of the user profile. `null` is rejected. |
| `level` | `Level` | no | The learner's level, in the scale of the language (`"N4"`, `"B1"`). Omit the key to let the server decide. `null` is rejected. |

```json
{ "text": "学校で行きます", "language": "ja", "level": "N5" }
```

```json
{ "text": "Je suis allé à l'école hier soir.", "language": "fr", "level": "B1" }
```

## CorrectionResponse

What the server returns for a correction.

| Field | Type | Required | Rules |
|---|---|---|---|
| `edits` | `Edit[]` | yes | Sorted by position and non-overlapping (see below). An empty array means no error was found. |
| `score` | integer | yes | From 0 to 100 inclusive. |

### Edit

One correction of a span of the submitted text.

| Field | Type | Required | Rules |
|---|---|---|---|
| `start` | integer | yes | Non-negative. First UTF-16 index of the faulty span. |
| `end` | integer | yes | Non-negative, and not less than `start`. Exclusive. `start === end` is an insertion. |
| `replacement` | string | yes | Text that replaces the span. An empty string is a deletion. |
| `errorType` | `ErrorType` | yes | An error type id of the request's language (see `ErrorType`). |
| `level` | `Level` | yes | Always set. The grammar point's level when one matched, the model's estimate otherwise. Same scale as the language. |
| `grammarPointId` | string or `null` | yes | Id of the matching grammar point of the language pack, or `null` when there is no match. The key itself is required. An empty string is rejected. |
| `explanation` | string | yes | Not blank: at least one character that is not whitespace after `trim()`. Why the span is wrong. |

### Ordering rule

For every edit after the first, `start` must be greater than or equal to the previous edit's `end`. So edits are sorted, never overlap, and an edit may start exactly where the previous one ends. This keeps underlines and hover cards unambiguous.

### Using an edit

- The struck-through original is `text.slice(edit.start, edit.end)`.
- There is **no `correctedText` field.** Build it by applying the edits to the original text, from the last edit to the first so earlier positions stay valid.
- Counts per category are derived by counting `edits` by `errorType`.

### Example

For the request above, `"学校で行きます"`:

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

## ErrorType

A non-blank string: the id of an error type of the learned language, for example `particles` or `keigo_politeness` for Japanese, `agreement` for French. The contract does not list them. Each language profile in the `core` configuration owns its list (Japanese: `core/data/error-types/ja.json`), and `CapabilitiesResponse` publishes it to the clients.

### A default value must always be handled

A self-hoster can add error types, and a language can gain some at any time, so nothing may break on an id the code does not know.

- **Server.** A response must never contain an id outside the language's list, whatever the model produced. The server replaces it with the `default` of that language (`other` unless configured otherwise) and never drops the whole correction because of it.
- **Client.** Every place that depends on `errorType` (underline colour, label, icon, grouping) needs a default branch with a neutral rendering. Never write an exhaustive `switch` without one. Labels are looked up by id in the client translations, with a fallback for an id without a label.

## Level

A non-blank string: a level in the scale of the learned language, for example `N5` to `N1` for Japanese or `A1` to `C2` (CEFR) for other languages. The scale and its order come from the language profile and are published by `CapabilitiesResponse`. It is used by `Edit.level`, `CorrectionRequest.level` and `UserProfile.declaredLevel`. The contract does not check that a level belongs to the language's scale: `core` does.

## CapabilitiesResponse

Body of `GET /v1/capabilities`: what the server can do, so a client shows labels and pickers without hardcoding anything.

| Field | Type | Rules |
|---|---|---|
| `languages` | `LanguageCapabilities[]` | At least one entry, and no two entries with the same `code`. |

`LanguageCapabilities`:

| Field | Type | Rules |
|---|---|---|
| `code` | `LanguageCode` | The language. |
| `errorTypes` | `ErrorType[]` | At least one, no duplicates. The ids the server can return in `Edit.errorType` for this language. |
| `levels` | `Level[]` | At least one, no duplicates. **Ordered from the lowest level to the highest**: the order is meaningful. |
| `skills` | string[] | At least one, no duplicates, none blank. The skills rated for this language (`reading`, `listening`, ...): the valid values of `SkillRating.skill`. **Required since 0.2.1.** |

Only ids are published. Display labels are translated by the client, by id.

```json
{
  "languages": [
    {
      "code": "ja",
      "errorTypes": ["particles", "keigo_politeness", "other"],
      "levels": ["N5", "N4", "N3", "N2", "N1"],
      "skills": ["reading", "listening", "writing", "speaking"]
    },
    {
      "code": "fr",
      "errorTypes": ["agreement", "verb_tense", "other"],
      "levels": ["A1", "A2", "B1", "B2", "C1", "C2"],
      "skills": ["reading", "writing"]
    }
  ]
}
```

## Page

`Page(itemSchema)` builds the schema of a paginated response, and `Page<Item>` is its type.

| Field | Type | Rules |
|---|---|---|
| `items` | `Item[]` | May be empty. |
| `nextCursor` | string or `null` | Opaque, non-empty cursor to send to get the next page. `null` marks the last page. The key is required. |

There is no `total`: it is costly to compute and unstable while items change.

```json
{ "items": [{ "id": "a1" }, { "id": "a2" }], "nextCursor": "eyJhZnRlciI6ImEyIn0" }
```

## ApiError

Body of an error response.

| Field | Type | Rules |
|---|---|---|
| `error.code` | `ApiErrorCode` | One of the codes below. |
| `error.message` | string | Not blank. Safe to show to the user: internal details go to the server logs only. |
| `error.details` | object | Optional. A record of string keys to any JSON value, for context a client can act on: the field at fault, the limit that was exceeded. |

`details` **never contains user content** (the submitted text, an epub excerpt, a model output) **nor internal details** (stack traces, SQL, provider names, file paths). It holds what the client already sent the key of, or a public limit. Anything else goes to the server logs, and user content goes nowhere.

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
{ "error": { "code": "unsupported_language", "message": "This language is not available on this server." } }
```

```json
{ "error": { "code": "payload_too_large", "message": "The text is too long.", "details": { "field": "text", "limit": 2000 } } }
```

## UserProfile

| Field | Type | Required | Rules |
|---|---|---|---|
| `displayName` | string | yes | Not blank. Free text. |
| `targetLanguage` | `LanguageCode` | no | The language being learned. Defaults to `"ja"` when omitted (so a parsed profile always has it). |
| `uiLanguage` | `LanguageCode` | yes | Language of the interface. |
| `timezone` | string | yes | Not blank. Whether it is a valid IANA name (`Asia/Bangkok`) is checked by the server, which owns the runtime. |
| `declaredLevel` | `Level` | yes | The level the user says they have, in the scale of `targetLanguage`. **Always set:** until the user declares one, the server sets the lowest level of the language (the first item of its `levels` in `CapabilitiesResponse`), and the user changes it during onboarding. `null` is rejected. Required since 0.2.1. |
| `skillRatings` | `SkillRating[]` | no | **Read-only.** The user's ratings, computed by the server. Defaults to `[]` (so a parsed profile always has it). A client never sends it: changes go through `UserProfileUpdate`, which has no such field. |

`UserProfile` is what the server returns. Never validate a client's request with it: its `skillRatings` default would turn a missing field into `[]` and wipe the stored ratings, and its `targetLanguage` default would reset the language to `"ja"`.

```json
{
  "displayName": "Robis",
  "targetLanguage": "ja",
  "uiLanguage": "fr",
  "timezone": "Asia/Bangkok",
  "declaredLevel": "N4",
  "skillRatings": [
    { "language": "ja", "skill": "reading", "rating": 1320, "votes": 8 }
  ]
}
```

### SkillRating

A rating of the user for one skill of one language. Computed by the server only.

| Field | Type | Rules |
|---|---|---|
| `language` | `LanguageCode` | The rated language. |
| `skill` | string | Not blank. One of the `skills` of that language in `CapabilitiesResponse`. |
| `rating` | number | Finite (`Infinity` and `NaN` are rejected). Its scale belongs to the server. |
| `votes` | integer | Zero or more. How many results the rating is based on. |

## UserProfileUpdate

What a client sends to change its profile. It carries **only the fields that change**: the server applies them to the stored profile and leaves every other field as it is.

| Field | Type | Required | Rules |
|---|---|---|---|
| `displayName` | string | no | Not blank. |
| `targetLanguage` | `LanguageCode` | no | No default: an absent key leaves the target language unchanged. **When present, `declaredLevel` is required.** |
| `uiLanguage` | `LanguageCode` | no | |
| `timezone` | string | no | Not blank. The IANA name is checked by the server. |
| `declaredLevel` | `Level` | with `targetLanguage` | In the scale of the target language after the update. Required when `targetLanguage` is sent. |

- At least one field: an empty update `{}` is rejected.
- `null` is rejected everywhere. A field cannot be cleared, only changed.
- **A new target language comes with its level.** A level only makes sense in the scale of its language: changing `targetLanguage` alone would keep, say, `N4` next to French. Such an update is rejected, with the issue on `declaredLevel`. When the user does not know their level yet, the client sends the **lowest level** of the new language, the first item of its `levels` in `CapabilitiesResponse`; the user changes it during onboarding.
- **No `skillRatings`.** The object is strict, so a client that sends ratings (even `[]`) is rejected with `invalid_request`. Only the server writes ratings.

```json
{ "targetLanguage": "fr", "declaredLevel": "A1" }
```

```json
{ "timezone": "Asia/Tokyo" }
```

## HealthResponse

Body of `GET /health`. It says the server is up, and nothing else: no version, no dependency status.

| Field | Type | Rules |
|---|---|---|
| `status` | `"ok"` | The only accepted value. |

```json
{ "status": "ok" }
```

## LimitsResponse

The limits the server is configured with, so a client can adapt before sending.

| Field | Type | Rules |
|---|---|---|
| `maxTextLength` | integer | Positive. Maximum length accepted for `text`. |
| `maxEdits` | integer | Positive. Maximum number of edits returned. |
| `maxExplanationLength` | integer | Positive. Maximum length of an `explanation`. |

All three keys are required.

```json
{ "maxTextLength": 2000, "maxEdits": 100, "maxExplanationLength": 500 }
```

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
