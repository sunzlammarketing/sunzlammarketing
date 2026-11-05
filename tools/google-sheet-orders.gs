/**
 * Đơn hàng web Sunz Làm Marketing: lưu đơn vào Google Sheet + gửi email giao hàng
 * + phục vụ link tải có bảo vệ (hết hạn, giới hạn lượt tải, file Drive để riêng tư).
 *
 * ── CÀI ĐẶT ─────────────────────────────────────────────────────────────────────
 * 1. Google Sheet → Tiện ích mở rộng → Apps Script → dán toàn bộ file này → Lưu.
 * 2. Điền fileId (ID trong link Drive) cho từng file ở PRODUCTS bên dưới.
 *    File hoặc THƯ MỤC đều được (thư mục sẽ tự nén .zip khi tải).
 * 3. Chọn hàm  authorize  → Chạy → cấp quyền (đọc Drive). Nhật ký liệt kê tên file là đúng.
 * 4. Chọn hàm  setup  → Chạy (tạo trình kích hoạt, menu "Sunz", cột Lượt tải, khoá ký link).
 * 5. Triển khai → Quản lý các bản triển khai → ✏️ → Phiên bản mới → Triển khai (giữ nguyên URL).
 * 6. Sau khi thử tải OK: đổi chia sẻ các file/thư mục trên Drive về "Bị hạn chế".
 *
 * 7. SePay (tự xác nhận thanh toán): điền SEPAY_KEY bên dưới (hoặc Cài đặt dự án ⚙️ → Thuộc tính
 *    tập lệnh → SEPAY_KEY) = đúng API Key của webhook SePay, cùng giá trị với secret SEPAY_KEY của
 *    Cloudflare Worker. Xem SEPAY.md. Bản trên GitHub để trống fileId và SEPAY_KEY.
 *
 * ── HẰNG NGÀY ───────────────────────────────────────────────────────────────────
 * Có SePay: tiền vào Sacombank → SePay báo webhook → đơn tự chuyển "Đã thanh toán" và
 * email giao hàng tự gửi. Tab "Giao dịch SePay" ghi mọi giao dịch tiền vào để đối chiếu.
 * Giao dịch không khớp đơn nào (sai nội dung, thiếu tiền) → ghi "Không khớp", bạn xử lý tay:
 * cột "Trạng thái" chọn "Đã thanh toán" → email giao hàng tự gửi (như cũ).
 * Menu Sunz › "Gửi lại email…" = gửi link mới cho dòng đang chọn (đặt lại lượt tải).
 *
 * ── MÃ GIẢM GIÁ ─────────────────────────────────────────────────────────────────
 * Tab "Mã giảm giá" (tự tạo khi chạy setup): mỗi dòng 1 mã. Loại "%" hoặc "đ"; để trống "Áp dụng cho"
 * = mọi sản phẩm có giá; "Bật" bỏ tick là tắt mã. "Đã dùng" tự tăng khi đơn dùng mã được thanh toán.
 * Số tiền đơn luôn được tính lại ở đây theo bảng giá web (SITE/prices.json) + mã giảm giá,
 * không tin số tiền trình duyệt gửi lên.
 */

// ===== CẤU HÌNH =====
const SHEET_NAME = 'Đơn hàng';
const SITE = 'https://sunzlammarketing.sunzlammarketing.workers.dev';
const BRAND = 'Sunz Làm Marketing';
const LINK_DAYS = 30; // link tải dùng được bao nhiêu ngày
const MAX_DOWNLOADS = 15; // tổng lượt tải tối đa cho mỗi đơn (mọi file cộng lại)
const SUPPORT = {
  messenger: 'https://m.me/sunzlammarketing',
  tiktok: 'https://www.tiktok.com/@sunz.lam.marketing',
  email: 'sunzlammarketing@gmail.com',
};

