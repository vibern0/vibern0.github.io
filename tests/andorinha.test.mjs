import test from 'node:test';
import assert from 'node:assert/strict';

const flight = await import('../site/andorinha.mjs').catch((error) => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});

const p0 = { x: 0, y: 0 };
const p1 = { x: 0, y: 100 };
const p2 = { x: 100, y: 100 };
const p3 = { x: 100, y: 0 };

test('a flight starts at its perch and ends at the exit point', () => {
  assert.equal(typeof flight.cubic, 'function');
  assert.deepEqual(flight.cubic(p0, p1, p2, p3, 0), { x: 0, y: 0 });
  assert.deepEqual(flight.cubic(p0, p1, p2, p3, 1), { x: 100, y: 0 });
});

test('the flight follows a curved arc rather than cutting between endpoints', () => {
  assert.equal(typeof flight.cubic, 'function');
  assert.deepEqual(flight.cubic(p0, p1, p2, p3, .5), { x: 50, y: 75 });
});

test('the heading follows the ascent, glide and descent along the route', () => {
  assert.equal(typeof flight.velocity, 'function');
  assert.deepEqual(flight.velocity(p0, p1, p2, p3, 0), { x: 0, y: 300 });
  assert.deepEqual(flight.velocity(p0, p1, p2, p3, .5), { x: 150, y: 0 });
  assert.deepEqual(flight.velocity(p0, p1, p2, p3, 1), { x: 0, y: -300 });
});

test('reversing the route reverses its heading while preserving the arc', () => {
  assert.equal(typeof flight.velocity, 'function');
  assert.deepEqual(flight.velocity(p3, p2, p1, p0, .5), { x: -150, y: 0 });
});
