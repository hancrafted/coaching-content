# AGENTS.md

## Project Overview

This repository is set up to develop highly performant, SEO-friendly, and interactive pages for education, marketing, and coaching. It uses a Vite Multi-Page Application (MPA) setup, Tailwind CSS v4, and daisyUI v5.

## Commands

Run everything from the repo root. `npm run verify` is the gate; it is broad and slow (types and tests included), and Husky runs it in full on both pre-commit and pre-push — so run it yourself before committing. `package.json` lists the rest.

**Pushing to `main` publishes.** `.github/workflows/deploy.yml` builds and deploys `dist/` to GitHub Pages at <https://hancrafted.github.io/coaching-content/>. Vite's `base` is the repo sub-path, so asset URLs must respect it — an absolute `/foo.png` 404s in production.

## Ground Rules

1. **Verify before you commit.** A failed hook costs more than a local run.
2. **When a hook fails, fix the cause and re-run.** Never `--no-verify` or `-n`.
3. **Tailwind v4 + daisyUI v5 only.** No `style="..."`, no inline `<style>` — Archgate blocks it (`FE-001-design`). Theme tokens go in the `@theme` block in `src/style.css`, never a `tailwind.config.js`. daisyUI loads via `@plugin "daisyui";` under `@import "tailwindcss";`. For complex UI: https://daisyui.com/llms.txt

## Directory Structure

| Directory          | Purpose                               | Must-read                  |
| ------------------ | ------------------------------------- | -------------------------- |
| `src/`             | Shared hub and design system          | `src/style.css`            |
| `src/<deck-name>/` | One deck each; same three-file shape  | its `index.html`           |
| `.archgate/adrs/`  | Archgate ADRs, each with a rules file | `FE-001-design.md`         |
| `docs/design-adr/` | Design ADRs (created lazily)          | any `type: design-adr`     |
| `docs/agents/`     | Agent skill configuration             | `issue-tracker.md`         |
| `scripts/`         | Utility and validation scripts        | `validate-commit-hook.mjs` |

## Agent skills

### Issue tracker

Issues live in this repo's GitHub Issues, driven by the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, each label string equal to its name. See `docs/agents/triage-labels.md`.

### Grilling format

Grilling rounds follow a house format: a three-line orientation, `Analogy` blocks kept separate from the literal question, a cap of five questions (three when the round fixes structure), and every id carried with its name. It overrides the grilling skill's one-round-per-frontier default. Applies to `/grill-me`, `/grill-with-docs`, and Wayfinder grilling tickets. See `docs/agents/grilling-format.md`.

### Domain docs

Single-context: one root `CONTEXT.md`. Two kinds of ADR — choose by whether the decision is machine-checkable:

- **Archgate ADR** in `.archgate/adrs/`, named `XX-NNN-slug.md` with a sibling `XX-NNN-slug.rules.ts` that `archgate check` enforces.
- **Design ADR** in `docs/design-adr/`, the prose decisions `/grill-with-docs` produces. Each carries `type: design-adr` in its frontmatter.

See `docs/agents/domain.md`.
