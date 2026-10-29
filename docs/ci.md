# CI configuration (contract repo)

One-line summary: every knob of the GitHub Actions pipeline and its supply-chain checks, with defaults, allowed values and how to change them.

Files: `.github/workflows/ci.yml`, `.github/dependabot.yml`, `.gitleaks.toml`, `scripts/check-no-local-deps.mjs`.

## Jobs

| Job | Runs | Blocks merge | Purpose |
|---|---|---|---|
| `check` | Node 22 and 24 matrix | yes | `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` |
| `audit` | Node 24 | yes | `pnpm audit --audit-level=high` |
| `local-dependencies` | no install | yes | `node scripts/check-no-local-deps.mjs` |
| `secret-scan` | full git history | yes | gitleaks over every commit |

"Blocks merge" assumes the job names are listed as required status checks in the branch protection of `main` (a GitHub setting, not part of this repo).

## Workflow settings

| Key (in `ci.yml`) | Default | Allowed values | Effect |
|---|---|---|---|
| `on` | `push`, `pull_request` | any trigger except `pull_request_target` | Never use `pull_request_target`: it runs fork code with repository secrets. |
| `permissions` | `contents: read` | minimal scopes only | Token is read-only for every job. Add a scope to a single job, never at the top level. |
| `concurrency.group` | `ci-${{ github.ref }}` | any expression | Runs on the same ref share a group. |
| `concurrency.cancel-in-progress` | `true` | `true`, `false` | A newer push cancels the older run. |
| `strategy.matrix.node` (job `check`) | `[22, 24]` | Node majors supported by `setup-node` | Node versions the package is tested on. |
| `node-version` (job `audit`) | `24` | one Node major | Node used for the audit. |
| `persist-credentials` (checkout) | `false` | `true`, `false` | Keeps the git token out of `.git/config` so later steps cannot reuse it. |

## `pnpm audit`

| Setting | Default | Allowed values | Effect |
|---|---|---|---|
| `--audit-level` | `high` | `low`, `moderate`, `high`, `critical` | Lowest severity that fails the job. `high` also fails on `critical`. |

Scope: all dependencies, dev included (dev tools run in CI and in release builds). The job blocks: a new high-severity advisory can turn an unrelated PR red. The fix is a dependency bump or, for a proven non-exploitable advisory, a documented `pnpm.auditConfig.ignoreCves` entry in `package.json`. To make it advisory only, add `continue-on-error: true` to the job.

```yaml
# lower the bar to moderate
- run: pnpm audit --audit-level=moderate
```

## Action pinning

Every third-party action is pinned by full commit SHA with the tag in a trailing comment:

```yaml
- uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4
```

A tag can be moved to different code by whoever controls the action's repository; a SHA cannot. Dependabot (below) updates the SHA and the comment together. To add an action, resolve the SHA with `gh api repos/<owner>/<repo>/commits/<tag> --jq .sha`.

## Dependabot (`.github/dependabot.yml`)

| Key | Default | Allowed values | Effect |
|---|---|---|---|
| `package-ecosystem` | `npm` and `github-actions` | Dependabot ecosystems | `npm` covers pnpm (reads `pnpm-lock.yaml`). |
| `schedule.interval` | `weekly` | `daily`, `weekly`, `monthly` | How often it looks for updates. |
| `schedule.day` | `monday` | weekday name | Day of the weekly run. |
| `cooldown.default-days` | `7` | integer | Ignores versions younger than this, so a hijacked release is usually yanked first. |
| `open-pull-requests-limit` | `5` | integer | Maximum open Dependabot PRs per ecosystem. |
| `groups.<name>.update-types` | `minor`, `patch` | `major`, `minor`, `patch` | Those updates arrive as one PR. Majors are not grouped, one PR each. |

Dependency versions in `package.json` stay pinned exactly (no `^` or `~`); Dependabot keeps the pin style. Always review the lockfile diff of a Dependabot PR: a new dependency or a changed resolution is the signal of a malicious bump. Install scripts stay off for packages listed in `pnpm.ignoredBuiltDependencies`.

## Secret scan (gitleaks)

| Setting | Default | Allowed values | Effect |
|---|---|---|---|
| `GITLEAKS_VERSION` (job env) | `8.30.1` | released gitleaks version | Binary downloaded from the GitHub release. |
| `GITLEAKS_SHA256` (job env) | sha256 of the linux x64 tarball | hex digest | Download is refused if it does not match. Update it with the version: `gh release download v<ver> -R gitleaks/gitleaks -p '*checksums.txt' -O -`. |
| `fetch-depth` | `0` | integer | Full history, so a secret removed in a later commit is still found. |
| `--redact` | on | flag | A leaked value never appears in the job log. |
| `.gitleaks.toml` `[extend] useDefault` | `true` | `true`, `false` | Uses the built-in ruleset. |

The gitleaks GitHub Action is not used: it needs a paid licence for organisations. The binary is run directly.

Allow a proven false positive in `.gitleaks.toml`, with a comment saying why:

```toml
[[allowlists]]
description = "test fixture, not a real key"
paths = ['''test/fixtures/fake-key\.txt''']
```

Run it locally: `gitleaks git --config .gitleaks.toml --redact --no-banner .`

## Local dependency check

`scripts/check-no-local-deps.mjs [directory]` exits 1 when `package.json` (any section, including `pnpm.overrides`) or `pnpm-lock.yaml` has a `specifier` or `version` starting with `link:`, `file:` or `portal:`. Reason: a local link works on one machine and breaks every other install, and CLAUDE.md forbids committing one. Test: `test/check-no-local-deps.test.ts`.

## Security model

- Fork PRs run with a read-only token and no secrets; no job uses a secret.
- No `${{ github.* }}` value is interpolated into a `run:` script.
- Third-party code runs only through SHA-pinned actions and the checksum-verified gitleaks binary.

## Follow-ups (not built)

| Item | Design |
|---|---|
| "A published version is never edited" check | On PRs, read `version` from `package.json`. If `v<version>` already exists as a git tag, fail when `git diff v<version> -- src package.json` is not empty (a published version's source changed without a bump). Stronger variant: rebuild, `npm pack`, and compare the integrity to `npm view @rin-language/contract@<version> dist.integrity`; needs a reproducible build, to be tested first. |
| Publish on tag with provenance | Release workflow on `v*` tags: `permissions: id-token: write`, `pnpm publish --provenance --access public`, run in a protected GitHub environment with required approval. Changes the release process (today: manual publish), so it needs the maintainer's confirmation. |