// Mã sản phẩm = chữ thứ 2 trong nội dung CK ("SUNZ <MÃ> <SĐT>").
// files[].fileId: ID file/thư mục Drive (phần giữa /d/ … /view hoặc sau /folders/).
const PRODUCTS = {
  SKILL50: {
    name: 'Skill viết content theo tình huống bán hàng',
    page: SITE + '/skill/viet-content-theo-tinh-huong-ban-hang',
    files: [
      { label: 'Claude & Codex', desc: 'File .zip để upload vào Claude (Customize › Skills › Upload a skill) hoặc chép vào Codex. Giữ nguyên tên file, không giải nén.', button: 'Tải bản Claude & Codex', fileId: '' },
      { label: 'ChatGPT & Gemini', desc: 'File .md + file Instructions dán sẵn, dùng qua ChatGPT Project hoặc Gemini Gem.', button: 'Tải bản ChatGPT & Gemini', fileId: '' },
      { label: 'Hướng dẫn cài đặt', desc: 'PDF các bước cài trên Claude, Codex, ChatGPT, Gemini.', button: 'Tải hướng dẫn (PDF)', fileId: '' },
    ],
  },
  NMM: {
    name: 'Ebook Nhập môn Marketing cho người mới',
    page: SITE + '/tai-lieu/nhap-mon-marketing',
    files: [
      { label: 'Ebook PDF', desc: 'Ebook 24 trang: 8 chương nền tảng, ví dụ thực tế 8 ngành, bài tập và kế hoạch marketing 1 trang.', button: 'Tải ebook (PDF)', fileId: '' },
    ],
  },
  EB50CT: {
    name: 'Ebook 50 công thức viết content theo tình huống bán hàng',
    page: SITE + '/tai-lieu/ebook-50-cong-thuc-viet-content',
    files: [
      { label: 'Ebook PDF', desc: 'Ebook 32 trang: 50 công thức, khung mẫu, ví dụ và checklist pháp lý quảng cáo.', button: 'Tải ebook (PDF)', fileId: '' },
    ],
  },
  PMA: {
    name: 'Ebook + Template Phễu Marketing AARRR',
    page: SITE + '/tai-lieu/pheu-marketing-aarrr',
    files: [
      { label: 'Ebook PDF', desc: 'Ebook hướng dẫn phễu Marketing AARRR qua 5 giai đoạn.', button: 'Tải ebook (PDF)', fileId: '' },
      { label: 'Template', desc: 'Template vẽ và đo lường hành trình khách hàng theo AARRR.', button: 'Tải template', fileId: '' },
    ],
  },
  PAI30: {
    name: 'Ebook + Template 30 prompt AI cho Marketer',
    page: SITE + '/tai-lieu/30-prompt-ai-cho-marketer',
    files: [
      { label: 'Ebook PDF', desc: 'Ebook hướng dẫn dùng 30 prompt AI cho công việc Marketing.', button: 'Tải ebook (PDF)', fileId: '' },
      { label: 'Template', desc: 'Template 30 prompt để tuỳ chỉnh theo mục tiêu, sản phẩm và khách hàng.', button: 'Tải template', fileId: '' },
    ],
  },
  PLQC26: {
    name: 'Ebook + Template Check pháp lý quảng cáo 2026 cho Shop & KOC',
    page: SITE + '/tai-lieu/check-phap-ly-quang-cao-2026',
    files: [
      { label: 'Ebook PDF', desc: 'Ebook rà soát pháp lý nội dung quảng cáo 2026 cho Shop & KOC.', button: 'Tải ebook (PDF)', fileId: '' },
      { label: 'Template', desc: 'Template ghi chú các điểm cần kiểm tra trước khi đăng.', button: 'Tải template', fileId: '' },
    ],
  },
  CSOP: {
    name: 'Ebook + Template Checklist 30 điểm tối ưu SEO On-page',
    page: SITE + '/tai-lieu/checklist-seo-on-page',
    files: [
      { label: 'Ebook PDF', desc: 'Ebook 17 trang: 30 điểm, ví dụ đúng/sai, checklist in nhanh.', button: 'Tải ebook (PDF)', fileId: '' },
      { label: 'Template chấm điểm', desc: 'File Excel: mở bằng Google Trang tính để chấm điểm tự động cho 10 bài.', button: 'Tải template (Excel)', fileId: '' },
    ],
  },
};

// Cột trong sheet (1 = A)
const COL = { time: 1, code: 2, product: 3, amount: 4, name: 5, phone: 6, email: 7, status: 8, page: 9, sentAt: 10, downloads: 11, token: 12, txn: 13, coupon: 14 };
const HEADERS = ['Thời gian', 'Mã đơn (nội dung CK)', 'Sản phẩm', 'Số tiền', 'Họ tên', 'SĐT / Zalo', 'Email', 'Trạng thái', 'Trang', 'Đã gửi email lúc', 'Lượt tải', 'Mã tra cứu', 'Mã giao dịch SePay', 'Mã giảm giá'];
// API Key của webhook SePay (cùng giá trị với secret SEPAY_KEY trên Cloudflare). Có thể điền thẳng ở đây
// hoặc thêm Thuộc tính tập lệnh SEPAY_KEY (ưu tiên Thuộc tính). KHÔNG đưa bản có key lên GitHub.
const SEPAY_KEY = '';
const TXN_SHEET = 'Giao dịch SePay';
const COUPON_SHEET = 'Mã giảm giá';
const COUPON_HEADERS = ['Mã', 'Loại (% hoặc đ)', 'Giá trị', 'Áp dụng cho (mã SP, cách nhau dấu phẩy; trống = tất cả)', 'Bắt đầu', 'Hết hạn', 'Lượt tối đa (trống = không giới hạn)', 'Đã dùng', 'Bật', 'Ghi chú'];
const MIN_TOTAL = 2000; // giảm xong không thấp hơn mức này (tránh đơn 0 ₫ / số lẻ ngân hàng không nhận)
const TXN_HEADERS = ['Nhận lúc', 'Mã GD SePay', 'Ngày GD (ngân hàng)', 'Số tiền', 'Nội dung CK', 'Mã tham chiếu', 'Kết quả', 'Mã đơn khớp'];
const STATUS = { pending: 'Chờ thanh toán', claimed: 'Khách báo đã CK', paid: 'Đã thanh toán', sent: 'Đã gửi email', missing: 'Thiếu file tải', cancel: 'Huỷ' };

