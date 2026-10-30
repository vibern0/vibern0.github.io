import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { extname, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const siteRoot = resolve(import.meta.dirname, '../site');
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

let browser;
let page;
let server;
let siteUrl;

before(async () => {
  server = createServer(async (request, response) => {
    try {
      const pathname = new URL(request.url, 'http://localhost').pathname;
      const relativePath = pathname === '/' ? 'index.html' : pathname.slice(1);
      const filePath = resolve(siteRoot, relativePath);
      if (!filePath.startsWith(siteRoot + '/')) throw new Error('Path outside site root');
      const body = await readFile(filePath);
      response.writeHead(200, { 'content-type': contentTypes[extname(filePath)] || 'application/octet-stream' });
      response.end(body);
    } catch {
      response.writeHead(404);
      response.end('Not found');
    }
  });
  await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));
  browser = await chromium.launch();
  page = await browser.newPage();
  const address = server.address();
  siteUrl = `http://127.0.0.1:${address.port}/`;
  await page.goto(siteUrl, { waitUntil: 'networkidle' });
});

after(async () => {
  await browser?.close();
  await new Promise((resolveClose) => server?.close(resolveClose));
});

async function panelContent(id) {
  const panel = page.locator(id);
  return {
    date: (await panel.locator('.career-date').textContent()).trim(),
    role: (await panel.locator('.career-role').textContent()).trim(),
    text: (await panel.textContent()).replace(/\s+/g, ' ').trim(),
    stack: await panel.locator('.stack-list > li').allTextContents(),
    links: await panel.locator('a').evaluateAll((anchors) => anchors.map((anchor) => anchor.href)),
  };
}

test('experience presents CV-backed outcomes, sources and role-specific stacks', async () => {
  const gnosis = await panelContent('#gnosis-panel');
  assert.equal(gnosis.date, 'Aug 2024 – Sep 2026');
  assert.equal(gnosis.role, 'Full-stack Web3 engineer');
  assert.match(gnosis.text, /Circles v1 and v2/);
  assert.match(gnosis.text, /1,200 users per rolling week/);
  assert.deepEqual(gnosis.stack, [
    'TypeScript', 'Node.js', 'Express', 'Svelte', 'Solidity', 'Gnosis', 'Envio', 'GraphQL', 'Firebase',
  ]);

  const impactMarket = await panelContent('#impactmarket-panel');
  assert.match(impactMarket.text, /45k\+/);
  assert.match(impactMarket.text, /\$3M\+/);
  assert.deepEqual(impactMarket.stack, [
    'TypeScript', 'Node.js', 'Express', 'React', 'Next.js', 'React Native', 'Solidity', 'Celo',
    'The Graph', 'GraphQL', 'PostgreSQL', 'Redis', 'Firebase', 'AWS Lambda', 'S3', 'CloudFront',
    'API Gateway', 'Heroku', 'Docker', 'CircleCI',
  ]);
  assert.ok(impactMarket.links.includes('https://github.com/impactMarket/utils'));
  assert.ok(impactMarket.links.includes('https://medium.com/pactfoundation/year-in-review-impactmarkets-journey-in-2023-63d2235de08e'));

  const techHq = await panelContent('#tech-hq-panel');
  assert.match(techHq.text, /450\+ GitHub stars/);
  assert.deepEqual(techHq.stack, ['Solidity', 'JavaScript', 'TypeScript', 'React', 'Hardhat']);
  assert.equal((await page.getByText('Altice Labs', { exact: false }).allTextContents()).length, 1);
});

