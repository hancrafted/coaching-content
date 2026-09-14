import "../src/style.css";

/**
 * Maintain markdown for AI knowledge bases — scroll-tower engine.
 *
 * The single source of truth is the semantic HTML in `#tower`: every `.beat`
 * <section> carries data-section / data-section-title / data-beat / data-assertion.
 * The table of contents (desktop rail + mobile drawer), the accordion grouping,
 * the scroll active-sync, the progress bars and the deep-link hashes are ALL derived
 * from those attributes at runtime — so adding or removing a beat is a one-block edit.
 *
 * Colour language, established in the hero and reused by every later section:
 *   primary                = human    (the load-bearing actor)
 *   neutral / base-content = machine  (deliberately desaturated)
 *   accent                 = AI       (the ambiguous middle)
 * `secondary` is not used for any of the three — per ADR FE-001 it renders
 * near-gray in the default corporate theme.
 *
 * Per ADR FE-001, runtime-animated dimensions are set here via `element.style`
 * with their targets stored in `data-*` attributes; the HTML carries no inline
 * styles and no <style> blocks, and complex keyframes live in ./animation.css.
 */

/** Shared with the sibling ai-token-economy-101 deck so a theme choice carries across both. */
const STORAGE_KEY = "token-economy-theme";

/**
 * The curated shortlist. These are the themes the deck is checked against —
 * at least one light and one dark, per ADR FE-001's requirement for
 * semantic-coloured decorative layers. Ticket 12's verification sweep confirms
 * (and may adjust) this membership; every other theme stays reachable below it,
 * explicitly marked as unverified.
 */
const CURATED_THEMES = [
  { value: "corporate", label: "Corporate" },
  { value: "winter", label: "Winter" },
  { value: "business", label: "Business" },
  { value: "night", label: "Night" },
  { value: "dim", label: "Dim" },
  { value: "luxury", label: "Luxury" },
];

const OTHER_THEMES = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "cupcake", label: "Cupcake" },
  { value: "bumblebee", label: "Bumblebee" },
  { value: "emerald", label: "Emerald" },
  { value: "synthwave", label: "Synthwave" },
  { value: "retro", label: "Retro" },
  { value: "cyberpunk", label: "Cyberpunk" },
  { value: "valentine", label: "Valentine" },
  { value: "halloween", label: "Halloween" },
  { value: "garden", label: "Garden" },
  { value: "forest", label: "Forest" },
  { value: "aqua", label: "Aqua" },
  { value: "lofi", label: "Lofi" },
  { value: "pastel", label: "Pastel" },
  { value: "fantasy", label: "Fantasy" },
  { value: "wireframe", label: "Wireframe" },
  { value: "black", label: "Black" },
  { value: "dracula", label: "Dracula" },
  { value: "cmyk", label: "CMYK" },
  { value: "autumn", label: "Autumn" },
  { value: "acid", label: "Acid" },
  { value: "lemonade", label: "Lemonade" },
  { value: "coffee", label: "Coffee" },
  { value: "nord", label: "Nord" },
  { value: "sunset", label: "Sunset" },
  { value: "caramellatte", label: "Caramellatte" },
  { value: "abyss", label: "Abyss" },
  { value: "silk", label: "Silk" },
];

const ALL_THEMES = [...CURATED_THEMES, ...OTHER_THEMES];
const DEFAULT_THEME = "corporate";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const tower = document.getElementById("tower");

const escapeHtml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const pad2 = (n) => String(n).padStart(2, "0");

/* ------------------------------------------------------------------ *
 * Model — derive beats + sections from the DOM
 * ------------------------------------------------------------------ */

const beatEls = tower ? Array.from(tower.querySelectorAll(".beat")) : [];
const beatOrder = beatEls.map((el) => el.id);
const total = beatEls.length;
const beatById = {};
const sectionMap = new Map();

beatEls.forEach((el) => {
  const beat = {
    id: el.id,
    section: el.dataset.section,
    code: el.dataset.beat,
    assertion: el.dataset.assertion || "",
  };
  beatById[el.id] = beat;
  if (!sectionMap.has(beat.section)) {
    sectionMap.set(beat.section, {
      num: beat.section,
      title: el.dataset.sectionTitle || `Section ${beat.section}`,
      beats: [],
    });
  }
  sectionMap.get(beat.section).beats.push(beat);
});

