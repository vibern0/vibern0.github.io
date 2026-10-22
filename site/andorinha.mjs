export function cubic(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return {
    x: u*u*u*p0.x + 3*u*u*t*p1.x + 3*u*t*t*p2.x + t*t*t*p3.x,
    y: u*u*u*p0.y + 3*u*u*t*p1.y + 3*u*t*t*p2.y + t*t*t*p3.y,
  };
}

export function velocity(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return {
    x: 3*u*u*(p1.x-p0.x) + 6*u*t*(p2.x-p1.x) + 3*t*t*(p3.x-p2.x),
    y: 3*u*u*(p1.y-p0.y) + 6*u*t*(p2.y-p1.y) + 3*t*t*(p3.y-p2.y),
  };
}

function initializeAndorinhas() {
  const image = document.querySelector('.porto img');
  const scene = document.querySelector('.porto');
  if (!image || !scene) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const sprite = new Image();
  sprite.src = new URL('./assets/swallow-flight.webp', import.meta.url).href;
  const spriteReady = sprite.decode().then(() => true, () => false);
  const sky = document.createElement('div');
  sky.className = 'andorinha-sky';
  sky.setAttribute('aria-hidden', 'true');
  document.body.append(sky);

  const perches = Array.from({ length: 4 }, (_, index) => {
    const element = document.createElement('span');
    element.className = 'andorinha-perch';
    element.setAttribute('aria-hidden', 'true');
    element.innerHTML = '<svg viewBox="0 0 40 40" fill="currentColor"><path d="M11 22c2-7 6-13 12-15 4-2 8 0 8 4l5 2-6 1c-1 6-5 10-10 12L6 36l5-12-9 7 9-12Z"/><path d="m22 25 2 6m-5-6 2 7" fill="none"/></svg>';
    scene.append(element);
    return { element, x: .689 + index * .047, y: .469 - index * .030 };
  });

  const flights = new Set();
  const anchors = [...document.querySelectorAll('.project-icon, .milestone-dot, .section-heading, .footer-corner')];
  let lastScrollY = scrollY;
  let scrollDistance = 0;
  let lastLaunch = -Infinity;
  let lastAnchor = null;
  let introTimer;
  let introPending = !reducedMotion.matches;
  let threshold = 250;

  function positionPerches() {
    const bounds = image.getBoundingClientRect();
    const container = scene.getBoundingClientRect();
    perches.forEach((perch) => {
      perch.element.style.left = (bounds.left - container.left + bounds.width * perch.x) + 'px';
      perch.element.style.top = (bounds.top - container.top + bounds.height * perch.y) + 'px';
    });
  }

  function launchFlock(origin, fromPorto = false) {
    if (reducedMotion.matches || document.hidden || flights.size || !sprite.complete || !sprite.naturalWidth) return false;
    const direction = origin.x > innerWidth * .5 ? -1 : 1;
    const exit = direction > 0 ? innerWidth + 150 : -150;
    const rise = fromPorto ? 200 : 100 + Math.random() * 130;
    const p0 = origin;
    const p1 = { x: origin.x + direction * 180, y: origin.y - 85 };
    const p2 = { x: origin.x + (exit-origin.x) * .65, y: origin.y - rise - 35 };
    const p3 = { x: exit, y: Math.max(-50, origin.y - rise) };
    const duration = Math.max(4700, Math.abs(exit-origin.x) * 4.7);
    const start = performance.now();
    const bounds = image.getBoundingClientRect();
    const count = fromPorto ? 4 : 3 + Math.floor(Math.random() * 2);
    const verticalOffsets = [0, -24, 23, -8];
    lastLaunch = start;

    for (let index = 0; index < count; index++) {
      const bird = document.createElement('span');
      bird.className = 'andorinha-flight';
      bird.dataset.origin = fromPorto ? 'porto' : 'scroll';
      bird.dataset.member = String(index);
      sky.append(bird);
      const delay = index * 85;
      const phase = Math.random() * 130 + index * 69;
      const size = (fromPorto ? .84 : .77) * (1 - index * .045);
      const startOffset = fromPorto ? {
        x: bounds.width * (perches[index].x-perches[0].x),
        y: bounds.height * (perches[index].y-perches[0].y),
      } : { x: -direction * index * 9, y: index * 5 };
      const flight = { bird, frame: 0 };
      flights.add(flight);

      function draw(now) {
        const elapsed = now - start - delay;
        if (elapsed < 0) {
          flight.frame = requestAnimationFrame(draw);
          return;
        }
        const t = Math.min(1, elapsed / duration);
        const position = cubic(p0, p1, p2, p3, t);
        const vector = velocity(p0, p1, p2, p3, t);
        const formation = Math.min(1, t * 5);
        const offsetX = startOffset.x * (1-formation) - direction * index * 47 * formation;
        const offsetY = startOffset.y * (1-formation) + verticalOffsets[index] * formation;
        const drift = Math.sin(elapsed * .0022 + index * 1.9) * 3.5 * formation;
        const pitch = Math.max(-19, Math.min(15, Math.atan2(vector.y, Math.abs(vector.x)) * 180 / Math.PI)) * direction;
        const beating = elapsed < 700 || (elapsed + phase) % (1550 + index * 115) < 490;
        const frame = beating ? Math.floor((elapsed + phase) / (32 + index)) % 8 : 2;
        bird.style.backgroundPosition = ((frame % 4) * 100 / 3) + '% ' + (frame < 4 ? 0 : 100) + '%';
        const scale = size * (1 - t * .20);
        bird.style.transform = 'translate3d(' + (position.x+offsetX-39.2) + 'px,' + (position.y+offsetY+drift-47.7867) + 'px,0) rotate(' + pitch + 'deg) scale(' + (scale*direction) + ',' + scale + ')';
        bird.style.opacity = String(Math.min(1, elapsed / 130) * Math.min(1, (1-t) * 8));

        if (t < 1 && !document.hidden && !reducedMotion.matches) {
          flight.frame = requestAnimationFrame(draw);
        } else {
          bird.remove();
          flights.delete(flight);
        }
      }
      flight.frame = requestAnimationFrame(draw);
    }
    return true;
  }

  async function takeOff() {
    const loaded = await spriteReady;
    introPending = false;
    if (!loaded || reducedMotion.matches) return;
    positionPerches();
    const bounds = image.getBoundingClientRect();
    if (bounds.bottom < 0 || bounds.top > innerHeight) return;
    if (launchFlock({ x: bounds.left + bounds.width * perches[0].x, y: bounds.top + bounds.height * perches[0].y }, true)) {
      perches.forEach((perch) => { perch.element.style.opacity = '0'; });
    }
  }

  function scrollFlight() {
    if (introPending || reducedMotion.matches) return;
    if (performance.now() - lastLaunch < 2800 || flights.size) return;
    const candidates = anchors.filter((element) => {
      const bounds = element.getBoundingClientRect();
      return element !== lastAnchor && bounds.top > 95 && bounds.bottom < innerHeight - 30;
    });
    if (!candidates.length) return;
    const anchor = candidates[Math.floor(Math.random() * candidates.length)];
    const bounds = anchor.getBoundingClientRect();
    const isHeading = anchor.classList.contains('section-heading');
    const x = isHeading ? bounds.right - 40 - Math.random() * 70 : bounds.left + bounds.width * .52;
    if (launchFlock({ x, y: bounds.top + (isHeading ? 5 : bounds.height * .18) })) {
      lastAnchor = anchor;
      scrollDistance = 0;
      threshold = 200 + Math.random() * 190;
    }
  }

  window.addEventListener('scroll', () => {
    scrollDistance += Math.abs(scrollY - lastScrollY);
    lastScrollY = scrollY;
    if (scrollDistance >= threshold) scrollFlight();
  }, { passive: true });

  function cancelFlights() {
    for (const flight of flights) {
      cancelAnimationFrame(flight.frame);
      flight.bird.remove();
    }
    flights.clear();
  }

  function applyMotionPreference() {
    if (reducedMotion.matches) {
      introPending = false;
      clearTimeout(introTimer);
      cancelFlights();
      perches.forEach((perch) => { perch.element.style.opacity = '1'; });
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelFlights();
  });
  reducedMotion.addEventListener('change', applyMotionPreference);
  new ResizeObserver(positionPerches).observe(image);
  applyMotionPreference();
  if (image.complete) positionPerches();
  else image.addEventListener('load', positionPerches, { once: true });
  if (!reducedMotion.matches) introTimer = setTimeout(takeOff, 1400);
}

if (typeof document !== 'undefined') initializeAndorinhas();