// ===== LƯU ĐƠN TỪ WEB =====
function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#e0e7ff');
  }
  // Sheet cũ ít cột hơn HEADERS (vd chưa có cột Mã giao dịch SePay) → thêm cột, tránh lỗi đọc/ghi ngoài bảng
  if (sh.getMaxColumns() < HEADERS.length) {
    sh.insertColumnsAfter(sh.getMaxColumns(), HEADERS.length - sh.getMaxColumns());
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold').setBackground('#e0e7ff');
  }
  return sh;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse((e.postData && e.postData.contents) || '{}');
    if (d.website) return out_({ ok: false }); // bẫy bot (ô ẩn)
    const sh = getSheet_();
    const code = String(d.code || '').slice(0, 60);

    if (d.action === 'sepay') return out_(handleSepay_(d));

    if (d.action === 'claim') {
      const row = findRow_(code);
      if (row) {
        const cell = sh.getRange(row, COL.status);
        if (cell.getValue() === STATUS.pending) cell.setValue(STATUS.claimed);
      }
      return out_({ ok: true });
    }

    const statusToken = String(d.statusToken || '');
    if (statusToken && !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(statusToken)) {
      return out_({ ok: false, error: 'invalid_token' });
    }

    // Tính lại số tiền ở máy chủ: giá web hiện tại + mã giảm giá (nếu hợp lệ)
    const pcode = code.split(/\s+/)[1] || '';
    const q = quote_(pcode, d.coupon);
    const amount = q.ok ? q.total : q.base != null ? q.base : Number(d.amount) || '';

    sh.appendRow([
      new Date(),
      code,
      String(d.product || '').slice(0, 200),
      amount,
      String(d.name || '').slice(0, 100),
      "'" + String(d.phone || '').slice(0, 20), // giữ số 0 đầu
      String(d.email || '').slice(0, 120),
      STATUS.pending,
      String(d.page || '').slice(0, 200),
      '',
      0,
      statusToken,
      '',
      q.ok && q.coupon ? q.coupon : '',
    ]);
    if (q.error === 'price_unavailable') getSheet_().getRange(getSheet_().getLastRow(), COL.amount).setNote('Không đọc được bảng giá web, đang dùng số tiền trình duyệt gửi. Kiểm tra lại.');
    return out_({ ok: true, amount });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Dòng mới nhất có mã đơn này (0 nếu không có)
function findRow_(code) {
  const sh = getSheet_();
  const n = sh.getLastRow() - 1;
  if (n < 1) return 0;
  const codes = sh.getRange(2, COL.code, n, 1).getValues();
  for (let i = codes.length - 1; i >= 0; i--) if (codes[i][0] === code) return i + 2;
  return 0;
}

// ===== TRẠNG THÁI ĐƠN CHO WEB =====
function orderStatus_(token) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token)) return { ok: false, error: 'invalid_token' };
  const sh = getSheet_();
  const n = sh.getLastRow() - 1;
  if (n < 1) return { ok: false, error: 'not_found' };
  const tokens = sh.getRange(2, COL.token, n, 1).getValues();
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (String(tokens[i][0]) !== token) continue;
    const st = String(sh.getRange(i + 2, COL.status).getValue());
    const payment = st === STATUS.cancel ? 'cancelled' : st === STATUS.paid || st === STATUS.sent || st === STATUS.missing ? 'confirmed' : 'pending';
    return { ok: true, payment, delivery: st === STATUS.sent ? 'sent' : 'not_sent' };
  }
  return { ok: false, error: 'not_found' };
}

// ===== SEPAY: TỰ XÁC NHẬN THANH TOÁN =====
function sepayKey_() {
  return PropertiesService.getScriptProperties().getProperty('SEPAY_KEY') || SEPAY_KEY;
}

