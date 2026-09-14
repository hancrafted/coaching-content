import "../src/style.css";
import "./animation.css";

/**
 * Maintaining High Value Knowledge Bases — Scrollytelling Presentation Engine
 *
 * Single source of truth is the semantic HTML in `#tower`: every `.beat`
 * <section> carries data-section / data-section-title / data-beat / data-assertion.
 * The TOC, active-sync, progress bars, keyboard nav and deep-links are all derived
 * from those attributes at runtime.
 */

const STORAGE_KEY = "token-economy-theme";
const THEMES = [
  { value: "corporate", label: "Corporate (Default)" },
  { value: "business", label: "Business" },
  { value: "luxury", label: "Luxury" },
  { value: "night", label: "Night" },
  { value: "dim", label: "Dim" },
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
  { value: "winter", label: "Winter" },
  { value: "nord", label: "Nord" },
  { value: "sunset", label: "Sunset" },
  { value: "caramellatte", label: "Caramellatte" },
  { value: "abyss", label: "Abyss" },
  { value: "silk", label: "Silk" },
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
 * Table of contents — rendered into desktop rail & mobile drawer
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
        class="toc-section-header cursor-pointer flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-base-300/50"
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
 * Active-sync — highlight active beat, auto-expand section, progress
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

  fireActivate(id);
}

/* ------------------------------------------------------------------ *
 * Viz kit — countUp and activation registry
 * ------------------------------------------------------------------ */

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const nf = (n) => Math.round(n).toLocaleString("en-US");

