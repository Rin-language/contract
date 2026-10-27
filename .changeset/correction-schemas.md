---
"@rin-language/contract": minor
---

Add the text correction schemas: `JlptLevel`, `CorrectionRequest`, `Edit` (with an `errorType` from the closed `ErrorType` enum of 20 categories, a `jlptLevel` and a nullable `grammarPointId`) and `CorrectionResponse` (with a 0 to 100 `score`; edits sorted and non-overlapping), their inferred types, the `LimitsResponse` schema for server-configured limits, and the `API_VERSION` constant. Size limits are deliberately not part of the contract.
