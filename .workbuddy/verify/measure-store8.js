(() => {
  const idx = document.getElementById('indexRouteFrame');
  const sf = idx && idx.contentDocument;
  const mod = sf && sf.getElementById('yundengModuleFrame');
  const d = mod && mod.contentDocument;
  if (!d) return JSON.stringify({ err: 'no module doc' });

  // 移除引导浮层，避免遮挡/影响布局
  const kill = (root) => {
    if (!root) return;
    const el = root.getElementById && root.getElementById('yundengOnboardingOverlay');
    if (el) el.remove();
    root.querySelectorAll && root.querySelectorAll('[data-onboarding],[class*="onboarding"]').forEach(n => n.remove());
  };
  kill(d); kill(sf); kill(document);

  const R = el => { if (!el) return null; const b = el.getBoundingClientRect(); return { l: Math.round(b.left), r: Math.round(b.right), t: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) }; };
  const cs = (el, p) => el ? getComputedStyle(el)[p] : null;
  const out = {};

  // 1. 类型参数
  out.typeButtons = [...d.querySelectorAll('#proxyTypeOptions .segment-button')]
    .map(s => ({ txt: s.textContent.trim(), ...R(s) }));

  // 2. 地区区块对齐
  const regionCard = d.getElementById('proxyRegionCard');
  const rLabel = d.querySelector('#proxyRegionCard .field-label');
  const rOpts = d.querySelector('#proxyRegionCard .region-options');
  const rLine = d.querySelector('#proxyRegionCard .region-line');
  const rPrefix = d.querySelector('#proxyRegionCard .region-prefix');
  const rChip = d.querySelector('#continentOptions .option-chip');
  out.region = {
    label: R(rLabel), options: R(rOpts), line1: R(rLine), prefix: R(rPrefix), firstChip: R(rChip),
    optsMarginLeft: cs(rOpts, 'marginLeft'),
    lineCols: cs(rLine, 'gridTemplateColumns'),
    visible: regionCard ? !regionCard.classList.contains('hidden') : null
  };
  // 对齐基准：类型参数首个按钮 left  vs  地区 chips left  vs  地区整块 left
  out.align = {
    typeParamLeft: out.typeButtons[0] ? out.typeButtons[0].l : null,
    regionOptionsLeft: out.region.options ? out.region.options.l : null,
    regionChipLeft: out.region.firstChip ? out.region.firstChip.l : null
  };

  // 3. 套餐区块
  const planCard = d.getElementById('proxyPlanCard');
  const grid = d.getElementById('resourceGrid');
  const cards = [...d.querySelectorAll('#resourceGrid .resource-card')];
  out.plan = {
    cardVisible: planCard ? !planCard.classList.contains('hidden') : null,
    card: R(planCard), grid: R(grid),
    gridAutoRows: cs(grid, 'gridAutoRows'),
    gridCols: cs(grid, 'gridTemplateColumns'),
    gridAlignContent: cs(grid, 'alignContent'),
    planControlWrap: cs(d.querySelector('.plan-control'), 'flexWrap'),
    count: cards.length,
    cards: cards.map(c => ({ txt: c.textContent.trim().replace(/\s+/g, ' ').slice(0, 24), ...R(c) }))
  };
  // 卡片下方残余空白 = 区块内容底 - 最后一张卡底
  if (cards.length && planCard) {
    const cardInnerBottom = planCard.getBoundingClientRect().bottom - parseFloat(cs(planCard, 'paddingBottom') || 0);
    const lastBottom = Math.max(...cards.map(c => c.getBoundingClientRect().bottom));
    out.plan.gapBelowLastCard = Math.round(cardInnerBottom - lastBottom);
  }
  // 卡片高宽分布
  out.plan.heights = [...new Set(out.plan.cards.map(c => c.h))];
  out.plan.widths = [...new Set(out.plan.cards.map(c => c.w))];

  // 4. 页面总高
  out.docHeight = Math.round(d.documentElement.scrollHeight);
  return JSON.stringify(out, null, 1);
})()
