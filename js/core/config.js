/**
 * js/core/config.js
 * ─────────────────────────────────────────────────────────────
 * 全域設定物件 CFG + localStorage 存取工具
 * 所有模組透過 window.CFG 讀取 Supabase 連線資訊
 * ─────────────────────────────────────────────────────────────
 */

/** localStorage 讀取，帶預設值 */
const LS  = (k, def = '') => localStorage.getItem(k) || def;
/** localStorage 寫入 */
const LSS = (k, v)        => localStorage.setItem(k, v);

/**
 * 全域連線設定
 * 各資料表名稱由各模組自行管理，這裡只存共用的 URL / KEY
 */
window.CFG = {
  url: LS('erp_url'),
  key: LS('erp_key'),

  /** 重新從 localStorage 讀取（設定畫面儲存後呼叫） */
  reload() {
    this.url = LS('erp_url');
    this.key = LS('erp_key');
  },

  /** 儲存 URL / KEY 到 localStorage */
  save(url, key) {
    LSS('erp_url', url);
    LSS('erp_key', key);
    this.url = url;
    this.key = key;
  },
};

window.LS  = LS;
window.LSS = LSS;
