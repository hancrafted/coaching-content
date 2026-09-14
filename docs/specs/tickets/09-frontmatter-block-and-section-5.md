# 09: The frontmatter block, and section 5's three passes

**What to build:** The artefact the back half of the talk is built on, plus its first use.

One frontmatter block component, authored once with the complete OKF field set, whose fields can be revealed or dimmed per section. Sections 6 and 7 grow the same block rather than replacing it — that continuity is what makes the three appearances read as one document instead of three similar screenshots.

Its first use is section 5, which shows only a source entry and a staleness date, and runs three passes over it across three beats. The machine pass resolves cleanly. The AI pass returns an amber result whose own answer needs checking. The human pass — is this still the right source, should the date move — **stays open and unresolved on screen**, and is the last thing the audience sees before the talk moves on.

**Blocked by:** 01.

**Status:** ready-for-agent

- [ ] A single frontmatter block component renders real OKF field names and shapes, with individual fields independently targetable for reveal and dim
- [ ] Source entries render as a list of mappings with a required resource plus optional id and title; the staleness date renders as an ISO 8601 datetime with an explicit UTC offset
- [ ] The block is styled as a display element, not a code sample — no syntax-highlighter defaults and no code-sized monospace type
- [ ] Section 5 shows only the source entry and the staleness date
- [ ] Three passes stack vertically over the same block across three beats, in the order machine, AI, human
- [ ] The machine pass resolves: the resource resolves, the date parses, the field is present
- [ ] The AI pass returns an amber result stating that its own answer needs checking
- [ ] The human pass stays visibly open and unresolved, and is the final beat of the section
- [ ] Each pass is coloured by the established colour language
- [ ] Passes reveal on their own beat activation and all three are legible with motion disabled
- [ ] The block is legible at typical screen-share scale
- [ ] Archgate checks, eslint and prettier pass
