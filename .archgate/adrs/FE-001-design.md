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

#### Layering Decorative Backgrounds (Tailwind z-index)

- Give any container that hosts negative z-index decorative/background children (e.g. a `bg-[url('...')]` ambient backdrop placed behind text) an explicit `z-*` utility such as `z-0`, not just `relative`. Tailwind's `-z-10` utility only stacks correctly **within** a container that establishes its own CSS stacking context; `position: relative` alone does not establish one — only `relative`/`absolute` combined with an explicit `z-index` value does. Without it, the `-z-10` child escapes the intended container's stacking context entirely and can render fully invisible or behind unrelated ancestor content instead of just behind its sibling text.
  - Example: `<section class="relative z-0 ...">` wrapping `<div class="pointer-events-none absolute inset-0 -z-10 ...">` for the background layer.
- Verify decorative/background layers that rely on daisyUI semantic colors (e.g. `from-base-100` scrims over a background image) in at least one light theme (e.g. `corporate`) and one dark theme (e.g. `night`) before shipping. Semantic colors invert contrast direction between themes, so an opacity/filter mix tuned by eye in one theme can look washed out, too loud, or muddy in another.

#### Cycling Semantic Colors for Multi-Element Palettes

- When cycling through daisyUI semantic colors to visually distinguish many small, repeated elements (token/tag chips, category badges, chart legend swatches, calendar entries, etc.), avoid relying on `secondary` as one of the cycle colors. In this project's default `corporate` theme, `secondary` renders at markedly lower chroma than the other semantic hues (roughly 0.046, versus ~0.12–0.20 for `primary`, `accent`, `info`, `success`, and `warning`, measured via computed `color`), so it reads as near-gray next to them and undermines an otherwise colorful, distinct-looking set.
  - Prefer cycling through `primary`, `accent`, `info`, `success`, `warning` (adding `error` too if a "danger/negative" connotation is acceptable for the content being represented) for a palette where every entry is visibly distinct.
  - If `secondary` must be included in a multi-color palette, spot-check it visually in the corporate (default) theme before shipping — chroma for a given semantic color name is theme-defined and can vary significantly across the project's configured themes (`corporate`, `business`, `luxury`, `night`, `dim`).

#### Animated Dimensions & Theme-Aware SVG in Data Visualizations

- **Animate size in JavaScript, never via an inline HTML `style` attribute.** When an element's dimension must change at runtime (a bar fill %, a gauge width, stacked-bar segment widths), give the resting element a Tailwind class for its initial state (e.g. `basis-0`, `w-[10%]`), store the animation target in a `data-*` attribute, and set `element.style.width` / `element.style.flexBasis` from JS on activation. Setting `element.style` in JS is permitted under this ADR — only inline `style="..."` in the HTML source is disallowed. This keeps the markup passing `no-raw-inline-styles` while still driving arbitrary computed sizes, and it avoids polluting Tailwind's build with dozens of one-off `w-[NN%]` arbitrary values. Used across the token-economy page's context meter, workday stacked bars, and fullness gauge.
  - Example markup: `<div class="s4-1-seg shrink-0 grow-0 basis-0 bg-primary transition-all duration-500" data-basis="22"></div>` driven by `seg.style.flexBasis = seg.dataset.basis + "%"` in the beat's activation handler.
- **Theme SVG with `currentColor` and semantic color utilities, not hardcoded hex.** SVG is exempt from the inline-`style` ban, but a hardcoded `fill="#1e40af"` / `stroke="#000"` will not re-skin when the `data-theme` changes. Instead color SVG strokes/fills with `stroke="currentColor"` (or `fill="currentColor"`) plus a `text-*` utility on the `<svg>` or element (e.g. `class="text-primary"`), or use the semantic `fill-*` / `stroke-*` utilities — including opacity modifiers — which Tailwind v4 + daisyUI generate and which invert correctly across themes.
  - Example: `<svg class="text-primary"><path stroke="currentColor" fill="none" d="…"/><rect class="fill-base-content/5"/><line class="stroke-base-content/20"/></svg>`. Animate stroke draw by setting `path.style.strokeDasharray` / `strokeDashoffset` in JS (not in the HTML source).

### Don't

- Do not use inline styles `<div style="...">` for layout or standard styling.
- Do not write custom `@apply` classes in CSS files when utility classes can be used directly.
- Do not import other UI or CSS libraries (e.g., Bootstrap, Bulma, Material Design) into the project.
- Do not apply a `-z-*` utility to a child element without also giving its intended containing element an explicit `z-*` value (e.g. `z-0`) — otherwise the child is not scoped to that container's stacking context.
- Do not hardcode hex colors on SVG elements (`fill="#1e40af"`, `stroke="#000"`) — they will not re-skin across themes. Use `currentColor` + a `text-*` utility or the semantic `fill-*` / `stroke-*` utilities instead.
- Do not bake runtime-animated dimensions into the HTML as inline `style="width: …"` attributes — set them from JavaScript via `element.style` on activation instead.

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
