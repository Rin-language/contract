---
"@rin-language/contract": patch
---

Document the schemas themselves and generate a JSON Schema reference from them. Additive: no schema changes shape.

- New export `@rin-language/contract/json-schema/*`: one JSON Schema per exported schema (`Edit.json`, `UserProfile.json`, ...), generated at build time from the Zod schemas (`io: "output"`). Rules that JSON Schema cannot express (non-blank strings, `start <= end`, edit ordering, uniqueness, "at least one field") are written in the `description`. `Page` is a factory and has no generated file: convert `Page(Item)` with `z.toJSONSchema`.
- Every exported schema and every field now carries a `description` (Zod 4 `.meta`), and most carry `examples`; every export has a JSDoc, shown by the IDE in consumers. Tests check that all schemas convert, that all descriptions are present and that all examples parse.
- `docs/api.md` no longer repeats the fields: it keeps the conventions, the error codes and payload examples.
