# Portfolio CV Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the portfolio's experience and projects from the October 2026 CV, with exact tech stacks, public proof links, and two restrained impactMarket media tiles.

**Architecture:** Keep the buildless static site: `site/index.html` owns content, `site/styles.css` owns the responsive evidence/stack presentation, and the existing `site/timeline.mjs` interaction remains unchanged. A focused Node content test pins CV facts and link/asset contracts; the existing Playwright QA harness proves layout and progressive enhancement.

**Tech Stack:** Semantic HTML, CSS, vanilla JavaScript, Node's built-in test runner, Playwright QA, local WebP assets.

**Spec:** `docs/superpowers/specs/2026-10-30-portfolio-cv-refresh-design.md`

## Global Constraints

- Preserve the current buildless HTML/CSS/JavaScript architecture and add no production dependency.
- Preserve the Porto illustration, sage/forest palette, four-stop timeline, and existing timeline interaction model.
- Do not add or expand Altice Labs experience; preserve its existing compact historical note only.
- Do not reproduce the full CV or LinkedIn profile.
- Keep no more than two media tiles in any experience panel.
- Store media locally with explicit dimensions and useful alt text; do not hotlink LinkedIn images.
- Keep all experience content and links available without JavaScript.
- Preserve unrelated user-owned worktree changes.

## Review Focus

- **Narrow widths:** added stack tokens, links, and media must not overflow at 320, 390, or 430 pixels; Task 4 runs the existing multi-width browser assertion.
- **Media restraint:** exactly two impactMarket evidence tiles and no other role with more than two; Tasks 2 and 4 assert tile counts.
- **Asset failure/layout shift:** both thumbnails must be local, load successfully, and have explicit width/height; Tasks 2 and 4 assert paths, attributes, and `naturalWidth`.
- **Progressive enhancement:** richer content remains visible when JavaScript is disabled and timeline keyboard behavior is unchanged; Task 4 exercises both.
- **Source fidelity:** dates, measurable outcomes, stacks, and URLs match the supplied CV; Tasks 1 and 3 pin the exact facts and links.

---

### Task 1: Experience content and role-specific stacks

**Files:**
- Create: `tests/portfolio-content.test.mjs`
- Modify: `site/index.html:87-172`

**Interfaces:**
- Consumes: the existing `.career-panel`, `.career-main`, `.career-aside`, `.career-notes`, and `.career-stack` markup seams.
- Produces: `.stack-list[aria-label="Technology stack"]` lists inside the Gnosis, impactMarket, and Tech HQ panels; CV-backed outcome copy and public result links for later styling and browser checks.

- [ ] **Step 1: Write failing experience content tests**

Create `tests/portfolio-content.test.mjs` using `readFileSync` to load `site/index.html`. Add tests with these assertions:

```js
assert.match(html, /Aug 2024\s*[–-]\s*Sep 2026/);
assert.match(html, /1,200 users per rolling week/);
assert.match(html, /Circles v1 and v2/);
assert.match(html, /TypeScript[\s\S]*Node\.js[\s\S]*Express[\s\S]*Svelte[\s\S]*Solidity[\s\S]*Gnosis[\s\S]*Envio[\s\S]*GraphQL[\s\S]*Firebase/);
assert.match(html, /45k\+/);
assert.match(html, /\$3M\+/);
assert.match(html, /https:\/\/github\.com\/impactMarket\/utils/);
assert.match(html, /https:\/\/medium\.com\/pactfoundation\/year-in-review-impactmarkets-journey-in-2023-63d2235de08e/);
assert.match(html, /TypeScript[\s\S]*Node\.js[\s\S]*React[\s\S]*React Native[\s\S]*PostgreSQL[\s\S]*Docker[\s\S]*CircleCI/);
assert.equal((html.match(/Altice Labs/g) ?? []).length, 1);
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test tests/portfolio-content.test.mjs`

Expected: FAIL because the exact dates, outcomes, stack lists, and result links are not yet present.

- [ ] **Step 3: Refresh the Gnosis panel**