const sections = Array.from(sectionMap.values());

/* ------------------------------------------------------------------ *
 * Table of contents — rendered identically into both mount points
 * ------------------------------------------------------------------ */

function renderSection(section) {
  const beats = section.beats
    .map(
      (b) => `
      <a
        href="#${b.id}"
        data-toc-jump="${b.id}"
        class="toc-beat block rounded-lg px-3 py-2 transition-colors hover:bg-base-300/50"
      >
        <span class="font-mono text-[0.6rem] uppercase tracking-widest text-base-content/40">${escapeHtml(
          b.code,
        )}</span>
        <span class="toc-beat-title mt-0.5 line-clamp-2 block text-sm leading-snug text-base-content/70"
          >${escapeHtml(b.assertion)}</span
        >
      </a>`,
    )
    .join("");

  return `
    <div class="toc-section" data-toc-section="${section.num}">
      <button
        type="button"
        data-section-toggle="${section.num}"
        class="toc-section-header flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-base-300/50"
      >
        <span class="flex min-w-0 items-center gap-2">
          <span class="font-mono text-xs text-base-content/40">${pad2(section.num)}</span>
          <span class="truncate font-display text-sm font-semibold">${escapeHtml(section.title)}</span>
        </span>
        <svg
          data-caret
          class="h-4 w-4 shrink-0 text-base-content/40 transition-transform duration-200"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <div data-section-beats="${section.num}" class="toc-beats hidden pl-2">${beats}</div>
    </div>`;
}

function buildTOC() {
  const html = sections.map(renderSection).join("");
  ["toc-desktop", "toc-mobile"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  });
}

/* ------------------------------------------------------------------ *
 * Active-sync — highlight the active beat, auto-expand its section,
 * drive the progress bars and keep the URL hash in step
 * ------------------------------------------------------------------ */

let activeBeatId = null;
const progressEls = ["progress-desktop", "progress-mobile"]
  .map((id) => document.getElementById(id))
  .filter(Boolean);

function markBeatAnchor(anchor, active) {
  const title = anchor.querySelector(".toc-beat-title");
  anchor.classList.toggle("bg-primary/10", active);
  if (title) {
    title.classList.toggle("text-base-content/70", !active);
    title.classList.toggle("text-primary", active);
    title.classList.toggle("font-medium", active);
  }
}

function setSectionExpanded(num, expanded) {
  document
    .querySelectorAll(`[data-section-beats="${num}"]`)
    .forEach((el) => el.classList.toggle("hidden", !expanded));
  document
    .querySelectorAll(`[data-section-toggle="${num}"] [data-caret]`)
    .forEach((caret) => caret.classList.toggle("rotate-180", expanded));
}

function setActive(id) {
  if (!beatById[id] || id === activeBeatId) return;
  activeBeatId = id;
  const activeSection = beatById[id].section;

  document
    .querySelectorAll(".toc-beat")
    .forEach((a) => markBeatAnchor(a, a.getAttribute("data-toc-jump") === id));

  sections.forEach((s) => setSectionExpanded(s.num, s.num === activeSection));

  const idx = beatOrder.indexOf(id);
  const pct = total > 1 ? (idx / (total - 1)) * 100 : 100;
  progressEls.forEach((el) => {
    el.style.width = `${pct}%`;
  });

  const hash = `#${id}`;
  if (window.location.hash !== hash) {
    window.history.replaceState(null, "", hash);
  }

  // A beat taller than the viewport may never cross the reveal ratio; becoming
  // the dominant beat is the reliable second trigger for its animation.
  fireActivate(id);
}

/* ------------------------------------------------------------------ *
 * Activation registry
 *
 * Each beat may register an `activate` callback that fires ONCE, the first
 * time the beat is substantially in view or becomes the dominant beat. It
 * receives `reduced` (prefers-reduced-motion) and must render the final state
 * instantly when true — no content may be reachable only via animation.
 *
 * A beat that registers nothing still gets the default: its `[data-reveal]`
 * children fade up in sequence. Later tickets replace that per beat by calling
 * `registerActivate("s4-1", (reduced) => { ... })`.
 * ------------------------------------------------------------------ */

