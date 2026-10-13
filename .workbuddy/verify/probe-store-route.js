(() => {
  const out = {};
  out.topUrl = location.href;
  out.title = document.title;
  const f1 = document.getElementById('indexRouteFrame');
  out.f1src = f1 ? f1.getAttribute('src') : null;
  const d1 = f1 && f1.contentDocument;
  const f2 = d1 && d1.getElementById('yundengModuleFrame');
  out.f2src = f2 ? f2.getAttribute('src') : null;
  const d2 = f2 && f2.contentDocument;
  out.f2url = d2 ? d2.location.pathname.split('/').pop() + d2.location.search : null;
  if (d2) {
    const tabs = d2.querySelectorAll('#storeTabs [data-tab]');
    out.storeTabs = Array.from(tabs).map(b => b.dataset.tab + ':' + (b.dataset.active || b.getAttribute('aria-selected') || ''));
    out.cartItems = d2.querySelectorAll('[data-cart-item], .cart-item').length;
  }
  return JSON.stringify(out);
})()
