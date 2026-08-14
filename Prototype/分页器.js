/* 通用分页器组件 JS · 遵循《分页器PRD》规范
 * 用法：
 *   <link rel="stylesheet" href="分页器.css">
 *   <div id="pager"></div>
 *   <script src="分页器.js"></script>
 *   <script>
 *     const pager = new YDPager(document.getElementById('pager'), {
 *       total_count: 12486,
 *       current_page: 1,
 *       page_size: 10,
 *       page_size_options: [10, 20, 50, 100],
 *       onChange(state){
 *         console.log('分页变化', state);
 *       },
 *       toast(msg){ 自定义toast，可选 }
 *     });
 *     // 外部更新总条数：pager.setState({ total_count: 200, current_page: 1 });
 *   </script>
 */
(function (global) {
  const DEFAULT_OPTIONS = {
    total_count: 0,
    current_page: 1,
    page_size: 10,
    page_size_options: [10, 20, 50, 100]
  };

  function calc_total_pages(total_count, page_size) {
    if (!total_count || total_count <= 0) return 1;
    return Math.max(1, Math.ceil(total_count / page_size));
  }

  function format_total_label(total_count) {
    if (total_count > 1000) return '1000+';
    return String(total_count);
  }

  /**
   * 生成页码序列（含省略号 -1 表示）
   * 规则（PRD 5.1）：
   *  - 总页数 <=5：全部展示
   *  - 总页数 >5：根据当前页码显示前几、当前附近、最后一页 + 省略号
   */
  function build_page_sequence(current, total) {
    const seq = [];
    if (total <= 5) {
      for (let i = 1; i <= total; i++) seq.push(i);
      return seq;
    }
    // 总页数>5时：总是展示 1、最后一页；展示当前页附近；中间用 -1(省略号) 过渡
    const push = (v) => { if (seq[seq.length - 1] !== v) seq.push(v); };
    push(1);
    const left = Math.max(2, current - 1);
    const right = Math.min(total - 1, current + 1);
    if (left > 2) push(-1);
    for (let i = left; i <= right; i++) push(i);
    if (right < total - 1) push(-1);
    push(total);
    return seq;
  }

  function is_valid_int(v) {
    return /^\d+$/.test(String(v));
  }

  class YDPager {
    constructor(root, options) {
      this.root = typeof root === 'string' ? document.querySelector(root) : root;
      if (!this.root) throw new Error('[YDPager] 挂载根元素不存在');
      this.options = Object.assign({}, DEFAULT_OPTIONS, options || {});
      // 规范化
      this.options.page_size = Math.max(1, parseInt(this.options.page_size) || 10);
      this.options.current_page = Math.max(1, parseInt(this.options.current_page) || 1);
      this.options.total_count = Math.max(0, parseInt(this.options.total_count) || 0);
      this.options.total_pages = calc_total_pages(this.options.total_count, this.options.page_size);
      if (this.options.current_page > this.options.total_pages) this.options.current_page = this.options.total_pages;
      this._handlers = {};
      this._render();
    }

    /** 外部更新状态 */
    setState(patch, { silent = false } = {}) {
      Object.assign(this.options, patch || {});
      this.options.page_size = Math.max(1, parseInt(this.options.page_size) || 10);
      this.options.total_count = Math.max(0, parseInt(this.options.total_count) || 0);
      this.options.total_pages = calc_total_pages(this.options.total_count, this.options.page_size);
      this.options.current_page = Math.max(1, Math.min(
        parseInt(this.options.current_page) || 1,
        this.options.total_pages
      ));
      this._render();
      if (!silent && this.options.onChange) {
        this.options.onChange(this.getState());
      }
    }

    getState() {
      return {
        current_page: this.options.current_page,
        page_size: this.options.page_size,
        total_count: this.options.total_count,
        total_pages: this.options.total_pages
      };
    }

    destroy() {
      this.root.innerHTML = '';
      this._handlers = {};
    }

    _toast(msg) {
      if (typeof this.options.toast === 'function') { this.options.toast(msg); return; }
      // 兜底 toast：与项目现有 toastBox 结构兼容
      let box = document.getElementById('toastBox');
      if (!box) {
        box = document.createElement('div');
        box.id = 'toastBox';
        Object.assign(box.style, {
          position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 10000, background: '#1A1D24', color: '#fff', padding: '8px 16px',
          borderRadius: '4px', fontSize: '13px', display: 'none'
        });
        document.body.appendChild(box);
      }
      box.textContent = msg;
      box.style.display = 'block';
      clearTimeout(this._toastT);
      this._toastT = setTimeout(() => { box.style.display = 'none'; }, 1800);
    }

    _fireChange() {
      if (typeof this.options.onChange === 'function') {
        this.options.onChange(this.getState());
      }
    }

    _goToPage(page, { fromJumpInput = false } = {}) {
      page = parseInt(page);
      if (!is_valid_int(page) || isNaN(page)) {
        if (fromJumpInput) this._toast('请输入有效页码');
        return { ok: false, reason: 'invalid' };
      }
      if (page < 1 || page > this.options.total_pages) {
        if (fromJumpInput) this._toast('页码超出范围');
        return { ok: false, reason: 'out_of_range' };
      }
      if (page === this.options.current_page) return { ok: true };
      this.options.current_page = page;
      this._render();
      this._fireChange();
      if (fromJumpInput) this._toast('跳转成功');
      return { ok: true };
    }

    _onSizeChange(newSize) {
      newSize = parseInt(newSize);
      if (newSize === this.options.page_size) return;
      this.options.page_size = newSize;
      this.options.total_pages = calc_total_pages(this.options.total_count, this.options.page_size);
      this.options.current_page = 1; // 切换每页条数时重置到第一页（PRD 5.2.3）
      this._render();
      this._fireChange();
    }

    _render() {
      // 清理旧事件绑定引用
      this._handlers = {};
      const { current_page, page_size, total_count, total_pages } = this.options;
      const page_seq = build_page_sequence(current_page, total_pages);

      // === 核心分页导航区 ===
      let nav_html = '<div class="yd-pager-nav">';
      // 上一页
      nav_html += `<button type="button" class="yd-pager-btn is-icon" data-act="prev" aria-label="上一页" ${current_page === 1 ? 'disabled' : ''}>` +
        `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>` +
        `</button>`;
      // 页码 + 省略号
      page_seq.forEach((p) => {
        if (p === -1) {
          nav_html += `<span class="yd-pager-ellipsis">···</span>`;
        } else {
          const is_active = p === current_page;
          nav_html += `<button type="button" class="yd-pager-btn ${is_active ? 'is-active' : ''}" data-act="page" data-page="${p}" ${is_active ? 'disabled' : ''}>${p}</button>`;
        }
      });
      // 下一页
      nav_html += `<button type="button" class="yd-pager-btn is-icon" data-act="next" aria-label="下一页" ${current_page === total_pages ? 'disabled' : ''}>` +
        `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>` +
        `</button>`;
      nav_html += '</div>';

      // === 每页条数选择区 ===
      let size_html = '<div class="yd-pager-size"><select data-act="size" aria-label="每页显示条数">';
      (this.options.page_size_options || []).forEach((n) => {
        size_html += `<option value="${n}" ${n === page_size ? 'selected' : ''}>${n}条/页</option>`;
      });
      size_html += '</select></div>';

      // === 跳转与数据统计区 ===
      const total_label = format_total_label(total_count);
      // jump error tip: 初始空
      const right_html = `<div class="yd-pager-right">` +
        `<div class="yd-pager-jump">` +
        `<span>跳至</span>` +
        `<input type="text" inputmode="numeric" data-act="jump" value="1" aria-label="跳转页码">` +
        `<span>页</span>` +
        `<span class="yd-pager-error-tip" data-act="jump-err"></span>` +
        `</div>` +
        `<div class="yd-pager-stats">共<b>${total_label}</b>条记录 第<b>${current_page}</b>/<b>${total_pages}</b>页</div>` +
        `</div>`;

      this.root.className = (this.root.className ? this.root.className + ' ' : '') + 'yd-pagination';
      this.root.setAttribute('data-yd-pager', '');
      this.root.innerHTML = nav_html + size_html + right_html;

      // 事件绑定
      this._bind();
    }

    _bind() {
      const root = this.root;
      // 页码按钮（prev/next/page）
      root.addEventListener('click', this._h_click = (e) => {
        const btn = e.target.closest('button[data-act]');
        if (!btn) return;
        const act = btn.dataset.act;
        if (act === 'prev') this._goToPage(this.options.current_page - 1);
        else if (act === 'next') this._goToPage(this.options.current_page + 1);
        else if (act === 'page') this._goToPage(btn.dataset.page);
      });
      // 每页条数
      const sizeSel = root.querySelector('select[data-act="size"]');
      if (sizeSel) {
        sizeSel.addEventListener('change', this._h_size = (e) => {
          this._onSizeChange(e.target.value);
        });
      }
      // 跳转输入框
      const jumpInput = root.querySelector('input[data-act="jump"]');
      const jumpErr = root.querySelector('[data-act="jump-err"]');
      if (jumpInput) {
        jumpInput.addEventListener('keydown', this._h_jump_key = (e) => {
          if (e.key === 'Enter') {
            const v = (jumpInput.value || '').trim();
            // 校验
            let err = '';
            if (!is_valid_int(v)) err = '请输入有效页码';
            else {
              const n = parseInt(v);
              if (n < 1 || n > this.options.total_pages) err = '页码超出范围';
            }
            jumpErr.textContent = err;
            if (err) {
              jumpInput.classList.add('is-error');
              this._toast(err);
              return;
            }
            jumpInput.classList.remove('is-error');
            const r = this._goToPage(v, { fromJumpInput: true });
            if (r.ok) { jumpInput.value = '1'; }
          }
        });
        jumpInput.addEventListener('input', this._h_jump_input = () => {
          jumpInput.classList.remove('is-error');
          if (jumpErr) jumpErr.textContent = '';
        });
      }
    }
  }

  global.YDPager = YDPager;
})(typeof window !== 'undefined' ? window : this);
