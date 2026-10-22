import test from 'node:test';
import assert from 'node:assert/strict';

const timeline = await import('../site/timeline.mjs').catch((error) => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});

function progress(...args) {
  assert.equal(typeof timeline.getScrollProgress, 'function', 'Scroll progress must be implemented');
  return timeline.getScrollProgress(...args);
}

function next(...args) {
  assert.equal(typeof timeline.getNextMilestoneIndex, 'function', 'Keyboard navigation must be implemented');
  return timeline.getNextMilestoneIndex(...args);
}

test('the pulse stays at the beginning before the timeline enters the viewport', () => {
  assert.equal(progress(900, 600, 900), 0);
});

test('the pulse is halfway along when the timeline crosses the viewport midpoint', () => {
  assert.equal(progress(150, 600, 900), 0.5);
});

test('the pulse stops at the end after scrolling past the timeline', () => {
  assert.equal(progress(-900, 600, 900), 1);
});

test('a hidden timeline or unavailable viewport cannot produce an invalid position', () => {
  assert.equal(progress(0, 0, 900), 0);
  assert.equal(progress(0, 600, 0), 0);
});

test('forward arrows select the next milestone and wrap after the last one', () => {
  assert.equal(next(1, 'ArrowRight', 4), 2);
  assert.equal(next(3, 'ArrowDown', 4), 0);
});

test('backward arrows select the previous milestone and wrap before the first one', () => {
  assert.equal(next(2, 'ArrowLeft', 4), 1);
  assert.equal(next(0, 'ArrowUp', 4), 3);
});

test('Home and End select the first and last milestones', () => {
  assert.equal(next(2, 'Home', 4), 0);
  assert.equal(next(1, 'End', 4), 3);
});

test('unrelated keys leave the selected milestone unchanged', () => {
  assert.equal(next(2, 'Tab', 4), 2);
  assert.equal(next(1, 'Escape', 4), 1);
});
