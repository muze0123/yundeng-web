(() => {
  var f1, f2;
  return new Promise(function (resolve, fail) {
    var t = 0;
    (function poll() {
      f1 = document.querySelector('#indexRouteFrame');
      f2 = f1 && f1.contentDocument && f1.contentDocument.querySelector('#yundengModuleFrame');
      /* 模块文档就绪 ≠ 业务 DOM 就绪：等到目标元素真正挂载再继续 */
      if (f2 && f2.contentDocument && f2.contentDocument.querySelector('#duplicateOptionWrap')) {
        return resolve({ mid: f1.contentDocument, mod: f2.contentDocument });
      }
      if (++t > 80) return fail('frames not ready');
      setTimeout(poll, 250);
    })();
  }).then(function (F) {
    var d2 = F.mod, w = d2.defaultView;
    var R = [];
    var ok = function (cond, msg) { R.push((cond ? 'PASS ' : 'FAIL ') + msg); };
    var $ = function (s) { return d2.querySelector(s); };
    var ov = F.mid.getElementById('yundengOnboardingOverlay');
    if (ov) ov.remove();
    F.mid.body.className = F.mid.body.className.replace(/yundeng-onboarding-[a-z]+/g, '').trim();

    var wrapVisible = function () { return !$('#duplicateOptionWrap').classList.contains('hidden'); };
    var checked = function () { return $('#detectDuplicate').checked; };
    var setRadio = function (group, value) {
      var r = [...d2.querySelectorAll('input[name="' + group + '"]')].find(function (x) { return x.value === value; });
      r.closest('.net-card').click();
    };
    var sleep = function (ms) { return new Promise(function (s) { setTimeout(s, ms); }); };
    var verdictText = function () {
      var el = $('#singleDetectBody .detect-verdict');
      return el ? el.textContent.trim() : '(无)';
    };
    var verdictColor = function () {
      var el = $('#singleDetectBody .detect-verdict');
      return el ? w.getComputedStyle(el).color : '(无)';
    };
    var toastInfo = function () {
      var el = $('.device-toast');
      if (!el) return { text: '(无 Toast)' };
      return { text: el.textContent.trim(), role: el.getAttribute('role') };
    };
    var clickCheckbox = function () { $('#detectDuplicate').click(); };
    var fill = function (id, value) {
      var el = $('#' + id);
      el.value = value;
      el.dispatchEvent(new w.Event('input', { bubbles: true }));
    };

    return (async function () {
      /* ① 单个添加 · 静态：排选项可见（原有行为不回退） */
      ok(wrapVisible(), '① 单个添加-静态：「校验重复项」在操作栏左侧可见');
      ok(!checked(), '① 勾选框默认未勾选');

      /* ② 勾选后切到动态：选项仍可见、勾选保留 */
      clickCheckbox();
      ok(checked(), '② 静态下可勾选');
      setRadio('network', '动态');
      await sleep(120);
      ok(wrapVisible(), '② 切到动态后「校验重复项」仍可见');
      ok(checked(), '② 切到动态后勾选状态保留');
      setRadio('network', '静态');
      await sleep(120);
      ok(checked(), '② 切回静态勾选仍保留（未被清空）');

      /* ③ 动态 · 提取链接命中已有样本：检测结果标「设备重复」，提交被拦截 */
      setRadio('network', '动态');
      await sleep(120);
      fill('deviceName', '动态重复验证');
      fill('extractUrl', 'https://api.example.test/token');
      $('#detectSingle').click();
      await sleep(1100);
      R.push('③ 检测结论=' + verdictText() + ' 颜色=' + verdictColor());
      ok(verdictText() === '设备重复', '③ 动态命中已有提取链接时检测结论为「设备重复」');
      ok(verdictColor() === 'rgb(231, 119, 45)', '③ 重复态用 warning 橙 #E7772D（与静态一致）');
      $('#submitBtn').click();
      await sleep(200);
      R.push('③ Toast=' + JSON.stringify(toastInfo()));
      ok(toastInfo().text.indexOf('禁止添加') >= 0, '③ 动态提交命中重复被拦截并 Toast 提示');
      ok(toastInfo().role === 'alert', '③ 拦截 Toast 为 danger（role=alert）');
      ok(!$('#submitBtn').disabled, '③ 拦截后提交按钮未被禁用（可修正后重试）');
      ok(!!$('#deviceName') && !!$('#submitBtn'), '③ 拦截后仍停留在添加设备页（表单未被卸载）');

      /* ④ 动态 · 未命中样本：检测成功，不误伤 */
      /* 原型「可连通」按链接长度奇偶模拟（既有规则）：此处取偶数长度链接以走成功分支 */
      fill('extractUrl', 'https://api.example.test/fresh-one');
      $('#detectSingle').click();
      await sleep(1100);
      R.push('④ 检测结论=' + verdictText());
      ok(verdictText() === '检测成功', '④ 动态未命中样本时正常检测成功（不误判重复）');

      /* ⑤ 大小写 / 空格不敏感（与静态同一口径） */
      fill('extractUrl', '  HTTPS://API.EXAMPLE.TEST/TOKEN  ');
      $('#detectSingle').click();
      await sleep(1100);
      R.push('⑤ 检测结论=' + verdictText());
      ok(verdictText() === '设备重复', '⑤ 提取链接大小写 / 首尾空格不敏感');

      /* ⑥ 取消勾选后同一链接不再判重 */
      clickCheckbox();
      fill('extractUrl', 'https://api.example.test/token');
      $('#detectSingle').click();
      await sleep(1100);
      R.push('⑥ 检测结论=' + verdictText());
      ok(verdictText() !== '设备重复', '⑥ 取消勾选后同一提取链接不再判为重复');

      /* ⑦ 静态回归：主机:端口 命中样本仍然拦截 */
      setRadio('network', '静态');
      await sleep(120);
      clickCheckbox();
      fill('deviceName', '静态重复验证');
      fill('deviceHost', '203.0.113.21');
      fill('devicePort', '8000');
      $('#detectSingle').click();
      await sleep(1100);
      R.push('⑦ 检测结论=' + verdictText());
      ok(verdictText() === '设备重复', '⑦ 静态按 主机:端口 判重未回退');
      $('#submitBtn').click();
      await sleep(200);
      R.push('⑦ Toast=' + JSON.stringify(toastInfo()));
      ok(toastInfo().text.indexOf('禁止添加') >= 0, '⑦ 静态重复提交仍被拦截');

      /* ⑧ 未选择网络属性：隐藏并清空勾选 */
      var radios = [...d2.querySelectorAll('input[name="network"]')];
      radios.forEach(function (r) { r.checked = false; });
      radios[0].dispatchEvent(new w.Event('change', { bubbles: true }));
      await sleep(150);
      ok(!wrapVisible(), '⑧ 未选择网络属性时「校验重复项」不展示');
      ok(!checked(), '⑧ 未选择网络属性时勾选被清空');

      /* ⑨ 气泡文案与批量侧逐字一致 */
      setRadio('network', '静态');
      await sleep(120);
      var tips = [...d2.querySelectorAll('.dup-tip')].map(function (el) { return el.textContent.trim(); });
      R.push('⑨ 气泡份数=' + tips.length + ' 去重后=' + new Set(tips).size);
      ok(new Set(tips).size === 1, '⑨ 两处气泡文案逐字一致');
      ok(tips[0].indexOf('自有设备列表') >= 0, '⑨ 气泡比对目标仍为「自有设备列表」（动态设备同属该列表）');

      return R.join('\n');
    })();
  });
})()
