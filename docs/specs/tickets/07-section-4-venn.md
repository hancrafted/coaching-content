# 07: Section 4 — where the effort goes (the Venn)

**What to build:** The centrepiece. A three-region Venn showing what a machine can check, what AI can help with, and what only a human can check — with the human region drawn visibly largest, so the argument's weight is carried by the geometry and not only by the narration. Each region carries three short phrases and no icons. The AI region's label is a question mark, so its ambiguity reads as deliberate.

This is built as a reusable component, because section 9 re-renders the same Venn with different emphasis. It is one drawing used twice, not two drawings.

**Blocked by:** 01.

**Status:** ready-for-agent

- [ ] A three-region Venn renders as hand-authored inline SVG circles
- [ ] The human region is visibly the largest
- [ ] Machine region reads: reference resolves, file exists, template structure holds
- [ ] Human region reads: is it still true, is it stale, does the reference point at the right content
- [ ] The AI region's label is a question mark, with fact-check, hard numbers, and still-needs-checking beneath it
- [ ] No icons appear in any region
- [ ] The AI overlap is produced by blending the two parent regions rather than painted as a flat third fill, and both parents are semantic tokens so the blend re-skins across themes
- [ ] The overlap is distinguishable in both a light and a dark theme; if it muddies in dark, the unfilled hatched or dashed fallback is applied and re-verified
- [ ] The Venn is a reusable component that accepts an emphasis state, so section 9 can re-render it without a second drawing
- [ ] The Venn animates in on beat activation and is fully legible with motion disabled
- [ ] Speaker notes carry the spoken accelerator-not-a-solution argument and the freelancer-with-amnesia callback, neither of which appears on the slide
- [ ] Archgate checks, eslint and prettier pass
