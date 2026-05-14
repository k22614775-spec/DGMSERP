/**
 * js/core/ui-helpers.js
 * ─────────────────────────────────────────────────────────────
 * 通用 DOM 工具：顯示/隱藏、狀態列更新、dirty 旗標
 * 各模組可直接呼叫；元素 ID 由呼叫端指定
 * ─────────────────────────────────────────────────────────────
 * 暴露（掛在 window 上供全域使用）：
 *   show(id)           顯示元素（移除 display:none）
 *   hide(id)           隱藏元素（設 display:none）
 *   toggle(id)         切換顯示/隱藏
 *   el(id)             等同 document.getElementById
 *   setErpStatus(msg)  更新 ERP 主狀態列（#erp-status-msg）
 *   setModStatus(panelEl, msg)  更新模組內狀態列（.mod-status-msg）
 *   setCount(n, id?)   更新筆數顯示（預設 #row-count）
 *   markDirty(set, idx, flagId?)  加入 dirty 集合並顯示旗標
 *   clearDirty(set, flagId?)      清空 dirty 集合並隱藏旗標
 *   confirm2(msg)      回傳 Promise<boolean>，顯示原生 confirm
 * ─────────────────────────────────────────────────────────────
 */

/** 取得 DOM 元素（不存在時回傳 null 而非拋錯） */
window.el = (id) => document.getElementById(id);

/** 顯示元素 */
window.show = (id) => {
  const e = typeof id === 'string' ? window.el(id) : id;
  if (e) e.style.display = '';
};

/** 隱藏元素 */
window.hide = (id) => {
  const e = typeof id === 'string' ? window.el(id) : id;
  if (e) e.style.display = 'none';
};

/** 切換顯示 */
window.toggle = (id) => {
  const e = typeof id === 'string' ? window.el(id) : id;
  if (!e) return;
  e.style.display = e.style.display === 'none' ? '' : 'none';
};

/**
 * 更新 ERP 主狀態列
 * （index.html 的 #erp-status-msg span）
 */
window.setErpStatus = (msg) => {
  const e = window.el('erp-status-msg');
  if (e) e.textContent = msg;
};

/**
 * 更新模組內狀態列
 * @param {HTMLElement|string} panel - 模組面板元素或模組 key
 * @param {string} msg
 */
window.setModStatus = (panel, msg) => {
  const root = typeof panel === 'string'
    ? window.el(`panel-${panel}`)
    : panel;
  if (!root) return;
  const e = root.querySelector('.mod-status-msg');
  if (e) e.textContent = msg;
};

/**
 * 更新筆數顯示
 * @param {number} n
 * @param {string} [id='row-count'] - 目標元素 ID
 */
window.setCount = (n, id = 'row-count') => {
  const e = window.el(id);
  if (e) e.textContent = `共 ${n} 筆`;
};

/**
 * 標記資料列為 dirty（有未儲存變更）
 * @param {Set}    dirtySet - 模組自己的 dirty Set
 * @param {number} idx      - 資料列索引
 * @param {string} [flagId='dirty-flag'] - 旗標元素 ID
 */
window.markDirty = (dirtySet, idx, flagId = 'dirty-flag') => {
  dirtySet.add(idx);
  const e = window.el(flagId);
  if (e) e.style.display = '';
};

/**
 * 清空 dirty 旗標
 * @param {Set}    dirtySet
 * @param {string} [flagId='dirty-flag']
 */
window.clearDirty = (dirtySet, flagId = 'dirty-flag') => {
  dirtySet.clear();
  const e = window.el(flagId);
  if (e) e.style.display = 'none';
};

/**
 * 非同步 confirm（包裝 window.confirm，方便未來改為自訂 modal）
 * @param {string} msg
 * @returns {Promise<boolean>}
 */
window.confirm2 = (msg) => Promise.resolve(window.confirm(msg));

/**
 * 顯示短暫的 toast 訊息（右下角淡入淡出）
 * @param {string} msg
 * @param {'info'|'ok'|'error'} [type='info']
 * @param {number} [ms=2500] - 顯示毫秒數
 */
window.toast = (() => {
  let _wrap = null;
  function getWrap() {
    if (_wrap) return _wrap;
    _wrap = document.createElement('div');
    _wrap.id = 'erp-toast-wrap';
    Object.assign(_wrap.style, {
      position: 'fixed', bottom: '28px', right: '12px',
      zIndex: '9999', display: 'flex', flexDirection: 'column',
      gap: '4px', pointerEvents: 'none',
    });
    document.body.appendChild(_wrap);
    return _wrap;
  }
  return function toast(msg, type = 'info', ms = 2500) {
    const colors = { info: '#1a3060', ok: '#006400', error: '#8b0000' };
    const wrap = getWrap();
    const t = document.createElement('div');
    Object.assign(t.style, {
      background: colors[type] || colors.info,
      color: '#fff', padding: '4px 12px', fontSize: '12px',
      fontFamily: 'inherit', borderRadius: '2px',
      boxShadow: '1px 1px 4px rgba(0,0,0,.4)',
      opacity: '1', transition: 'opacity 0.3s',
    });
    t.textContent = msg;
    wrap.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 350); }, ms);
  };
})();