function countUp(el, to, opts = {}) {
  const { duration = 1400, from = 0, decimals = 0, easing = easeOutCubic, onDone } = opts;
  if (!el) return;
  if (reduceMotion) {
    el.textContent = decimals > 0 ? to.toFixed(decimals) : nf(to);
    if (onDone) onDone();
    return;
  }
  let startTs = null;
  const step = (ts) => {
    if (startTs === null) startTs = ts;
    const t = Math.min(1, (ts - startTs) / duration);
    const val = from + (to - from) * easing(t);
    el.textContent = decimals > 0 ? val.toFixed(decimals) : nf(val);
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

function registerActivate(id, fn) {
  activateRegistry[id] = fn;
}

function fireActivate(id) {
  if (activated.has(id)) return;
  const fn = activateRegistry[id];
  if (!fn) return;
  activated.add(id);
  fn(reduceMotion);
}

/* ------------------------------------------------------------------ *
 * Reveal-on-enter & IntersectionObserver
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
        if (e.isIntersecting && e.intersectionRatio > 0.3) fireActivate(e.target.id);
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
    e.preventDefault();
    const num = toggle.getAttribute("data-section-toggle");
    const beatsEl = document.querySelector(`[data-section-beats="${num}"]`);
    if (beatsEl) {
      const isExpanded = !beatsEl.classList.contains("hidden");
      setSectionExpanded(num, !isExpanded);
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
    /* persistence unavailable */
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
          <span data-theme-check="${t.value}" class="text-primary font-mono text-xs"></span>
        </button>
      </li>`,
  ).join("");

  host.innerHTML = `
    <div class="dropdown dropdown-end">
      <label tabindex="0" class="btn btn-ghost btn-sm gap-2 normal-case font-mono text-xs" aria-label="Select theme">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="4"></circle>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
        </svg>
        <span class="hidden sm:inline">Theme</span>
      </label>
      <ul tabindex="0" class="dropdown-content menu menu-sm bg-base-200 text-base-content rounded-box z-50 mt-2 max-h-96 w-52 overflow-y-auto p-2 shadow-xl border border-base-300">
        ${items}
      </ul>
    </div>`;

  host.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-theme-value]");
    if (btn) {
      setTheme(btn.getAttribute("data-theme-value"));
    }
  });

  updateThemeChecks();
}

/* ------------------------------------------------------------------ *
 * Ambient "Rot Clock" in Top Navbar & Hero
 * ------------------------------------------------------------------ */

function setupRotClock() {
  const navVal = document.getElementById("nav-rot-value");
  const heroVal = document.getElementById("hero-rot-counter");
  if (!navVal && !heroVal) return;

  let days = 1715.4; // 4.7 years average

  if (reduceMotion) {
    if (navVal) navVal.textContent = "4.7 yrs";
    if (heroVal) heroVal.textContent = "4.7 years";
    return;
  }

  let lastTs = null;
  function tick(ts) {
    if (lastTs === null) lastTs = ts;
    days += (ts - lastTs) * 0.00008; // slow persistent creep
    lastTs = ts;
    if (navVal) navVal.textContent = `${(days / 365.25).toFixed(2)} yrs`;
    if (heroVal) heroVal.textContent = `${(days / 365.25).toFixed(2)} yrs`;
    window.requestAnimationFrame(tick);
  }
  window.requestAnimationFrame(tick);
}

/* ------------------------------------------------------------------ *
 * Beat Activation Handlers (Level 2 & 3 Visualizations)
 * ------------------------------------------------------------------ */

// S1.1: Four Jobs / Timeline of Knowledge Management
registerActivate("s1-1", (reduced) => {
  const trustStage =
    document.getElementById("stage-trust") || document.getElementById("pillar-trust");
  if (trustStage && !reduced) {
    trustStage.classList.add("kb-pulse-glow");
  }
});

// S1.2: Documentation Rot 82.3% Stat
registerActivate("s1-2", (_reduced) => {
  const statEl = document.getElementById("s1-2-stat");
  if (statEl) {
    countUp(statEl, 82.3, { duration: 1600, decimals: 1 });
  }
});

// S2.1: The Missing Arrow Simulation
const simBtn = document.getElementById("s21-sim-btn");
if (simBtn) {
  simBtn.addEventListener("click", () => {
    const humanFeedback = document.getElementById("s21-human-feedback");
    const aiFeedback = document.getElementById("s21-ai-feedback");
    const humanOutput = document.getElementById("s21-human-output");
    const aiOutput = document.getElementById("s21-ai-output");

    if (humanFeedback) {
      humanFeedback.classList.remove("opacity-0");
      humanFeedback.classList.add("opacity-100");
    }
    if (humanOutput) {
      humanOutput.textContent = 'Refused stale spec: "Halting — Auth v1 endpoint deprecated."';
      humanOutput.classList.remove("text-base-content/50");
      humanOutput.classList.add("text-success");
    }

    if (aiFeedback) {
      aiFeedback.classList.remove("opacity-0");
      aiFeedback.classList.add("opacity-100");
    }
    if (aiOutput) {
      aiOutput.textContent = 'Compiled 280 lines using dead v1 API. Status: "All tests passing"';
      aiOutput.classList.remove("text-base-content/50");
      aiOutput.classList.add("text-error");
    }
  });
}

// S2.2: The Moat Inversion Chart & Triage Scorecard
registerActivate("s2-2", (reduced) => {
  const bars = [
    { id: "bar-python", pct: 45.8 },
    { id: "bar-java", pct: 23.4 },
    { id: "bar-cobol", pct: 15.8 },
    { id: "bar-ts", pct: 11.2 },
    { id: "bar-js", pct: 4.8 },
  ];

  bars.forEach((b) => {
    const el = document.getElementById(b.id);
    if (el) {
      if (reduced) {
        el.style.width = `${b.pct}%`;
      } else {
        setTimeout(() => {
          el.style.width = `${b.pct}%`;
        }, 150);
      }
    }
  });
});

// S2.3: RAG Hot-Swap Simulator
const ragToggle = document.getElementById("rag-toggle-era");
if (ragToggle) {
  ragToggle.addEventListener("change", (e) => {
    const isStale = e.target.checked;
    const meterEl = document.getElementById("rag-meter-fill");
    const pctEl = document.getElementById("rag-pct-val");
    const statusEl = document.getElementById("rag-era-status");
    const descEl = document.getElementById("rag-era-desc");

    if (isStale) {
      // Wrong era index (2016)
      if (meterEl) {
        meterEl.style.width = "12%";
        meterEl.className = "h-full rounded-full bg-error transition-all duration-700 ease-out";
      }
      if (pctEl) {
        countUp(pctEl, 12, { duration: 600 });
      }
      if (statusEl) {
        statusEl.textContent = "Wrong-Era Index (2016 Stale)";
        statusEl.className = "badge badge-error gap-1 font-mono text-xs";
      }
      if (descEl) {
        descEl.textContent =
          "Lewis et al. hot-swap: accuracy collapsed to 12% / 4%. Model had zero awareness that index was stale.";
      }
    } else {
      // Right era index (2018)
      if (meterEl) {
        meterEl.style.width = "70%";
        meterEl.className = "h-full rounded-full bg-success transition-all duration-700 ease-out";
      }
      if (pctEl) {
        countUp(pctEl, 70, { duration: 600 });
      }
      if (statusEl) {
        statusEl.textContent = "Right-Era Index (2018 Matched)";
        statusEl.className = "badge badge-success gap-1 font-mono text-xs";
      }
      if (descEl) {
        descEl.textContent =
          "Lewis et al. benchmark: matched right-era index answers with 70% accuracy.";
      }
    }
  });
}

// S3.2: Config Inspector Tabs / Field Highlights
const configFields = document.querySelectorAll("[data-config-field]");
configFields.forEach((btn) => {
  btn.addEventListener("click", () => {
    const fieldKey = btn.getAttribute("data-config-field");
    const detailTitle = document.getElementById("config-field-title");
    const detailIntent = document.getElementById("config-field-intent");
    const detailRole = document.getElementById("config-field-role");

    configFields.forEach((b) => b.classList.remove("bg-primary/20", "border-primary"));
    btn.classList.add("bg-primary/20", "border-primary");

    if (fieldKey === "stale_after") {
      if (detailTitle) detailTitle.textContent = "stale_after: <date>";
      if (detailIntent)
        detailIntent.textContent =
          '"Every architectural document carries an expiry date. When past due, agents flag rather than trust."';
      if (detailRole)
        detailRole.textContent =
          "Prevents silent decay. Clock-free in CI to avoid turning code trees red overnight.";
    } else if (fieldKey === "verified") {
      if (detailTitle) detailTitle.textContent = "verified: { by, at }";
      if (detailIntent)
        detailIntent.textContent =
          '"Trust requires a named human champion. AI can draft; only a person can certify correctness."';
      if (detailRole)
        detailRole.textContent =
          "Maps to verified.by. Enforces accountability without putting tooling into read path.";
    } else if (fieldKey === "sources") {
      if (detailTitle) detailTitle.textContent = "sources: [ { id, title } ]";
      if (detailIntent)
        detailIntent.textContent =
          '"Every technical claim must cite an authoritative reference. No unsourced lore."';
      if (detailRole)
        detailRole.textContent =
          "Guards against hallucination cascades by pinning claims to verifiable artifacts.";
    } else if (fieldKey === "status") {
      if (detailTitle) detailTitle.textContent = "status: draft | stable | deprecated";
      if (detailIntent)
        detailIntent.textContent =
          '"Documents in draft or deprecated state cannot be used as canonical truth by agents."';
      if (detailRole)
        detailRole.textContent =
          "Allows incremental drafting while protecting production agents from unvetted work.";
    }
  });
});

// S3.4: Interactive Terminal Simulator Demo
const termOutput = document.getElementById("term-body");
const termCmdLabel = document.getElementById("term-cmd-label");
const termButtons = document.querySelectorAll("[data-term-cmd]");

const TERM_SCENARIOS = {
  ungoverned: {
    cmd: "claude-code 'Query: What is the current auth strategy?'",
    lines: [
      { text: "$ claude-code 'Query: What is the current auth strategy?'", type: "cmd" },
      { text: "Reading docs/architecture/auth.md (Ungoverned)...", type: "info" },
      { text: "Result: [Confidence: 99.4%]", type: "success" },
      {
        text: '» "Use the JWT v1 Bearer token against /api/v1/auth/token as described in the docs."',
        type: "warn",
      },
      {
        text: "FAIL: /api/v1/auth/token was decommissioned 18 months ago. Agent generated invalid client code.",
        type: "error",
      },
    ],
    missingArrowStatus: "missing",
  },
  check: {
    cmd: "markdown-harness --check docs/**/*.md",
    lines: [
      { text: "$ markdown-harness --check docs/**/*.md", type: "cmd" },
      { text: "Scanning 24 markdown files across 3 governed rulesets...", type: "info" },
      {
        text: "✓ docs/presentations/2026-09-15-maintaining-kb.md: OK (frontmatter valid)",
        type: "success",
      },
      { text: "✓ docs/architecture/auth.md: OK (pinned schema valid)", type: "success" },
      { text: "Result: 24/24 files structurally valid. Exit code 0.", type: "success" },
      {
        text: "[Note: --check is clock-free: it validates schema, never failing on dates]",
        type: "info",
      },
    ],
    missingArrowStatus: "missing",
  },
  assess: {
    cmd: "markdown-harness --assess docs/architecture/auth.md",
    lines: [
      { text: "$ markdown-harness --assess docs/architecture/auth.md", type: "cmd" },
      { text: "Inspecting metadata: status: stable · stale_after: 2026-09-14", type: "info" },
      { text: "Clock check: Current time is past stale_after horizon!", type: "warn" },
      { text: "ASSESSMENT: REVIEW", type: "warn" },
      {
        text: 'RULE INTENT: "This document is past its freshness horizon. A human domain owner must verify API currency."',
        type: "success",
      },
      {
        text: "FEEDBACK LOOP ACTIVATED: Agent surfaces missing arrow: 'Document expired. Halting until verified.'",
        type: "success",
      },
    ],
    missingArrowStatus: "restored",
  },
  future: {
    cmd: "markdown-harness --assess docs/architecture/auth.md --now 2026-12-01",
    lines: [
      {
        text: "$ markdown-harness --assess docs/architecture/auth.md --now 2026-12-01T00:00:00Z",
        type: "cmd",
      },
      {
        text: "Simulating instant: 2026-12-01T00:00:00Z (supplied parameter, reproducible)",
        type: "info",
      },
      { text: "Document stale_after: 2026-09-14 (78 days expired)", type: "error" },
      { text: "ASSESSMENT: FIX_FILE", type: "error" },
      {
        text: "INTENT SIGNAL: Document requires review by verified.by champion before agent ingestion.",
        type: "warn",
      },
    ],
    missingArrowStatus: "restored",
  },
};

termButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.getAttribute("data-term-cmd");
    const scenario = TERM_SCENARIOS[key];
    if (!scenario || !termOutput) return;

    termButtons.forEach((b) => b.classList.remove("btn-primary", "btn-active"));
    btn.classList.add("btn-primary");

    if (termCmdLabel) termCmdLabel.textContent = scenario.cmd;

    termOutput.innerHTML = "";
    scenario.lines.forEach((line, i) => {
      const p = document.createElement("p");
      p.className = `kb-term-line font-mono text-xs leading-relaxed ${
        line.type === "cmd"
          ? "text-primary font-semibold"
          : line.type === "error"
            ? "text-error"
            : line.type === "warn"
              ? "text-warning"
              : line.type === "success"
                ? "text-success"
                : "text-base-content/60"
      }`;
      p.textContent = line.text;
      termOutput.appendChild(p);

      if (reduceMotion) {
        p.classList.add("is-visible");
      } else {
        setTimeout(() => {
          p.classList.add("is-visible");
        }, i * 140);
      }
    });

    // Update missing arrow visual in S3.4
    const arrowBox = document.getElementById("demo-arrow-status");
    if (arrowBox) {
      if (scenario.missingArrowStatus === "restored") {
        arrowBox.className =
          "rounded-box border border-success/40 bg-success/10 p-4 transition-all duration-300";
        arrowBox.innerHTML = `
          <div class="flex items-center gap-3">
            <span class="badge badge-success font-mono text-xs">RESTORED</span>
            <span class="font-display text-sm font-semibold text-success">Missing Arrow Restored as Working Software</span>
          </div>
          <p class="mt-2 text-xs text-base-content/80">
            Agent reads the Rule's <code>intent</code> string via <code>--assess</code> and pushes actionable feedback upstream to the human.
          </p>`;
      } else {
        arrowBox.className =
          "rounded-box border border-error/30 bg-error/5 p-4 transition-all duration-300";
        arrowBox.innerHTML = `
          <div class="flex items-center gap-3">
            <span class="badge badge-error font-mono text-xs">MISSING</span>
            <span class="font-display text-sm font-semibold text-error">Silent Failure Mode</span>
          </div>
          <p class="mt-2 text-xs text-base-content/60">
            Without frontmatter trust governance, the agent consumes stale docs as truth without signaling failure.
          </p>`;
      }
    }
  });
});

// S4.1: Summary Stat Count-ups & Accidental Alignment Visual
registerActivate("s4-1", (reduced) => {
  const statYears = document.getElementById("s4-years-stat");
  const statAccidental = document.getElementById("s4-accidental-stat");
  const statDocFix = document.getElementById("s4-docfix-stat");

  if (statYears) countUp(statYears, 4.7, { duration: 1500, decimals: 1 });
  if (statAccidental) countUp(statAccidental, 47.6, { duration: 1700, decimals: 1 });
  if (statDocFix) countUp(statDocFix, 39.1, { duration: 1700, decimals: 1 });

  const barAccidental = document.getElementById("bar-accidental");
  const barFix = document.getElementById("bar-docfix");
  const barDelete = document.getElementById("bar-delete");

  if (barAccidental) {
    if (reduced) barAccidental.style.width = "47.6%";
    else setTimeout(() => (barAccidental.style.width = "47.6%"), 200);
  }
  if (barFix) {
    if (reduced) barFix.style.width = "39.1%";
    else setTimeout(() => (barFix.style.width = "39.1%"), 350);
  }
  if (barDelete) {
    if (reduced) barDelete.style.width = "13.3%";
    else setTimeout(() => (barDelete.style.width = "13.3%"), 500);
  }
});

/* ------------------------------------------------------------------ *
 * Initialization
 * ------------------------------------------------------------------ */

document.addEventListener("DOMContentLoaded", () => {
  buildTOC();
  buildThemePicker();
  setupObserver();
  setupRotClock();

  // Honor deep link on direct entry
  const initialHash = window.location.hash.slice(1);
  if (initialHash && beatById[initialHash]) {
    setTimeout(() => scrollToBeat(initialHash), 50);
  } else if (beatOrder.length > 0) {
    setActive(beatOrder[0]);
  }
});
