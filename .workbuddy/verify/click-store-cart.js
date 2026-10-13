(() => {
  const f1 = document.getElementById('indexRouteFrame');
  const d1 = f1 && f1.contentDocument;
  const f2 = d1 && d1.getElementById('yundengModuleFrame');
  const d2 = f2 && f2.contentDocument;
  if (!d2) return JSON.stringify({ ok: false, reason: 'no module frame' });
  const tab = d2.querySelector('#storeTabs [data-tab="cart"]');
  if (!tab) return JSON.stringify({ ok: false, reason: 'no cart tab' });
  tab.click();
  return JSON.stringify({ ok: true, clicked: 'cart' });
})()
