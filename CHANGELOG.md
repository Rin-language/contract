# @rin-language/contract

## 0.2.0

### Minor Changes

- af143dd: **BREAKING (intended, 0.x): the contract no longer freezes anything that depends on the learned language.** Error types, level scales, grammar and prompts now live in the language profile of the `core` configuration.
  
  Breaking changes:
  
  - `ErrorType` is a non-blank string instead of a closed enum of 21 values. The valid ids come from the language profile and are published by `CapabilitiesResponse`. Clients keep a default branch for an unknown id.
  - `JlptLevel` is removed and replaced by `Level`, a non-blank string (`N5` to `N1`, `A1` to `C2`, ...).
  - `Edit.jlptLevel` is renamed `Edit.level`. `CorrectionRequest.level` keeps its name and now takes a `Level`.
  
  Additions:
  
  - `LanguageCode`: two lowercase letters, format only (`ja`, `zh`, `fr`).
  - `CorrectionRequest.language`: optional `LanguageCode`; when omitted the server uses the user's target language.
  - `CapabilitiesResponse` and `LanguageCapabilities` for `GET /v1/capabilities`: the available languages, each with its error type ids and its ordered levels.
  - `Page(itemSchema)` and the `Page<Item>` type: cursor-based paginated response.
  - `ApiError` and `ApiErrorCode`: API error body with a closed list of 11 codes.
  - `UserProfile`: `displayName`, `targetLanguage` (default `"ja"`), `uiLanguage`, `timezone`, optional `declaredLevel`.

## 0.1.0

### Minor Changes

- 4abbc99: Add the text correction schemas: `JlptLevel`, `CorrectionRequest`, `Edit` (with an `errorType` from the closed `ErrorType` enum of 21 categories, including an `other` catch-all, a `jlptLevel` and a nullable `grammarPointId`) and `CorrectionResponse` (with a 0 to 100 `score`; edits sorted and non-overlapping), their inferred types, the `LimitsResponse` schema for server-configured limits, and the `API_VERSION` constant. Size limits are deliberately not part of the contract.
