(function () {
  'use strict';

  const toggle = document.getElementById('annoToggle');
  const getRender = () => {
    if (typeof renderAnnoBadges === 'function') return renderAnnoBadges;
    if (typeof renderAnno === 'function') return renderAnno;
    return null;
  };
  if (!toggle || !getRender()) return;

  const storageKey = `yundeng-annotation-toggle:${location.pathname.split('/').pop()}`;
  const longPressDelay = 350;
  const moveTolerance = 6;
  let pointerId = null;
  let startY = 0;
  let startTop = 0;
  let pressTimer = null;
  let dragging = false;
  let suppressClick = false;

  toggle.style.touchAction = 'none';
  toggle.style.userSelect = 'none';
  toggle.style.cursor = 'grab';
  toggle.setAttribute('aria-label', '显示交互标注，长按可调整纵向位置');
  toggle.title = '点击显示标注，长按调整位置';

  function render() {
    getRender()?.();
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), Math.max(min, max));
  }

  function place(top) {
    const rect = toggle.getBoundingClientRect();
    const safeTop = clamp(top, 8, innerHeight - rect.height - 8);
    toggle.style.left = 'auto';
    toggle.style.right = '8px';
    toggle.style.top = `${safeTop}px`;
    return safeTop;
  }

  function syncState() {
    toggle.setAttribute('aria-pressed', String(annoVisible));
    toggle.dataset.annotationVisible = String(annoVisible);
    toggle.title = annoVisible ? '点击隐藏标注，长按调整位置' : '点击显示标注，长按调整位置';
    const label = toggle.querySelector('span');
    if (label) label.textContent = annoVisible ? '隐藏标注' : '显示标注';
  }

  function restorePosition() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      if (Number.isFinite(saved.top)) place(saved.top);
    } catch (_) {}
  }

  function clearPressTimer() {
    clearTimeout(pressTimer);
    pressTimer = null;
  }

  toggle.onclick = null;
  toggle.addEventListener('pointerdown', event => {
    if (event.button !== undefined && event.button !== 0) return;
    pointerId = event.pointerId;
    startY = event.clientY;
    startTop = toggle.getBoundingClientRect().top;
    dragging = false;
    suppressClick = false;
    clearPressTimer();
    pressTimer = setTimeout(() => {
      if (pointerId !== event.pointerId) return;
      dragging = true;
      toggle.style.cursor = 'grabbing';
      toggle.setPointerCapture?.(pointerId);
    }, longPressDelay);
  });

  toggle.addEventListener('pointermove', event => {
    if (event.pointerId !== pointerId) return;
    const deltaY = event.clientY - startY;
    if (!dragging) {
      if (Math.abs(deltaY) > moveTolerance) {
        clearPressTimer();
        suppressClick = true;
      }
      return;
    }
    event.preventDefault();
    place(startTop + deltaY);
    render();
  });

  function finishPointer(event) {
    if (event.pointerId !== pointerId) return;
    clearPressTimer();
    if (dragging) {
      const top = place(toggle.getBoundingClientRect().top);
      try { localStorage.setItem(storageKey, JSON.stringify({ top })); } catch (_) {}
      suppressClick = true;
    }
    toggle.releasePointerCapture?.(pointerId);
    pointerId = null;
    dragging = false;
    toggle.style.cursor = 'grab';
  }

  toggle.addEventListener('pointerup', finishPointer);
  toggle.addEventListener('pointercancel', finishPointer);
  toggle.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    annoVisible = !annoVisible;
    syncState();
    render();
  }, true);

  toggle.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    annoVisible = !annoVisible;
    syncState();
    render();
  });

  addEventListener('resize', () => {
    place(toggle.getBoundingClientRect().top);
    render();
  });

  annoVisible = false;
  restorePosition();
  syncState();
  requestAnimationFrame(render);
})();