In `#gnosis-panel`, use the CV dates `Aug 2024 – Sep 2026`, role `Full-stack Web3 engineer`, and concise outcome copy covering:

- Circles v1/v2 indexing and demurrage balance data;
- unified transfers/swaps plus Circles-to-Gnosis Pay top-ups;
- cashback calculation, payouts, transaction estimates, and Intercom support automation, including approximately 1,200 users per rolling week.

Render the exact Gnosis stack as `<ul class="stack-list" aria-label="Technology stack">` tokens in this order: TypeScript, Node.js, Express, Svelte, Solidity, Gnosis, Envio, GraphQL, Firebase.

- [ ] **Step 4: Refresh the impactMarket and Tech HQ panels**

Keep impactMarket's always-visible summary short and preserve the `45k+`, `~30`, and `$3M+` metrics. Expand `.career-notes` with the hybrid indexed/private PostgreSQL architecture, shared TypeScript/React SDK, donation mining, Microcredit, Learn & Earn, and six-engineer team, using contextual links to:

- `https://medium.com/pactfoundation/year-in-review-impactmarkets-journey-in-2023-63d2235de08e`
- `https://github.com/impactMarket/utils`
- `https://medium.com/pactfoundation/4-impact-weekly-bulletin-3c4c75138d2`
- `https://medium.com/pactfoundation/28-impact-bulletin-september-2023-134ca745a1f7`

Render the exact impactMarket stack as stack tokens: TypeScript, Node.js, Express, React, Next.js, React Native, Solidity, Celo, The Graph, GraphQL, PostgreSQL, Redis, Firebase, AWS Lambda, S3, CloudFront, API Gateway, Heroku, Docker, CircleCI.

For Tech HQ, retain the concise Ethereum-client-work summary, add the 450+ GitHub-star open-source tooling proof, and render: Solidity, JavaScript, TypeScript, React, Hardhat. Leave the existing Altice Labs sentence unchanged.

- [ ] **Step 5: Run focused and existing unit tests**

Run: `node --test tests/portfolio-content.test.mjs tests/timeline.test.mjs tests/andorinha.test.mjs`

Expected: all tests PASS.

- [ ] **Step 6: Commit the experience slice**

```bash
git add site/index.html tests/portfolio-content.test.mjs
git commit -m "feat: enrich portfolio experience"
```

---

### Task 2: Restrained impactMarket evidence media

**Files:**
- Create: `site/assets/impactmarket-jaguara.webp`
- Create: `site/assets/impactmarket-defi-for-people.webp`
- Modify: `site/index.html:119-145`
- Modify: `site/styles.css:155-186,210-303`
- Modify: `tests/portfolio-content.test.mjs`

**Interfaces:**
- Consumes: the impactMarket `career-panel` from Task 1 and these public video sources: `https://www.youtube.com/watch?v=jozKD2rQqxo` and `https://www.youtube.com/watch?v=_4TemHnmRCE`.
- Produces: one `.career-evidence` region containing exactly two `.evidence-card` links with local `.webp` thumbnails, descriptive labels, alt text, and explicit dimensions.

- [ ] **Step 1: Add failing media-contract tests**

Extend `tests/portfolio-content.test.mjs` to isolate `#impactmarket-panel` and assert:

```js
assert.equal((impactPanel.match(/class="evidence-card"/g) ?? []).length, 2);
assert.match(impactPanel, /assets\/impactmarket-jaguara\.webp/);
assert.match(impactPanel, /assets\/impactmarket-defi-for-people\.webp/);
assert.match(impactPanel, /youtube\.com\/watch\?v=jozKD2rQqxo/);
assert.match(impactPanel, /youtube\.com\/watch\?v=_4TemHnmRCE/);
assert.equal((impactPanel.match(/<img[^>]+width="\d+"[^>]+height="\d+"[^>]+alt="[^"]+"/g) ?? []).length, 2);
```

