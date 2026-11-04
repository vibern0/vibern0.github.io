export function getScrollProgress(top, height, viewportHeight) {
  if (height <= 0 || viewportHeight <= 0) return 0;
  const progress = (viewportHeight * 0.75 - top) / (height + viewportHeight * 0.5);
  return Math.max(0, Math.min(1, progress));
}

export function getNextMilestoneIndex(current, key, length) {
  if (key === 'Home') return 0;
  if (key === 'End') return length - 1;
  if (key === 'ArrowRight' || key === 'ArrowDown') return (current + 1) % length;
  if (key === 'ArrowLeft' || key === 'ArrowUp') return (current - 1 + length) % length;
  return current;
}

const resizeTiming = { duration: 240, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' };

function initializeDetails(reducedMotion) {
  document.querySelectorAll('.career-notes, .project-notes').forEach((details) => {
    const summary = details.querySelector('summary');
    const body = document.createElement('div');
    body.className = 'details-body';
    while (summary.nextSibling) body.append(summary.nextSibling);
    details.append(body);
    let animation = null;
    let targetOpen = null;

    summary.addEventListener('click', (event) => {
      event.preventDefault();
      const open = !(targetOpen ?? details.open);
      const from = details.open ? body.getBoundingClientRect().height : 0;
      const opacity = details.open ? getComputedStyle(body).opacity : 0;
      animation?.cancel();
      targetOpen = open;
      body.inert = !open;

      if (reducedMotion.matches) {
        details.open = open;
        animation = null;
        targetOpen = null;
        return;
      }

      // Keep native details open until the closing animation has finished.
      details.open = true;
      const to = open ? body.getBoundingClientRect().height : 0;
      const next = body.animate([
        { height: `${from}px`, opacity },
        { height: `${to}px`, opacity: open ? 1 : 0 },
      ], resizeTiming);
      animation = next;
      next.finished.then(() => {
        if (animation !== next) return;
        details.open = open;
        animation = null;
        targetOpen = null;
      }, () => {});
    });
  });
}

function initializeTimeline() {
  const timeline = document.querySelector('[data-timeline]');
  if (!timeline) return;

  const stops = [...timeline.querySelectorAll('[data-stop]')];
  const buttons = stops.map((stop) => stop.querySelector('.milestone'));
  const panels = buttons.map((button) => document.getElementById(button.getAttribute('aria-controls')));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileLayout = window.matchMedia('(max-width: 700px)');
  const stage = document.createElement('div');
  stage.className = 'career-stage';
  panels.forEach((panel) => stage.append(panel));
  timeline.append(stage);
  const keyboardKeys = new Set(['Home', 'End', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp']);
  let activeIndex = Math.max(0, stops.findIndex((stop) => stop.hasAttribute('data-initial')));
  let frame = 0;
  let resizeAnimation = null;

  function selectMilestone(index) {
    if (index === activeIndex) return;
    const from = stage.getBoundingClientRect().height;
    resizeAnimation?.cancel();
    activeIndex = index;

    buttons.forEach((button, current) => {
      const selected = current === activeIndex;
      button.setAttribute('aria-expanded', String(selected));
      panels[current].hidden = !selected;
      panels[current].inert = !selected;
    });
    const to = panels[index].getBoundingClientRect().height;
    if (!reducedMotion.matches && Math.abs(from - to) > 1) {
      resizeAnimation = stage.animate([
        { height: `${from}px` },
        { height: `${to}px` },
      ], resizeTiming);
    }
    requestUpdate();
  }

  function updateProgress() {
    frame = 0;
    const first = buttons[0].getBoundingClientRect();
    const last = buttons.at(-1).getBoundingClientRect();
    const length = mobileLayout.matches ? last.top - first.top : last.left - first.left;
    timeline.style.setProperty('--rail-length', length + 'px');
    if (reducedMotion.matches) return;
    const bounds = timeline.getBoundingClientRect();
    const progress = getScrollProgress(bounds.top, bounds.height, window.innerHeight);
    timeline.style.setProperty('--scroll-progress', String(progress));
  }

  function requestUpdate() {
    if (!frame) frame = window.requestAnimationFrame(updateProgress);
  }

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => selectMilestone(index));
    button.addEventListener('keydown', (event) => {
      if (!keyboardKeys.has(event.key)) return;
      event.preventDefault();
      const next = getNextMilestoneIndex(index, event.key, buttons.length);
      selectMilestone(next);
      buttons[next].focus();
    });
  });

  // Enhance only after the complete content and controls are available.
  buttons.forEach((button, index) => {
    button.setAttribute('aria-expanded', String(index === activeIndex));
    panels[index].hidden = index !== activeIndex;
    panels[index].inert = index !== activeIndex;
  });
  timeline.classList.add('is-enhanced');
  initializeDetails(reducedMotion);

  function finishResizing() {
    resizeAnimation?.finish();
    document.querySelectorAll('.details-body').forEach((body) => {
      body.getAnimations().forEach((animation) => animation.finish());
    });
  }

  window.addEventListener('scroll', () => {
    if (!reducedMotion.matches) requestUpdate();
  }, { passive: true });
  window.addEventListener('resize', () => {
    finishResizing();
    requestUpdate();
  });
  reducedMotion.addEventListener('change', () => {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    if (reducedMotion.matches) {
      finishResizing();
      timeline.style.removeProperty('--scroll-progress');
    }
    requestUpdate();
  });
  new ResizeObserver(requestUpdate).observe(timeline);
  requestUpdate();
}

if (typeof document !== 'undefined') initializeTimeline();