// Cloudflare Worker (/api/sepay, worker/sepay.js) đã kiểm tra API Key của SePay rồi chuyển giao dịch sang đây.
// Trả ok:true khi đã xử lý xong (kể cả không khớp đơn) để SePay không gửi lại; ok:false → SePay thử lại.
function handleSepay_(d) {
  const key = sepayKey_();
  if (!key || d.key !== key) return { ok: false, error: 'unauthorized' };
  const tx = d.tx || {};
  const id = String(tx.id || '');
  if (!id) return { ok: false, error: 'missing_id' };

  const log = txnSheet_();
  if (log.getLastRow() > 1) {
    const ids = log.getRange(2, 2, log.getLastRow() - 1, 1).getValues();
    if (ids.some((r) => String(r[0]) === id)) return { ok: true, duplicate: true }; // SePay gửi lại
  }

  const amount = Number(tx.transferAmount) || 0;
  const content = String(tx.content || '');
  let result = 'Không khớp đơn nào';
  let matched = '';
  let deliverRow = 0;

  if (tx.transferType && tx.transferType !== 'in') {
    result = 'Bỏ qua (tiền ra)';
  } else {
    const row = findRowByContent_(content);
    if (row) {
      const sh = getSheet_();
      const v = sh.getRange(row, 1, 1, HEADERS.length).getValues()[0];
      matched = String(v[COL.code - 1]);
      const due = Number(v[COL.amount - 1]) || 0;
      const st = String(v[COL.status - 1]);
      if (st === STATUS.sent || st === STATUS.paid) {
        result = 'Đơn đã thanh toán trước đó (kiểm tra chuyển trùng)';
      } else if (amount < due) {
        result = 'Thiếu tiền: nhận ' + amount + ', cần ' + due;
        sh.getRange(row, COL.status).setNote('SePay: nhận ' + amount + ' ₫, thiếu ' + (due - amount) + ' ₫ (GD ' + id + ')');
      } else {
        sh.getRange(row, COL.status).setValue(STATUS.paid);
        sh.getRange(row, COL.txn).setValue(id);
        useCoupon_(String(v[COL.coupon - 1] || ''));
        result = 'Đã xác nhận đơn';
        deliverRow = row;
      }
    }
  }

  log.appendRow([new Date(), id, String(tx.transactionDate || ''), amount, content, String(tx.referenceCode || ''), result, matched]);
  // Gửi email sau khi đã ghi log; lỗi gửi mail không làm SePay gửi lại giao dịch
  if (deliverRow) {
    try {
      deliver_(deliverRow);
    } catch (err) {
      note_(getSheet_().getRange(deliverRow, COL.status), 'Đã nhận tiền nhưng gửi email lỗi: ' + err);
    }
  }
  return { ok: true, result };
}

function txnSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(TXN_SHEET);
  if (!sh) {
    sh = ss.insertSheet(TXN_SHEET);
    sh.appendRow(TXN_HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, TXN_HEADERS.length).setFontWeight('bold').setBackground('#dcfce7');
  }
  return sh;
}

// Ngân hàng có thể đổi hoa/thường, bỏ dấu cách hoặc chèn thêm chữ vào nội dung CK.
// So khớp theo mã đơn đã bỏ hết ký tự không phải chữ/số (đơn mới nhất trước).
function findRowByContent_(content) {
  const norm = (s) => String(s).toUpperCase().replace(/[^A-Z0-9]/g, '');
  const text = norm(content);
  if (!text) return 0;
  const sh = getSheet_();
  const n = sh.getLastRow() - 1;
  if (n < 1) return 0;
  const codes = sh.getRange(2, COL.code, n, 1).getValues();
  for (let i = codes.length - 1; i >= 0; i--) {
    const c = norm(codes[i][0]);
    if (c.length >= 12 && text.indexOf(c) !== -1) return i + 2;
  }
  return 0;
}

// ===== GIÁ & MÃ GIẢM GIÁ =====
// Bảng giá lấy từ web (SITE/prices.json, sinh từ products.ts/skills.ts), lưu đệm 10 phút.
function priceTable_() {
  const cache = CacheService.getScriptCache();
  const hit = cache.get('prices');
  if (hit) return JSON.parse(hit);
  const res = UrlFetchApp.fetch(SITE + '/prices.json', { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) throw new Error('prices_http_' + res.getResponseCode());
  const data = JSON.parse(res.getContentText()).prices || {};
  cache.put('prices', JSON.stringify(data), 600);
  return data;
}

// Giá đang áp dụng (có tính giá mở bán theo thời gian), null nếu không bán qua QR
function basePrice_(pcode) {
  const p = priceTable_()[pcode];
  if (!p) return null;
  const now = Date.now();
  if (p.promo && now >= Date.parse(p.promo.from) && now <= Date.parse(p.promo.until)) return Number(p.promo.price);
  return p.price == null ? null : Number(p.price);
}

function couponSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(COUPON_SHEET);
  if (!sh) {
    sh = ss.insertSheet(COUPON_SHEET);
    sh.appendRow(COUPON_HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, COUPON_HEADERS.length).setFontWeight('bold').setBackground('#fef3c7');
    // Dòng mẫu (đang tắt): giảm 20% mọi sản phẩm, tối đa 50 lượt
    sh.appendRow(['SUNZ20', '%', 20, '', '', '', 50, 0, false, 'Mẫu: tick ô Bật để dùng']);
    sh.getRange(2, 9, sh.getMaxRows() - 1, 1).insertCheckboxes();
  }
  return sh;
}

// Tìm mã (không phân biệt hoa thường). Trả {row, c} hoặc null.
function findCoupon_(code) {
  const key = String(code || '').trim().toUpperCase();
  if (!key) return null;
  const sh = couponSheet_();
  const n = sh.getLastRow() - 1;
  if (n < 1) return null;
  const rows = sh.getRange(2, 1, n, COUPON_HEADERS.length).getValues();
  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][0]).trim().toUpperCase() === key) return { row: i + 2, c: rows[i] };
  }
  return null;
}

