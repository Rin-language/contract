# Rin (working name)

Open-core Japanese immersion app. Writing practice with AI correction and daily prompts, an epub reader, a streak shared by all activities, and a curated list of native Japanese content (v1). A recommendation/curation system comes in v2.

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
- Definition of done: see BIBLE.md.
- Commands: to be filled in after the first slice (install, dev, test, lint, typecheck, build). Keep this file updated when they exist.
