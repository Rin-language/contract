---
"@rin-language/contract": minor
---

Add the text correction schemas: `JlptLevel`, `CorrectionRequest`, `Edit` (with an `errorType` from the `ErrorType` taxonomy, grouped in `ERROR_TYPES_BY_GROUP`) and `CorrectionResponse` (with a 0 to 100 `score`; edits sorted and non-overlapping), their inferred types, the `LimitsResponse` schema for server-configured limits, and the `API_VERSION` constant. Size limits are deliberately not part of the contract.
