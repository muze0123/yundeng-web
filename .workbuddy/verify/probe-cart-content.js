(() => {
  const f1 = document.getElementById('indexRouteFrame');
  const d1 = f1 && f1.contentDocument;
  const ov = d1 && d1.getElementById('yundengOnboardingOverlay');
  if (ov) ov.remove();
  const f2 = d1 && d1.getElementById('yundengModuleFrame');
  const d2 = f2 && f2.contentDocument;
  if (!d2) return JSON.stringify({ ok: false, reason: 'no module frame' });
  const rows = d2.querySelectorAll('tbody tr').length;
  const txt = (d2.body.innerText || '').replace(/\s+/g, ' ').slice(0, 260);
  const summary = d2.querySelector('#cartSummary, .cart-summary');
  return JSON.stringify({ ok: true, rows, summaryText: summary ? (summary.innerText || '').replace(/\s+/g, ' ').slice(0, 160) : null, txt });
})()