// Báo giá cho 1 sản phẩm + mã giảm giá (mã trống = giá gốc).
// {ok, base, discount, total, coupon} hoặc {ok:false, error, base?}
function quote_(pcode, coupon) {
  let base;
  try {
    base = basePrice_(pcode);
  } catch (err) {
    return { ok: false, error: 'price_unavailable' };
  }
  if (base == null || base <= 0) return { ok: false, error: 'not_for_sale' };
  const code = String(coupon || '').trim().toUpperCase();
  if (!code) return { ok: true, base, discount: 0, total: base, coupon: '' };

  const f = findCoupon_(code);
  if (!f) return { ok: false, error: 'coupon_invalid', base };
  const [, type, value, scope, start, end, maxUses, used, enabled] = f.c;
  const now = new Date();
  if (enabled !== true && String(enabled).toUpperCase() !== 'TRUE') return { ok: false, error: 'coupon_invalid', base };
  if (start && now < new Date(start)) return { ok: false, error: 'coupon_not_started', base };
  if (end) {
    const until = new Date(end);
    if (until.getHours() === 0 && until.getMinutes() === 0) until.setHours(23, 59, 59); // "Hết hạn" là ngày → hết ngày đó
    if (now > until) return { ok: false, error: 'coupon_expired', base };
  }
  if (maxUses !== '' && Number(used || 0) >= Number(maxUses)) return { ok: false, error: 'coupon_used_up', base };
  const list = String(scope || '').toUpperCase().split(/[\s,;]+/).filter(Boolean);
  if (list.length && list.indexOf(pcode) === -1) return { ok: false, error: 'coupon_not_for_product', base };

  const v = Number(value) || 0;
  let discount = String(type).indexOf('%') !== -1 ? Math.round((base * Math.min(v, 100)) / 100 / 1000) * 1000 : v;
  discount = Math.max(0, Math.min(discount, base - MIN_TOTAL));
  return { ok: true, base, discount, total: base - discount, coupon: code };
}

// Đơn dùng mã đã thanh toán → tăng "Đã dùng"
function useCoupon_(code) {
  const f = findCoupon_(code);
  if (!f) return;
  const cell = couponSheet_().getRange(f.row, 8);
  cell.setValue(Number(cell.getValue() || 0) + 1);
}

// ===== LINK TẢI CÓ BẢO VỆ =====
// Token = base64(payload) + "." + HMAC-SHA256(payload, khoá bí mật lưu trong Script Properties)
function secret_() {
  const props = PropertiesService.getScriptProperties();
  let s = props.getProperty('DL_SECRET');
  if (!s) {
    s = Utilities.getUuid() + Utilities.getUuid();
    props.setProperty('DL_SECRET', s);
  }
  return s;
}
function sign_(p64) {
  return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(p64, secret_())).replace(/=+$/, '');
}
function makeToken_(code, pcode, index) {
  const payload = JSON.stringify({ o: code, k: pcode, i: index, e: Date.now() + LINK_DAYS * 864e5 });
  const p64 = Utilities.base64EncodeWebSafe(payload).replace(/=+$/, '');
  return p64 + '.' + sign_(p64);
}
function downloadUrl_(code, pcode, index) {
  return SITE + '/dl?t=' + makeToken_(code, pcode, index);
}

// Cloudflare Worker gọi:
//  ?action=order-status&token=<mã theo dõi> → trạng thái đơn cho cửa sổ thanh toán trên web
//  ?dl=<token> → trả file (base64) nếu token hợp lệ
function doGet(e) {
  const prm = (e && e.parameter) || {};
  if (prm.action === 'order-status') return out_(orderStatus_(String(prm.token || '')));
  if (prm.action === 'quote') return out_(quote_(String(prm.product || ''), String(prm.coupon || '')));
  const t = prm.dl || '';
  if (!t) return out_({ ok: false, error: 'Thiếu mã tải.' });
  try {
    const parts = t.split('.');
    if (parts.length !== 2 || parts[1] !== sign_(parts[0])) return out_({ ok: false, error: 'Link tải không hợp lệ.' });
    const pad = parts[0] + '==='.slice((parts[0].length + 3) % 4);
    const d = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(pad)).getDataAsString());
    if (Date.now() > d.e) return out_({ ok: false, error: 'Link tải đã hết hạn. Nhắn Sunz để được gửi link mới nhé.' });
    const product = PRODUCTS[d.k];
    const f = product && product.files[d.i];
    if (!f || !f.fileId) return out_({ ok: false, error: 'Không tìm thấy tài liệu.' });

    // Đếm lượt tải theo đơn
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const row = findRow_(d.o);
      if (row) {
        const cell = getSheet_().getRange(row, COL.downloads);
        const used = Number(cell.getValue()) || 0;
        if (used >= MAX_DOWNLOADS) return out_({ ok: false, error: 'Đơn hàng đã dùng hết lượt tải. Nhắn Sunz để được hỗ trợ nhé.' });
        cell.setValue(used + 1);
      }
    } finally {
      lock.releaseLock();
    }

    const blob = fileBlob_(f.fileId);
    return out_({ ok: true, name: blob.getName(), mime: blob.getContentType(), b64: Utilities.base64Encode(blob.getBytes()) });
  } catch (err) {
    return out_({ ok: false, error: 'Không đọc được tài liệu, vui lòng nhắn Sunz.' });
  }
}

