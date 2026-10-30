# Portfolio CV refresh design

## Intent

Bring the portfolio in line with Bernardo's October 2026 CV and LinkedIn profile so recruiters and engineering peers can quickly understand the scope, results, technology, and supporting proof behind each role. Preserve the site's quiet editorial character and its existing buildless implementation.

## Goals

- Replace thin experience summaries with concise, measurable outcomes drawn from the CV.
- Show a complete, role-specific tech stack for Gnosis, impactMarket, and Tech HQ.
- Add contextual links to public results, source repositories, and articles without turning prose into a link list.
- Add subtle supporting media inside expanded experience panels: at most two small linked thumbnails for a major role.
- Refresh the projects section from the CV, including Mosaic, Kettigo, and the tiered spending guard.
- Keep all experience readable without JavaScript and usable at narrow mobile widths.

## Non-goals and anti-goals

- Do not reproduce the entire CV or LinkedIn profile.
- Do not add or expand Altice Labs experience.
- Do not add a gallery, carousel, modal viewer, framework, CMS, or build step.
- Do not copy LinkedIn chrome, analytics, recommendations, or unrelated profile content.
- Do not inflate weak or unavailable media; a clean text link is preferable to a low-quality image.
- Do not disturb the Porto illustration, sage/forest palette, or timeline interaction model.
- Do not overwrite unrelated user-owned changes already present in the worktree.

## Chosen approach

Use the existing timeline and project components as the only presentation seams. Each selected role will contain two or three high-signal outcomes, a compact wrapped stack, relevant inline source links, and an optional evidence row. This is richer than a light copy refresh but deliberately shorter than a CV transcription.

### Alternatives considered

- **Full CV:** most bullets and links inside expandable panels. Rejected because it would make the timeline dense and repetitive.
- **Light refresh:** update summaries and stack labels only. Rejected because it would omit the strongest measurable outcomes and public proof.
- **Enriched timeline (chosen):** selective outcomes, exact stacks, contextual links, and restrained media. Best balance of credibility and readability.

## Content and presentation

### Hero

- Preserve the intent and facts in the current uncommitted hero copy.
- Keep the current title, introduction, Porto artwork, contact links, and availability language.
- Only make small copy or wrapping adjustments if the expanded credentials cause a verified responsive-layout problem.

### Experience timeline

- **Gnosis:** emphasize Circles v1/v2 indexing, unified transfer/swap history, Circles-to-Gnosis Pay top-ups, and the cashback operations/support system. Show the CV stack: TypeScript, Node.js, Express, Svelte, Solidity, Gnosis, Envio, GraphQL, and Firebase.
- **impactMarket:** emphasize first-engineer ownership, 45k+ beneficiaries and $3M+ distributed, the hybrid indexed/private data architecture, the shared SDK, donation mining, Microcredit, Learn & Earn, and team leadership. Select no more than three outcomes for the always-visible panel; keep additional detail in the existing disclosure. Show the full CV stack in a wrapping presentation.
- **Tech HQ:** retain the concise full-stack Ethereum summary, add the open-source tooling proof, and link the relevant organization or repositories where appropriate.
- Present technology as a labeled, accessible wrapped list rather than a single vague category line.

### Evidence media

- Add a small “Selected evidence” row only where clean, relevant assets are available.
- Cap each role at two tiles. A tile consists of a local optimized thumbnail, a short descriptive label, and a link to the original public source.
- Prioritize the impactMarket videos linked from LinkedIn and a clean Gnosis/portfolio work image if the export provides one at usable quality.
- Use meaningful alt text; decorative thumbnail details remain hidden from screen readers.
- Do not hotlink LinkedIn-hosted images. Store any selected thumbnail locally and link the tile to the original video, article, product, or repository.

### Projects

- Add **Mosaic — Zero-Knowledge Trust Network** with its GitHub link, February 2024 hackathon context, and Noir/Barretenberg/Solidity/TypeScript/Hardhat/viem stack.
- Refresh **Tiered Spending Guard** using the CV description and keep both source and technical-article links.
- Refresh **Kettigo** with the confidential USDC, Safe smart-account, sponsored-transaction, and withdrawal-processing details while preserving its prototype label.
- Keep Task Cycle because it represents current independent product work even though it is not in the CV.

## Implementation constraints

- Continue using semantic HTML, existing CSS, and vanilla JavaScript.
- Add no production or runtime dependency. A versioned dev-only browser dependency is permitted for reproducible acceptance tests.
- Preserve progressive enhancement: all role content and links remain available without JavaScript.
- Media assets must be local, compressed, and explicitly sized to avoid layout shift.
- External links should use clear labels and safe new-tab behavior only if the site already adopts it consistently; otherwise preserve current same-tab behavior.

## Acceptance

- Experience copy and dates match the supplied CV.
- Every role displays a specific tech stack and all supplied public links resolve to the intended targets.
- No experience panel shows more than two media tiles.
- The timeline remains scannable and visually subordinate media does not dominate the role text.
- No horizontal overflow at 320, 390, 430, 768, 1024, and 1440 pixels.
- Timeline pointer, keyboard, reduced-motion, and no-JavaScript behavior still pass.
- Images load locally with useful alt text and fixed dimensions.
- Existing unrelated worktree changes remain intact.

## Builder calls

- Choose the highest-quality clean thumbnails available from the supplied LinkedIn export and linked original sources; fall back to text-only evidence when quality is insufficient.
- Keep visible outcome copy brief and move secondary detail into the existing disclosure.
- Reuse the current project and timeline visual language rather than introducing a new card style.
