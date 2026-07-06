# RULE-001: Git Commits

All commits in this repository must follow a strict conventional structure and contain staged changes matching a single scope to maintain atomic changes.

## Scope

One commit = one scope. Never mix files across different scopes in a single commit. Commit dependencies first.

**Staged files are mapped to the following scopes:**

- `root` (files directly at the repository root, e.g. `package.json`, `index.html`)
- `src` (files under `src/`)
- `ai-token-economy-101` (files under `ai-token-economy-101/`)
- `governance` (files under `governance/`)
- `scripts` (files under `scripts/`)
- Each dot-directory has its own scope:
  - `.archgate`
  - `.claude`
  - `.husky`
  - `.github`

## Message Format

Commits must follow the [Conventional Commits](https://conventionalcommits.org/en/v1.0.0/) specification combined with a [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format for the body.

Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `ci`, `perf`, `test`, `build`, `style` (use `!` for breaking changes).

```
type(scope): subject line description

### Added|Changed|Deprecated|Removed|Fixed|Security
- description of the changes made
```

_Note: The second line of the commit message must be left empty. The body must contain at least one section starting with a markdown level-3 header (### Added, etc.) and a bullet point list item._
