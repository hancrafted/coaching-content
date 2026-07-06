import "../src/style.css";

/**
 * AI Token Economy — scroll-tower engine.
 *
 * Single source of truth is the semantic HTML in `#tower`: every `.beat`
 * <section> carries data-section / data-section-title / data-beat / data-assertion.
 * The table of contents (desktop rail + mobile drawer), the accordion grouping,
 * the scroll active-sync, the progress bars and the deep-link hashes are ALL derived
 * from those attributes at runtime — so adding or removing a beat is a one-block edit.
 */

const STORAGE_KEY = "token-economy-theme";
const THEMES = [
  { value: "corporate", label: "Corporate" },
  { value: "business", label: "Business" },
  { value: "luxury", label: "Luxury" },
  { value: "night", label: "Night" },
  { value: "dim", label: "Dim" },
];

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
        class="toc-section-header flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-base-300/50"
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

  // A section taller than the viewport may never cross the reveal ratio;
  // becoming the active beat is a reliable second trigger for its instrument.
  fireActivate(id);
}

/* ------------------------------------------------------------------ *
 * Viz kit — shared instruments reused across beats
 *
 * The through-line of the talk is a meter that is normally invisible, so
 * every beat's evidence is an *instrument*: a number that counts, a bar
 * that fills, chips that tally. Cost is always rendered in the machine's
 * own typeface (font-mono tabular-nums); the human side stays humanist.
 *
 * Each beat may register an `activate` callback that fires ONCE, the first
 * time the beat is substantially in view (or becomes the active beat). It
 * receives `reduced` (prefers-reduced-motion) and must render the final
 * state instantly when true.
 * ------------------------------------------------------------------ */

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const nf = (n) => Math.round(n).toLocaleString("en-US");

/**
 * rAF count-up. Writes to `el.textContent` from `from`→`to`.
 * @param {(n:number)=>string} [opts.format] formatter (default en-US integer)
 * @param {()=>void} [opts.onDone] fired when the count settles
 */
function countUp(el, to, opts = {}) {
  const { duration = 1400, from = 0, format = nf, easing = easeOutCubic, onDone } = opts;
  if (reduceMotion) {
    el.textContent = format(to);
    if (onDone) onDone();
    return;
  }
  let startTs = null;
  const step = (ts) => {
    if (startTs === null) startTs = ts;
    const t = Math.min(1, (ts - startTs) / duration);
    el.textContent = format(from + (to - from) * easing(t));
    if (t < 1) {
      window.requestAnimationFrame(step);
    } else if (onDone) {
      onDone();
    }
  };
  window.requestAnimationFrame(step);
}

const activateRegistry = {};
const activated = new Set();

/** A beat registers its on-activation animation here (keyed by section id). */
function registerActivate(id, fn) {
  activateRegistry[id] = fn;
}

/** Fire a beat's activate callback exactly once. */
function fireActivate(id) {
  if (activated.has(id)) return;
  const fn = activateRegistry[id];
  if (!fn) return;
  activated.add(id);
  fn(reduceMotion);
}

/* ------------------------------------------------------------------ *
 * Reveal-on-enter + active tracking via IntersectionObserver
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
        // Animate the beat's instrument once it is substantially in view.
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
    const num = toggle.getAttribute("data-section-toggle");
    const section = sections.find((s) => String(s.num) === String(num));
    if (section && section.beats[0]) {
      scrollToBeat(section.beats[0].id);
      closeDrawer();
    }
  }
});

window.addEventListener("keydown", (e) => {
  const tag = document.activeElement?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

  const idx = beatOrder.indexOf(activeBeatId);
  if (e.key === "ArrowDown" || e.key === "PageDown") {
    e.preventDefault();
    if (idx < total - 1) scrollToBeat(beatOrder[idx + 1]);
  } else if (e.key === "ArrowUp" || e.key === "PageUp") {
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
  return document.documentElement.getAttribute("data-theme") || "corporate";
}

function updateThemeChecks() {
  const cur = currentTheme();
  THEMES.forEach((t) => {
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

function buildThemePicker() {
  const host = document.getElementById("theme-picker");
  if (!host) return;

  const items = THEMES.map(
    (t) => `
      <li>
        <button type="button" data-theme-value="${t.value}" class="justify-between">
          <span>${t.label}</span>
          <span data-theme-check="${t.value}" class="text-primary"></span>
        </button>
      </li>`,
  ).join("");

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
        class="menu dropdown-content z-50 mt-2 w-44 rounded-box border border-base-200 bg-base-100 p-2 shadow-lg"
      >
        ${items}
      </ul>
    </div>`;

  host.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-theme-value]");
    if (btn) setTheme(btn.getAttribute("data-theme-value"));
  });

  updateThemeChecks();
}

/* ------------------------------------------------------------------ *
 * Ambient hero meter — the invisible, unwatched meter
 * ------------------------------------------------------------------ */

