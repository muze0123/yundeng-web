(function () {
  const toggle = document.getElementById('annoToggle');
  if (!toggle || typeof renderAnno !== 'function') return;

  const storageKey = `yundeng-annotation-toggle:${location.pathname.split('/').pop()}`;
  const dragThreshold = 5;
  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;
  let dragged = false;

  toggle.style.touchAction = 'none';
  toggle.style.userSelect = 'none';
  toggle.style.cursor = 'grab';
  toggle.setAttribute('aria-label', '显示或隐藏交互标注；可拖拽移动');

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), Math.max(min, max));
  }

  function place(left, top) {
    const rect = toggle.getBoundingClientRect();
    const safeLeft = clamp(left, 8, innerWidth - rect.width - 8);
    const safeTop = clamp(top, 8, innerHeight - rect.height - 8);
    toggle.style.left = `${safeLeft}px`;
    toggle.style.top = `${safeTop}px`;
    toggle.style.right = 'auto';
    return { left: safeLeft, top: safeTop };
  }

  function syncState() {
    toggle.setAttribute('aria-pressed', String(annoVisible));
    toggle.dataset.annotationVisible = String(annoVisible);
    toggle.classList.toggle('opacity-60', !annoVisible);
    toggle.classList.toggle('shadow-lg', annoVisible);
    toggle.title = annoVisible ? '隐藏交互标注（可拖拽）' : '显示交互标注（可拖拽）';
    const label = toggle.querySelector('span');
    if (label) label.textContent = annoVisible ? '隐藏标注' : '显示标注';
  }

  function restorePosition() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (Number.isFinite(saved?.left) && Number.isFinite(saved?.top)) place(saved.left, saved.top);
    } catch (_) {}
  }

  toggle.onclick = null;
  toggle.addEventListener('pointerdown', event => {
    if (event.button !== undefined && event.button !== 0) return;
    pointerId = event.pointerId;
    const rect = toggle.getBoundingClientRect();
    startX = event.clientX;
    startY = event.clientY;
    startLeft = rect.left;
    startTop = rect.top;
    dragged = false;
    toggle.style.cursor = 'grabbing';
    toggle.setPointerCapture?.(pointerId);
    event.preventDefault();
  });

  toggle.addEventListener('pointermove', event => {
    if (event.pointerId !== pointerId) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (!dragged && Math.hypot(dx, dy) < dragThreshold) return;
    dragged = true;
    place(startLeft + dx, startTop + dy);
    renderAnno();
  });

  function finishDrag(event) {
    if (event.pointerId !== pointerId) return;
    toggle.releasePointerCapture?.(pointerId);
    pointerId = null;
    toggle.style.cursor = 'grab';
    if (dragged) {
      const rect = toggle.getBoundingClientRect();
      try { localStorage.setItem(storageKey, JSON.stringify({ left: rect.left, top: rect.top })); } catch (_) {}
    }
  }

  toggle.addEventListener('pointerup', finishDrag);
  toggle.addEventListener('pointercancel', finishDrag);
  toggle.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (dragged) {
      dragged = false;
      return;
    }
    annoVisible = !annoVisible;
    syncState();
    renderAnno();
  }, true);

  toggle.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    annoVisible = !annoVisible;
    syncState();
    renderAnno();
  });

  addEventListener('resize', () => {
    const rect = toggle.getBoundingClientRect();
    place(rect.left, rect.top);
    renderAnno();
  });

  restorePosition();
  syncState();
  requestAnimationFrame(renderAnno);
})();
