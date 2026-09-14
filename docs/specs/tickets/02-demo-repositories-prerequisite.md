# 02: Demo repositories and demo content (prerequisite, outside this repo)

**What to build:** The live-demo environment for section 8. The presenter can sit in front of two pre-opened terminals, ask the same question about the same document in each, and get visibly different answers — one where the agent has no instruction about staleness, one where the hook supplies the operator's sentence.

This work happens on the presenter's local machine, outside this repository, and is explicitly out of scope for the deck spec. It is captured here because it is a blocking prerequisite for the talk and the longest-lead item in the plan.

**Blocked by:** None (can start immediately; runs in parallel with all deck work).

**Status:** needs-human (not agent-grabbable — requires local machine setup and authored content)

- [ ] Two local repositories exist that look like ordinary documentation folders, not like the harness's own repo
- [ ] One has the `markdown-harness` Claude Code hook wired; the other does not
- [ ] Both contain the same authored document, resembling the audience's own wiki — an onboarding page, deploy runbook, or deprecation notice
- [ ] That document's staleness date has passed, and its prose contains no language about freshness, staleness, or dates, so a model has nothing to notice on its own
- [ ] Each repository carries a root pointer — an index document or an agent-instructions entry — so the demo question can be asked from the repository root without pasting a file path
- [ ] The hook's configured sentence instructs the agent to propose opening a ticket, and to answer in pirate speak as a visible signature that the hook fired
- [ ] Both sessions are rehearsed end to end: same question, same document, visibly different answers, with the switch between them costing one window change
- [ ] The activity log confirms the hook fired in the wired repository and did not in the other
