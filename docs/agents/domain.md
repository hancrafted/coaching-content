# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

This is a **single-context** repo: one `CONTEXT.md` at the root, one ADR directory.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root.
- **`.archgate/adrs/`**: Archgate ADRs. Each `XX-NNN-slug.md` has a sibling `XX-NNN-slug.rules.ts` that `archgate check` enforces on every `npm run verify`.
- **`docs/design-adr/`**: design ADRs — prose decisions with no machine-checkable form, produced by `/grill-with-docs`. Each carries `type: design-adr` in its frontmatter, which is how you identify one.

Read whichever ADRs touch the area you're about to work in.

- **`AGENTS.md`** at the repo root for build commands, directory layout, and ground rules.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

```
/
├── AGENTS.md                      ← build commands, ground rules, directory map
├── CONTEXT.md                     ← glossary (created lazily by /domain-modeling)
├── .archgate/
│   └── adrs/
│       ├── FE-001-design.md       ← the decision, in prose
│       └── FE-001-design.rules.ts ← the machine-checkable form of it
├── docs/design-adr/               ← design ADRs (created lazily)
└── src/
```

## Writing a new ADR

This repo overrides the `docs/adr/` default in `domain-modeling`'s `ADR-FORMAT.md`. Pick the destination by whether the decision is machine-checkable:

- **Machine-checkable** → an Archgate ADR in `.archgate/adrs/`: prefix by domain (`FE-` for frontend), and add the `.rules.ts` sibling. The `archgate:adr-author` skill handles this.
- **Prose only** → a design ADR in `docs/design-adr/`, with frontmatter `type: design-adr`. Create the directory lazily, on the first one.

```md
---
type: design-adr
---

# {Short title for the decision}

{1-3 sentences: the context, the decision, and why.}
```

The body follows `ADR-FORMAT.md`: a single paragraph is fine, and optional `Status` / Considered Options / Consequences sections only when they earn their place.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts FE-001 (design integrity), but worth reopening because…_