function startHeroMeter() {
  const el = document.getElementById("hero-meter");
  if (!el) return;

  const fmt = (n) => Math.floor(n).toLocaleString("en-US");
  const start = 1472318; // the meter has been running long before you arrived

  if (reduceMotion) {
    el.textContent = fmt(start);
    return;
  }

  let value = start;
  let last = null;
  const step = (ts) => {
    if (last === null) last = ts;
    value += (ts - last) * 3.2;
    last = ts;
    el.textContent = fmt(value);
    window.requestAnimationFrame(step);
  };
  window.requestAnimationFrame(step);
}

/* ------------------------------------------------------------------ *
 * Beat instruments — each registers its on-activation animation.
 * Registered before Init so they exist when the first beat activates.
 * ------------------------------------------------------------------ */

// S2.1 — the freelancer's three flaws reveal in sequence.
registerActivate("s2-1", (reduced) => {
  const flaws = document.querySelectorAll("#s2-1 [data-flaw]");
  flaws.forEach((el, i) => {
    const show = () => el.classList.remove("opacity-0", "translate-y-3");
    if (reduced) show();
    else window.setTimeout(show, 160 + i * 260);
  });
});

// S5.1 — odometer climbs step by step, pauses, then jumps to the ~55k punch.
registerActivate("s5-1", (reduced) => {
  const odo = document.getElementById("s5-odometer");
  const panel = document.getElementById("s5-meter");
  const steps = Array.from(document.querySelectorAll("#s5-1 [data-step]"));
  if (!odo) return;

  const stops = [4000, 11000, 17000, 55000];
  const brighten = (el) => el && el.classList.remove("opacity-30");

  if (reduced) {
    odo.textContent = nf(55000);
    steps.forEach(brighten);
    return;
  }

  let from = 0;
  const run = (i) => {
    if (i >= stops.length) return;
    const isPunch = i === stops.length - 1;
    brighten(steps[i]);
    countUp(odo, stops[i], {
      from,
      duration: isPunch ? 1500 : 650,
      onDone: () => {
        from = stops[i];
        if (isPunch && panel) {
          panel.classList.add("scale-105");
          window.setTimeout(() => panel.classList.remove("scale-105"), 260);
        }
        if (!isPunch) window.setTimeout(() => run(i + 1), 520);
      },
    });
  };
  run(0);
});

// S2.2 — one figure branches into a team; the 5–20× multiplier counts up.
registerActivate("s2-2", (reduced) => {
  const mult = document.getElementById("s22-mult");
  const leaves = document.querySelectorAll("#s2-2 [data-branch]");

  if (reduced) {
    if (mult) mult.textContent = "20";
    leaves.forEach((el) => el.classList.remove("opacity-0"));
    return;
  }

  leaves.forEach((el, i) =>
    window.setTimeout(() => el.classList.remove("opacity-0"), 220 + i * 180),
  );
  if (mult) countUp(mult, 20, { duration: 1200 });
});

// S2.3 — four eras reveal left→right; the token-economy foundation draws in last.
registerActivate("s2-3", (reduced) => {
  const eras = document.querySelectorAll("#s2-3 [data-era]");
  const foundation = document.getElementById("s23-foundation");
  const reveal = (el) => el.classList.remove("opacity-0", "translate-y-4");

  if (reduced) {
    eras.forEach(reveal);
    if (foundation) foundation.style.width = "100%";
    return;
  }

  eras.forEach((el, i) => window.setTimeout(() => reveal(el), 120 + i * 180));
  if (foundation) {
    window.setTimeout(
      () => {
        foundation.style.width = "100%";
      },
      120 + eras.length * 180 + 200,
    );
  }
});

// S2.4 — AI charges drip in and the running total climbs to match the signed invoice.
registerActivate("s2-4", (reduced) => {
  const total = document.getElementById("s24-total");
  const drips = document.querySelectorAll("#s2-4 [data-drip]");
  const euro = (n) => nf(n);

  if (reduced) {
    if (total) total.textContent = euro(3200);
    drips.forEach((el) => el.classList.remove("opacity-0"));
    return;
  }

  drips.forEach((el, i) =>
    window.setTimeout(() => el.classList.remove("opacity-0"), 200 + i * 160),
  );
  if (total) countUp(total, 3200, { duration: 1600, format: euro });
});

// S2.5 — quality/value bars fill; the cheaper option is crowned the winner.
registerActivate("s2-5", (reduced) => {
  const fills = document.querySelectorAll("#s2-5 [data-fill]");
  const counts = document.querySelectorAll("#s2-5 [data-count]");
  const winner = document.getElementById("s25-winner");
  const applyFills = () =>
    fills.forEach((el) => {
      el.style.width = `${el.dataset.fill}%`;
    });

  if (reduced) {
    applyFills();
    counts.forEach((el) => {
      el.textContent = el.dataset.countTo;
    });
    if (winner) winner.classList.remove("opacity-0");
    return;
  }

  window.setTimeout(applyFills, 150);
  counts.forEach((el) => countUp(el, Number(el.dataset.countTo), { duration: 1200 }));
  if (winner) window.setTimeout(() => winner.classList.remove("opacity-0"), 900);
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
  window.requestAnimationFrame(() => scrollToBeat(hashId));
} else {
  revealBeat(document.getElementById(beatOrder[0]));
}

setupObserver();
startHeroMeter();
