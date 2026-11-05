// Nhận báo "có tiền vào" từ SePay (webhook) và cho web hỏi lại đơn đã được trả tiền chưa.
// - POST /api/sepay       : SePay gọi tới, xác thực bằng header "Authorization: Apikey <SEPAY_KEY>".
//   Secret SEPAY_KEY thêm trên dashboard Cloudflare (Settings → Variables and Secrets), KHÔNG ghi ở đây.
//   Nội dung chuyển khoản dạng "SUNZ <mã SP> <SĐT> <8 ký tự>" (web Sunz) hoặc "SAOKE …" (web Sao Kể)
//   → lưu vào KV: pay:<mã đơn> = {amount, at, ids}.
// - GET  /api/pay-status?code=<mã đơn> : trả {paid, amount}. Mã đơn có 8 ký tự ngẫu nhiên nên người
//   ngoài không đoán được; chỉ trả đã trả tiền hay chưa, không lộ thông tin nào khác.
// Dùng chung cho web Sunz và web Sao Kể Bạn Nghe (gọi từ domain khác nên có CORS).
// - Mỗi giao dịch tiền vào cũng được chuyển sang Apps Script (tools/google-sheet-orders.gs): ghi tab
//   "Giao dịch SePay", khớp đơn trong Sheet → "Đã thanh toán" + gửi email link tải (xem SEPAY.md).
//   RIÊNG đơn mã SAOKE (web Sao Kể) KHÔNG chuyển sang Sheet Sunz: Sao Kể có Sheet đơn hàng riêng,
//   tự hỏi /api/pay-status (sao-ke-ban-nghe/web/apps-script/don-hang-sao-ke.gs).
//   Apps Script lỗi → trả 503 để SePay gửi lại; Apps Script dedupe theo mã giao dịch nên gửi lại không sao.

import { APPS_SCRIPT } from './config.js';

// SĐT Việt Nam: số 0 rồi chữ số 1–9 (03x, 05x, 07x, 08x, 09x, 02x). Chặn "0" thứ hai để mã SP kết thúc bằng số 0
// (vd SKILL50) không bị cắt sai thành "SKILL5" + "0091…".
const CODE_RE = /^(SUNZ|SAOKE) [A-Z0-9]{2,10} 0[1-9]\d{8} [A-Z0-9]{8}$/;

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', ...extra },
  });
}

// Tìm mã đơn trong nội dung ngân hàng gửi về (ngân hàng có thể bỏ dấu cách, thêm chữ phía trước/sau)
export function findOrderCode(content) {
  const flat = String(content || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const m = flat.match(/(SUNZ|SAOKE)([A-Z0-9]{2,10}?)(0[1-9]\d{8})([A-Z0-9]{8})/);
  return m ? `${m[1]} ${m[2]} ${m[3]} ${m[4]}` : null;
}

export async function handleSepay(request, env) {
  if (request.method !== 'POST') return json({ success: false, error: 'method_not_allowed' }, 405);
  const auth = request.headers.get('Authorization') || '';
  if (!env.SEPAY_KEY || auth !== `Apikey ${env.SEPAY_KEY}`) return json({ success: false, error: 'unauthorized' }, 401);
  let d;
  try { d = await request.json(); } catch { return json({ success: false, error: 'bad_json' }, 400); }
  if (d.transferType !== 'in') return json({ success: true, skip: 'not_incoming' });
  const code = findOrderCode(d.content || d.description);
  // KV cho web Sao Kể: chỉ khi có mã đơn và chưa ghi giao dịch này (SePay có thể gửi lại)
  if (code) await savePayment(env, d, code);
  // Sheet đơn hàng Sunz: mọi giao dịch tiền vào (để có nhật ký đối soát đầy đủ), trừ đơn của web Sao Kể
  if (code && code.startsWith('SAOKE ')) return json({ success: true, code });
  if (!(await forwardToSheet(env, d))) return json({ success: false, error: 'sheet_unavailable' }, 503);
  return json({ success: true, code });
}

async function savePayment(env, d, code) {
  const txKey = d.id != null ? `sepaytx:${d.id}` : null;
  if (txKey && (await env.RATE_KV.get(txKey))) return;

  const key = `pay:${code}`;
  let prev = null;
  try { prev = JSON.parse((await env.RATE_KV.get(key)) || 'null'); } catch {}
  const rec = {
    amount: (prev?.amount || 0) + (Number(d.transferAmount) || 0),
    at: d.transactionDate || new Date().toISOString(),
    ids: [...(prev?.ids || []), d.id ?? null].slice(-10),
    ref: String(d.referenceCode || '').slice(0, 40),
  };
  await env.RATE_KV.put(key, JSON.stringify(rec));
  if (txKey) await env.RATE_KV.put(txKey, '1', { expirationTtl: 60 * 60 * 24 * 120 });
}

// true = Apps Script đã nhận (hoặc chưa cài SEPAY_KEY bên Apps Script → bỏ qua, không bắt SePay gửi lại)
async function forwardToSheet(env, d) {
  try {
    const res = await fetch(APPS_SCRIPT, {
      method: 'POST',
      redirect: 'follow',
      body: JSON.stringify({
        action: 'sepay',
        key: env.SEPAY_KEY,
        tx: {
          id: d.id,
          gateway: d.gateway,
          transactionDate: d.transactionDate,
          accountNumber: d.accountNumber,
          content: d.content || d.description,
          transferType: d.transferType,
          transferAmount: d.transferAmount,
          referenceCode: d.referenceCode,
        },
      }),
    });
    const data = await res.json();
    return !!data && (data.ok || data.error === 'unauthorized');
  } catch {
    return false;
  }
}

export async function handlePayStatus(request, env, url) {
  const cors = { 'Access-Control-Allow-Origin': '*' };
  if (request.method !== 'GET') return json({ ok: false }, 405, cors);
  const code = (url.searchParams.get('code') || '').trim().toUpperCase().replace(/\s+/g, ' ');
  if (!CODE_RE.test(code)) return json({ ok: false, error: 'invalid_code' }, 400, cors);
  let rec = null;
  try { rec = JSON.parse((await env.RATE_KV.get(`pay:${code}`)) || 'null'); } catch {}
  return json({ ok: true, paid: !!rec, amount: rec?.amount || 0 }, 200, cors);
}
