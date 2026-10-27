const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.env.PORTFOLIO_URL || 'http://localhost:4173/';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  const contexts = [];
  const errors = [];

  async function page(options = {}) {
    const context = await browser.newContext({ viewport: { width: 1200, height: 900 }, ...options });
    contexts.push(context);
    const result = await context.newPage();
    result.on('pageerror', (error) => errors.push(error.message));
    return result;
  }

  async function check(name, run) {
    try {
      await run();
      results.push({ name, passed: true });
    } catch (error) {
      results.push({ name, passed: false, error: error.message });
    }
  }

  try {
    await check('Early scrolling cannot replace the Porto take-off with a scroll flock', async () => {
      const early = await page();
      await early.goto(base, { waitUntil: 'networkidle' });
      await early.evaluate(() => scrollTo(0, 300));
      await early.waitForSelector('.andorinha-flight', { timeout: 6000 });
      assert.equal(await early.locator('.andorinha-flight[data-origin="porto"]').count(), 4);
      assert.equal(await early.locator('.andorinha-flight[data-origin="scroll"]').count(), 0);
      await early.context().close();
    });

    const main = await page();
    await main.goto(base, { waitUntil: 'networkidle' });

    await check('The main site has perched birds and no preview controls', async () => {
      assert.equal(await main.locator('.andorinha-perch').count(), 4);
      assert.equal(await main.locator('.motion-preview-bar, #replay-bird, #scroll-birds').count(), 0);
    });

    await check('The Porto scene launches four animated birds', async () => {
      await main.waitForSelector('.andorinha-flight', { timeout: 6000 });
      assert.equal(await main.locator('.andorinha-flight[data-origin="porto"]').count(), 4);
      await main.waitForFunction(() => [...document.querySelectorAll('.andorinha-flight')].every((bird) => Number(bird.style.opacity) > .8));
      const poses = await main.locator('.andorinha-flight').evaluateAll((birds) => birds.map((bird) => bird.style.backgroundPosition));
      assert.ok(new Set(poses).size > 1, 'Wingbeats must have independent phases');
    });

    await check('Rapid scrolling never overlaps two flocks', async () => {
      for (const top of [400, 100, 800]) {
        await main.evaluate((position) => scrollTo(0, position), top);
        assert.ok(await main.locator('.andorinha-flight').count() <= 4);
      }
    });

    await check('Later scrolling launches a flock of three or four birds', async () => {
      await main.waitForFunction(() => document.querySelectorAll('.andorinha-flight').length === 0);
      await main.evaluate(() => scrollTo(0, 500));
      await main.waitForSelector('.andorinha-flight[data-origin="scroll"]');
      const size = await main.locator('.andorinha-flight').count();
      assert.ok(size === 3 || size === 4);
    });

    await check('Birds cannot intercept page links or timeline controls', async () => {
      assert.equal(await main.locator('.andorinha-sky').evaluate((element) => getComputedStyle(element).pointerEvents), 'none');
      await main.locator('#impactmarket-trigger').click();
      assert.equal(await main.locator('#impactmarket-panel').isVisible(), true);
    });

    await check('Enabling reduced motion immediately cancels active birds', async () => {
      await main.emulateMedia({ reducedMotion: 'reduce' });
      await main.waitForFunction(() => document.querySelectorAll('.andorinha-flight').length === 0);
      assert.equal(await main.locator('.andorinha-sky').isVisible(), false);
    });

    await check('Reduced motion on first load keeps the page static', async () => {
      const quiet = await page({ reducedMotion: 'reduce' });
      await quiet.goto(base, { waitUntil: 'networkidle' });
      assert.equal(await quiet.locator('.andorinha-perch').count(), 4);
      await quiet.evaluate(() => scrollTo(0, 700));
      assert.equal(await quiet.locator('.andorinha-flight').count(), 0);
      assert.equal(await quiet.locator('.andorinha-sky').isVisible(), false);
      await quiet.context().close();
    });

    await check('Mobile layouts remain within the viewport', async () => {
      const mobile = await page({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
      await mobile.goto(base, { waitUntil: 'networkidle' });
      await mobile.waitForSelector('.andorinha-flight', { timeout: 6000 });
      for (const width of [320, 390, 430]) {
        await mobile.setViewportSize({ width, height: 844 });
        assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      }
      await mobile.context().close();
    });

    await check('A missing decorative sprite leaves the portfolio usable', async () => {
      const missing = await page();
      await missing.route('**/assets/swallow-flight.webp', (route) => route.abort());
      await missing.goto(base, { waitUntil: 'networkidle' });
      await missing.locator('#tech-hq-trigger').click();
      assert.equal(await missing.locator('#tech-hq-panel').isVisible(), true);
      assert.equal(await missing.locator('.andorinha-flight').count(), 0);
      await missing.context().close();
    });

    await check('No animation or portfolio runtime errors occur', async () => {
      assert.deepEqual(errors, []);
    });
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify(results, null, 2));
  if (results.some((result) => !result.passed)) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
