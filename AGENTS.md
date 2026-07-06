# AGENTS.md

## Project Overview

This repository is set up to develop highly performant, SEO-friendly, and interactive pages for education, marketing, and coaching. It uses a Vite Multi-Page Application (MPA) setup, Tailwind CSS v4, and daisyUI v5.

## CLI & Script Commands

Always run these commands from the repository root:

- **Start Dev Server**: `npm run dev`
- **Build Production Assets**: `npm run build` (outputs to `dist/`)
- **Run Complete Verification**: `npm run verify` (runs Archgate check, ESLint, Prettier format check, and Vite build)
- **Run Linting**: `npm run lint`
- **Run Prettier Formatter**: `npm run format` (auto-formats all files)
- **Check Prettier Formatting**: `npm run format:check`

## Ground Rules

1. **Verify Before Push**: Always run `npm run verify` locally before committing or pushing changes. This is enforced by Husky pre-commit and pre-push hooks.
2. **Never Bypass Hooks**: Do not use `--no-verify` or `-n` with `git commit`. If hooks fail, resolve the issues instead of bypassing them.
3. **Atomic Commits**: Follow `governance/rules/RULE-001-git-commits.md`. One commit must address exactly one scope (e.g. `src`, `ai-token-economy-101`, `root`, `.archgate`, etc.).
4. **Design Integrity**: All styles and components must use **Tailwind CSS v4** and **daisyUI v5** components. Raw inline styling (`style="..."`) or inline `<style>` tags are blocked or warned against via Archgate ADR rules (`FE-001-design`).

## Directory Structure

| Directory               | Purpose                                        | Must-read                                  |
| ----------------------- | ---------------------------------------------- | ------------------------------------------ |
| `src/`                  | Core shared frontend code (style.css, main.js) | `src/style.css`                            |
| `ai-token-economy-101/` | Interactive deck/presentation (token economy)  | `ai-token-economy-101/index.html`          |
| `.archgate/adrs/`       | Architecture Decision Records & Rules          | `FE-001-design`                            |
| `governance/rules/`     | Repository conventions and rules               | `governance/rules/RULE-001-git-commits.md` |
| `scripts/`              | Project utility and validation scripts         | `scripts/validate-commit-hook.mjs`         |
| `.husky/`               | Git hooks configuration                        | `.husky/pre-commit`                        |

## Design Theme & Libraries

- **daisyUI v5**: Import `@plugin "daisyui";` in `src/style.css` under the `@import "tailwindcss";` directive. Use semantic daisyUI class names (e.g. `btn`, `card`, `alert`) to keep the design cohesive and responsive. Read https://daisyui.com/llms.txt if you need more guidance for more complex ui development.
- **Tailwind CSS v4**: Set up theme custom properties (fonts, custom colors, animations) inside the `@theme` block in `src/style.css` instead of deprecated `tailwind.config.js` configurations.
