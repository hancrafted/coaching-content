# 06: Section 3 — why this was always hard

**What to build:** The section that makes the thesis a shape rather than a claim. Two curves over time: creation effort, which collapses once AI arrives, and verification effort, which climbs with volume. The horizontal axis marks **day zero**, the point where a document reaches production. Where the curves cross is marked and labelled **"where the work moved"** — the fixed visual anchor the rest of the talk refers back to.

The curves draw themselves in when the beat activates, and the crossover label arrives last, so the reveal follows the sentence the presenter is speaking.

**Blocked by:** 01.

**Status:** ready-for-agent

- [ ] Two curves render as hand-authored inline SVG paths with no charting library
- [ ] The horizontal axis is time with day zero marked and labelled as the point the document reaches production
- [ ] The vertical axis reads as effort
- [ ] Creation effort visibly collapses and verification effort visibly climbs
- [ ] The crossover point is marked and labelled "where the work moved"
- [ ] Curves draw in on beat activation by animating stroke dash from JavaScript, with targets held in data attributes rather than inline styles
- [ ] The crossover label animates in after both curves have finished drawing
- [ ] Creation and verification curves use the established colour language
- [ ] With motion disabled, both curves and the crossover label are fully drawn and legible
- [ ] Archgate checks, eslint and prettier pass
