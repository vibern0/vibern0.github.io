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
  await page.goto(`http://127.0.0.1:${address.port}/`, { waitUntil: 'networkidle' });
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
  const cards = impactPanel.locator('.evidence-card');
  assert.equal(await cards.count(), 2);
  assert.deepEqual(await cards.evaluateAll((items) => items.map((item) => item.getAttribute('href'))), [
    'https://www.youtube.com/watch?v=jozKD2rQqxo',
    'https://www.youtube.com/watch?v=_4TemHnmRCE',
  ]);
  assert.deepEqual(await cards.locator('img').evaluateAll((images) => images.map((image) => ({
    src: new URL(image.src).pathname,
    width: image.getAttribute('width'),
    height: image.getAttribute('height'),
    alt: image.getAttribute('alt'),
  }))), [
    {
      src: '/assets/impactmarket-jaguara.webp',
      width: '480',
      height: '360',
      alt: 'Residents of the Povoado de Jaguara UBI community in Brazil.',
    },
    {
      src: '/assets/impactmarket-defi-for-people.webp',
      width: '480',
      height: '360',
      alt: 'impactMarket presentation for Celo’s DeFi for the People initiative.',
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
