import "../src/style.css";

/**
 * Maintaining markdown for AI — scroll-tower engine.
 *
 * The single source of truth is the semantic HTML in `#tower`: every `.beat`
 * <section> carries data-section / data-section-title / data-beat / data-assertion.
 * The table of contents (desktop rail + mobile drawer), the accordion grouping,
 * the scroll active-sync, the progress bars and the deep-link hashes are ALL derived
 * from those attributes at runtime — so adding or removing a beat is a one-block edit.
 *
 * Colour language, established in the hero and reused by every later section:
 *   primary                = machine  (mechanical, deterministic checks)
 *   secondary              = human    (the load-bearing actor, ground truth)
 *   accent                 = AI       (the accelerator, recommendations)
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
    title: el.dataset.slideTitle || el.dataset.assertion || "",
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
 * Table of contents — executive summary, claims as titles, collapsed
 * hierarchy with only section 5 having children.
 * ------------------------------------------------------------------ */

function renderSection(section) {
  // Only section 5 has genuine subsections
  if (section.beats.length > 1) {
    const beats = section.beats
      .map(
        (b) => `
        <a
          href="#${b.id}"
          data-toc-jump="${b.id}"
          class="toc-beat block rounded-lg px-3 py-1.5 transition-colors hover:bg-base-300/50"
        >
          <span class="toc-beat-title line-clamp-1 block text-xs leading-snug text-base-content/70"
            >${escapeHtml(b.title || b.assertion)}</span
          >
        </a>`,
      )
      .join("");

    return `
      <div class="toc-section" data-toc-section="${section.num}">
        <button
          type="button"
          data-section-toggle="${section.num}"
          aria-expanded="true"
          class="toc-section-header flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-base-300/50"
        >
          <span class="flex min-w-0 items-center gap-2">
            <span class="font-mono text-xs text-base-content/40">${pad2(section.num)}</span>
            <span class="truncate font-display text-sm font-semibold">${escapeHtml(section.title)}</span>
          </span>
          <svg
            data-caret
            aria-hidden="true"
            class="h-4 w-4 shrink-0 text-base-content/40 transition-transform duration-200 rotate-180"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <div data-section-beats="${section.num}" class="toc-beats pl-6 space-y-0.5 mt-0.5">${beats}</div>
      </div>`;
  }

  // Single-slide flat entry — no fake hierarchy, no SX.1 code
  const b = section.beats[0];
  return `
    <div class="toc-section" data-toc-section="${section.num}">
      <a
        href="#${b.id}"
        data-toc-jump="${b.id}"
        class="toc-beat block rounded-lg px-3 py-2 transition-colors hover:bg-base-300/50"
      >
        <span class="flex items-center gap-2">
          <span class="font-mono text-xs text-base-content/40">${pad2(section.num)}</span>
          <span class="toc-beat-title line-clamp-2 font-display text-sm font-semibold text-base-content/80">${escapeHtml(
            section.title,
          )}</span>
        </span>
      </a>
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
  anchor.classList.toggle("bg-secondary/10", active);
  if (title) {
    title.classList.toggle("text-base-content/70", !active);
    title.classList.toggle("text-secondary", active);
    title.classList.toggle("font-bold", active);
  }
}

function setSectionExpanded(num, expanded) {
  document
    .querySelectorAll(`[data-section-beats="${num}"]`)
    .forEach((el) => el.classList.toggle("hidden", !expanded));
  document
    .querySelectorAll(`[data-section-toggle="${num}"]`)
    .forEach((btn) => btn.setAttribute("aria-expanded", String(expanded)));
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

  sections.forEach((s) => {
    if (s.beats.length > 1) {
      setSectionExpanded(s.num, s.num === activeSection);
    }
  });

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

/* ------------------------------------------------------------------ *
 * The motion vocabulary
 *
 * Mirrors the custom properties at the top of animation.css. The stylesheet
 * owns the transitions and the keyframes; these numbers exist so the JS-timed
 * parts — staggers, and the hand-offs between one primitive and the next — stay
 * in the same language. Change a duration in one file and change it in the
 * other; they are one vocabulary in two syntaxes.
 *
 * Every beat's full sequence is budgeted to finish inside 2.5s, which is about
 * how long the presenter takes to say the sentence that goes with it.
 * ------------------------------------------------------------------ */

const MOTION = {
  rise: 560,
  draw: 900,
  settle: 520,
  hover: 180,
  stagger: 90,
};

/** Rise: bring a [data-rise] element in. Instant under reduced motion. */
function rise(el, at, reduced) {
  if (!el) return;
  if (reduced) el.classList.add("is-risen");
  else setTimeout(() => el.classList.add("is-risen"), at);
}

/**
 * Draw, part one: measure a path and park it fully undrawn.
 *
 * The length comes from getTotalLength(), never from a hand-guessed constant —
 * two paths of different true lengths sharing one number draw at visibly
 * different rates.
 */
function armDraw(path) {
  if (!path) return 0;
  const len = path.getTotalLength();
  path.style.strokeDasharray = `${len}`;
  path.style.strokeDashoffset = `${len}`;
  return len;
}

/** Draw, part two: release an armed path so it draws over --deck-draw. */
function releaseDraw(path, at, reduced) {
  if (!path) return;
  const go = () => {
    path.style.strokeDashoffset = "0";
  };
  if (reduced) {
    path.style.strokeDasharray = "none";
    go();
  } else setTimeout(go, at);
}

/** Settle: a one-shot pop and ring on an HTML element. Silent under reduced motion. */
function settle(el, at, reduced) {
  if (!el || reduced) return;
  setTimeout(() => {
    el.classList.remove("deck-settle");
    void el.offsetWidth; // restart the animation if the beat is re-entered
    el.classList.add("deck-settle");
  }, at);
}

/** Settle, SVG flavour: the authored ring circle expands once and fades. */
function settleRing(el, at, reduced) {
  if (!el || reduced) return;
  setTimeout(() => el.classList.add("is-settling"), at);
}

/** A beat registers its on-activation animation here (keyed by beat id). */
function registerActivate(id, fn) {
  activateRegistry[id] = fn;
}

/** Rise the `[data-reveal]` children in sequence — the default beat animation. */
function revealSequence(root, reduced, { delay = 120, step = MOTION.stagger } = {}) {
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
  // A card back is open. Arrow keys belong to whatever is inside it — stepping
  // the deck underneath a modal is never what the key was meant for. Esc is the
  // dialog's own, handled by its `cancel` listener.
  if (document.querySelector("dialog[open]")) return;

  if (e.key === "p" || e.key === "P") {
    e.preventDefault();
    togglePresentationMode();
    return;
  }
  if (e.key === "n" || e.key === "N") {
    e.preventDefault();
    toggleSpeakerNotes();
    return;
  }

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
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
 * Presenter controls — presentation mode & speaker notes
 * ------------------------------------------------------------------ */

const STORAGE_KEY_PRESENTATION = "deck-presentation-mode";
const STORAGE_KEY_NOTES = "deck-speaker-notes";

function updatePresenterControlsUI() {
  const isPres = document.documentElement.classList.contains("presentation-mode");
  const isNotes = document.documentElement.classList.contains("notes-visible");

  const presCheck = document.getElementById("presentation-mode-check");
  if (presCheck) presCheck.textContent = isPres ? "✓" : "";

  const notesCheck = document.getElementById("speaker-notes-check");
  if (notesCheck) notesCheck.textContent = isNotes ? "✓" : "";

  const directNotesBtn = document.getElementById("direct-notes-btn");
  if (directNotesBtn) {
    directNotesBtn.classList.toggle("btn-active", isNotes);
    directNotesBtn.classList.toggle("border-secondary", isNotes);
    directNotesBtn.classList.toggle("bg-secondary/15", isNotes);
    directNotesBtn.classList.toggle("text-secondary", isNotes);
    directNotesBtn.setAttribute("aria-pressed", isNotes ? "true" : "false");
  }

  const railNotesBtn = document.getElementById("rail-toggle-notes");
  if (railNotesBtn) {
    railNotesBtn.classList.toggle("btn-active", isNotes);
    railNotesBtn.classList.toggle("border-secondary", isNotes);
    railNotesBtn.classList.toggle("bg-secondary/15", isNotes);
    railNotesBtn.classList.toggle("text-secondary", isNotes);
  }
}

function setPresentationMode(enabled) {
  document.documentElement.classList.toggle("presentation-mode", enabled);
  document.body.classList.toggle("presentation-mode", enabled);
  try {
    localStorage.setItem(STORAGE_KEY_PRESENTATION, enabled ? "true" : "false");
  } catch {
    /* persistence unavailable */
  }
  updatePresenterControlsUI();
  if (enabled && document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}

function togglePresentationMode() {
  const current = document.documentElement.classList.contains("presentation-mode");
  setPresentationMode(!current);
}

function setSpeakerNotes(enabled) {
  document.documentElement.classList.toggle("notes-visible", enabled);
  document.body.classList.toggle("notes-visible", enabled);
  try {
    localStorage.setItem(STORAGE_KEY_NOTES, enabled ? "true" : "false");
  } catch {
    /* persistence unavailable */
  }
  updatePresenterControlsUI();
}

function toggleSpeakerNotes() {
  const current = document.documentElement.classList.contains("notes-visible");
  setSpeakerNotes(!current);
}

function buildPresenterControls() {
  const host = document.getElementById("presenter-controls");
  if (!host) return;

  host.innerHTML = `
    <div class="flex items-center gap-1.5">
      <!-- Direct Speaker Notes Button for high discoverability -->
      <button
        type="button"
        id="direct-notes-btn"
        class="btn btn-ghost btn-sm gap-1.5 border border-base-300 transition-colors"
        aria-label="Toggle speaker notes"
        title="Toggle speaker notes (N)"
      >
        <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span class="text-xs font-medium">Notes</span>
        <kbd class="kbd kbd-xs font-mono">N</kbd>
        <span id="speaker-notes-check" class="text-secondary font-bold text-xs"></span>
      </button>

      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-sm btn-square border border-base-300" aria-label="Presenter controls" title="Presenter controls">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6h16M4 12h10M4 18h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <ul
          tabindex="0"
          class="menu dropdown-content z-50 mt-2 w-56 rounded-box border border-base-200 bg-base-100 p-2 shadow-lg"
        >
          <li class="menu-title text-[0.65rem] uppercase tracking-[0.2em]">Presenter controls</li>
          <li>
            <button type="button" id="toggle-presentation-btn" class="justify-between py-2">
              <span class="flex items-center gap-2">
                <span>Presentation mode</span>
                <kbd class="kbd kbd-xs">P</kbd>
              </span>
              <span id="presentation-mode-check" class="text-secondary font-bold"></span>
            </button>
          </li>
          <li>
            <button type="button" id="toggle-notes-btn" class="justify-between py-2">
              <span class="flex items-center gap-2">
                <span>Speaker notes</span>
                <kbd class="kbd kbd-xs">N</kbd>
              </span>
            </button>
          </li>
        </ul>
      </div>
    </div>`;

  const presBtn = document.getElementById("toggle-presentation-btn");
  if (presBtn) {
    presBtn.addEventListener("click", () => {
      togglePresentationMode();
    });
  }

  const directBtn = document.getElementById("direct-notes-btn");
  if (directBtn) {
    directBtn.addEventListener("click", () => {
      toggleSpeakerNotes();
    });
  }

  const notesBtn = document.getElementById("toggle-notes-btn");
  if (notesBtn) {
    notesBtn.addEventListener("click", () => {
      toggleSpeakerNotes();
    });
  }

  const railBtn = document.getElementById("rail-toggle-notes");
  if (railBtn) {
    railBtn.addEventListener("click", () => {
      toggleSpeakerNotes();
    });
  }

  const exitBtn = document.getElementById("exit-presentation");
  if (exitBtn) {
    exitBtn.addEventListener("click", () => {
      setPresentationMode(false);
    });
  }

  updatePresenterControlsUI();
}

// Global delegated clicks for slide-level notes triggers and rail
document.addEventListener("click", (e) => {
  if (
    e.target.closest("[data-notes-cue]") ||
    e.target.closest("[data-close-notes]") ||
    e.target.closest("#rail-toggle-notes")
  ) {
    toggleSpeakerNotes();
  }
});

/* ------------------------------------------------------------------ *
 * Beat animations — each beat registers its own, before Init so it exists
 * when the first beat activates. Later tickets add theirs here.
 * ------------------------------------------------------------------ */

// S1.1 — the hero lands line by line: eyebrow, title, thesis, name. Already does
// its job; retimed only, to adopt Rise.
registerActivate("s1-1", (reduced) => {
  const hero = document.getElementById("s1-1");
  if (!hero) return;
  revealSequence(hero, reduced, { delay: 200 });
});

/* ------------------------------------------------------------------ *
 * S2.1 — The card backs & popovers
 *
 * Five modals mounted once into <body> and opened by matching
 * [data-card-open] triggers:
 *   - frontmatter: structured metadata block (anchored to top of centre card)
 *   - syntax: 8-part core markdown syntax (anchored to body of centre card)
 *   - memory: static context always loaded (AGENTS.md, CLAUDE.md)
 *   - knowledge: dynamic context retrieved on demand (LLM-wiki, runbooks)
 *   - instruction: dynamic context loaded on task match (agent skills)
 * ------------------------------------------------------------------ */

/** A source excerpt dressed as the file it came from. */
function codePanel(filename, source) {
  return `
    <figure class="overflow-hidden rounded-box border border-base-300 bg-base-200/40">
      <figcaption class="flex items-center gap-2 border-b border-base-300 bg-base-200/70 px-3 py-2">
        <span class="size-2 rounded-full bg-primary/60"></span>
        <span class="size-2 rounded-full bg-accent/60"></span>
        <span class="font-mono text-[0.7rem] font-semibold text-base-content/70">${escapeHtml(filename)}</span>
      </figcaption>
      <pre class="overflow-x-auto px-4 py-3 font-mono text-[0.72rem] leading-relaxed text-base-content/80"><code>${escapeHtml(source)}</code></pre>
    </figure>`;
}

const backHeading = (text) =>
  `<h4 class="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-base-content/50">${text}</h4>`;

function frontmatterMarkup() {
  return `
    <div class="grid gap-8 md:grid-cols-2">
      <div class="min-w-0">
        ${backHeading("What is front matter?")}
        <p class="mt-2 text-sm leading-relaxed text-base-content/75">
          A YAML header delimited by triple dashes (<code class="rounded bg-base-200 px-1 font-mono text-[0.8em]">---</code>) at the top of a markdown file. It supplies typed, machine-readable key-value pairs that agents and linters inspect before parsing the document body.
        </p>

        <div class="mt-6">
          ${backHeading("Why it carries the workflow")}
          <p class="mt-2 text-sm leading-relaxed text-base-content/75">
            Without front matter, a markdown file is opaque text. Linters cannot tell whether a document is a playbook, a policy, or a draft, and cannot check if it has expired. Front matter adds a deterministic header without sacrificing human readability.
          </p>
        </div>

        <div class="mt-6 rounded-box border border-primary/30 bg-primary/5 p-4">
          <p class="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-primary">Standardising the signal</p>
          <p class="mt-2 text-sm leading-relaxed text-base-content/80">
            Fields like <code class="font-mono text-xs text-primary font-semibold">type</code>, <code class="font-mono text-xs text-secondary font-semibold">stale_after</code>, and <code class="font-mono text-xs font-semibold">owner</code> make verification mechanical. Section 5 of this talk explores how the Open Knowledge Format (OKF) standardises these fields across repositories.
          </p>
        </div>
      </div>

      <div class="min-w-0">
        ${backHeading("Example front matter header")}
        <div class="mt-2">
          ${codePanel(
            "markdown.md",
            [
              "---",
              "type: Playbook",
              "stale_after: 2026-07-01",
              'owner: "@engineering/sre"',
              'verified_by: "human:han"',
              "---",
              "",
              "# Incident Response Runbook",
              "",
              "1. Triage telemetry payload.",
            ].join("\n"),
          )}
        </div>
      </div>
    </div>`;
}

/**
 * The three role cards share a shape, with credibility line and verified link.
 */
function roleBackBody({
  files,
  reads,
  costs,
  breaks,
  credibility,
  linkUrl,
  linkText,
  filename,
  source,
}) {
  const credHtml = credibility
    ? `
        <div class="mt-5 rounded-box border border-base-300 bg-base-200/50 p-3.5">
          <p class="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-base-content/60">Credibility &amp; Adoption</p>
          <p class="mt-1.5 text-xs leading-relaxed text-base-content/85">${escapeHtml(credibility)}</p>
          ${
            linkUrl
              ? `<div class="mt-2.5">
                  <a
                    href="${escapeHtml(linkUrl)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="link link-primary font-mono text-xs inline-flex items-center gap-1"
                  >
                    <span>${escapeHtml(linkText || linkUrl)}</span>
                    <span class="text-[11px]">↗</span>
                  </a>
                </div>`
              : ""
          }
        </div>`
    : "";

  return `
    <div class="grid gap-8 md:grid-cols-2">
      <div class="min-w-0">
        ${backHeading("Typical files")}
        <ul class="mt-2 flex flex-wrap gap-1.5">
          ${files.map((f) => `<li class="badge badge-ghost badge-sm font-mono">${escapeHtml(f)}</li>`).join("")}
        </ul>

        ${`<div class="mt-6">${backHeading("When the agent reads it")}<p class="mt-2 text-sm leading-relaxed text-base-content/75">${reads}</p></div>`}
        ${`<div class="mt-5">${backHeading("What it costs")}<p class="mt-2 text-sm leading-relaxed text-base-content/75">${costs}</p></div>`}

        <div class="mt-6 rounded-box border border-warning/40 bg-warning/10 p-4">
          <p class="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-warning">Goes wrong when</p>
          <p class="mt-2 text-sm leading-relaxed text-base-content/80">${breaks}</p>
        </div>

        ${credHtml}
      </div>

      <div class="min-w-0">
        ${backHeading("What it looks like")}
        <div class="mt-2">${codePanel(filename, source)}</div>
      </div>
    </div>`;
}

/**
 * The markdown cheat sheet — raw on the left, rendered on the right.
 */
const MD_ROWS = [
  {
    raw: ["# Heading 1", "## Heading 2", "###### Heading 6"].join("\n"),
    rendered: `
      <p class="font-display text-xl font-bold leading-snug">Heading 1</p>
      <p class="font-display text-base font-bold leading-snug">Heading 2</p>
      <p class="font-display text-[0.7rem] font-bold uppercase leading-snug tracking-wide">Heading 6</p>`,
  },
  {
    raw: "**bold** and *italic* and `code` and ~~struck~~",
    rendered: `<p><strong>bold</strong> and <em>italic</em> and <code class="rounded bg-base-200 px-1 font-mono text-[0.8em]">code</code> and <s class="opacity-60">struck</s></p>`,
  },
  {
    raw: "[the handbook](https://example.com/handbook)",
    rendered: `<p><a class="link link-primary" href="https://example.com/handbook" rel="nofollow">the handbook</a></p>`,
  },
  {
    raw: ["- context", "- knowledge", "  - nested one level", "", "1. first", "2. second"].join(
      "\n",
    ),
    rendered: `
      <ul class="list-disc pl-5">
        <li>context</li>
        <li>knowledge<ul class="list-disc pl-5"><li>nested one level</li></ul></li>
      </ul>
      <ol class="mt-2 list-decimal pl-5"><li>first</li><li>second</li></ol>`,
  },
  {
    raw: ["- [x] reviewed", "- [ ] not yet"].join("\n"),
    rendered: `
      <ul class="space-y-1">
        <li class="flex items-center gap-2"><input type="checkbox" class="checkbox checkbox-xs" checked disabled /> reviewed</li>
        <li class="flex items-center gap-2"><input type="checkbox" class="checkbox checkbox-xs" disabled /> not yet</li>
      </ul>`,
  },
  {
    raw: "> Writing got cheap. Verifying did not.",
    rendered: `<blockquote class="border-l-4 border-base-300 pl-3 italic text-base-content/70">Writing got cheap. Verifying did not.</blockquote>`,
  },
  {
    raw: ["```bash", "npm run verify", "```"].join("\n"),
    rendered: `<pre class="overflow-x-auto rounded-box bg-base-200 px-3 py-2 font-mono text-[0.78rem]"><code>npm run verify</code></pre>`,
  },
  {
    raw: [
      "| File          | Owner |",
      "| ------------- | ----- |",
      "| onboarding.md | @mo   |",
    ].join("\n"),
    rendered: `
      <div class="overflow-x-auto">
        <table class="table table-xs">
          <thead><tr><th>File</th><th>Owner</th></tr></thead>
          <tbody><tr><td class="font-mono">onboarding.md</td><td>@mo</td></tr></tbody>
        </table>
      </div>`,
  },
];

function markdownCheatSheetMarkup() {
  const rows = MD_ROWS.map(
    (row) => `
      <div class="grid gap-2 border-t border-base-200 py-3 first:border-t-0 first:pt-0 sm:grid-cols-2 sm:gap-8">
        <pre class="min-w-0 whitespace-pre-wrap font-mono text-[0.74rem] leading-relaxed text-base-content/70"><code>${escapeHtml(row.raw)}</code></pre>
        <div class="min-w-0 text-sm leading-relaxed">${row.rendered}</div>
      </div>`,
  ).join("");

  return `
    <div
      class="sticky top-0 z-10 grid gap-2 border-b border-base-300 bg-base-100 pb-2 sm:grid-cols-2 sm:gap-8"
    >
      <p class="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-base-content/50">Raw markdown</p>
      <p class="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-base-content/50">How it renders</p>
    </div>
    <div class="mt-2">${rows}</div>
    <div class="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-base-200 pt-4 text-sm leading-relaxed text-base-content/65">
      <p>
        Standard markdown syntax supported by every parser and LLM context window.
      </p>
      <a
        href="https://github.com/adam-p/markdown-here/wiki/markdown-cheatsheet"
        target="_blank"
        rel="noopener noreferrer"
        class="link link-primary font-mono text-xs inline-flex items-center gap-1 shrink-0"
      >
        <span>Adam Pritchard's Cheatsheet on GitHub ↗</span>
      </a>
    </div>`;
}

/** The five card backs/popovers. */
const CARD_BACKS = [
  {
    key: "frontmatter",
    eyebrow: "markdown.md · Front matter",
    title: "Structured metadata above unstructured text",
    lede: "A YAML header between triple-dash fences (---). It provides typed, deterministic attributes so agents and linters inspect what a file is before parsing its prose.",
    body: frontmatterMarkup(),
  },
  {
    key: "syntax",
    eyebrow: "markdown.md · Body syntax",
    title: "Eight bits of syntax, and that is the whole format",
    lede: "No runtime, no schema, no database. A handful of characters that a person can read unaided and a parser agrees on — which is exactly why both humans and machines can use the same file.",
    body: markdownCheatSheetMarkup(),
  },
  {
    key: "memory",
    eyebrow: "Memory",
    title: "Static context — what the project is, carried into every turn",
    lede: "Long-term persistent state: how you build, what you never do, who to ask. It is the agent's memory of the project, and it is read whether or not the current task needs it.",
    body: roleBackBody({
      files: ["AGENTS.md", "CLAUDE.md", "README.md", ".cursorrules"],
      reads:
        "At the start of every session, in full, before your first sentence. The agent does not choose to read it — it arrives already read.",
      costs:
        "It occupies the context window for the entire session. Every line you add is a line paid for on every single turn, so length is a budget and not a virtue.",
      breaks:
        "A rule changes and the file does not. Because it is loaded unconditionally, a stale line here is applied with total confidence to work it no longer describes.",
      credibility:
        "AGENTS.md — used by 60k+ open-source projects; now stewarded by the Agentic AI Foundation under the Linux Foundation. Named as static context in Osmani, Saboo & Kartakis, The New SDLC with Vibe Coding (Google, May 2026), fig. 4.",
      linkUrl: "https://agents.md/",
      linkText: "Visit agents.md",
      filename: "AGENTS.md",
      source: [
        "# AGENTS.md",
        "",
        "## Commands",
        "",
        "- Build: `npm run build`",
        "- Verify: `npm run verify`",
        "",
        "## Ground rules",
        "",
        "1. Run verify before every commit.",
        "2. Tailwind v4 + daisyUI v5 only — no inline styles.",
        "3. One commit addresses exactly one scope.",
      ].join("\n"),
    }),
  },
  {
    key: "knowledge",
    eyebrow: "Knowledge",
    title: "Dynamic context, fetched only when a question reaches for it",
    lede: "What the organisation knows and would otherwise have to re-learn: playbooks, decisions, runbooks, post-mortems. Most of it is never opened in any given session.",
    body: roleBackBody({
      files: ["docs/handbook/*.md", "wiki/", "adr/*.md", "runbooks/"],
      reads:
        "On demand. It is indexed or searched, and the pages that match the question get pulled in — three files out of four hundred.",
      costs:
        "Almost nothing to store and very little to carry, because only the matched pages enter the window. The cost is not tokens; it is upkeep.",
      breaks:
        "It is retrieved without being re-verified. A playbook that expired two quarters ago answers just as fluently and just as confidently as a current one.",
      credibility:
        "LLM-wiki — Karpathy, April 2026, 5,000+ stars. The canonical reference for the term.",
      linkUrl: "https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f",
      linkText: "Karpathy's LLM-wiki gist on GitHub",
      filename: "docs/handbook/onboarding.md",
      source: [
        "---",
        "type: Handbook",
        "stale_after: 2026-07-01",
        'owner: "@people-ops"',
        "---",
        "",
        "# Employee onboarding",
        "",
        "## First week",
        "",
        "1. Collect the laptop from IT on day one.",
        "2. Complete the security training module.",
        "3. Meet your onboarding buddy.",
        "",
        "## Accounts to request",
        "",
        "| System | Requested from |",
        "| ------ | -------------- |",
        "| Email  | IT Helpdesk    |",
      ].join("\n"),
    }),
  },
  {
    key: "instruction",
    eyebrow: "Instructions",
    title: "A procedure, written to be executed rather than read",
    lede: "The repeatable jobs: how a review is run, how a release note is drafted, how a page gets checked. Prose describes; an instruction is followed, step by step.",
    body: roleBackBody({
      files: [".agents/skills/*/SKILL.md", ".claude/skills/*/SKILL.md", "prompts/"],
      reads:
        "When its trigger matches — you type the command, or its description fits the task well enough that the agent reaches for it unprompted. At startup the agent sees only the front matter; the steps arrive on the match.",
      costs:
        "Only loaded when invoked, so it is cheap to keep dozens. That progressive disclosure is what makes skills the workhorse of dynamic context. The real cost is that a vague trigger gets it loaded for the wrong task.",
      breaks:
        "The steps drift from reality. A wrong sentence in a wiki page misleads someone; a wrong step in an instruction gets run, on your repository, without being reread.",
      credibility:
        "The commit skill from this repository's own toolkit — built on the open Agent Skills standard, and named as the dynamic-context pattern in Osmani, Saboo & Kartakis, The New SDLC with Vibe Coding (Google, May 2026), fig. 4.",
      linkUrl: "https://github.com/hancrafted/skills/blob/main/skills/commit/SKILL.md",
      linkText: "Read the commit skill on GitHub",
      filename: ".claude/skills/commit/SKILL.md",
      source: [
        "---",
        "name: commit",
        "description: Author a commit message and commit it — Conventional Commits",
        "  header, Keep a Changelog body, Source trailer. Use before every",
        "  `git commit`, whether a human or an agent initiates it.",
        "---",
        "",
        "Author a commit by running the steps in order.",
        "",
        "**2. Read the change.** `git status`, `git diff --staged`, `git diff`.",
        "A non-empty index is expressed intent: honour it.",
        "_Done when_ the index holds exactly this commit's set.",
        "",
        "**4. Author the message, and write it to the draft.**",
        "_Done when_ the gate exits 0 against the draft.",
        "",
        "**7. Report, and stop.** The commit stays in the local clone:",
        "**pushing is the human's act**.",
      ].join("\n"),
    }),
  },
];

/**
 * The modal shell. Full-bleed on phones; centred panel at ~86vw elsewhere.
 */
function cardBackMarkup(back) {
  return `
    <dialog id="card-back-${back.key}" class="modal" aria-labelledby="card-back-${back.key}-title">
      <div
        class="deck-swivel modal-box relative flex h-[100dvh] max-h-none w-full max-w-none flex-col rounded-none p-5 sm:h-auto sm:max-h-[82vh] sm:w-[86vw] sm:max-w-5xl sm:rounded-box sm:p-8"
      >
        <button
          type="button"
          data-card-close
          class="btn btn-circle btn-ghost absolute right-3 top-3 z-20 size-11 sm:size-9"
          aria-label="Close"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>

        <header class="shrink-0 pr-14">
          <p class="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-primary">
            ${escapeHtml(back.eyebrow)}
          </p>
          <h3
            id="card-back-${back.key}-title"
            class="mt-2 font-display text-xl font-bold tracking-tight md:text-2xl"
          >
            ${back.title}
          </h3>
          <p class="mt-3 max-w-3xl text-sm font-light leading-relaxed text-base-content/70">
            ${back.lede}
          </p>
        </header>

        <div class="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">${back.body}</div>
      </div>

      <div class="modal-backdrop">
        <button type="button" data-card-close aria-label="Close">close</button>
      </div>
    </dialog>`;
}

/** Mounted once, into <body>. */
function mountCardBacks() {
  if (document.querySelector("[data-card-backs]")) return;
  const host = document.createElement("div");
  host.setAttribute("data-card-backs", "");
  host.innerHTML = CARD_BACKS.map(cardBackMarkup).join("");
  document.body.append(host);

  host.querySelectorAll("dialog").forEach((dlg) => {
    dlg.addEventListener("cancel", (e) => {
      e.preventDefault();
      closeCardBack(dlg);
    });
  });
}

/**
 * Swivel: the card turns to show its back. Mirrors --deck-swivel.
 */
const SWIVEL = 520;

function openCardBack(key) {
  if (key === "markdown") key = "syntax";
  const dlg = document.getElementById(`card-back-${key}`);
  if (!dlg || dlg.open) return;
  const box = dlg.querySelector(".deck-swivel");
  box.classList.remove("is-opening", "is-closing");
  dlg.showModal();
  if (reduceMotion) return;
  void box.offsetWidth;
  box.classList.add("is-opening");
}

function closeCardBack(dlg) {
  if (!dlg || !dlg.open) return;
  const box = dlg.querySelector(".deck-swivel");
  box.classList.remove("is-opening");
  if (reduceMotion) {
    dlg.close();
    return;
  }
  box.classList.add("is-closing");
  const done = () => {
    box.classList.remove("is-closing");
    dlg.close();
  };
  box.addEventListener("animationend", done, { once: true });
  setTimeout(() => {
    if (box.classList.contains("is-closing")) done();
  }, SWIVEL + 120);
}

document.addEventListener("click", (e) => {
  const closer = e.target.closest?.("[data-card-close]");
  if (closer) {
    closeCardBack(closer.closest("dialog"));
    return;
  }
  const opener = e.target.closest?.("[data-card-open]");
  if (opener) openCardBack(opener.dataset.cardOpen);
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const opener = e.target.closest?.("[data-card-open]");
  if (!opener) return;
  e.preventDefault();
  openCardBack(opener.dataset.cardOpen);
});

mountCardBacks();

/* ------------------------------------------------------------------ *
 * S2.1 — Connecting arrows from Markdown card to Knowledge, Instructions, Memory
 * ------------------------------------------------------------------ */

let s2ArrowsDrawn = false;

const S2_FILES = {
  knowledge: {
    key: "knowledge",
    filename: "docs/handbook/onboarding.md",
    badge: "Retrieved on demand",
    badgeClass: "badge-accent/20 text-accent",
    frontmatterHtml: `<pre class="mt-3 font-mono text-xs leading-relaxed break-words whitespace-pre-wrap text-base-content/85"><code><span class="text-base-content/40">---</span>
<span class="font-medium text-accent">type:</span> Handbook
<span class="font-medium text-secondary">stale_after:</span> 2026-07-01
<span class="font-medium text-base-content/70">owner:</span> "@people-ops"
<span class="text-base-content/40">---</span></code></pre>`,
    bodyTitlePrefix: "#",
    bodyTitlePrefixClass: "text-accent",
    bodyTitle: "Employee onboarding",
    bodyDesc:
      "Handbook for first-week setup. Dynamic context: the agent pays the token cost only when a question reaches for it.",
    bodyDetailsHtml: `
      <div class="flex items-center gap-2">
        <input type="checkbox" checked disabled class="checkbox checkbox-xs rounded checkbox-accent" />
        <span>1. Collect laptop from IT on day one</span>
      </div>
      <div class="flex items-center gap-2">
        <input type="checkbox" disabled class="checkbox checkbox-xs rounded checkbox-accent" />
        <span>2. Complete security training module</span>
      </div>
      <div class="flex items-center gap-2">
        <input type="checkbox" disabled class="checkbox checkbox-xs rounded checkbox-accent" />
        <span>3. Meet your onboarding buddy</span>
      </div>`,
    quote: "Retrieved on demand. Stale pages answer just as fluently as fresh ones.",
    quoteBorderClass: "border-accent/40",
  },
  memory: {
    key: "memory",
    filename: "AGENTS.md",
    badge: "Always loaded",
    badgeClass: "badge-primary/20 text-primary",
    frontmatterHtml: `
      <div class="mt-3 rounded-lg border border-dashed border-base-300 bg-base-100/50 p-3 text-xs leading-relaxed text-base-content/60">
        <div class="flex items-center gap-2 font-mono text-[11px] font-semibold text-primary/80 uppercase tracking-wider mb-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <span>No front matter header</span>
        </div>
        <p>Pure Markdown loaded unconditionally at session start. Context files typically omit front matter so entire contents stream straight into prompt window.</p>
      </div>`,
    bodyTitlePrefix: "#",
    bodyTitlePrefixClass: "text-primary",
    bodyTitle: "AGENTS.md",
    bodyDesc:
      "Project overview & ground rules for AI pair programmers. Static context: every token is present in every interaction, whether or not it is relevant.",
    bodyDetailsHtml: `
      <div class="flex items-center gap-2 text-base-content/85">
        <span class="text-primary font-bold">›</span>
        <span>Commands: <code class="bg-base-200/80 px-1 py-0.5 rounded text-[11px] font-mono">npm run build</code> · <code class="bg-base-200/80 px-1 py-0.5 rounded text-[11px] font-mono">npm run verify</code></span>
      </div>
      <div class="flex items-center gap-2 text-base-content/85">
        <span class="text-primary font-bold">›</span>
        <span>Ground rule: Tailwind v4 + daisyUI v5 — no inline styles</span>
      </div>
      <div class="flex items-center gap-2 text-base-content/85">
        <span class="text-primary font-bold">›</span>
        <span>Ground rule: One commit addresses exactly one scope</span>
      </div>`,
    quote: "Always loaded, every interaction. Length is a budget, not a virtue.",
    quoteBorderClass: "border-primary/40",
  },
  instruction: {
    key: "instruction",
    filename: "SKILL.md",
    badge: "User or model invoked",
    badgeClass: "badge-secondary/20 text-secondary",
    frontmatterHtml: `<pre class="mt-3 font-mono text-xs leading-relaxed break-words whitespace-pre-wrap text-base-content/85"><code><span class="text-base-content/40">---</span>
<span class="font-medium text-secondary">name:</span> commit
<span class="font-medium text-secondary">description:</span> Author a commit message and commit it &mdash; Conventional
  Commits header, Keep a Changelog body, Source trailer. Use before every
  <span class="text-base-content/70">git commit</span>.
<span class="text-base-content/40">---</span></code></pre>`,
    bodyTitlePrefix: "#",
    bodyTitlePrefixClass: "text-secondary",
    bodyTitle: "Commit skill",
    bodyDesc:
      "Only the description above is loaded at startup. The steps below arrive when a task matches it \u2014 progressive disclosure.",
    bodyDetailsHtml: `
      <div class="flex items-center gap-2 text-base-content/85">
        <span class="badge badge-secondary badge-xs font-mono">2</span>
        <span>Read the change &mdash; a non-empty index is expressed intent</span>
      </div>
      <div class="flex items-center gap-2 text-base-content/85">
        <span class="badge badge-secondary badge-xs font-mono">4</span>
        <span>Author the message; done when the gate exits 0</span>
      </div>
      <div class="flex items-center gap-2 text-base-content/85">
        <span class="badge badge-secondary badge-xs font-mono">7</span>
        <span>Report and stop &mdash; pushing is the human&rsquo;s act</span>
      </div>`,
    quote: "Run step by step on your repo. A wrong instruction executes without being reread.",
    quoteBorderClass: "border-secondary/40",
  },
};

/*
 * The three files are different lengths, so re-writing the preview's innerHTML
 * on every hover resized the markdown card — which moved the role cards beside
 * it and dragged the arrows along with them, so the whole composition twitched
 * as the cursor crossed the stack. Every variant is mounted once instead,
 * stacked in a single grid cell: the card is always as tall as its tallest
 * variant, so switching roles reflows nothing. Inactive panes keep their box
 * (visibility, not display) — holding the height open is their whole job.
 */
const S2_SWAP_SLOTS = [
  ["s2-frontmatter-content", (f) => f.frontmatterHtml],
  ["s2-body-title", (f) => escapeHtml(f.bodyTitle)],
  [
    "s2-body-desc",
    (f) => `<p class="text-xs leading-relaxed text-base-content/70">${escapeHtml(f.bodyDesc)}</p>`,
  ],
  ["s2-body-details", (f) => `<div class="space-y-1.5">${f.bodyDetailsHtml}</div>`],
  [
    "s2-body-quote",
    (f) =>
      `<blockquote class="border-l-2 ${f.quoteBorderClass} pl-3 text-xs italic text-base-content/60">${escapeHtml(f.quote)}</blockquote>`,
  ],
];

function mountSection2Swaps() {
  const order = ["knowledge", "instruction", "memory"];
  S2_SWAP_SLOTS.forEach(([hostId, render]) => {
    const host = document.getElementById(hostId);
    if (!host) return;
    host.classList.add("s2-swap");
    host.innerHTML = order
      .map((k) => `<div class="s2-swap-item" data-swap="${k}">${render(S2_FILES[k])}</div>`)
      .join("");
  });
}

function setSection2ActiveCard(key) {
  const file = S2_FILES[key];
  if (!file) return;

  const filenameEl = document.getElementById("s2-filename");
  if (filenameEl) filenameEl.textContent = file.filename;

  const badgeEl = document.getElementById("s2-filebadge");
  if (badgeEl) {
    badgeEl.textContent = file.badge;
    badgeEl.className = `badge badge-sm font-mono text-[10px] uppercase tracking-wider ${file.badgeClass}`;
  }

  // Everything that can change height was mounted up front; switching roles
  // only moves which pane is lit, so no measurement changes.
  document.querySelectorAll("#s2-source-card .s2-swap-item").forEach((pane) => {
    pane.classList.toggle("is-active", pane.dataset.swap === key);
  });

  // The prefix is always "#", so only its colour moves — no reflow to guard.
  const titlePrefix = document.getElementById("s2-body-prefix");
  if (titlePrefix) {
    titlePrefix.textContent = file.bodyTitlePrefix;
    titlePrefix.className = `font-mono text-sm ${file.bodyTitlePrefixClass}`;
  }

  const cardKeys = ["knowledge", "instruction", "memory"];
  cardKeys.forEach((k) => {
    const cardEl = document.getElementById(`s2-card-${k}`);
    if (cardEl) {
      if (k === key) {
        cardEl.classList.add("s2-card-active");
      } else {
        cardEl.classList.remove("s2-card-active");
      }
    }
  });

  cardKeys.forEach((k) => {
    const arrowGroup = document.getElementById(`s2-arrow-group-${k}`);
    if (arrowGroup) {
      if (k === key) {
        arrowGroup.classList.add("is-active");
        arrowGroup.classList.remove("is-inactive");
      } else {
        arrowGroup.classList.remove("is-active");
        arrowGroup.classList.add("is-inactive");
      }
    }
  });

  // Sockets run top-to-bottom in the same order as the role cards, so the three
  // arrows fan out without crossing.
  const socketMap = {
    knowledge: "s2-socket-1",
    instruction: "s2-socket-2",
    memory: "s2-socket-3",
  };
  Object.entries(socketMap).forEach(([k, socketId]) => {
    const sEl = document.getElementById(socketId);
    if (sEl) {
      if (k === key) {
        sEl.classList.add("s2-socket-active");
        sEl.setAttribute("r", "5");
      } else {
        sEl.classList.remove("s2-socket-active");
        sEl.setAttribute("r", "3.5");
      }
    }
  });

  requestAnimationFrame(updateSection2Arrows);
}

/**
 * Box of an element in the composition's own coordinate space.
 *
 * Deliberately offsetLeft/offsetTop rather than getBoundingClientRect: the role
 * cards carry `deck-lift`, which translates them 2px on hover. Rects include
 * that transform, so measuring while a card is mid-lift docks the arrowhead 2px
 * off the card's centre line and leaves it there for as long as the cursor
 * stays. Offsets report the laid-out position, which is what the arrow should
 * point at. The walk stops at the container because the container is
 * `position: relative`, so it is always in the offsetParent chain.
 */
function s2Box(el, root) {
  let x = 0;
  let y = 0;
  let node = el;
  while (node && node !== root) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight, cy: y + el.offsetHeight / 2 };
}

/**
 * Where an arrow leaves its region of the markdown card.
 *
 * Not the region's centre. The front matter block is several times taller than
 * the role card it feeds, so centre-to-centre put the socket 150px below its
 * target and turned a 48px gap into a near-vertical hairpin. Sliding the socket
 * along the region's right edge towards the card keeps the arrow shallow while
 * still reading as "this block feeds that card"; the inset stops it from
 * sitting on the region's own rounded corner.
 */
function s2SocketY(region, targetY) {
  const inset = Math.min(14, region.h / 2);
  return Math.max(region.y + inset, Math.min(region.y + region.h - inset, targetY));
}

/**
 * Connector from a socket to a card's left edge.
 *
 * The straight run-out and run-in are the whole point. A bare cubic ends with a
 * horizontal tangent only in theory; in practice the last few pixels are still
 * turning, so the arrowhead — which takes its angle from the path end — docks
 * at a slant and reads as missing the card. A literal `L` into the endpoint
 * makes the final direction exact, and the tip lands on the card's border
 * rather than floating short of it.
 *
 * Handles grow with the vertical drop so a tall connection eases through the
 * middle instead of kinking, and are capped just under the span so the curve
 * never loops back on itself.
 */
function s2Connector(x0, y0, x1, y1) {
  const ax = x0 + 12;
  const bx = Math.max(x1 - 16, ax + 2);
  const span = bx - ax;
  const h = Math.min(span * 0.95, Math.max(span * 0.5, Math.abs(y1 - y0) * 0.45));
  return `M ${x0} ${y0} L ${ax} ${y0} C ${ax + h} ${y0}, ${bx - h} ${y1}, ${bx} ${y1} L ${x1} ${y1}`;
}

function updateSection2Arrows() {
  const container = document.getElementById("s2-composition");
  const source = document.getElementById("s2-source-card");
  const region1 = document.getElementById("s2-region-frontmatter");
  const region2 = document.getElementById("s2-region-knowledge");
  const region3 = document.getElementById("s2-region-instruction");
  const card1 = document.getElementById("s2-card-knowledge");
  const card2 = document.getElementById("s2-card-instruction");
  const card3 = document.getElementById("s2-card-memory");
  const svg = document.getElementById("s2-arrows-svg");

  if (!container || !source || !card1 || !card2 || !card3 || !svg) return;

  const sBox = s2Box(source, container);
  const t1 = s2Box(card1, container);
  const t2 = s2Box(card2, container);
  const t3 = s2Box(card3, container);

  // If stacked on mobile or elements not laid out side-by-side, bail
  if (t1.x <= sBox.x + sBox.w - 10) return;

  // Origin X: right edge of the markdown card
  const x0 = sBox.x + sBox.w;

  // Target points: left edge of each card, on its centre line
  const x1 = t1.x;
  const y1 = t1.cy;

  const x2 = t2.x;
  const y2 = t2.cy;

  const x3 = t3.x;
  const y3 = t3.cy;

  // Origin Y values: on the 3 semantic sections of the markdown file, nudged
  // towards the card each one feeds
  const y0_1 = region1 ? s2SocketY(s2Box(region1, container), y1) : y1;
  const y0_2 = region2 ? s2SocketY(s2Box(region2, container), y2) : y2;
  const y0_3 = region3 ? s2SocketY(s2Box(region3, container), y3) : y3;

  const d1 = s2Connector(x0, y0_1, x1, y1);
  const d2 = s2Connector(x0, y0_2, x2, y2);
  const d3 = s2Connector(x0, y0_3, x3, y3);

  // Connecting spine on the right edge of markdown card
  const dSpine = `M ${x0} ${y0_1} L ${x0} ${y0_3}`;

  const setD = (id, val) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.setAttribute("d", val);
    // A path that has already drawn carries an inline dash pair measured from
    // its old geometry. Re-routing invalidates that pair, and anything past the
    // stale length silently stops being painted — so drop it on re-layout.
    if (s2ArrowsDrawn && el.hasAttribute("data-draw")) {
      el.style.strokeDasharray = "none";
      el.style.strokeDashoffset = "0";
    }
  };

  setD("s2-arrow-track-knowledge", d1);
  setD("s2-arrow-knowledge", d1);
  setD("s2-arrow-flow-knowledge", d1);

  setD("s2-arrow-track-instruction", d2);
  setD("s2-arrow-instruction", d2);
  setD("s2-arrow-flow-instruction", d2);

  setD("s2-arrow-track-memory", d3);
  setD("s2-arrow-memory", d3);
  setD("s2-arrow-flow-memory", d3);

  setD("s2-spine", dSpine);

  // Socket dots on the markdown card
  const setCircle = (id, cx, cy) => {
    const el = document.getElementById(id);
    if (el) {
      el.setAttribute("cx", `${cx}`);
      el.setAttribute("cy", `${cy}`);
    }
  };

  setCircle("s2-socket-1", x0, y0_1);
  setCircle("s2-socket-2", x0, y0_2);
  setCircle("s2-socket-3", x0, y0_3);

  // Arm paths if not drawn yet, so they are parked undrawn on arrival
  if (!reduceMotion && !s2ArrowsDrawn) {
    ["s2-arrow-memory", "s2-arrow-knowledge", "s2-arrow-instruction"].forEach((id) => {
      const p = document.getElementById(id);
      if (p) armDraw(p);
    });
  }
}

function mountSection2Arrows() {
  // Panes first: the card must be at its final height before anything measures.
  mountSection2Swaps();

  // Run on next frame so layout measurements are settled
  requestAnimationFrame(updateSection2Arrows);

  const container = document.getElementById("s2-composition");
  if (container && typeof window.ResizeObserver !== "undefined") {
    const ro = new window.ResizeObserver(() => {
      updateSection2Arrows();
    });
    ro.observe(container);
  }
  window.addEventListener("resize", updateSection2Arrows);

  const cardMap = [
    { id: "s2-card-knowledge", key: "knowledge" },
    { id: "s2-card-instruction", key: "instruction" },
    { id: "s2-card-memory", key: "memory" },
  ];

  // Hover previews a role; clicking pins it. Pinning is what makes the three
  // cards usable on touch, where there is no hover at all — and it gives the
  // speaker a way to park the deck on one file while they talk over it.
  // Leaving the composition falls back to whatever is pinned, so the preview
  // never strands on a card the cursor merely passed over.
  let pinnedKey = "knowledge";

  const pin = (key) => {
    pinnedKey = key;
    setSection2ActiveCard(key);
    cardMap.forEach(({ id, key: k }) => {
      const el = document.getElementById(id);
      if (el) el.setAttribute("aria-pressed", k === key ? "true" : "false");
    });
  };

  cardMap.forEach(({ id, key }) => {
    const card = document.getElementById(id);
    if (!card) return;
    card.addEventListener("mouseenter", () => setSection2ActiveCard(key));
    card.addEventListener("focus", () => setSection2ActiveCard(key));
    card.addEventListener("click", () => pin(key));
    card.addEventListener("keydown", (e) => {
      // The card back has its own trigger inside; only the card itself pins.
      if (e.target !== card) return;
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      pin(key);
    });
  });

  if (container) {
    container.addEventListener("mouseleave", () => setSection2ActiveCard(pinnedKey));
  }

  pin(pinnedKey);
}

mountSection2Arrows();

// S2.1 — heading lines and composition Rise in sequence, then arrows Draw to the 3 roles.
registerActivate("s2-1", (reduced) => {
  const beat = document.getElementById("s2-1");
  if (!beat) return;
  revealSequence(beat, reduced);

  updateSection2Arrows();

  const arrows = [
    { id: "s2-arrow-knowledge", card: "s2-card-knowledge", delay: 200 },
    { id: "s2-arrow-instruction", card: "s2-card-instruction", delay: 320 },
    { id: "s2-arrow-memory", card: "s2-card-memory", delay: 440 },
  ];

  arrows.forEach(({ id, card, delay }) => {
    const p = document.getElementById(id);
    if (p) {
      if (!reduced) {
        armDraw(p);
        releaseDraw(p, delay, reduced);
      } else {
        releaseDraw(p, 0, true);
      }
    }
    const c = document.getElementById(card);
    if (c) {
      settle(c, delay + 350, reduced);
    }
  });

  s2ArrowsDrawn = true;

  // Reveal flowing dashes after lines finish drawing
  const svg = document.getElementById("s2-arrows-svg");
  if (svg) {
    if (reduced) {
      svg.classList.add("s2-arrows-active");
    } else {
      setTimeout(() => svg.classList.add("s2-arrows-active"), 800);
    }
  }
});

/* ------------------------------------------------------------------ *
 * S3.1 — Two charts: one document decays, the corpus compounds
 *
 * This replaces a single diverging-curves chart that plotted two independent
 * variables — elapsed time AND document volume — on one x-axis. That made it
 * two charts fighting over one frame, and on the volume reading its central
 * claim was simply false: creation effort does not collapse as a corpus grows,
 * because you are still writing new documents at two hundred files. It also
 * carried precise figures (10 docs at +30d, 200 at +180d) that nobody had
 * measured. In a talk about confidently asserting things nobody verified, an
 * invented dataset is the one artefact that undercuts the argument.
 *
 * So: two charts, different variables, no overlap, and no numbers anywhere.
 * Each axis is NAMED so the chart reads standalone; no axis carries VALUES,
 * because there is nothing measured to put on one.
 *
 *   Left  — the life of ONE document. Maintenance effort spikes around
 *           creation and decays toward zero as attention moves elsewhere;
 *           staleness drift rises from day zero and never flattens. They
 *           cross, and the crossing is the whole argument.
 *   Right — the corpus. Files grow roughly linearly; the maintenance surface
 *           curves upward, because each additional file can reference or
 *           contradict the others. Time does not appear on this chart at all.
 *
 * A third line for trust was considered on the left chart and rejected: trust
 * falling is drift rising mirrored, so it adds ink without adding a claim.
 *
 * Both charts share one plot box (x 76→400, y 62→300 in a 560×360 viewBox) so
 * the pair reads as one figure. Every stroke and fill is a semantic daisyUI
 * token — the page ships fourteen-plus themes, and a hardcoded hue breaks on
 * the first switch.
 * ------------------------------------------------------------------ */

/** Left: the life of one document. Maintenance fades, drift does not. */
function documentDecayMarkup() {
  return `
    <svg
      viewBox="0 0 560 360"
      role="img"
      aria-label="The life of a single document, with effort on the vertical axis. Neither axis is numbered. Maintenance effort spikes around the day the document ships, then decays toward zero as attention moves elsewhere. Staleness drift starts at day zero and climbs steadily, never flattening. The two lines cross partway along, and that crossing is where the work moved."
      class="effort-chart mx-auto block h-auto max-h-[40vh] w-full"
    >
      <defs>
        <marker
          id="decay-axis-arrow"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 1 2 L 7 5 L 1 8 z" fill="currentColor" class="text-base-content/40" />
        </marker>
      </defs>

      <!-- The frame: everything true before any line is drawn. No gridlines —
           with no values on either axis a grid is ink carrying no information. -->
      <g data-rise data-chart-frame>
        <!-- Before it ships is its own territory, faintly shaded. -->
        <rect x="76" y="62" width="84" height="238" class="fill-base-content/5" />

        <!-- Axes. Only effort carries an arrow: it is the only one whose
             direction has to be read. -->
        <g class="text-base-content/40">
          <line x1="76" y1="300" x2="76" y2="52" stroke="currentColor" stroke-width="1.5" marker-end="url(#decay-axis-arrow)" />
          <line x1="68" y1="300" x2="410" y2="300" stroke="currentColor" stroke-width="1.5" />
        </g>
        <text x="76" y="38" class="fill-base-content/60 font-mono text-[11px] uppercase tracking-widest">
          Effort
        </text>

        <!-- Day zero is a boundary, not a tick: a rule with a labelled cap, and
             a named territory on each side. -->
        <g>
          <line x1="160" y1="66" x2="160" y2="306" class="stroke-base-content/25" stroke-width="1.5" />
          <rect x="118" y="44" width="84" height="21" rx="10.5" class="fill-base-100 stroke-base-content/30" stroke-width="1" />
          <text x="160" y="59" text-anchor="middle" class="fill-base-content font-mono text-[10.5px] font-bold uppercase tracking-wider">
            Day zero
          </text>
        </g>

        <!-- Axis names, no axis values. -->
        <g class="font-mono uppercase">
          <text x="154" y="320" text-anchor="end" class="fill-base-content/45 text-[9.5px] tracking-[0.18em]">before it ships</text>
          <text x="166" y="320" class="fill-base-content/45 text-[9.5px] tracking-[0.18em]">after it ships</text>
          <text x="238" y="344" text-anchor="middle" class="fill-base-content/60 text-[11px] tracking-widest">life of one document</text>
        </g>
      </g>

      <!-- Maintenance effort: a spike around creation, then decay toward zero as
           attention moves elsewhere. It approaches the axis and never lands. -->
      <path
        data-draw
        d="M 76 262 C 104 252, 130 200, 158 108 C 168 76, 196 74, 212 116 C 234 174, 258 214, 296 244 C 334 274, 368 285, 400 290"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        class="text-accent"
      />

      <!-- Staleness drift: begins the day the document ships and never flattens. -->
      <path
        data-draw
        d="M 160 296 C 196 288, 228 264, 262 230 C 300 192, 342 146, 400 76"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        class="text-secondary"
      />

      <!-- Direct labels at the line ends, each with a short line-key. The key
           carries the series colour; the label text stays base-content, which
           keeps it legible in every theme. -->
      <g data-rise data-chart-key>
        <line x1="408" y1="76" x2="424" y2="76" class="stroke-secondary" stroke-width="3" stroke-linecap="round" />
        <text x="432" y="73" class="fill-base-content text-[11px] font-semibold">Drift / staleness</text>
        <text x="432" y="88" class="fill-base-content/60 text-[11px]">never flattens</text>

        <line x1="408" y1="290" x2="424" y2="290" class="stroke-accent" stroke-width="3" stroke-linecap="round" />
        <text x="432" y="287" class="fill-base-content text-[11px] font-semibold">Maintenance effort</text>
        <text x="432" y="302" class="fill-base-content/60 text-[11px]">decays to nothing</text>
      </g>

      <!-- The crossing. Arrives last, because it is the conclusion: the dot sits
           on a surface-coloured ring so it stays legible exactly where the two
           lines overlap, and a Settle ring marks its arrival. -->
      <g data-rise data-crossover>
        <line x1="272" y1="122" x2="271" y2="209" class="stroke-secondary/40" stroke-width="1" stroke-dasharray="2 3" />
        <rect x="236" y="92" width="150" height="28" rx="9" class="fill-base-100 stroke-secondary/40" stroke-width="1" />
        <text x="311" y="110" text-anchor="middle" class="fill-secondary font-mono text-[10px] font-semibold tracking-wide">
          where the work moved
        </text>
        <circle data-settle-ring cx="271" cy="220" r="7" fill="none" class="stroke-secondary" stroke-width="2" />
        <circle cx="271" cy="220" r="5.5" class="fill-secondary stroke-base-100" stroke-width="2" />
      </g>
    </svg>`;
}

/** Right: the corpus. Maintenance surface outgrows the file count. No time axis. */
function corpusCompoundsMarkup() {
  return `
    <svg
      viewBox="0 0 560 360"
      role="img"
      aria-label="Maintenance surface plotted against corpus size. Neither axis is numbered and time does not appear. The file count grows roughly linearly. The maintenance surface curves upward and grows faster than the file count, because each additional file can reference or contradict the others. The gap between the two widens as the corpus grows."
      class="effort-chart mx-auto block h-auto max-h-[40vh] w-full"
    >
      <defs>
        <marker
          id="corpus-axis-arrow"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 1 2 L 7 5 L 1 8 z" fill="currentColor" class="text-base-content/40" />
        </marker>
        <!-- The gap between the two lines is revealed by this rectangle scaling
             out from the y-axis, so the gap opens as the lines pull apart. A
             horizontally scaled rectangle is still a rectangle, so this is a
             true wipe and nothing in the drawing is distorted. -->
        <clipPath id="corpus-gap-wipe">
          <rect data-curve-wipe x="76" y="44" width="330" height="256" />
        </clipPath>
      </defs>

      <g data-rise data-chart-frame>
        <g class="text-base-content/40">
          <line x1="76" y1="300" x2="76" y2="52" stroke="currentColor" stroke-width="1.5" marker-end="url(#corpus-axis-arrow)" />
          <line x1="68" y1="300" x2="410" y2="300" stroke="currentColor" stroke-width="1.5" />
        </g>
        <text x="76" y="38" class="fill-base-content/60 font-mono text-[11px] uppercase tracking-widest">
          Maintenance surface
        </text>
        <text x="238" y="344" text-anchor="middle" class="fill-base-content/60 font-mono text-[11px] uppercase tracking-widest">
          number of files
        </text>
      </g>

      <!-- The widening gap is the argument, so it is the only thing here that
           carries a fill. A tint, never a block: it is not a third series. -->
      <g clip-path="url(#corpus-gap-wipe)">
        <path
          d="M 76 288 C 108 272, 170 238, 238 200 C 292 170, 346 110, 400 50 L 400 160 C 292 203, 184 245, 76 288 Z"
          class="fill-secondary/10"
        />
      </g>

      <!-- Files: roughly linear. You add them at about the rate you always did. -->
      <path
        data-draw
        d="M 76 288 C 184 245, 292 203, 400 160"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        class="text-accent"
      />

      <!-- Maintenance surface: superlinear, because every file added can
           reference or contradict every file already there. -->
      <path
        data-draw
        d="M 76 288 C 108 272, 170 238, 238 200 C 292 170, 346 110, 400 50"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        class="text-secondary"
      />

      <g data-rise data-chart-key>
        <line x1="408" y1="50" x2="424" y2="50" class="stroke-secondary" stroke-width="3" stroke-linecap="round" />
        <text x="432" y="47" class="fill-base-content text-[11px] font-semibold">Maintenance surface</text>
        <text x="432" y="62" class="fill-base-content/60 text-[11px]">compounds</text>

        <line x1="408" y1="160" x2="424" y2="160" class="stroke-accent" stroke-width="3" stroke-linecap="round" />
        <text x="432" y="157" class="fill-base-content text-[11px] font-semibold">Files</text>
        <text x="432" y="172" class="fill-base-content/60 text-[11px]">roughly linear</text>
      </g>
    </svg>`;
}

const EFFORT_CHARTS = {
  decay: documentDecayMarkup,
  corpus: corpusCompoundsMarkup,
};

/** Both charts are armed the moment they exist, so they are parked undrawn. */
function mountEffortCharts() {
  document.querySelectorAll("[data-effort-chart]").forEach((host) => {
    const build = EFFORT_CHARTS[host.dataset.effortChart];
    if (!build) return;
    host.innerHTML = build();
    if (!reduceMotion) host.querySelectorAll("[data-draw]").forEach(armDraw);
  });
}

mountEffortCharts();

/** The svg mounted under a given [data-effort-chart] key, if it is there. */
function effortChart(root, key) {
  return root.querySelector(`[data-effort-chart="${key}"] .effort-chart`);
}

/* Sequence: the left chart builds and lands its crossing label before the right
   chart begins. The right chart is a second claim, not a restatement of the
   first, so it must not arrive underneath the first one's conclusion.
   Total ≈ 2.5s. */
function playEffortCharts(root, reduced) {
  const decay = effortChart(root, "decay");
  const corpus = effortChart(root, "corpus");

  if (decay) {
    rise(decay.querySelector("[data-chart-frame]"), 0, reduced);
    decay.querySelectorAll("[data-draw]").forEach((path) => releaseDraw(path, 150, reduced));
    rise(decay.querySelector("[data-chart-key]"), 700, reduced);
    rise(decay.querySelector("[data-crossover]"), 1050, reduced);
    settleRing(decay.querySelector("[data-settle-ring]"), 1100, reduced);
  }

  if (corpus) {
    rise(corpus.querySelector("[data-chart-frame]"), 1250, reduced);
    corpus.querySelectorAll("[data-draw]").forEach((path) => releaseDraw(path, 1400, reduced));
    if (reduced) corpus.classList.add("is-wiped");
    else setTimeout(() => corpus.classList.add("is-wiped"), 1400);
    rise(corpus.querySelector("[data-chart-key]"), 1950, reduced);
  }
}

// S3.1 — heading lines Rise, then the document chart builds and lands its
// crossing, and the corpus chart follows it.
registerActivate("s3-1", (reduced) => {
  const beat = document.getElementById("s3-1");
  if (!beat) return;
  revealSequence(beat, reduced);
  playEffortCharts(beat, reduced);
});

/* ------------------------------------------------------------------ *
 * Section 4 — The Effort Venn (and section 9 close)
 *
 * Section 4 is the opening slide for section 5. The Venn names the three
 * regions and stops there; the three cards beneath it carry each region's
 * summary and open its slide. Only the labels sit inside the circles —
 * packing the checks in as a word cloud fought the geometry and read as
 * clutter, and the cards hold that content better anyway.
 *
 * Authored once with effortVennMarkup(emphasis):
 *   emphasis = "establish" (section 4): all three regions render at equal
 *     weight, and each is a pointer shortcut to its section 5 slide.
 *   emphasis = "human" (section 9): re-renders the same drawing with machine
 *     and AI dimmed, and without the shortcuts — section 9 is a close, not a
 *     menu. Every [data-venn] element gets the drawing; its
 *     data-venn-emphasis attribute picks the state.
 * ------------------------------------------------------------------ */

/*
 * Machine (320, 250) r175 and human (570, 250) r215 cross on x = 413.8, at
 * y = 102.3 and y = 397.7. The lens traces the human arc down and the machine
 * arc back up, so it is exactly the overlap — true for as long as those five
 * numbers are. animation.css pins the §9 camera origin to the human centre and
 * has to move with it.
 */
const VENN_LENS = "M 413.8 102.3 A 215 215 0 0 0 413.8 397.7 A 175 175 0 0 0 413.8 102.3 Z";

/** Each region is a shortcut to the slide that works it through. */
const VENN_TARGETS = { machine: "s4-2", ai: "s4-3", human: "s4-4" };

/**
 * One drawing, mounted twice. `emphasis` disambiguates the hatch pattern id
 * between the two mounts and decides whether the regions are clickable.
 *
 * Emphasis is deliberately NOT baked into the classes here. Both mounts render
 * identically and neutrally, and the state lives as a class on the svg root
 * that JS toggles — so section 8 has a state to transition *from* rather than
 * simply appearing in its final one.
 */
function effortVennMarkup(emphasis) {
  // The shortcuts are pointer-only, and deliberately so: the svg is role="img"
  // with a complete aria-label, and focusable children inside a role="img" are
  // incoherent to assistive tech. The three cards below the drawing are real
  // links to the same three slides, so no destination is mouse-only.
  const region = (actor, tone) =>
    emphasis === "establish"
      ? `data-venn-actor="${actor}" class="${tone} cursor-pointer" data-toc-jump="${VENN_TARGETS[actor]}"`
      : `data-venn-actor="${actor}" class="${tone}"`;

  // §4 shares its slide with three cards and has to stay small; §6.1 and §7 both
  // give the drawing the page, so both get the larger size.
  const size = emphasis === "establish" ? "max-h-[42vh] max-w-3xl" : "max-h-[58vh] max-w-4xl";

  // The steer arrow, on the machine mount only. The claim §7 makes is that the
  // tool *is* the machine side and *reaches into* AI. An arrow says that; a
  // circle does not — a third circle would read as a fourth actor and contradict
  // the three-region model §5 spends three beats building.
  //
  // It is drawn below the region labels (machine's sit at y≈240–274) and in the
  // clear band around y≈330. At that height the machine circle runs to x=476 and
  // the lens opens at x=370, so a tip at x=400 lands inside the overlap rather
  // than short of it. The head is a filled triangle rather than a <marker> so
  // that <defs> stays untouched and the establish and human mounts keep emitting
  // identical bytes.
  //
  // The running badge is the other half of the same sentence: the arrow says the
  // machine steers, the badge says what it steers *into* is live while it does.
  // It sits at (414, ~80) — outside both circles, which is why the band above the
  // lens tip at (413.8, 102.3) is empty — with a short leader down to that tip,
  // so it annotates the border that animation.css pulses rather than floating.
  const steer =
    emphasis === "machine"
      ? `
      <g data-venn-steer data-venn-step="6">
        <path
          d="M 246 346 Q 322 316 390 330"
          fill="none"
          stroke-width="2.5"
          stroke-linecap="round"
          class="stroke-primary"
        ></path>
        <path d="M 400 331 L 385 334 L 387 323 Z" class="fill-primary"></path>
        <text x="318" y="308" text-anchor="middle"
          class="fill-primary font-mono text-[15px] font-semibold uppercase tracking-[0.12em]">steer</text>
      </g>
      <g data-venn-running data-venn-step="7">
        <circle cx="372" cy="76" r="5" class="venn-running-dot fill-accent"></circle>
        <text x="386" y="82"
          class="fill-accent font-mono text-[15px] font-semibold uppercase tracking-[0.12em]">running</text>
        <path d="M 414 90 L 414 101" fill="none" stroke-width="1.5"
          stroke-dasharray="3 4" class="stroke-accent/60"></path>
      </g>`
      : "";

  // The hypothesis footnote is §4's caveat and §7 keeps it. §6.1 drops it: that
  // beat is about where the tool acts, and re-raising an open question about the
  // region it steers into only muddies the claim.
  const hypothesis =
    emphasis === "machine"
      ? ""
      : `
          <path
            d="M 414 402 L 414 492"
            fill="none"
            stroke-width="1.5"
            stroke-dasharray="4 6"
            class="stroke-accent/60"
          ></path>
          <text x="414" y="516" text-anchor="middle"
            class="fill-accent font-mono text-[15px] font-semibold tracking-[0.02em]">the AI region is my hypothesis — still unsettled</text>`;

  // Swapped rather than appended: the machine mount genuinely describes a
  // different picture, and a label that still said "still unsettled" would
  // describe something no longer on screen.
  const aiLabel =
    emphasis === "machine"
      ? "AI sits where the two overlap and is labelled non-deterministic, AI judging, token cost; its border is pulsing and badged running. An arrow labelled steer runs from inside the machine region into the AI region."
      : "AI sits where the two overlap and is labelled non-deterministic, AI judging, token cost; it is marked as a hypothesis that is still unsettled. The three cards below open the slide for each region.";

  return `
    <svg
      viewBox="115 15 700 540"
      role="img"
      aria-label="Venn diagram of three overlapping regions. Machine, labelled deterministic, cheap, fast. Human, drawn largest, labelled non-deterministic, time consuming, trust. ${aiLabel}"
      class="venn venn-emphasis-establish isolate mx-auto block h-auto w-full ${size}"
    >
      <defs>
        <pattern
          id="venn-hatch-${emphasis}"
          width="10"
          height="10"
          patternTransform="rotate(45 0 0)"
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="10"
            stroke="currentColor"
            stroke-width="1.2"
            class="text-accent/25"
          />
        </pattern>
      </defs>
      <g data-venn-camera>
      <g ${region("machine", "text-primary")}>
        <circle
          data-venn-step="0"
          cx="320" cy="250" r="175"
          stroke-width="1.5"
          class="venn-circle fill-primary/15 stroke-primary/40"
        ></circle>
        <g data-venn-step="1">
          <text x="248" y="215" text-anchor="middle"
            class="fill-primary font-mono text-[26px] font-bold uppercase tracking-[0.12em]">machine</text>
          <text x="248" y="246" text-anchor="middle"
            class="fill-base-content/70 text-[15px]">deterministic</text>
          <text x="248" y="272" text-anchor="middle"
            class="fill-base-content/60 text-[14px]">cheap</text>
          <text x="248" y="296" text-anchor="middle"
            class="fill-base-content/60 text-[14px]">fast</text>
        </g>
      </g>
      <g ${region("human", "text-secondary")}>
        <circle
          data-venn-step="2"
          cx="570" cy="250" r="215"
          stroke-width="1.5"
          class="venn-circle mix-blend-multiply fill-secondary/20 stroke-secondary/50 text-secondary"
        ></circle>
        <g data-venn-step="3">
          <text x="635" y="215" text-anchor="middle"
            class="fill-secondary font-mono text-[26px] font-bold uppercase tracking-[0.12em]">human</text>
          <text x="635" y="246" text-anchor="middle"
            class="fill-base-content/70 text-[15px]">non-deterministic</text>
          <text x="635" y="272" text-anchor="middle"
            class="fill-base-content/60 text-[14px]">time consuming</text>
          <text x="635" y="296" text-anchor="middle"
            class="fill-base-content/60 text-[14px]">trust</text>
        </g>
      </g>
      <g ${region("ai", "text-accent")}>
        <path
          data-venn-step="4"
          d="${VENN_LENS}"
          stroke-width="1.5"
          stroke-dasharray="5 7"
          fill="url(#venn-hatch-${emphasis})"
          pointer-events="all"
          class="stroke-accent/70"
        ></path>
        <g data-venn-step="5">
          <text x="425" y="215" text-anchor="middle"
            class="fill-accent font-mono text-[26px] font-extrabold uppercase tracking-[0.12em]">AI</text>
          <text x="425" y="244" text-anchor="middle"
            class="fill-base-content/70 text-[12px]">non-deterministic</text>
          <text x="425" y="268" text-anchor="middle"
            class="fill-base-content/60 text-[12px]">AI judging</text>
          <text x="425" y="290" text-anchor="middle"
            class="fill-base-content/60 text-[12px]">token cost</text>
${hypothesis}
        </g>
      </g>${steer}
      </g>
    </svg>`;
}

function setupVennCardHover() {
  const container = document.querySelector("[data-venn-container]");
  if (!container) return;

  const setActiveActor = (actor) => {
    if (actor) {
      container.setAttribute("data-active-actor", actor);
    } else {
      container.removeAttribute("data-active-actor");
    }
  };

  container.querySelectorAll("[data-venn-actor]").forEach((el) => {
    const actor = el.getAttribute("data-venn-actor");
    el.addEventListener("mouseenter", () => setActiveActor(actor));
    el.addEventListener("mouseleave", () => setActiveActor(null));
  });

  container.querySelectorAll("[data-venn-card]").forEach((card) => {
    const actor = card.getAttribute("data-venn-card");
    card.addEventListener("mouseenter", () => setActiveActor(actor));
    card.addEventListener("mouseleave", () => setActiveActor(null));
    card.addEventListener("focusin", () => setActiveActor(actor));
    card.addEventListener("focusout", () => setActiveActor(null));
  });
}

function mountVenns() {
  document.querySelectorAll("[data-venn]").forEach((host) => {
    const emphasis = host.dataset.vennEmphasis || "establish";
    host.innerHTML = effortVennMarkup(emphasis);
    const svg = host.querySelector(".venn");
    if (!svg) return;

    // Section 8 does not re-assemble the drawing — the audience has already
    // watched it build in section 4. It arrives whole so the camera push is the
    // only thing that moves. Under reduced motion it also arrives already
    // emphasised, since there is no transition to watch.
    if (emphasis === "human") {
      svg.classList.add("venn-on");
      if (reduceMotion) setVennEmphasis(svg, "human");
    }
  });

  setupVennCardHover();
}

mountVenns();

/** Emphasis is a class on the svg root, so there is always a state to move from. */
function setVennEmphasis(svg, emphasis) {
  svg.classList.remove("venn-emphasis-establish", "venn-emphasis-machine", "venn-emphasis-human");
  svg.classList.add(`venn-emphasis-${emphasis}`);
}

function playVenn(svg, reduced, { delay = 100, step = MOTION.stagger } = {}) {
  if (reduced) {
    svg.classList.add("venn-on");
    return;
  }
  if (!svg.classList.contains("venn-on")) {
    svg.querySelectorAll("[data-venn-step]").forEach((el) => {
      el.style.transitionDelay = `${delay + Number(el.dataset.vennStep) * step}ms`;
    });
  }
  svg.classList.add("venn-on");
}

// S4.1 — heading lines Rise, then the Venn assembles actor by actor. The AI lens
// is the last step, so the overlap — the whole point of the drawing — resolves last.
registerActivate("s4-1", (reduced) => {
  const beat = document.getElementById("s4-1");
  if (!beat) return;
  revealSequence(beat, reduced);
  const svg = beat.querySelector(".venn");
  if (svg) playVenn(svg, reduced);
});

/* ------------------------------------------------------------------ *
 * Frontmatter Block Component (Sections 4, 5, 6)
 *
 * In Section 4 (s4-2..s4-4): Worked example passes in IDE editor.
 * In Section 5 (s5-1): Google OKF full specification frontmatter.
 * In Section 6 (s6-1): Operator governance with stale_after highlight.
 * ------------------------------------------------------------------ */

function renderFrontmatterBlock({ mode = "section-5", activeField = null } = {}) {
  if (mode === "section-5") {
    return `
      <div class="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-md font-mono">
        <!-- IDE Editor Tab Bar -->
        <div class="flex items-center justify-between border-b border-base-300 bg-base-200/80 px-4 py-2.5 text-xs">
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1.5 mr-2" aria-hidden="true">
              <span class="h-2.5 w-2.5 rounded-full bg-error/60"></span>
              <span class="h-2.5 w-2.5 rounded-full bg-warning/60"></span>
              <span class="h-2.5 w-2.5 rounded-full bg-success/60"></span>
            </div>
            <div class="flex items-center gap-1.5 rounded-t-md border-t-2 border-primary bg-base-100 px-3 py-1 font-medium text-base-content">
              <span class="text-primary font-bold text-xs">M↓</span>
              <span class="font-semibold">onboarding.md</span>
            </div>
          </div>
          <span class="badge badge-ghost badge-xs font-mono text-[10px] text-base-content/50">docs/handbook</span>
        </div>

        <!-- Raw Markdown Content imitating IDE editor with line numbers -->
        <div class="p-4 text-[11px] sm:text-xs leading-relaxed overflow-x-auto bg-base-100">
          <table class="w-full border-collapse font-mono">
            <tbody>
              <tr>
                <td rowspan="9" class="w-6 select-none align-middle text-center border-r border-base-300 pr-1 py-1">
                  <span class="inline-block [writing-mode:vertical-lr] rotate-180 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-base-content/20 select-none">frontmatter</span>
                </td>
                <td class="pr-3 text-right text-base-content/30 select-none w-6">1</td>
                <td class="text-primary/70 font-bold">---</td>
              </tr>
              <tr><td class="pr-3 text-right text-base-content/30 select-none">2</td><td><span class="text-primary font-medium">type</span>: <span class="text-base-content/80">Playbook</span></td></tr>
              <tr><td class="pr-3 text-right text-base-content/30 select-none">3</td><td><span class="text-primary font-medium">title</span>: <span class="text-base-content/80">Onboarding a new employee</span></td></tr>
              <tr><td class="pr-3 text-right text-base-content/30 select-none">4</td><td><span class="text-primary font-medium">sources</span>:</td></tr>
              <tr><td class="pr-3 text-right text-base-content/30 select-none">5</td><td class="pl-2">  - <span class="text-accent font-medium">id</span>: <span class="text-base-content/70">people-ops-handbook</span></td></tr>
              <tr><td class="pr-3 text-right text-base-content/30 select-none">6</td><td class="pl-2">    <span class="text-accent font-medium">resource</span>: <span class="text-primary/90 underline">https://intranet.example.com/people-ops/handbook#onboarding</span></td></tr>
              <tr><td class="pr-3 text-right text-base-content/30 select-none">7</td><td class="pl-2">    <span class="text-accent font-medium">title</span>: <span class="text-base-content/70">People Ops handbook, section 4</span></td></tr>
              <tr class="${activeField === "stale_after" ? "bg-warning/10 ring-1 ring-warning" : ""}"><td class="pr-3 text-right text-base-content/30 select-none">8</td><td><span class="text-primary font-medium">stale_after</span>: <span class="text-warning font-bold">2026-07-01T00:00:00Z</span></td></tr>
              <tr><td class="pr-3 text-right text-base-content/30 select-none">9</td><td class="text-primary/70 font-bold">---</td></tr>
              <tr><td class="w-6 select-none"></td><td class="pr-3 text-right text-base-content/30 select-none">10</td><td></td></tr>
              <tr>
                <td rowspan="7" class="w-6 select-none align-middle text-center border-r border-base-300 pr-1 py-1">
                  <span class="inline-block [writing-mode:vertical-lr] rotate-180 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-base-content/20 select-none">body</span>
                </td>
                <td class="pr-3 text-right text-base-content/30 select-none">11</td>
                <td class="font-bold text-base-content text-xs sm:text-sm"># Onboarding a new employee</td>
              </tr>
              <tr><td class="pr-3 text-right text-base-content/30 select-none">12</td><td></td></tr>
              <tr><td class="pr-3 text-right text-base-content/30 select-none">13</td><td class="font-semibold text-base-content/85">## Before day one</td></tr>
              <tr><td class="pr-3 text-right text-base-content/30 select-none">14</td><td></td></tr>
              <tr><td class="pr-3 text-right text-base-content/30 select-none">15</td><td class="text-base-content/70">1. Hiring manager files equipment request 5 days ahead: laptop, badge.</td></tr>
              <tr><td class="pr-3 text-right text-base-content/30 select-none">16</td><td class="text-base-content/70">2. People Ops opens accounts: email, chat, payroll run closing on 20th.</td></tr>
              <tr><td class="pr-3 text-right text-base-content/30 select-none">17</td><td class="text-base-content/70">3. Hiring manager names buddy, books 30-min coffee on day one.</td></tr>
            </tbody>
          </table>
        </div>
      </div>`;
  }

  // Section 5: Google OKF full specification frontmatter in IDE editor treatment
  if (mode === "section-6" || mode === "okf") {
    return `
      <div class="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-md font-mono w-full">
        <!-- IDE Editor Tab Bar -->
        <div class="flex items-center justify-between border-b border-base-300 bg-base-200/80 px-4 py-2.5 text-xs">
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1.5 mr-2" aria-hidden="true">
              <span class="h-2.5 w-2.5 rounded-full bg-error/60"></span>
              <span class="h-2.5 w-2.5 rounded-full bg-warning/60"></span>
              <span class="h-2.5 w-2.5 rounded-full bg-success/60"></span>
            </div>
            <div class="flex items-center gap-1.5 rounded-t-md border-t-2 border-primary bg-base-100 px-3 py-1 font-medium text-base-content">
              <span class="text-primary font-bold text-xs">M↓</span>
              <span class="font-semibold">markdown.md</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <a
              href="https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/main/SPEC.md"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 rounded-md border border-base-300 bg-base-200/90 px-2.5 py-1 text-xs font-mono font-medium text-base-content hover:bg-base-300 transition-all shadow-xs"
              title="Open Google OKF SPEC.md on GitHub"
            >
              <span>OKF SPEC.md ↗</span>
            </a>
          </div>
        </div>

        <!-- Raw Markdown Content imitating IDE editor with line numbers -->
        <div class="p-4 text-[11px] sm:text-xs leading-relaxed overflow-x-auto bg-base-100">
          <table class="w-full border-collapse font-mono">
            <tbody>
              <tr>
                <td rowspan="30" class="w-6 select-none align-middle text-center border-r border-base-300 pr-1 py-1">
                  <span class="inline-block [writing-mode:vertical-lr] rotate-180 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-base-content/25 select-none">frontmatter</span>
                </td>
                <td class="pr-3 text-right text-base-content/30 select-none w-6">1</td>
                <td colspan="2" class="text-base-content/70 font-bold">---</td>
              </tr>
              <tr class="hover:bg-base-200/40">
                <td class="pr-3 text-right text-base-content/30 select-none">2</td>
                <td colspan="2"><span class="text-base-content/40 font-normal"># --- </span><span class="font-bold text-base-content">Basic metadata</span><span class="text-base-content/40 font-normal"> (</span><a href="https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/main/SPEC.md#41-frontmatter" target="_blank" rel="noopener noreferrer" class="text-base-content/60 hover:text-primary underline font-normal transition-colors" title="Read §4.1 Frontmatter in OKF SPEC.md">§4.1</a><span class="text-base-content/40 font-normal">) ---</span></td>
              </tr>
              <tr class="hover:bg-base-200/40">
                <td class="pr-3 text-right text-base-content/30 select-none">3</td>
                <td class="whitespace-pre pr-8"><span class="font-bold text-primary">type</span>: <span class="text-base-content/85">&lt;Type name&gt;</span></td>
                <td class="whitespace-nowrap font-normal text-base-content/50 text-[11px] sm:text-xs"><span class="text-error font-normal"># REQUIRED</span> — concept taxonomy (e.g. Playbook, Reference, Metric)</td>
              </tr>
              <tr class="hover:bg-base-200/40">
                <td class="pr-3 text-right text-base-content/30 select-none">4</td>
                <td class="whitespace-pre pr-8"><span class="font-bold text-primary">title</span>: <span class="text-base-content/85">&lt;Display name&gt;</span></td>
                <td class="whitespace-nowrap font-normal text-base-content/50 text-[11px] sm:text-xs"># Recommended — human-readable display title</td>
              </tr>
              <tr class="hover:bg-base-200/40">
                <td class="pr-3 text-right text-base-content/30 select-none">5</td>
                <td class="whitespace-pre pr-8"><span class="font-bold text-primary">description</span>: <span class="text-base-content/85">&lt;One-line summary&gt;</span></td>
                <td class="whitespace-nowrap font-normal text-base-content/50 text-[11px] sm:text-xs"># Recommended — search snippet &amp; index preview</td>
              </tr>
              <tr class="hover:bg-base-200/40">
                <td class="pr-3 text-right text-base-content/30 select-none">6</td>
                <td class="whitespace-pre pr-8"><span class="font-bold text-primary">resource</span>: <span class="text-base-content/85">&lt;Canonical URI&gt;</span></td>
                <td class="whitespace-nowrap font-normal text-base-content/50 text-[11px] sm:text-xs"># Optional — canonical URI for underlying asset</td>
              </tr>
              <tr class="hover:bg-base-200/40">
                <td class="pr-3 text-right text-base-content/30 select-none">7</td>
                <td class="whitespace-pre pr-8"><span class="font-bold text-primary">tags</span>: <span class="text-base-content/85">[&lt;tag&gt;, &lt;tag&gt;, ...]</span></td>
                <td class="whitespace-nowrap font-normal text-base-content/50 text-[11px] sm:text-xs"># Optional — taxonomy categories</td>
              </tr>
              <tr class="hover:bg-base-200/40">
                <td class="pr-3 text-right text-base-content/30 select-none">8</td>
                <td colspan="2"></td>
              </tr>
              <tr class="hover:bg-base-200/40">
                <td class="pr-3 text-right text-base-content/30 select-none">9</td>
                <td colspan="2"><span class="text-base-content/40 font-normal"># --- </span><span class="font-bold text-base-content">Provenance</span><span class="text-base-content/40 font-normal"> (</span><a href="https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/main/SPEC.md#51-provenance-sources" target="_blank" rel="noopener noreferrer" class="text-base-content/60 hover:text-primary underline font-normal transition-colors" title="Read §5.1 Provenance in OKF SPEC.md">§5.1</a><span class="text-base-content/40 font-normal">) ---</span></td>
              </tr>
              <tr class="hover:bg-base-200/40">
                <td class="pr-3 text-right text-base-content/30 select-none">10</td>
                <td class="whitespace-pre pr-8"><span class="font-bold text-primary">sources</span>:</td>
                <td class="whitespace-nowrap font-normal text-base-content/50 text-[11px] sm:text-xs"># Optional — materials this concept derives from</td>
              </tr>
              <tr class="hover:bg-base-200/40">
                <td class="pr-3 text-right text-base-content/30 select-none">11</td>
                <td class="whitespace-pre pr-8">&nbsp;&nbsp;- <span class="font-normal text-base-content">id</span>: <span class="text-base-content/85">&lt;citation-key&gt;</span></td>
                <td class="whitespace-nowrap font-normal text-base-content/50 text-[11px] sm:text-xs"># Stable key for body claim attribution ([^key])</td>
              </tr>
              <tr class="hover:bg-base-200/40">
                <td class="pr-3 text-right text-base-content/30 select-none">12</td>
                <td class="whitespace-pre pr-8">&nbsp;&nbsp;&nbsp;&nbsp;<span class="font-normal text-base-content">resource</span>: <span class="text-base-content/85">&lt;Source URI&gt;</span></td>
                <td class="whitespace-nowrap font-normal text-base-content/50 text-[11px] sm:text-xs"><span class="text-error font-normal"># REQUIRED within entry</span> — URI or bundle path</td>
              </tr>
              <tr class="hover:bg-base-200/40">
                <td class="pr-3 text-right text-base-content/30 select-none">13</td>
                <td class="whitespace-pre pr-8">&nbsp;&nbsp;&nbsp;&nbsp;<span class="font-normal text-base-content">title</span>: <span class="text-base-content/85">&lt;Source label&gt;</span></td>
                <td class="whitespace-nowrap font-normal text-base-content/50 text-[11px] sm:text-xs"># Optional — human-readable label</td>
              </tr>
              <tr class="hover:bg-base-200/40">
                <td class="pr-3 text-right text-base-content/30 select-none">14</td>
                <td class="whitespace-pre pr-8">&nbsp;&nbsp;&nbsp;&nbsp;<span class="font-normal text-base-content">author</span>: <span class="text-base-content/85">&lt;Actor&gt;</span></td>
                <td class="whitespace-nowrap font-normal text-base-content/50 text-[11px] sm:text-xs"># Authority signal: team or producer</td>
              </tr>
              <tr class="hover:bg-base-200/40">
                <td class="pr-3 text-right text-base-content/30 select-none">15</td>
                <td class="whitespace-pre pr-8">&nbsp;&nbsp;&nbsp;&nbsp;<span class="font-normal text-base-content">usage_count</span>: <span class="text-base-content/85">&lt;Integer&gt;</span></td>
                <td class="whitespace-nowrap font-normal text-base-content/50 text-[11px] sm:text-xs"># Adoption &amp; liveness signal: exercise count</td>
              </tr>
              <tr class="hover:bg-base-200/40">
                <td class="pr-3 text-right text-base-content/30 select-none">16</td>
                <td class="whitespace-pre pr-8">&nbsp;&nbsp;&nbsp;&nbsp;<span class="font-normal text-base-content">last_modified</span>: <span class="text-base-content/85">&lt;ISO 8601&gt;</span></td>
                <td class="whitespace-nowrap font-normal text-base-content/50 text-[11px] sm:text-xs"># Recency signal: source last updated</td>
              </tr>
              <tr class="hover:bg-base-200/40">
                <td class="pr-3 text-right text-base-content/30 select-none">17</td>
                <td class="whitespace-pre pr-8"><span class="font-bold text-primary">usage_window</span>: <span class="text-base-content/85">{ from: &lt;ISO 8601&gt;, to: &lt;ISO 8601&gt; }</span></td>
                <td class="whitespace-nowrap font-normal text-base-content/50 text-[11px] sm:text-xs"># Timeframe for usage_count</td>
              </tr>
              <tr class="hover:bg-base-200/40">
                <td class="pr-3 text-right text-base-content/30 select-none">18</td>
                <td colspan="2"></td>
              </tr>
              <tr class="hover:bg-base-200/40">
                <td class="pr-3 text-right text-base-content/30 select-none">19</td>
                <td colspan="2"><span class="text-base-content/40 font-normal"># --- </span><span class="font-bold text-base-content">Trust</span><span class="text-base-content/40 font-normal"> (</span><a href="https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/main/SPEC.md#52-trust-generated-and-verified" target="_blank" rel="noopener noreferrer" class="text-base-content/60 hover:text-primary underline font-normal transition-colors" title="Read §5.2 Trust in OKF SPEC.md">§5.2</a><span class="text-base-content/40 font-normal">, </span><a href="https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/main/SPEC.md#53-trust-tiers" target="_blank" rel="noopener noreferrer" class="text-base-content/60 hover:text-primary underline font-normal transition-colors" title="Read §5.3 Trust tiers in OKF SPEC.md">§5.3</a><span class="text-base-content/40 font-normal">) ---</span></td>
              </tr>
              <tr class="hover:bg-base-200/40">
                <td class="pr-3 text-right text-base-content/30 select-none">20</td>
                <td class="whitespace-pre pr-8"><span class="font-bold text-primary">generated</span>:</td>
                <td class="whitespace-nowrap font-normal text-base-content/50 text-[11px] sm:text-xs"># Content production record</td>
              </tr>
              <tr class="hover:bg-base-200/40">
                <td class="pr-3 text-right text-base-content/30 select-none">21</td>
                <td class="whitespace-pre pr-8">&nbsp;&nbsp;<span class="font-normal text-base-content">by</span>: <span class="text-base-content/85">&lt;Actor&gt;</span></td>
                <td class="whitespace-nowrap font-normal text-base-content/50 text-[11px] sm:text-xs"><span class="text-error font-normal"># REQUIRED within generated</span> — agent or human</td>
              </tr>
              <tr class="hover:bg-base-200/40">
                <td class="pr-3 text-right text-base-content/30 select-none">22</td>
                <td class="whitespace-pre pr-8">&nbsp;&nbsp;<span class="font-normal text-base-content">at</span>: <span class="text-base-content/85">&lt;ISO 8601&gt;</span></td>
                <td class="whitespace-nowrap font-normal text-base-content/50 text-[11px] sm:text-xs"># Datetime of last meaningful generation</td>
              </tr>
              <tr class="hover:bg-base-200/40">
                <td class="pr-3 text-right text-base-content/30 select-none">23</td>
                <td class="whitespace-pre pr-8"><span class="font-bold text-primary">verified</span>:</td>
                <td class="whitespace-nowrap font-normal text-base-content/50 text-[11px] sm:text-xs"># Content verification events</td>
              </tr>
              <tr class="hover:bg-base-200/40">
                <td class="pr-3 text-right text-base-content/30 select-none">24</td>
                <td class="whitespace-pre pr-8">&nbsp;&nbsp;- <span class="font-normal text-base-content">by</span>: <span class="font-normal text-base-content">&lt;Actor&gt;</span></td>
                <td class="whitespace-nowrap font-normal text-base-content/50 text-[11px] sm:text-xs"><span class="text-error font-normal"># REQUIRED within entry</span> — reviewer (human sets trust tier)</td>
              </tr>
              <tr class="hover:bg-base-200/40">
                <td class="pr-3 text-right text-base-content/30 select-none">25</td>
                <td class="whitespace-pre pr-8">&nbsp;&nbsp;&nbsp;&nbsp;<span class="font-normal text-base-content">at</span>: <span class="text-base-content/85">&lt;ISO 8601&gt;</span></td>
                <td class="whitespace-nowrap font-normal text-base-content/50 text-[11px] sm:text-xs"># Datetime of verification</td>
              </tr>
              <tr class="hover:bg-base-200/40">
                <td class="pr-3 text-right text-base-content/30 select-none">26</td>
                <td colspan="2"></td>
              </tr>
              <tr class="hover:bg-base-200/40">
                <td class="pr-3 text-right text-base-content/30 select-none">27</td>
                <td colspan="2"><span class="text-base-content/40 font-normal"># --- </span><span class="font-bold text-base-content">Lifecycle</span><span class="text-base-content/40 font-normal"> (</span><a href="https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/main/SPEC.md#54-lifecycle-status" target="_blank" rel="noopener noreferrer" class="text-base-content/60 hover:text-primary underline font-normal transition-colors" title="Read §5.4 Lifecycle in OKF SPEC.md">§5.4</a><span class="text-base-content/40 font-normal">, </span><a href="https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/main/SPEC.md#55-lifecycle-stale_after" target="_blank" rel="noopener noreferrer" class="text-base-content/60 hover:text-primary underline font-normal transition-colors" title="Read §5.5 Stale after in OKF SPEC.md">§5.5</a><span class="text-base-content/40 font-normal">) ---</span></td>
              </tr>
              <tr class="hover:bg-base-200/40">
                <td class="pr-3 text-right text-base-content/30 select-none">28</td>
                <td class="whitespace-pre pr-8"><span class="font-bold text-primary">status</span>: <span class="text-base-content/85">stable</span></td>
                <td class="whitespace-nowrap font-normal text-base-content/50 text-[11px] sm:text-xs"># draft | stable | deprecated (default: stable)</td>
              </tr>
              <tr class="hover:bg-base-200/40">
                <td class="pr-3 text-right text-base-content/30 select-none">29</td>
                <td class="whitespace-pre pr-8"><span class="font-bold text-primary">stale_after</span>: <span class="text-base-content/85">&lt;ISO 8601&gt;</span></td>
                <td class="whitespace-nowrap font-normal text-base-content/50 text-[11px] sm:text-xs"># Absolute review budget deadline</td>
              </tr>
              <tr>
                <td class="pr-3 text-right text-base-content/30 select-none">30</td>
                <td colspan="2" class="text-base-content/70 font-bold">---</td>
              </tr>
              <tr>
                <td class="w-6 select-none"></td>
                <td class="pr-3 text-right text-base-content/30 select-none">31</td>
                <td colspan="2"></td>
              </tr>
              <tr>
                <td rowspan="3" class="w-6 select-none align-middle text-center border-r border-base-300 pr-1 py-1">
                  <span class="inline-block [writing-mode:vertical-lr] rotate-180 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-base-content/25 select-none">body</span>
                </td>
                <td class="pr-3 text-right text-base-content/30 select-none">32</td>
                <td colspan="2" class="font-bold text-base-content text-xs sm:text-sm"># Markdown</td>
              </tr>
              <tr><td class="pr-3 text-right text-base-content/30 select-none">33</td><td colspan="2"></td></tr>
              <tr>
                <td class="pr-3 text-right text-base-content/30 select-none">34</td>
                <td colspan="2" class="text-base-content/80">Document body content in standard markdown format.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>`;
  }

  // Section 7: Operator Governance
  return `
    <div class="frontmatter-card rounded-2xl border border-base-300 bg-base-200/50 p-5 md:p-6 shadow-sm font-mono text-xs md:text-sm">
      <div class="mb-4 flex items-center justify-between border-b border-base-300/70 pb-3">
        <div class="flex items-center gap-2">
          <span class="inline-block h-2.5 w-2.5 rounded-full bg-secondary/80"></span>
          <span class="font-mono text-xs font-semibold text-base-content/80">onboarding.md</span>
          <span class="font-mono text-[10px] text-base-content/40">frontmatter</span>
        </div>
        <span class="badge badge-ghost badge-xs font-mono text-[10px] tracking-wider text-base-content/60">OKF v0.2</span>
      </div>
      <div class="space-y-2.5">
        <div class="rounded-lg border border-base-300/60 bg-base-100/70 p-2.5">
          <span class="text-base-content/50 uppercase tracking-wider text-[10px]">type:</span> <span class="font-semibold text-base-content ml-2">Playbook</span>
        </div>
        <div class="rounded-lg border border-base-300/60 bg-base-100/70 p-2.5">
          <span class="text-base-content/50 uppercase tracking-wider text-[10px]">sources:</span>
          <div class="ml-3 pl-3 border-l-2 border-base-300/80 mt-1 text-xs">
            <span class="text-base-content/50">resource:</span> <span class="text-primary break-all">https://intranet.example.com/people-ops/handbook#onboarding</span>
          </div>
        </div>
        <div class="rounded-lg border-2 border-secondary bg-secondary/10 p-3.5 shadow-sm ring-1 ring-secondary/30">
          <div class="flex items-center justify-between">
            <span class="text-secondary uppercase tracking-wider text-[10px] font-bold">stale_after:</span>
            <span class="badge badge-secondary badge-xs font-mono text-secondary-content">The Signal</span>
          </div>
          <div class="mt-1.5 font-bold text-secondary text-sm md:text-base">
            2026-07-01T00:00:00Z
          </div>
        </div>
        <div class="rounded-lg border border-base-300/60 bg-base-100/70 p-2.5">
          <span class="text-base-content/50 uppercase tracking-wider text-[10px]">generated:</span> <span class="text-base-content/70 ml-2">ai:claude-opus-5</span>
        </div>
        <div class="rounded-lg border border-base-300/60 bg-base-100/70 p-2.5">
          <span class="text-base-content/50 uppercase tracking-wider text-[10px]">verified:</span> <span class="text-secondary font-bold ml-2">human:m.okonkwo</span>
        </div>
      </div>
    </div>`;
}

function mountFrontmatterBlocks() {
  document.querySelectorAll("[data-frontmatter-mount]").forEach((host) => {
    const beatId = host.dataset.frontmatterMount;
    const isWorkedExample = beatId.startsWith("s4") && beatId !== "s4-1";
    const mode = host.dataset.frontmatterMode || (isWorkedExample ? "section-5" : "okf");
    host.innerHTML = renderFrontmatterBlock({
      mode,
      // The "section-7" branch is unreferenced: the beat that mounted the block
      // with stale_after ringed was replaced by the markdown-harness section,
      // which mounts no frontmatter block. Left in place deliberately —
      // removing it is a separate decision.
      activeField: mode === "section-7" ? "stale_after" : null,
    });
  });
}

mountFrontmatterBlocks();

/* ------------------------------------------------------------------ *
 * Section 4 — three passes, and only two of them land
 *
 * This is where the vocabulary earns itself. The machine pass and the AI pass
 * Settle: they arrive and they finish. The human pass does not get a Settle at
 * all — it carries the Unsettled ring authored in index.html, which breathes and
 * never resolves. That contrast is the section's argument, so it is also carried
 * in words and in stroke style, never in motion alone.
 * ------------------------------------------------------------------ */

/** Settle the resolved passes on a beat, in the order they happened. */
function playPasses(beat, reduced, order) {
  order.forEach((name, i) => {
    settle(beat.querySelector(`[data-pass="${name}"]`), 500 + i * 200, reduced);
  });
}

// S4.2 — the machine pass resolves cleanly.
registerActivate("s4-2", (reduced) => {
  const beat = document.getElementById("s4-2");
  if (!beat) return;
  revealSequence(beat, reduced);
  playPasses(beat, reduced, ["machine"]);
});

// S4.3 — the AI pass lands too, but amber: a claim, not a resolution.
registerActivate("s4-3", (reduced) => {
  const beat = document.getElementById("s4-3");
  if (!beat) return;
  revealSequence(beat, reduced);
  playPasses(beat, reduced, ["ai"]);
});

// S4.4 — both earlier passes settle again as recaps, and the human pass is left
// visibly open beneath them.
registerActivate("s4-4", (reduced) => {
  const beat = document.getElementById("s4-4");
  if (!beat) return;
  revealSequence(beat, reduced);
  playPasses(beat, reduced, ["machine", "ai"]);
});

// S5.1 — Google OKF
registerActivate("s5-1", (reduced) => {
  const beat = document.getElementById("s5-1");
  if (!beat) return;
  revealSequence(beat, reduced);
});

// S6.1 — the third Venn mount. Unlike §7, this one assembles: the audience has
// not seen the drawing since §4, so it rebuilds actor by actor and only then
// dims to the machine region, with the steer arrow arriving last as step 6.
//
// The emphasis is applied under reduced motion too, rather than returning early
// the way §7 does. §7 can return because mountVenns already emphasised its mount
// at load; this one has no such head start, so skipping it would leave the beat
// sitting in the neutral establish state with nothing to say.
registerActivate("s6-1", (reduced) => {
  const beat = document.getElementById("s6-1");
  if (!beat) return;
  revealSequence(beat, reduced);
  const svg = beat.querySelector(".venn");
  if (!svg) return;
  playVenn(svg, reduced);
  // Eight steps at 90ms from a 100ms delay puts the running badge's rise starting
  // at 730ms; the dim waits until it has landed so the two gestures do not muddy.
  if (reduced) setVennEmphasis(svg, "machine");
  else setTimeout(() => setVennEmphasis(svg, "machine"), 1150);
});

// S6.2–S6.4 register nothing: fireActivate falls back to revealSequence, which
// is all these three need.

/* ------------------------------------------------------------------ *
 * typeInto — currently unreferenced
 *
 * This drove the old rescue-terminal beat, where the question typed itself in
 * once at the point it was asked. That beat was replaced by the markdown-harness
 * section, whose live demo (S6.3) is a holding slide and types nothing. The
 * helper is left in place because removing dead code is a separate decision;
 * its companion .deck-caret keyframes are still in animation.css for the same
 * reason.
 * ------------------------------------------------------------------ */

/** Type a line out character by character, leaving a caret until it lands. */
function typeInto(el, reduced, { at = 0, total = 800 } = {}) {
  if (!el || reduced) return at;

  const chars = Array.from(el.textContent);
  const per = Math.max(12, Math.round(total / chars.length));
  const node = document.createTextNode("");
  const caret = document.createElement("span");
  caret.className = "deck-caret text-primary";
  caret.setAttribute("aria-hidden", "true");
  caret.textContent = "▌";

  el.textContent = "";
  el.append(node, caret);

  setTimeout(() => {
    let i = 0;
    const tick = setInterval(() => {
      node.data += chars[i];
      if (++i >= chars.length) {
        clearInterval(tick);
        caret.remove();
      }
    }, per);
  }, at);

  return at + chars.length * per;
}

// S8.1 — the close. The drawing is already on screen; the camera pushes in
// towards the human region and then holds still. ≈0.9s, and deliberately no
// Unsettled here: the restlessness belongs to the middle of the argument, not
// its ending, and keeping Unsettled to one appearance is what makes it mean
// something back in §4.4.
registerActivate("s8-1", (reduced) => {
  const beat = document.getElementById("s8-1");
  if (!beat) return;
  revealSequence(beat, reduced);
  const svg = beat.querySelector(".venn");
  if (!svg || reduced) return;
  setTimeout(() => setVennEmphasis(svg, "human"), 120);
});

/* ------------------------------------------------------------------ *
 * Init
 * ------------------------------------------------------------------ */

buildThemePicker();
buildPresenterControls();
buildTOC();

try {
  if (localStorage.getItem(STORAGE_KEY_PRESENTATION) === "true") {
    setPresentationMode(true);
  }
  if (localStorage.getItem(STORAGE_KEY_NOTES) === "true") {
    setSpeakerNotes(true);
  }
} catch {
  /* ignore */
}

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