Also assert every `.career-panel` has at most two `.evidence-card` occurrences.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test tests/portfolio-content.test.mjs`

Expected: FAIL because the evidence region and local assets do not exist.

- [ ] **Step 3: Acquire and optimize the two source thumbnails**

Download the YouTube `hqdefault.jpg` images for `jozKD2rQqxo` and `_4TemHnmRCE` to a temporary directory, convert them to WebP at a maximum width of 480px, and save them under the exact asset names above. Inspect both output images; do not use LinkedIn page chrome or profile imagery.

- [ ] **Step 4: Add semantic evidence markup**

Add a `.career-evidence` region after impactMarket's notes, labeled “Selected evidence”, with these two linked cards:

- “Povoado de Jaguara — UBI community in Brazil” → `https://www.youtube.com/watch?v=jozKD2rQqxo`
- “DeFi for the People — impactMarket on Celo” → `https://www.youtube.com/watch?v=_4TemHnmRCE`

Each image uses its local WebP, real pixel dimensions, `loading="lazy"`, and concise alt text describing the thumbnail.

- [ ] **Step 5: Style evidence and stack tokens responsively**

In `site/styles.css`, add:

- `.stack-list` as an unstyled, wrapping flex list with small bordered/wash tokens consistent with the existing palette;
- `.career-evidence` as a full-width dashed-top region;
- `.evidence-grid` as two compact columns on desktop and one column at `max-width: 700px`;
- `.evidence-card` as a restrained thumbnail/label link with a fixed-aspect image, visible keyboard focus inherited from global link styles, and no new animation.

Keep thumbnails visually smaller than the impact metrics and role heading.

- [ ] **Step 6: Run content tests and inspect assets**

Run: `node --test tests/portfolio-content.test.mjs`

Run: `file site/assets/impactmarket-jaguara.webp site/assets/impactmarket-defi-for-people.webp`

Expected: tests PASS; both assets report WebP image data.

- [ ] **Step 7: Commit the evidence slice**

```bash
git add site/index.html site/styles.css site/assets/impactmarket-jaguara.webp site/assets/impactmarket-defi-for-people.webp tests/portfolio-content.test.mjs
git commit -m "feat: add restrained experience evidence"
```

---

### Task 3: CV-backed projects and links

**Files:**
- Modify: `site/index.html:177-237`
- Modify: `site/styles.css:188-203,284-298` only if the fourth project exposes spacing or wrapping defects
- Modify: `tests/portfolio-content.test.mjs`

**Interfaces:**
- Consumes: the existing `.project`, `.project-content`, `.project-notes`, `.project-stack`, and `.project-links` component pattern.
- Produces: `#mosaic`, refreshed `#kettigo`, retained `#task-cycle`, and renamed/refreshed `#tiered-spending-guard` project articles with exact public links.

- [ ] **Step 1: Add failing project-contract tests**

Extend `tests/portfolio-content.test.mjs` with:

```js
assert.match(html, /id="mosaic"/);
assert.match(html, /https:\/\/github\.com\/vibern0\/circuit-breaker-mosaic/);
assert.match(html, /Noir[\s\S]*Barretenberg[\s\S]*Solidity[\s\S]*TypeScript[\s\S]*Hardhat[\s\S]*viem/);
assert.match(html, /id="kettigo"[\s\S]*confidential USDC[\s\S]*sponsored transactions/);
assert.match(html, /id="task-cycle"/);
assert.match(html, /id="tiered-spending-guard"/);
assert.match(html, /https:\/\/github\.com\/vibern0\/tiered-spending-guard/);
assert.match(html, /articles\/bounded-spending-vault\.html/);
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test tests/portfolio-content.test.mjs`

Expected: FAIL because Mosaic is absent and the Kettigo/guard copy and links are stale.

- [ ] **Step 3: Add Mosaic using the existing project component**

Add `#mosaic` with status “ETHGlobal Circuit Breaker · Feb 2024”, a concise zero-knowledge trust-network summary, the CV proof-of-concept detail, stack Noir/Barretenberg/Solidity/TypeScript/Hardhat/viem, and source link `https://github.com/vibern0/circuit-breaker-mosaic`.

- [ ] **Step 4: Refresh Kettigo and the tiered spending guard**

