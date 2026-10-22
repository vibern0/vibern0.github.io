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

function initializeTimeline() {
  const timeline = document.querySelector('[data-timeline]');
  if (!timeline) return;

  const stops = [...timeline.querySelectorAll('[data-stop]')];
  const buttons = stops.map((stop) => stop.querySelector('.milestone'));
  const panels = buttons.map((button) => document.getElementById(button.getAttribute('aria-controls')));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileLayout = window.matchMedia('(max-width: 700px)');
  const keyboardKeys = new Set(['Home', 'End', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp']);
  let activeIndex = Math.max(0, stops.findIndex((stop) => stop.hasAttribute('data-initial')));
  let frame = 0;

  function selectMilestone(index, keepPosition = true) {
    const previousTop = buttons[index].getBoundingClientRect().top;
    activeIndex = index;

    buttons.forEach((button, current) => {
      const selected = current === activeIndex;
      button.setAttribute('aria-expanded', String(selected));
      panels[current].hidden = !selected;
    });

    // Keep a tapped milestone in place when a panel above it collapses.
    if (keepPosition && mobileLayout.matches) {
      const offset = buttons[index].getBoundingClientRect().top - previousTop;
      if (offset !== 0) window.scrollBy({ top: offset, behavior: 'instant' });
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
      selectMilestone(next, false);
      buttons[next].focus();
    });
  });

  // Enhance only after the complete content and controls are available.
  buttons.forEach((button, index) => {
    button.setAttribute('aria-expanded', String(index === activeIndex));
    panels[index].hidden = index !== activeIndex;
  });
  timeline.classList.add('is-enhanced');

  window.addEventListener('scroll', () => {
    if (!reducedMotion.matches) requestUpdate();
  }, { passive: true });
  window.addEventListener('resize', requestUpdate);
  reducedMotion.addEventListener('change', () => {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    if (reducedMotion.matches) timeline.style.removeProperty('--scroll-progress');
    requestUpdate();
  });
  new ResizeObserver(requestUpdate).observe(timeline);
  requestUpdate();
}

if (typeof document !== 'undefined') initializeTimeline();
