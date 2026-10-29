# Rin (working name)

Open-core language immersion app, focused on Japanese first but designed to handle several languages. Writing practice with AI correction and daily prompts, an epub reader, a streak shared by all activities, and a curated list of native content in the target language (v1). A recommendation/curation system comes in v2.

@BIBLE.md

## Philosophy

- The core is open source. Technical users self-host it, plug in their own AI API or run models locally.
- The paid offer is zero friction: a hosted service with the data (the curated list), sync, later the recommendation system and possibly a mobile app. Planned price: 5 USD/month.
- Self-hosted and hosted must run the SAME client and the SAME core handlers. Only the base URL and the injected providers differ.
- Free tools matter to the author. Never cripple the open-source core to push the paid plan.

## Repos

- `contract` (public, separate repo, published as a versioned npm package): Zod schemas and inferred types only. No business logic, no runtime dependency besides Zod. Single source of truth shared by core, cloud and mobile.
- `core` (public, license to be decided: AGPL or BSL): web client, base server, correction/streak/reader/list logic, docker compose. Depends on `contract`. This repo is the one you are in.
- `cloud` (private, later): auth, Stripe, quota and cost ledger, managed LLM gateway, sync. Imports `core`, depends on `contract`.
- `mobile` (later): depends on `contract` only.
- Start with `contract` and `core`. Create `cloud` and `mobile` only when a real need appears.

### Contract rules

- Semver. Within a major version, changes are additive only (new optional fields, new endpoints). Breaking changes require a new major version and a new API prefix (/v2).
- Every schema change ships with a test and a changelog entry.
- During development, link the local contract into core instead of publishing on every change.
- Never edit a published version.

## Workflow

- Work in plan mode first on foundations and anything touching the contract.
- One branch and one commit series per slice. Small commits.
- Use the `superpowers` skills: brainstorming before design, writing-plans for a plan, test-driven-development for code, systematic-debugging for bugs, requesting-code-review to detect potential problems, verification-before-completion before claiming done.
- Security first: before coding, describe the potential security flaws (threats, abuse cases) of the slice, and again in the review.
- Model choice for subagents: Haiku for mechanical tasks that need no reasoning (e.g. writing a test from a written test description); Opus for the tasks that matter (code review, security review).
- Definition of done: see BIBLE.md.
- Commands (pnpm): `pnpm install`, `pnpm test` (rebuilds `dist/` first), `pnpm lint` (Biome), `pnpm format`, `pnpm typecheck`, `pnpm build` (tsup). Keep this file updated when they change.
- Release: add a changeset with `pnpm changeset`; to release, run `pnpm changeset version` on a release branch, merge it (`main` is protected, so everything goes through a PR), then `pnpm publish --access public` from `main` and tag `vX.Y.Z`.

## Session notes for the other repos

- At the end of a session, or after a major addition, write one new note in `../changes-context/`. Follow `../changes-context/README.md` for the file name and structure, and start the note by saying which repo's agent you are. Never edit an old note.
- Before work that depends on another repo, you may read that repo's latest notes in the same folder.
- This instruction only applies on the author's machine. If the parent folder is not the Rin workspace (`../CLAUDE.md` or `../changes-context/README.md` is missing, which means you are on another computer), do not run it, do not discuss it and do not mention it in the chat. Ignore it silently.
