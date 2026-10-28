---
"@rin-language/contract": patch
---

Complete the 0a+ slice with additive schemas.

- Common primitives: `Id` (opaque non-blank string), `IsoDateTime` (ISO 8601 with `Z` or an offset), `DayKey` (`YYYY-MM-DD`, a day that exists, computed by the server) and `ActivityKind` (open non-blank string).
- `SkillRating` `{ language, skill, rating, votes }`, and `UserProfile.skillRatings`: read-only, computed by the server, defaults to `[]`.
- `HealthResponse` `{ status: "ok" }` for `GET /health`.
- `ApiError`: optional `error.details`, a record that never holds user content nor internal details. The envelope is unchanged.

**Required field:** `LanguageCapabilities.skills` (non-empty, unique) is required in `CapabilitiesResponse`. No server implements `GET /v1/capabilities` yet, so no existing response breaks, but a server must publish `skills` for every language.