const activateRegistry = {};
const activated = new Set();

/** A beat registers its on-activation animation here (keyed by beat id). */
function registerActivate(id, fn) {
  activateRegistry[id] = fn;
}

/** Fade `[data-reveal]` children up in sequence — the default beat animation. */
function revealSequence(root, reduced, { delay = 120, step = 140 } = {}) {
  const items = root.querySelectorAll("[data-reveal]");
  items.forEach((el, i) => {
    const show = () => el.classList.remove("opacity-0", "translate-y-3");
    if (reduced) show();
    else setTimeout(show, delay + i * step);
  });
}

/** Fire a beat's activate callback exactly once. */
function fireActivate(id) {
  if (activated.has(id)) return;
  const el = document.getElementById(id);
  if (!el) return;
  activated.add(id);
  const fn = activateRegistry[id];
  if (fn) fn(reduceMotion);
  else revealSequence(el, reduceMotion);
}

/* ------------------------------------------------------------------ *
 * Reveal-on-enter + active tracking via one IntersectionObserver
 * ------------------------------------------------------------------ */

function revealBeat(el) {
  const inner = el.querySelector(".beat-inner");
  if (inner) inner.classList.remove("opacity-0", "translate-y-6");
}

function setupObserver() {
  const ratios = new Map();
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        ratios.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
        if (e.isIntersecting && e.intersectionRatio > 0.1) revealBeat(e.target);
        // Run the beat's animation once it is substantially in view.
        if (e.isIntersecting && e.intersectionRatio > 0.35) fireActivate(e.target.id);
      });

      let bestId = null;
      let bestRatio = 0;
      ratios.forEach((ratio, id) => {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestId = id;
        }
      });
      if (bestId) setActive(bestId);
    },
    { root: tower, threshold: [0.1, 0.25, 0.5, 0.75, 1] },
  );

  beatEls.forEach((el) => io.observe(el));
}

/* ------------------------------------------------------------------ *
 * Navigation — click, keyboard, hash
 *
 * Arrow-key beat stepping only. No CSS scroll-snap is used anywhere, so the
 * reader who opens the shared link afterwards keeps ordinary free scrolling.
 * ------------------------------------------------------------------ */

function closeDrawer() {
  const cb = document.getElementById("toc-drawer");
  if (cb) cb.checked = false;
}

function scrollToBeat(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
}

document.addEventListener("click", (e) => {
  const jump = e.target.closest("[data-toc-jump]");
  if (jump) {
    e.preventDefault();
    scrollToBeat(jump.getAttribute("data-toc-jump"));
    closeDrawer();
    return;
  }

  const toggle = e.target.closest("[data-section-toggle]");
  if (toggle) {
    e.preventDefault();
    const num = toggle.getAttribute("data-section-toggle");
    const beatsEl = document.querySelector(`[data-section-beats="${num}"]`);
    if (beatsEl) setSectionExpanded(num, beatsEl.classList.contains("hidden"));
  }
});

/** Typing in a form field must never step the deck. */
function isTypingTarget(el) {
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable === true;
}

window.addEventListener("keydown", (e) => {
  if (isTypingTarget(document.activeElement)) return;

  const idx = beatOrder.indexOf(activeBeatId);
  if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "PageDown") {
    e.preventDefault();
    if (idx < total - 1) scrollToBeat(beatOrder[idx + 1]);
  } else if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "PageUp") {
    e.preventDefault();
    if (idx > 0) scrollToBeat(beatOrder[idx - 1]);
  } else if (e.key === "Home") {
    e.preventDefault();
    scrollToBeat(beatOrder[0]);
  } else if (e.key === "End") {
    e.preventDefault();
    scrollToBeat(beatOrder[total - 1]);
  }
});

window.addEventListener("hashchange", () => {
  const id = window.location.hash.slice(1);
  if (beatById[id] && id !== activeBeatId) scrollToBeat(id);
});

/* ------------------------------------------------------------------ *
 * Theme picker
 * ------------------------------------------------------------------ */

function currentTheme() {
  return document.documentElement.getAttribute("data-theme") || DEFAULT_THEME;
}

function updateThemeChecks() {
  const cur = currentTheme();
  ALL_THEMES.forEach((t) => {
    document.querySelectorAll(`[data-theme-check="${t.value}"]`).forEach((el) => {
      el.textContent = t.value === cur ? "✓" : "";
    });
  });
}

