// Nhận báo "có tiền vào" từ SePay (webhook) và cho web hỏi lại đơn đã được trả tiền chưa.
// - POST /api/sepay       : SePay gọi tới, xác thực bằng header "Authorization: Apikey <SEPAY_KEY>".
//   Secret SEPAY_KEY thêm trên dashboard Cloudflare (Settings → Variables and Secrets), KHÔNG ghi ở đây.
//   Nội dung chuyển khoản dạng "SUNZ <mã SP> <SĐT> <8 ký tự>" → lưu vào KV: pay:<mã đơn> = {amount, at, ids}.
// - GET  /api/pay-status?code=<mã đơn> : trả {paid, amount}. Mã đơn có 8 ký tự ngẫu nhiên nên người
//   ngoài không đoán được; chỉ trả đã trả tiền hay chưa, không lộ thông tin nào khác.
// Dùng chung cho web Sunz và web Sao Kể Bạn Nghe (gọi từ domain khác nên có CORS).

const CODE_RE = /^SUNZ [A-Z0-9]{2,10} 0\d{9} [A-Z0-9]{8}$/;

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', ...extra },
  });
}

// Tìm mã đơn trong nội dung ngân hàng gửi về (ngân hàng có thể bỏ dấu cách, thêm chữ phía trước/sau)
export function findOrderCode(content) {
  const flat = String(content || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const m = flat.match(/SUNZ([A-Z0-9]{2,10}?)(0\d{9})([A-Z0-9]{8})/);
  return m ? `SUNZ ${m[1]} ${m[2]} ${m[3]}` : null;
}

export async function handleSepay(request, env) {
  if (request.method !== 'POST') return json({ success: false, error: 'method_not_allowed' }, 405);
  const auth = request.headers.get('Authorization') || '';
  if (!env.SEPAY_KEY || auth !== `Apikey ${env.SEPAY_KEY}`) return json({ success: false, error: 'unauthorized' }, 401);
  let d;
  try { d = await request.json(); } catch { return json({ success: false, error: 'bad_json' }, 400); }
  if (d.transferType !== 'in') return json({ success: true, skip: 'not_incoming' });
  const code = findOrderCode(d.content || d.description);
  if (!code) return json({ success: true, skip: 'no_order_code' });

  // SePay có thể gửi lại cùng một giao dịch → bỏ qua lần trùng
  const txKey = d.id != null ? `sepaytx:${d.id}` : null;
  if (txKey && (await env.RATE_KV.get(txKey))) return json({ success: true, duplicate: true });

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
  return json({ success: true, code });
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
