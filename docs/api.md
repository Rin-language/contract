# API reference

Reference for the schemas exported by `@rin-language/contract`. The schemas are the source of truth: if this page and a schema ever disagree, the schema wins and this page has a bug.

The package defines **payload shapes only**. Routes, authentication and rate limiting belong to `core` and `cloud`. `API_VERSION` (`"v1"`) is the version of the API these shapes belong to and is meant to be used as the route prefix.

## Conventions

- **Strict objects.** Unknown keys are rejected, in requests and in responses.
- **Keys are camelCase.** Enum values are lowercase `snake_case`, except JLPT levels (`N5` to `N1`).
- **Positions.** `start` and `end` are UTF-16 code units, the indices `String.prototype.slice` uses, counted from the beginning of the submitted `text`. `end` is exclusive.
- **No size limits here.** The schemas check shape, not size. Limits come from the server configuration and are published through `LimitsResponse`. Enforce them before spending any model call.
- **Untrusted input.** Validate every request body and every model output with these schemas at the boundary, before using it.

## CorrectionRequest

What a client sends to have a text corrected.

| Field | Type | Required | Rules |
|---|---|---|---|
| `text` | string | yes | Not blank: at least one character that is not whitespace after `trim()`. The text is never trimmed or altered. |
| `level` | `JlptLevel` | no | `"N5"`, `"N4"`, `"N3"`, `"N2"` or `"N1"`. Omit the key to let the server decide. `null` is rejected. |

```json
{ "text": "学校で行きます", "level": "N5" }
```

## CorrectionResponse

What the server returns for a correction.

| Field | Type | Required | Rules |
|---|---|---|---|
| `edits` | `Edit[]` | yes | Sorted by position and non-overlapping (see below). An empty array means no error was found. |
| `score` | integer | yes | From 0 to 100 inclusive. |

### Edit

One correction of a span of the submitted text.

| Field | Type | Required | Rules |
|---|---|---|---|
| `start` | integer | yes | Non-negative. First UTF-16 index of the faulty span. |
| `end` | integer | yes | Non-negative, and not less than `start`. Exclusive. `start === end` is an insertion. |
| `replacement` | string | yes | Text that replaces the span. An empty string is a deletion. |
| `errorType` | `ErrorType` | yes | One of the categories listed below. |
| `jlptLevel` | `JlptLevel` | yes | Always set. The catalog level when a grammar point matched, the model's estimate otherwise. |
| `grammarPointId` | string or `null` | yes | Id of the matching catalog grammar point, or `null` when the catalog has no match. The key itself is required. An empty string is rejected. |
| `explanation` | string | yes | Not empty. Why the span is wrong. |

### Ordering rule

For every edit after the first, `start` must be greater than or equal to the previous edit's `end`. So edits are sorted, never overlap, and an edit may start exactly where the previous one ends. This keeps underlines and hover cards unambiguous.

### Using an edit

- The struck-through original is `text.slice(edit.start, edit.end)`.
- There is **no `correctedText` field.** Build it by applying the edits to the original text, from the last edit to the first so earlier positions stay valid.
- Counts per category are derived by counting `edits` by `errorType`.

### Example

For the request above, `"学校で行きます"`:

```json
{
  "edits": [
    {
      "start": 0,
      "end": 3,
      "replacement": "学校に",
      "errorType": "particles",
      "jlptLevel": "N5",
      "grammarPointId": "ni_particle",
      "explanation": "Utilisation de la mauvaise particule de destination."
    }
  ],
  "score": 85
}
```

## ErrorType

A closed enum. The first twelve come from the grammar catalog, the next eight cover error kinds the catalog does not, and `other` is the catch-all.

| Value | Covers |
|---|---|
| `particles` | Basic, compound and emphatic particles |
| `conjunctions_affixes` | Connectors between sentences, prefixes and suffixes |
| `verb_conjugation_compounds` | Verb forms (passive, causative, volitional) and compound verbs |
| `giving_receiving` | Giving and receiving expressions (てあげる, てくれる, てもらう…) |
| `keigo_politeness` | Politeness, honorific and humble language, register and formality |
| `conditionals` | Conditions and hypotheses (ば, たら, なら, と…) |
| `obligation_permission_prohibition` | What must, may or must not be done |
| `desire_intent_plans` | Wishes, decisions, intentions and plans |
| `conjecture_judgment_appearance` | Probability, impressions, hearsay and deductions |
| `comparison_degree_limitation` | Comparison, degree and restriction |
| `time_situation_aspect` | Timing, stages, progression, simultaneity and tense or aspect mismatches |
| `reason_cause_concession` | Cause, reason, opposition and concession |
| `orthography` | Wrong kanji, homophone confusion, okurigana, look-alike kana, long vowels, geminate consonants |
| `adjective_conjugation` | Conjugation of い and な adjectives |
| `word_order` | Order of the elements of a sentence |
| `counters` | Wrong counter word |
| `transitivity` | Transitive and intransitive verb confusion |
| `vocabulary_word_choice` | Unnatural collocation, literal translation, false friends |
| `style_and_discourse` | Pronoun overuse, redundant repetition, abrupt sentence endings |
| `punctuation` | Punctuation |
| `other` | Catch-all for an error that fits no other category, and the natural default (see below) |

### A default value must always be handled

The list will grow: each new category ships in a new minor version of the contract. Nothing may break when a value is not one the code knows, so both sides handle a default.

- **Server.** A response must never contain a value outside `ErrorType`, whatever the model or the catalog produced. The server maps any category it cannot match to a configured default category, `other` unless the deployment chooses another, and never drops the whole correction because of it. The default is a server setting, validated at startup against `ErrorType`.
- **Client.** Every place that depends on `errorType` (underline colour, label, icon, grouping) needs a default branch with a neutral rendering. Do not write an exhaustive `switch` without one.
- **Version skew.** The schema is closed, so a client validating with an older version of the contract rejects a response that uses a newer category. Keep the contract version up to date, and treat that failure as "client needs an update" rather than as a corrupt response.

## LimitsResponse

The limits the server is configured with, so a client can adapt before sending.

| Field | Type | Rules |
|---|---|---|
| `maxTextLength` | integer | Positive. Maximum length accepted for `text`. |
| `maxEdits` | integer | Positive. Maximum number of edits returned. |
| `maxExplanationLength` | integer | Positive. Maximum length of an `explanation`. |

All three keys are required.

```json
{ "maxTextLength": 2000, "maxEdits": 100, "maxExplanationLength": 500 }
```

## What the contract does not check

These checks need information the contract does not have, so they live in `core`:

- Sizes: text length, number of edits, explanation length, `replacement` length.
- That `start` and `end` lie within the submitted text, and that the faulty span is really present in it.
- That `grammarPointId` exists in the catalog and belongs to the category in `errorType`.
- That `score` is consistent with the edits.
