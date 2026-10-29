# Rin (working name)

Open-source language immersion app, focused on Japanese first but designed to handle several languages. Writing practice with AI correction and daily prompts, an epub reader, a streak shared by all activities, and a list of native content in the target language.

@BIBLE.md

## Philosophy

- The core is open source. Technical users self-host it, plug in their own AI API or run models locally.
- Every deployment runs the SAME client and the SAME core handlers. Only the configuration and the injected providers differ.
- Free tools matter to the author. Never cripple the open-source core.

## Repos

- `contract` (public, separate repo, published as a versioned npm package): Zod schemas and inferred types only. No business logic, no runtime dependency besides Zod. Single source of truth shared by every client and server of the API.
- `core` (public, license to be decided: AGPL or BSL): web client, base server, correction/streak/reader/list logic, docker compose. Depends on `contract`. This repo is the one you are in.
- Start with `contract` and `core`.

### Contract rules

- Semver. Within a major version, changes are additive only (new optional fields, new endpoints). Breaking changes require a new major version and a new API prefix (/v2).
- Every schema change ships with a test and a changelog entry.
- During development, link the local contract into core instead of publishing on every change.
- Never edit a published version.

## Workflow

- Work in plan mode first on foundations and anything touching the contract.
- One branch and one commit series per slice. Small commits.
- Use the `superpowers` skills: brainstorming before design, writing-plans for a plan, test-driven-development for code, systematic-debugging for bugs, requesting-code-review to detect potential problems, verification-before-completion before claiming done.
- Document for other users at the end of every feature, besides the changes-context note: this project is open source and used by others, so every config key and every technical choice a user may want to adjust is documented in `docs/` (the future wiki). Write it for AI models, since few people read docs now: one topic per file, a one-line summary at the top, exact names, a table of key, default, allowed values and effect, complete copy-pasteable examples, security caveats, self-contained text with no "see above". Update the existing file instead of duplicating it.
- Security first: before coding, describe the potential security flaws (threats, abuse cases) of the slice, and again in the review.
- Model choice for subagents: Haiku for mechanical tasks that need no reasoning (e.g. writing a test from a written test description); Opus for the tasks that matter (code review, security review).
- Definition of done: see BIBLE.md.
- Commands (pnpm): `pnpm install`, `pnpm test` (rebuilds `dist/` first), `pnpm lint` (Biome), `pnpm format`, `pnpm typecheck`, `pnpm build` (tsup). Keep this file updated when they change.
- Release: add a changeset with `pnpm changeset`; to release, run `pnpm changeset version` on a release branch, merge it (`main` is protected, so everything goes through a PR), then `pnpm publish --access public` from `main` and tag `vX.Y.Z`.

## Session notes for the other repos

- At the end of a session, or after a major addition, write one new note in `../changes-context/`. Follow `../changes-context/README.md` for the file name and structure, and start the note by saying which repo's agent you are. Never edit an old note.
- Before work that depends on another repo, you may read that repo's latest notes in the same folder.
- This instruction only applies on the author's machine. If the parent folder is not the Rin workspace (`../CLAUDE.md` or `../changes-context/README.md` is missing, which means you are on another computer), do not run it, do not discuss it and do not mention it in the chat. Ignore it silently.