function setTheme(value) {
  document.documentElement.setAttribute("data-theme", value);
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* persistence unavailable — theme still applies for this session */
  }
  updateThemeChecks();
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
}

function themeItems(themes) {
  return themes
    .map(
      (t) => `
      <li>
        <button type="button" data-theme-value="${t.value}" class="justify-between">
          <span>${t.label}</span>
          <span data-theme-check="${t.value}" class="text-primary"></span>
        </button>
      </li>`,
    )
    .join("");
}

function buildThemePicker() {
  const host = document.getElementById("theme-picker");
  if (!host) return;

  host.innerHTML = `
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-ghost btn-sm gap-1" aria-label="Choose theme">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" />
          <path d="M12 3a9 9 0 000 18" fill="currentColor" />
        </svg>
        <span class="hidden sm:inline">Theme</span>
      </div>
      <ul
        tabindex="0"
        class="menu dropdown-content z-50 mt-2 max-h-80 w-52 flex-col flex-nowrap overflow-y-auto rounded-box border border-base-200 bg-base-100 p-2 shadow-lg"
      >
        <li class="menu-title text-[0.65rem] uppercase tracking-[0.2em]">Curated</li>
        ${themeItems(CURATED_THEMES)}
        <li class="menu-title text-[0.65rem] uppercase tracking-[0.2em]">Unverified</li>
        ${themeItems(OTHER_THEMES)}
      </ul>
    </div>`;

  host.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-theme-value]");
    if (btn) setTheme(btn.getAttribute("data-theme-value"));
  });

  updateThemeChecks();
}

/* ------------------------------------------------------------------ *
 * Beat animations — each beat registers its own, before Init so it exists
 * when the first beat activates. Later tickets add theirs here.
 * ------------------------------------------------------------------ */

// S1.1 — the hero lands line by line: eyebrow, title, thesis, name.
registerActivate("s1-1", (reduced) => {
  const hero = document.getElementById("s1-1");
  if (!hero) return;
  revealSequence(hero, reduced, { delay: 200, step: 220 });
});

/*
 * S4.1 — the effort Venn. One drawing used twice: section 4 mounts it with
 * emphasis "establish" to set the colour language, and section 9 (ticket 08)
 * re-renders the same component with emphasis "human" — human region lit,
 * machine and AI dimmed. Every [data-venn] element gets the drawing; its
 * data-venn-emphasis attribute picks the state.
 *
 * The geometry carries the argument. The human circle is visibly the largest,
 * and AI is not a circle of its own: it is the lens where the two parent
 * circles overlap, produced by mix-blend-multiply inside the svg's isolated
 * stacking context rather than painted as a flat third fill — the ambiguity
 * emerges from the geometry, and both parents are semantic tokens so the
 * blend re-skins across themes. The lens's only label is a question mark
 * (accent); its boundary is a dashed accent outline — provisional territory,
 * and the same treatment the spec names as the fallback should the blend
 * ever muddy in a dark theme.
 *
 * Machine circle: c(290,280) r160. Human circle: c(535,280) r235. Their
 * intersection tips sit at (352, 132.5) and (352, 427.5) — the lens path
 * below traces the human circle's left arc down, then the machine circle's
 * right arc back up.
 */

const VENN_LENS = "M 352 132.5 A 235 235 0 0 0 352 427.5 A 160 160 0 0 0 352 132.5 Z";