// File → nội dung file; thư mục → nén .zip các file bên trong.
// Lưu ý: DriveApp.getFileById(<ID thư mục>) KHÔNG báo lỗi mà trả "file" rỗng → phải kiểm tra loại.
function fileBlob_(id) {
  const item = DriveApp.getFileById(id);
  if (item.getMimeType() === MimeType.FOLDER) {
    const folder = DriveApp.getFolderById(id);
    const blobs = [];
    const it = folder.getFiles();
    while (it.hasNext()) blobs.push(it.next().getBlob());
    if (!blobs.length) throw new Error('Thư mục trống');
    return Utilities.zip(blobs, folder.getName() + '.zip');
  }
  const blob = item.getBlob();
  if (!blob.getBytes().length) throw new Error('File rỗng');
  return blob;
}

// Chạy 1 lần để cấp quyền Drive + kiểm tra fileId đúng chưa
function authorize() {
  Object.keys(PRODUCTS).forEach((k) =>
    PRODUCTS[k].files.forEach((f) => {
      if (!f.fileId) return;
      const b = fileBlob_(f.fileId);
      Logger.log(k + ' › ' + f.label + ' → ' + b.getName() + ' (' + Math.round(b.getBytes().length / 1024) + ' KB)');
    })
  );
}

// ===== CÀI ĐẶT 1 LẦN =====
function setup() {
  const sh = getSheet_();
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold').setBackground('#e0e7ff');
  const rule = SpreadsheetApp.newDataValidation().requireValueInList(Object.values(STATUS), true).setAllowInvalid(true).build();
  if (sh.getMaxRows() > 1) sh.getRange(2, COL.status, sh.getMaxRows() - 1, 1).setDataValidation(rule);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === 'onStatusEdit')
    .forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('onStatusEdit').forSpreadsheet(ss).onEdit().create();
  secret_();
  txnSheet_();
  couponSheet_();
  const msg =
    'XONG. Đã bật gửi email giao hàng + link tải có bảo vệ. ' +
    (sepayKey_()
      ? 'SePay: đã có SEPAY_KEY, đơn sẽ tự xác nhận khi tiền vào.'
      : 'SePay: CHƯA có SEPAY_KEY, đơn vẫn phải xác nhận tay.');
  Logger.log(msg); // chạy từ trang code: xem ở "Nhật ký thực thi" bên dưới
  // Toast thay cho alert: alert chờ bấm OK trong tab Sheet, chạy từ trang code sẽ bị "Vượt quá thời gian thực thi"
  SpreadsheetApp.getActive().toast(msg, 'Sunz', 10);
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Sunz')
    .addItem('Gửi lại email giao hàng cho dòng đang chọn', 'resendSelected')
    .addItem('Gửi email mẫu cho chính mình', 'sendTestToMe')
    .addToUi();
}

// ===== GỬI EMAIL KHI ĐỔI TRẠNG THÁI =====
function onStatusEdit(e) {
  const r = e.range;
  if (r.getSheet().getName() !== SHEET_NAME || r.getColumn() !== COL.status || r.getRow() < 2 || r.getNumRows() !== 1) return;
  if (String(e.value || r.getValue()) !== STATUS.paid) return;
  if (String(e.oldValue || '') !== STATUS.paid) useCoupon_(String(getSheet_().getRange(r.getRow(), COL.coupon).getValue() || ''));
  deliver_(r.getRow());
}

function resendSelected() {
  const row = getSheet_().getActiveRange().getRow();
  if (row < 2) return SpreadsheetApp.getUi().alert('Chọn một dòng đơn hàng trước.');
  deliver_(row);
}

