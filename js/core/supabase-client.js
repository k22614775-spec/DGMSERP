/**
 * js/core/supabase-client.js
 * ─────────────────────────────────────────────────────────────
 * Supabase 連線初始化 + 共用 CRUD helpers
 *
 * 依循 supabase-case-rule：
 *   Rule 1  filter 鍵名使用資料庫欄位原名（中文保留原字）
 *   Rule 3  safe getter g(row, col) 避免 null/undefined
 *   Rule 4  upsert payload 使用原始欄位名稱
 * ─────────────────────────────────────────────────────────────
 * 依賴：js/core/config.js（必須先載入，提供 window.CFG）
 * 暴露：window.SB, window.initSB, window.apiGet,
 *        window.apiUpsert, window.apiDelete, window.g
 * ─────────────────────────────────────────────────────────────
 */

/** Supabase client 實例（未連線時為 null）*/
window.SB = null;

/**
 * 初始化 Supabase client
 * @returns {boolean} 成功回傳 true，CFG 不完整回傳 false
 */
window.initSB = function initSB() {
  const { url, key } = window.CFG;
  if (!url || !key) { window.SB = null; return false; }
  try {
    window.SB = window.supabase.createClient(url, key, {
      auth: { persistSession: false },
    });
    return true;
  } catch (e) {
    window.SB = null;
    return false;
  }
};

/**
 * 讀取資料表
 * @param {string} table   - 資料表名稱
 * @param {Object} filters - 過濾條件，key 為欄位名（中文），value 格式：
 *     'eq.<值>'     → .eq(k, 值)
 *     'ilike.<值>'  → .ilike(k, 值)
 *     '_order'      → .order(值)
 *     其他          → .eq(k, 值)
 * @param {number} limit   - 最多筆數（預設 5000）
 * @returns {Promise<Array>}
 */
window.apiGet = async function apiGet(table, filters = {}, limit = 5000) {
  if (!window.SB) throw new Error('未連線 Supabase');
  let q = window.SB.from(table).select('*').limit(limit);
  for (const [k, v] of Object.entries(filters)) {
    if (k === '_order') { q = q.order(v); continue; }
    if (typeof v === 'string' && v.startsWith('eq.'))    { q = q.eq(k, v.slice(3));    continue; }
    if (typeof v === 'string' && v.startsWith('ilike.')) { q = q.ilike(k, v.slice(6)); continue; }
    q = q.eq(k, v);
  }
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
};

/**
 * 新增或更新（依 pk 衝突）
 * @param {string}       table - 資料表名稱
 * @param {Object|Array} rows  - 單筆或多筆，欄位名使用 DB 原名
 * @param {string}       pk    - 主鍵欄位名稱
 * @returns {Promise<any>}
 */
window.apiUpsert = async function apiUpsert(table, rows, pk) {
  if (!window.SB) throw new Error('未連線 Supabase');
  const arr = Array.isArray(rows) ? rows : [rows];
  const { data, error } = await window.SB.from(table).upsert(arr, { onConflict: pk });
  if (error) throw error;
  return data;
};

/**
 * 刪除符合條件的列
 * @param {string} table  - 資料表名稱
 * @param {Object} filter - 條件物件，e.g. { '型號': 'ABC' }
 * @returns {Promise<void>}
 */
window.apiDelete = async function apiDelete(table, filter) {
  if (!window.SB) throw new Error('未連線 Supabase');
  let q = window.SB.from(table).delete();
  for (const [k, v] of Object.entries(filter)) q = q.eq(k, v);
  const { error } = await q;
  if (error) throw error;
};

/**
 * Safe getter（Rule 3）
 * 防止 null / undefined 導致渲染錯誤
 * @param {Object} row - 資料列物件
 * @param {string} col - 欄位名稱
 * @returns {string|number}
 */
window.g = function g(row, col) {
  if (!row) return '';
  const v = row[col];
  return (v === null || v === undefined) ? '' : v;
};