For Kettigo, preserve the Sepolia-prototype label and existing app/source links; update the detail to cover confidential USDC, Safe smart accounts, sponsored transactions, deposit-weighted prize draws, and automated withdrawal processing.

Rename the current Safe project to “Tiered spending guard”, set `id="tiered-spending-guard"`, use `https://github.com/vibern0/tiered-spending-guard`, and add a separate technical-article link to `articles/bounded-spending-vault.html`. Preserve the explicit unaudited/testnet caveat.

- [ ] **Step 5: Run focused and existing unit tests**

Run: `node --test tests/portfolio-content.test.mjs tests/timeline.test.mjs tests/andorinha.test.mjs`

Expected: all tests PASS.

- [ ] **Step 6: Commit the projects slice**

```bash
git add site/index.html site/styles.css tests/portfolio-content.test.mjs
git commit -m "feat: refresh portfolio projects"
```

---

### Task 4: Browser regression proof and visual repair

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Modify: `.gitignore`
- Modify: `tests/portfolio-content.test.mjs`
- Modify: `output/qa/check-portfolio.cjs`
- Modify if needed: `site/index.html`
- Modify if needed: `site/styles.css`
- Create: `output/qa/cv-refresh-desktop.png`
- Create: `output/qa/cv-refresh-mobile.png`

**Interfaces:**
- Consumes: the completed static site from Tasks 1–3 and the existing Playwright QA harness.
- Produces: automated layout/accessibility proof plus reviewed desktop/mobile screenshots; no new product interface.

- [ ] **Step 1: Extend the browser QA harness before running the site**

Add checks to `output/qa/check-portfolio.cjs` asserting:

- `#impactmarket-panel .evidence-card` count is exactly 2 and every other panel's count is at most 2;
- every evidence image has `complete === true`, `naturalWidth > 0`, non-empty `alt`, and numeric `width`/`height` attributes;
- `.stack-list` exists in Gnosis, impactMarket, and Tech HQ panels;
- all `http(s)` CV-backed anchors have the expected `href` values;
- layout remains within viewport at 320, 390, 430, 700, 701, 768, 900, 1024, and 1440 pixels;
- no-JavaScript mode shows all four career panels and both evidence links;
- existing keyboard, reduced-motion, and runtime-error checks still pass.

- [ ] **Step 2: Install versioned QA tooling and run all automated proof**

Run once after checkout: `npm install && npm run test:setup`

Run: `npm test`

Expected: all Node and Playwright checks PASS with no page errors or overflow. The committed test starts its own local server and covers rendered content, local image loading, responsive widths, keyboard interaction, reduced motion, and the no-JavaScript fallback.

- [ ] **Step 3: Verify public destinations**

Check the CV-backed GitHub, Medium, YouTube, app, and local article destinations. A redirect is acceptable; a 404 or wrong destination is not. If a third-party anti-bot response prevents automated validation, verify the exact URL against the supplied PDF annotation and record that limitation.

- [ ] **Step 4: Inspect desktop and mobile screenshots**

Capture the complete page at 1440×1000 and 390×844 with impactMarket selected. Verify that stacks wrap cleanly, media stays subordinate, labels do not clip, the longer page retains rhythm, and the hero still fits with the existing uncommitted credentials copy.

- [ ] **Step 5: Apply only evidence-backed visual repairs and rerun proof**

Modify `site/index.html` or `site/styles.css` only for defects observed in Step 4, then rerun Step 2 and recapture both screenshots. Stop when every acceptance check passes.

- [ ] **Step 6: Check the final diff and commit QA-backed repairs**

Run: `git diff --check`

Run: `git status --short`

Expected: no whitespace errors; only the planned site, asset, test, spec/plan, and QA files are changed or created.

```bash
git add site/index.html site/styles.css tests/portfolio-content.test.mjs docs/superpowers/specs/2026-10-30-portfolio-cv-refresh-design.md docs/superpowers/plans/2026-10-30-portfolio-cv-refresh.md
git commit -m "test: verify portfolio cv refresh"
```
