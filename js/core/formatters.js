/**
 * js/core/formatters.js
 * ─────────────────────────────────────────────────────────────
 * 格式化工具函式（日期、數字、儲存格）
 * 各模組共用；不依賴任何其他模組
 * ─────────────────────────────────────────────────────────────
 * 暴露：window.fmtDate, window.fmtNum, window.fmtCell,
 *        window.NUM_COLS（通用數字欄位集合）
 * ─────────────────────────────────────────────────────────────
 */

/**
 * 將 ISO 日期字串轉為民國年格式
 * e.g. "2024-03-15" → "113年03月15日"
 * @param {string|null} v
 * @returns {string}
 */
window.fmtDate = function fmtDate(v) {
  if (!v) return '';
  try {
    const d = new Date(v);
    if (isNaN(d)) return String(v);
    const tw = d.getFullYear() - 1911;
    const mm  = String(d.getMonth() + 1).padStart(2, '0');
    const dd  = String(d.getDate()).padStart(2, '0');
    return `${tw}年${mm}月${dd}日`;
  } catch {
    return String(v);
  }
};

/**
 * 格式化數字（移除多餘尾零，保留最多 dec 位小數）
 * e.g. fmtNum(1.500, 3) → "1.5"
 *      fmtNum(1000)      → "1,000"
 * @param {number|string|null} v
 * @param {number} dec - 最多小數位（預設 3）
 * @returns {string}
 */
window.fmtNum = function fmtNum(v, dec = 3) {
  if (v === '' || v === null || v === undefined) return '';
  const n = parseFloat(v);
  if (isNaN(n)) return String(v);
  // 移除尾零
  const s = n.toFixed(dec).replace(/\.?0+$/, '');
  // 千分位（整數部分）
  const [intPart, decPart] = s.split('.');
  const intFmt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decPart ? `${intFmt}.${decPart}` : intFmt;
};

/**
 * 通用數字欄位集合（庫存模組用；其他模組可擴充自己的 Set）
 * 凡在此集合內的欄位，fmtCell 會自動套用數字格式
 */
window.NUM_COLS = new Set([
  '厚度','寬度','長度','單位重','密度','進價','售價',
  '本倉數量','本倉總數','寄倉數量','寄倉總數',
  '安全數量','安全總數','管厚','外徑','內徑',
  '外箱材積','外箱淨重','外箱毛重',
  '正面漆膜厚','背面漆膜厚','數量','總數','長度M',
  '鋼捲厚度','鋼捲寬度','鋼捲比重',
  // 訂單模組欄位（預留）
  '數量','單價','金額','稅額','含稅金額',
]);

/**
 * 依欄位類型選擇格式化方式
 * @param {string} col - 欄位名稱
 * @param {*}      val - 原始值
 * @param {Set}   [numCols] - 自訂數字欄位集合（預設使用 window.NUM_COLS）
 * @returns {string}
 */
window.fmtCell = function fmtCell(col, val, numCols) {
  if (val === '' || val === null || val === undefined) return '';
  const nc = numCols || window.NUM_COLS;
  if (col === '異動日期' || col === '建檔日期' || col === '異動時間' ||
      col === '訂單日期' || col === '出貨日期' || col === '到期日期') {
    return window.fmtDate(val);
  }
  if (nc.has(col)) return window.fmtNum(val);
  return String(val);
};