function effortVennMarkup(emphasis) {
  const dimmed = emphasis === "human";
  const dim = dimmed ? " opacity-25" : "";
  const lit = dimmed ? " venn-lit" : "";
  return `
    <svg
      viewBox="110 25 680 510"
      role="img"
      aria-label="Three-region Venn: what a machine can check, what AI can help with, and what only a human can check. The human region is drawn largest."
      class="venn isolate mx-auto block h-auto max-h-[48vh] w-full max-w-3xl"
    >
      <g data-venn-actor="machine" class="text-base-content transition-opacity duration-700${dim}">
        <circle
          data-venn-step="0"
          cx="290" cy="280" r="160"
          stroke-width="1.5"
          class="venn-circle fill-base-content/10 stroke-base-content/30"
        ></circle>
        <g data-venn-step="1">
          <text x="225" y="185" text-anchor="middle"
            class="fill-base-content/50 font-mono text-[11px] uppercase tracking-[0.3em]">machine</text>
          <text x="215" y="255" text-anchor="middle" class="fill-base-content/55 text-[13px]">reference resolves</text>
          <text x="215" y="285" text-anchor="middle" class="fill-base-content/55 text-[13px]">file exists</text>
          <text x="215" y="315" text-anchor="middle" class="fill-base-content/55 text-[13px]">template structure holds</text>
        </g>
      </g>
      <g data-venn-actor="human" class="text-primary transition-opacity duration-700">
        <circle
          data-venn-step="2"
          cx="535" cy="280" r="235"
          stroke-width="1.5"
          class="venn-circle mix-blend-multiply fill-primary/20 stroke-primary/50 text-primary${lit}"
        ></circle>
        <g data-venn-step="3">
          <text x="610" y="150" text-anchor="middle"
            class="fill-primary font-mono text-[11px] uppercase tracking-[0.3em]">human</text>
          <text x="605" y="242" text-anchor="middle" class="fill-base-content/90 text-[15px] font-medium">is it still true</text>
          <text x="605" y="280" text-anchor="middle" class="fill-base-content/90 text-[15px] font-medium">is it stale</text>
          <text x="605" y="318" text-anchor="middle" class="fill-base-content/90 text-[15px] font-medium">does the reference point</text>
          <text x="605" y="340" text-anchor="middle" class="fill-base-content/90 text-[15px] font-medium">at the right content</text>
        </g>
      </g>
      <g data-venn-actor="ai" class="text-accent transition-opacity duration-700${dim}">
        <path
          data-venn-step="4"
          d="${VENN_LENS}"
          stroke-width="1.5"
          stroke-dasharray="5 7"
          class="fill-none stroke-accent/60"
        ></path>
        <text data-venn-step="4" x="375" y="252" text-anchor="middle"
          class="fill-accent font-display text-[72px] font-bold">?</text>
        <g data-venn-step="5">
          <text x="373" y="298" text-anchor="middle" class="fill-base-content/70 text-[12.5px]">fact-check</text>
          <text x="373" y="324" text-anchor="middle" class="fill-base-content/70 text-[12.5px]">hard numbers</text>
          <text x="373" y="350" text-anchor="middle" class="fill-base-content/70 text-[12.5px]">still needs checking</text>
        </g>
      </g>
    </svg>`;
}

document.querySelectorAll("[data-venn]").forEach((host) => {
  host.innerHTML = effortVennMarkup(host.dataset.vennEmphasis || "establish");
});

/**
 * Stagger the Venn's arrival — machine first (the settled part), the human
 * circle second (the big arrival), the question mark last. Reduced motion
 * skips the stagger; the reduced-motion block in animation.css already holds
 * every step at its final, fully legible state.
 */
function playVenn(svg, reduced, { delay = 350, step = 300 } = {}) {
  if (!reduced) {
    svg.querySelectorAll("[data-venn-step]").forEach((el) => {
      el.style.transitionDelay = `${delay + Number(el.dataset.vennStep) * step}ms`;
    });
  }
  svg.classList.add("venn-on");
}

// S4.1 — heading lines fade up, then the Venn assembles actor by actor.
registerActivate("s4-1", (reduced) => {
  const beat = document.getElementById("s4-1");
  if (!beat) return;
  revealSequence(beat, reduced);
  const svg = beat.querySelector(".venn");
  if (svg) playVenn(svg, reduced);
});

/* ------------------------------------------------------------------ *
 * Init
 * ------------------------------------------------------------------ */

buildThemePicker();
buildTOC();

if (reduceMotion) {
  document
    .querySelectorAll(".beat-inner")
    .forEach((el) => el.classList.remove("opacity-0", "translate-y-6"));
}

const hashId = window.location.hash.slice(1);
const initialId = beatById[hashId] ? hashId : beatOrder[0];
setActive(initialId);
if (beatById[hashId]) {
  requestAnimationFrame(() => scrollToBeat(hashId));
} else if (beatOrder.length) {
  revealBeat(document.getElementById(beatOrder[0]));
}

setupObserver();
