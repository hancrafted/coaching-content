---
id: FE-001
title: Design System - Tailwind and daisyUI
domain: frontend
rules: true
---

# Design System - Tailwind and daisyUI

## Context

We want to develop highly performant, SEO-friendly, and interactive pages for education, marketing, and coaching.
To ensure visual consistency, rich aesthetics, and optimal bundle size/performance, we need to enforce a unified styling convention.
Ad-hoc CSS, inline styles, or bringing in heavy, inconsistent third-party libraries will lead to maintenance overhead and slower page loads.

## Decision

All UI styling and component building must be done using **Tailwind CSS v4** and **daisyUI v5**.

- **Tailwind CSS v4** is used for utility-first styling, grid/flexbox layouts, responsive design, and bespoke layout adjustments.
- **daisyUI v5** is our primary UI component library, providing semantic classes (e.g., `btn`, `card`, `alert`, `modal`) and customizable themes.
- CSS components should not be built from scratch when a daisyUI component exists.
- In-file CSS rules (`<style>` blocks or separate component-specific CSS files) are discouraged unless absolutely necessary for complex animations or third-party integrations.

## Do's and Don'ts

### Do

- Use daisyUI components (e.g. `<button class="btn btn-primary">` or `<div class="card bg-base-100 shadow-sm">`).
- Use Tailwind CSS responsive utility prefixes (e.g., `md:grid-cols-2`) for layouts.
- Import `tailwindcss` and the `daisyui` plugin in the main CSS entry file (`src/style.css`).
- Use daisyUI semantic colors (`bg-base-100`, `text-primary`, etc.) instead of hardcoded hex values or generic Tailwind colors (e.g., `bg-red-500`) to support automatic theme switching.

#### Theming (daisyUI v5)

- Configure the enabled themes inside the daisyUI plugin config block in `src/style.css`, e.g. `@plugin "daisyui" { themes: corporate --default, business, luxury; }`. The bare `@plugin "daisyui";` only enables the default `light`/`dark` themes — it does **not** enable a curated set.
- Switch themes at runtime by setting the `data-theme` attribute on the `<html>` element (e.g. from a theme picker), and persist the user's choice to `localStorage`.
- To avoid a flash of the default theme (FOUC), read the saved theme from `localStorage` and set `data-theme` in a small inline `<script>` in `<head>` **before first paint**. Inline `<script>` is permitted under this ADR; only inline `style="..."` attributes and `<style>` blocks are disallowed.

### Don't

- Do not use inline styles `<div style="...">` for layout or standard styling.
- Do not write custom `@apply` classes in CSS files when utility classes can be used directly.
- Do not import other UI or CSS libraries (e.g., Bootstrap, Bulma, Material Design) into the project.

## Consequences

### Positive

- Visual excellence and consistent look and feel out of the box.
- Seamless dark/light theme switching using daisyUI's theme engine.
- Fast page load times and excellent Core Web Vitals (CWV) due to Vite compile-time optimizations of Tailwind v4.

### Negative

- Developers need to learn daisyUI class names and conventions.

## Compliance and Enforcement

This ADR is enforced by automated checks in `.archgate/adrs/FE-001-design.rules.ts`:

1. `tailwind-and-daisyui-imported`: Ensures that the main style entry (`src/style.css`) imports tailwindcss and the daisyui plugin. This check accepts **both** the bare `@plugin "daisyui";` form and the daisyUI v5 config-block form `@plugin "daisyui" { ... }` (used to enable a curated theme set).
2. `no-raw-inline-styles`: Warns/errors on the usage of raw inline `style="..."` tags in HTML files when Tailwind utility classes should be used instead.
3. `no-style-tags-in-html`: Ensures `<style>` blocks are not used in HTML files, keeping styling centralized and utility-driven.