test('impactMarket evidence stays local, descriptive and limited to two items', async () => {
  const impactPanel = page.locator('#impactmarket-panel');
  if (!await impactPanel.isVisible()) await page.locator('#impactmarket-trigger').click();
  const cards = impactPanel.locator('.evidence-card');
  assert.equal(await cards.count(), 2);
  assert.deepEqual(await cards.evaluateAll((items) => items.map((item) => item.getAttribute('href'))), [
    'https://www.youtube.com/watch?v=jozKD2rQqxo',
    'https://www.youtube.com/watch?v=_4TemHnmRCE',
  ]);
  await cards.locator('img').first().scrollIntoViewIfNeeded();
  assert.deepEqual(await cards.locator('img').evaluateAll((images) => images.map((image) => ({
    src: new URL(image.src).pathname,
    width: image.getAttribute('width'),
    height: image.getAttribute('height'),
    alt: image.getAttribute('alt'),
    complete: image.complete,
    naturalWidth: image.naturalWidth,
  }))), [
    {
      src: '/assets/impactmarket-jaguara.webp',
      width: '480',
      height: '360',
      alt: 'Residents of the Povoado de Jaguara UBI community in Brazil.',
      complete: true,
      naturalWidth: 480,
    },
    {
      src: '/assets/impactmarket-defi-for-people.webp',
      width: '480',
      height: '360',
      alt: 'impactMarket presentation for Celo’s DeFi for the People initiative.',
      complete: true,
      naturalWidth: 480,
    },
  ]);

  for (const panel of await page.locator('.career-panel').all()) {
    assert.ok(await panel.locator('.evidence-card').count() <= 2);
  }
});

test('projects expose the CV-backed proof, stacks and destinations', async () => {
  const mosaic = page.locator('#mosaic');
  assert.equal(await mosaic.count(), 1);
  assert.match((await mosaic.textContent()).replace(/\s+/g, ' '), /ETHGlobal Circuit Breaker · Feb 2024/);
  assert.deepEqual((await mosaic.locator('.project-stack').textContent()).split('·').map((item) => item.trim()), [
    'Noir', 'Barretenberg', 'Solidity', 'TypeScript', 'Hardhat', 'viem',
  ]);
  assert.equal(await mosaic.locator('a').getAttribute('href'), 'https://github.com/vibern0/circuit-breaker-mosaic');

  const kettigoText = (await page.locator('#kettigo').textContent()).replace(/\s+/g, ' ');
  assert.match(kettigoText, /confidential USDC/);
  assert.match(kettigoText, /sponsored transactions/);
  assert.equal(await page.locator('#task-cycle').count(), 1);

  const guard = page.locator('#tiered-spending-guard');
  assert.equal(await guard.count(), 1);
  assert.deepEqual(await guard.locator('.project-links a').evaluateAll((links) => links.map((link) => link.getAttribute('href'))), [
    'https://github.com/vibern0/tiered-spending-guard',
    'articles/bounded-spending-vault.html',
  ]);
  assert.match((await guard.textContent()).replace(/\s+/g, ' '), /unaudited research prototype on a test network/);
});

test('expanded experience stays within phone, tablet and desktop viewports', async () => {
  for (const width of [320, 390, 430, 700, 701, 768, 900, 1024, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.evaluate(() => new Promise((resolveFrame) => requestAnimationFrame(() => requestAnimationFrame(resolveFrame))));
    if (!await page.locator('#impactmarket-panel').isVisible()) await page.locator('#impactmarket-trigger').click();
    const dimensions = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
    assert.ok(dimensions.content <= dimensions.viewport, `Overflow at ${width}px: ${dimensions.content}px`);
  }
});

test('timeline keyboard and reduced-motion behavior remains accessible', async () => {
  await page.goto(siteUrl, { waitUntil: 'networkidle' });
  await page.setViewportSize({ width: 390, height: 844 });
  const impact = page.locator('#impactmarket-trigger');
  await impact.scrollIntoViewIfNeeded();
  await impact.focus();
  await impact.press('End');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'tech-hq-trigger');
  assert.equal(await page.locator('#tech-hq-panel').isVisible(), true);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => new Promise((resolveFrame) => requestAnimationFrame(resolveFrame)));
  assert.equal(await page.locator('.rail-pulse').isVisible(), false);
  await page.locator('#gnosis-trigger').click();
  assert.equal(await page.locator('#gnosis-panel').isVisible(), true);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
});

test('experience and evidence remain available without JavaScript', async () => {
  const noScript = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const plain = await noScript.newPage();
  await plain.goto(siteUrl, { waitUntil: 'networkidle' });
  assert.equal(await plain.locator('.career-panel:visible').count(), 4);
  assert.equal(await plain.locator('#impactmarket-panel .evidence-card').count(), 2);
  const dimensions = await plain.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
  assert.ok(dimensions.content <= dimensions.viewport);
  await noScript.close();
});
