# @rin-language/contract

Shared [Zod](https://zod.dev) schemas and inferred TypeScript types for the Rin API. This package is the single source of truth between the client, the server and any other consumer. It contains schemas only: no business logic, no server or client code.

Current scope: text correction (`JlptLevel`, `CorrectionRequest`, `Edit`, `CorrectionResponse`, `ErrorType`), the server limits (`LimitsResponse`) and `API_VERSION`. Every object schema is strict: unknown keys are rejected.

## Install

Zod is a peer dependency, so install it alongside the package:

```sh
pnpm add @rin-language/contract zod
```

## Usage

```ts
import {
  CorrectionRequest,
  type CorrectionResponse,
} from "@rin-language/contract";

const request = CorrectionRequest.parse({ text: "私は学生です", level: "N4" });
```

Validate all external input (HTTP bodies, model output) with these schemas at the boundary.

## Conventions

- **Edit positions:** `start` and `end` are UTF-16 code units (the indices `String.prototype.slice` uses) into the submitted text. Edits are sorted by position and never overlap. Checking that they fit the original text depends on that text, so it lives in `core`, not here.
- **Corrected text:** there is no `correctedText` field. Apply the edits to the original text; the struck-through original of an edit is `text.slice(start, end)`.
- **Error category and level:** `Edit.errorType` is one of the `ErrorType` categories (for example `particles`, `keigo_politeness`, `orthography`). The list is closed, so adding a category is a new contract release, and a consumer on an older version rejects responses that use it. `Edit.jlptLevel` is always set: the catalog level when a grammar point matched, the model's estimate otherwise. `Edit.grammarPointId` is the matching catalog entry, or `null` when there is none; `core` checks it against the catalog.
- **Score:** `CorrectionResponse.score` is an integer from 0 to 100.
- **Size limits are not in the contract.** The server enforces them from its own configuration and exposes them as `LimitsResponse` (`maxTextLength`, `maxEdits`, `maxExplanationLength`). The schemas here only check shape, so a consumer must enforce its server's limits before spending any model call.

## Link a local copy into `core`

While developing, link this repo into `core` instead of publishing on every change. With both repos side by side:

```sh
# in contract/
pnpm install && pnpm build

# in core/
pnpm add @rin-language/contract@link:../contract
```

After changing a schema, run `pnpm build` again in `contract/` (or `pnpm exec tsup --watch` to rebuild on save). Before releasing `core`, switch back to the published version with `pnpm add @rin-language/contract@<version>`.

## Scripts

| Script           | What it does                                                                    |
| ---------------- | ------------------------------------------------------------------------------- |
| `pnpm test`      | Builds, then runs the Vitest suite (including type tests and the built package) |
| `pnpm lint`      | Biome lint and format check                                                     |
| `pnpm typecheck` | `tsc --noEmit` on sources and tests                                             |
| `pnpm build`     | ESM bundle and `.d.ts` into `dist/` with tsup                                   |

## Versioning

Semantic versioning, managed with [Changesets](https://github.com/changesets/changesets).

- Within a major version, changes are additive only: new optional fields, new endpoints. Breaking changes require a new major version and a new API prefix (`/v2`).
- A published version is never edited.
- Every schema change ships with a test and a changeset (`pnpm changeset`), and is released on its own before any code uses it.
- Release: `pnpm version` (applies changesets, updates `CHANGELOG.md`), then commit, tag and `pnpm publish`.

## License

MIT