function deliver_(row) {
  const sh = getSheet_();
  const v = sh.getRange(row, 1, 1, HEADERS.length).getValues()[0];
  const order = {
    code: String(v[COL.code - 1]),
    amount: Number(v[COL.amount - 1]) || 0,
    name: String(v[COL.name - 1] || '').trim(),
    phone: String(v[COL.phone - 1]).replace(/^'/, ''),
    email: String(v[COL.email - 1] || '').trim(),
  };
  const statusCell = sh.getRange(row, COL.status);
  const pcode = order.code.split(/\s+/)[1] || '';
  const product = PRODUCTS[pcode];

  if (!order.email) return note_(statusCell, 'Đơn chưa có email khách.');
  if (!product || product.files.some((f) => !f.fileId)) {
    statusCell.setValue(STATUS.missing);
    return note_(statusCell, 'Chưa điền fileId cho mã "' + pcode + '" trong PRODUCTS (Apps Script).');
  }
  const links = product.files.map((f, i) => downloadUrl_(order.code, pcode, i));
  MailApp.sendEmail({
    to: order.email,
    subject: 'Thanh toán thành công · ' + product.name,
    name: BRAND,
    replyTo: SUPPORT.email,
    htmlBody: buildEmail_(order, product, links),
    body: plainText_(order, product, links),
  });
  statusCell.setValue(STATUS.sent).setNote('');
  sh.getRange(row, COL.sentAt).setValue(new Date());
  sh.getRange(row, COL.downloads).setValue(0); // link mới → đặt lại lượt tải
}

function note_(cell, msg) {
  cell.setNote(msg);
  SpreadsheetApp.getActive().toast(msg, 'Chưa gửi được email', 8);
}

function sendTestToMe() {
  const me = Session.getActiveUser().getEmail() || SUPPORT.email;
  const product = PRODUCTS.SKILL50;
  const order = { code: 'SUNZ SKILL50 0900000000', amount: 99000, name: 'Khách hàng mẫu', phone: '0900000000', email: me };
  const links = product.files.map((f, i) => downloadUrl_(order.code, 'SKILL50', i));
  MailApp.sendEmail({ to: me, subject: '[MẪU] Thanh toán thành công · ' + product.name, name: BRAND, htmlBody: buildEmail_(order, product, links), body: plainText_(order, product, links) });
  SpreadsheetApp.getActive().toast('Đã gửi email mẫu tới ' + me, 'Sunz', 5);
}

// ===== NỘI DUNG EMAIL (phong cách email giao hàng Noti) =====
const esc_ = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const vnd_ = (n) => Number(n).toLocaleString('vi-VN') + ' ₫';
// Màu cho từng khối tải (xoay vòng): nền nhạt · màu nhãn · nút gradient + màu dự phòng
// Chỉ dùng 2 màu thương hiệu: xanh tím logo #403bd3 · cam san hô logo #ff7759
const THEMES = [
  { bg: '#eeedfc', label: '#403bd3', from: '#6f6af0', to: '#403bd3' }, // xanh tím
  { bg: '#fff3ef', label: '#e2553b', from: '#ffa184', to: '#e8573a' }, // cam
  { bg: '#f6f2fb', label: '#403bd3', from: '#403bd3', to: '#ff7759' }, // xanh tím → cam
  { bg: '#eeedfc', label: '#2e2a9e', from: '#5d58e6', to: '#2e2a9e' }, // xanh tím đậm
];
const pill_ = (text, color, bg) =>
  '<span style="display:inline-block;padding:6px 14px;border-radius:999px;background:' + bg + ';color:' + color + ';font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase">' + text + '</span>';

function buildEmail_(o, p, links) {
  const F = 'font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif';
  const row = (k, v, last) =>
    '<tr><td style="padding:14px 0;color:#64748b;font-size:14px;' + (last ? '' : 'border-bottom:1px solid #e2e8f0') + '">' + k + '</td>' +
    '<td style="padding:14px 0;text-align:right;font-weight:700;color:#0f172a;font-size:14px;' + (last ? '' : 'border-bottom:1px solid #e2e8f0') + '">' + v + '</td></tr>';
  const files = p.files
    .map((f, i) => {
      const t = THEMES[i % THEMES.length];
      return (
        '<div style="background:' + t.bg + ';border-radius:18px;padding:26px 22px;margin:0 0 14px;text-align:center">' +
        '<div style="color:' + t.label + ';font-size:13px;font-weight:800;letter-spacing:.1em;text-transform:uppercase">' + esc_(f.label) + '</div>' +
        (f.desc ? '<div style="color:#475569;font-size:14px;line-height:1.6;margin:8px 0 0">' + esc_(f.desc) + '</div>' : '') +
        '<a href="' + esc_(links[i]) + '" style="display:inline-block;margin-top:18px;padding:14px 30px;border-radius:999px;background:' + t.to + ';background-image:linear-gradient(135deg,' + t.from + ',' + t.to + ');color:#fff;text-decoration:none;font-weight:800;font-size:15px">' + esc_(f.button) + ' →</a>' +
        '</div>'
      );
    })
    .join('');
  return (
    '<div style="background:#f1f0fb;padding:24px 10px;' + F + '">' +
    '<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 20px 40px -24px rgba(15,23,42,.35)">' +
    // Header gradient
    '<div style="background:#403bd3;background-image:linear-gradient(135deg,#2e2a9e,#403bd3 55%,#5d58e6);padding:34px 24px 30px;text-align:center;color:#fff">' +
    '<img src="' + SITE + '/logo-mark.png" width="44" height="44" alt="Sunz" style="background:#fff;border-radius:12px;padding:5px;margin:0 auto 14px;display:block">' +
    '<div style="font-size:26px;font-weight:900;line-height:1.25">Thanh toán thành công</div>' +
    '<div style="font-size:14px;opacity:.9;margin-top:6px">' + esc_(p.name) + '</div>' +
    '</div>' +
    '<div style="padding:26px 26px 8px">' +
    // Hộp xác nhận
    '<div style="background:#fff3ef;border-radius:18px;padding:26px 20px;text-align:center">' +
    '<div style="width:60px;height:60px;line-height:60px;margin:0 auto;border-radius:50%;background:#ff7759;background-image:linear-gradient(135deg,#ffa184,#ff7759 55%,#e8573a);color:#fff;font-size:30px;font-weight:900">✓</div>' +
    '<div style="color:#e2553b;font-size:20px;font-weight:900;margin-top:14px">Thanh toán đã được xác nhận!</div>' +
    '<div style="color:#64748b;font-size:14px;margin-top:4px">Cảm ơn bạn đã tin tưởng ' + BRAND + '.</div>' +
    '</div>' +
    // Lời chào
    '<p style="font-size:17px;color:#0f172a;margin:24px 0 6px">Xin chào <b style="color:#403bd3">' + esc_(o.name || 'bạn') + '</b>,</p>' +
    '<p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 20px">Sunz đã nhận được thanh toán của bạn cho <b>' + esc_(p.name) + '</b>. Dưới đây là thông tin đăng ký và link tải tài liệu.</p>' +
    // Thông tin đăng ký
    pill_('Thông tin đăng ký', '#403bd3', '#eeedfc') +
    '<div style="background:#f8fafc;border-radius:18px;padding:6px 20px;margin:12px 0 0">' +
    '<table style="width:100%;border-collapse:collapse">' +
    row('Họ và tên', esc_(o.name || '—')) +
    row('Email', '<a href="mailto:' + esc_(o.email) + '" style="color:#403bd3">' + esc_(o.email) + '</a>') +
    row('Số điện thoại', esc_(o.phone)) +
    row('Mã đơn', esc_(o.code)) +
    row('Số tiền', '<span style="color:#403bd3">' + vnd_(o.amount) + '</span>') +
    row('Trạng thái', '<span style="display:inline-block;padding:5px 12px;border-radius:999px;background:#fff3ef;color:#e2553b;border:1px solid #ffd3c6">Đã thanh toán</span>', true) +
    '</table></div>' +
    // Lưu ý
    '<div style="background:#eeedfc;border-radius:14px;padding:14px 16px;margin:16px 0 0;color:#2e2a9e;font-size:14px;line-height:1.6">' +
    '<b>Lưu ý:</b> Vui lòng lưu email này và đánh dấu quan trọng để tải lại khi cần. Link tải dành riêng cho bạn, dùng trong ' + LINK_DAYS + ' ngày, vui lòng không chia sẻ.' +
    '</div>' +
    // Link tải
    '<div style="margin:26px 0 12px">' + pill_('Link tải tài liệu', '#403bd3', '#eeedfc') + '</div>' +
    files +
    '<p style="text-align:center;color:#64748b;font-size:13px;margin:4px 0 22px">Bấm nút là file tự tải về máy.</p>' +
    // Hỗ trợ
    pill_('Tài liệu & hỗ trợ', '#e2553b', '#fff3ef') +
    '<div style="font-size:15px;line-height:2.1;margin:10px 0 18px">' +
    '<a href="' + p.page + '" style="color:#403bd3;text-decoration:none">Trang sản phẩm & hướng dẫn sử dụng →</a><br>' +
    '<a href="' + SUPPORT.messenger + '" style="color:#403bd3;text-decoration:none">Cần hỗ trợ? Nhắn Sunz qua Messenger →</a><br>' +
    '<a href="' + SUPPORT.tiktok + '" style="color:#403bd3;text-decoration:none">Theo dõi Sunz trên TikTok →</a>' +
    '</div>' +
    '<p style="font-size:15px;color:#334155;margin:0 0 24px">Chúc bạn ứng dụng thành công! 💜</p>' +
    '</div>' +
    // Footer
    '<div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 26px;text-align:center;color:#94a3b8;font-size:12px;line-height:1.7">' +
    '<b style="color:#475569;font-size:14px">' + BRAND + '</b><br>' +
    '<a href="' + SITE + '" style="color:#94a3b8">' + SITE.replace('https://', '') + '</a><br>' +
    '© 2026 ' + BRAND + '. Tài liệu dành riêng cho người mua. Nghiêm cấm sao chép, chia sẻ hoặc bán lại khi chưa được cho phép.' +
    '</div></div></div>'
  );
}

function plainText_(o, p, links) {
  return [
    'Thanh toán thành công · ' + p.name,
    '',
    'Xin chào ' + (o.name || 'bạn') + ',',
    'Sunz đã nhận được thanh toán của bạn cho ' + p.name + '.',
    '',
    'Mã đơn: ' + o.code,
    'Số tiền: ' + vnd_(o.amount),
    '',
    'Link tải (dành riêng cho bạn, dùng trong ' + LINK_DAYS + ' ngày):',
    ...p.files.map((f, i) => '- ' + f.button + ': ' + links[i]),
    '',
    'Trang sản phẩm: ' + p.page,
    'Hỗ trợ: ' + SUPPORT.messenger,
    '',
    '© 2026 ' + BRAND,
  ].join('\n');
}
