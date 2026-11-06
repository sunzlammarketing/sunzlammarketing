// API riêng cho web Sao Kể Bạn Nghe (https://sao-ke-ban-nghe.vercel.app):
// mua gói trả phí PHẢI đăng nhập Google (Firebase Auth, dự án "sao-ke-ban-nghe"),
// SePay báo đủ tiền → tự ghi quyền dùng gói cho đúng tài khoản đó. Không cần ai bấm tay.
//
// - POST /api/saoke/order  (Authorization: Bearer <Firebase ID token>) body {pack, phone}
//      → tạo mã đơn "SAOKE <gói> <SĐT> <8 ký tự>", giá do MÁY CHỦ quyết định; lưu KV saoke:order:<mã>.
// - GET  /api/saoke/me     (Authorization: Bearer …) → {packs: {SKCS: {buys, cap, slots}, …}} gói đã mua.
// - POST /api/saoke/claim  (Authorization: Bearer …) body {pack, k, label} → dùng 1 lượt của gói cho 1 người
//      (k = mã hoá ngày giờ nơi sinh, do web tính). Mỗi lượt mua: SKCS, SKVIP = 2 người; SKCN = 1 gia đình; SKGD = 2 cặp ghép đôi.
// - GET  /api/saoke/quote?pack=&coupon=  → {base, discount, total, coupon} (giá cuối do máy chủ tính)
// - grantSaoke(env, code)  : gọi từ webhook SePay (worker/sepay.js) khi mã SAOKE có tiền về;
//      đủ tiền → thêm 1 lượt mua vào KV saoke:ent:<uid>. Gọi lại nhiều lần cũng không sao (nhớ theo mã đơn).
// ID token được kiểm chữ ký bằng khoá công khai của Google, không cần khoá bí mật nào.

const PROJECT = 'sao-ke-ban-nghe';
// Giá gốc / giá ưu đãi (đến hết PROMO_UNTIL) / số người mỗi lượt mua
const PACKS = {
  SKCS: { name: 'Bản giải chuyên sâu', regular: 75000, promo: 52500, per: 2 },
  SKCN: { name: 'Gói Tết cả nhà', regular: 75000, promo: 52500, per: 1 },
  SKVIP: { name: 'Gói VIP', regular: 149000, promo: 99000, per: 2 },
  SKGD: { name: 'Ghép đôi', regular: 29000, promo: 19000, per: 2 }, // 1 lượt = 2 cặp ghép đôi
};
const PROMO_UNTIL = Date.parse('2026-11-15T23:59:59+07:00');
// Sheet "Đơn hàng Sao Kể" (Apps Script riêng của Sao Kể): tab "Mã giảm giá"
const SAOKE_SHEET = 'https://script.google.com/macros/s/AKfycbz-RlRxdniOxuMSLGHBn3V8Xigf0zZMIumPIs3z3twQWt6wIafJAW7HtY7wQ3nzF9iJZA/exec';
const MAX_OFF = 0.5; // tổng giảm (khuyến mãi + mã) không quá 50% giá gốc
const ORIGINS = ['https://sao-ke-ban-nghe.vercel.app', 'http://localhost:4330'];

export const priceNow = (pack, now = Date.now()) => (now <= PROMO_UNTIL ? PACKS[pack].promo : PACKS[pack].regular);

function corsHeaders(request) {
  const o = request.headers.get('Origin') || '';
  return {
    'Access-Control-Allow-Origin': ORIGINS.includes(o) ? o : ORIGINS[0],
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    Vary: 'Origin',
  };
}
function json(request, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', ...corsHeaders(request) },
  });
}

// ---------- Kiểm Firebase ID token (RS256, khoá công khai của Google) ----------
let JWKS = null, JWKS_AT = 0;
async function googleKeys() {
  if (JWKS && Date.now() - JWKS_AT < 3600e3) return JWKS;
  const r = await fetch('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com');
  JWKS = (await r.json()).keys || [];
  JWKS_AT = Date.now();
  return JWKS;
}
const b64u = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));
const dec = (s) => JSON.parse(new TextDecoder().decode(b64u(s)));

export async function verifyIdToken(token, keysFn = googleKeys, now = Date.now() / 1000) {
  try {
    const [h, p, s] = String(token || '').split('.');
    if (!s) return null;
    const head = dec(h), body = dec(p);
    if (head.alg !== 'RS256') return null;
    const jwk = (await keysFn()).find((k) => k.kid === head.kid);
    if (!jwk) return null;
    const key = await crypto.subtle.importKey('jwk', { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', ext: true }, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64u(s), new TextEncoder().encode(h + '.' + p));
    if (!ok) return null;
    if (body.aud !== PROJECT || body.iss !== 'https://securetoken.google.com/' + PROJECT) return null;
    if (!(body.exp > now) || body.iat > now + 300 || !body.sub) return null;
    return { uid: String(body.sub), email: String(body.email || ''), name: String(body.name || '') };
  } catch {
    return null;
  }
}

async function readJSON(env, key) {
  try { return JSON.parse((await env.RATE_KV.get(key)) || 'null'); } catch { return null; }
}

// Chuẩn hoá dữ liệu quyền (bản cũ chỉ có {at, code, amount})
function normEnt(ent) {
  ent = ent || { packs: {} };
  ent.packs = ent.packs || {};
  for (const [k, v] of Object.entries(ent.packs)) {
    if (v && v.buys == null) ent.packs[k] = { buys: 1, codes: v.code ? [v.code] : [], slots: [] };
  }
  return ent;
}
const view = (ent) => Object.fromEntries(Object.entries(ent.packs).map(([k, v]) => [k, { buys: v.buys, cap: v.buys * (PACKS[k]?.per || 1), slots: (v.slots || []).map((x) => ({ k: x.k, label: x.label })) }]));

export async function grantSaoke(env, code) {
  const order = await readJSON(env, `saoke:order:${code}`);
  if (!order) return false;
  const pay = await readJSON(env, `pay:${code}`);
  if (!pay || (pay.amount || 0) < order.amount) return false;
  const key = `saoke:ent:${order.uid}`;
  const ent = normEnt(await readJSON(env, key));
  ent.email = ent.email || order.email;
  const p = (ent.packs[order.pack] = ent.packs[order.pack] || { buys: 0, codes: [], slots: [] });
  if (p.codes.includes(code)) return true;
  p.codes.push(code);
  p.buys += 1;
  await env.RATE_KV.put(key, JSON.stringify(ent));
  return true;
}

// Giá cuối cho 1 gói + mã giảm giá (mã kiểm ở Sheet Sao Kể). Không bao giờ dưới 50% giá gốc.
export async function quote(pack, coupon) {
  const base = priceNow(pack), floor = Math.ceil((PACKS[pack].regular * (1 - MAX_OFF)) / 500) * 500;
  const code = String(coupon || '').trim().toUpperCase();
  if (!code) return { ok: true, base, discount: 0, total: base, coupon: '' };
  if (!/^[A-Z0-9_-]{2,30}$/.test(code)) return { ok: false, error: 'coupon_invalid' };
  let d;
  try {
    const r = await fetch(`${SAOKE_SHEET}?action=quote&pack=${pack}&coupon=${encodeURIComponent(code)}&base=${base}`, { redirect: 'follow' });
    d = await r.json();
  } catch { return { ok: false, error: 'coupon_unavailable' }; }
  if (!d || !d.ok) return { ok: false, error: (d && d.error) || 'coupon_invalid' };
  const total = Math.max(floor, base - (Number(d.discount) || 0));
  return { ok: true, base, discount: base - total, total, coupon: d.coupon || code, capped: base - (Number(d.discount) || 0) < floor };
}

export async function handleSaoke(request, env, url) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request) });
  if (url.pathname === '/api/saoke/quote' && request.method === 'GET') {
    const pack = String(url.searchParams.get('pack') || '');
    if (!PACKS[pack]) return json(request, { ok: false, error: 'bad_pack' }, 400);
    // chống dò mã: 30 lần/IP/giờ
    const ip = request.headers.get('CF-Connecting-IP') || 'x', rk = `saoke:quote:${ip}:${Math.floor(Date.now() / 3600e3)}`;
    const n = Number((await env.RATE_KV.get(rk)) || 0);
    if (n >= 30) return json(request, { ok: false, error: 'rate_limited' }, 429);
    await env.RATE_KV.put(rk, String(n + 1), { expirationTtl: 3700 });
    return json(request, await quote(pack, url.searchParams.get('coupon')));
  }
  const auth = request.headers.get('Authorization') || '';
  const user = auth.startsWith('Bearer ') ? await verifyIdToken(auth.slice(7)) : null;
  if (!user) return json(request, { ok: false, error: 'login_required' }, 401);
  const entKey = `saoke:ent:${user.uid}`;
  const ent = normEnt(await readJSON(env, entKey));
  const prices = Object.fromEntries(Object.entries(PACKS).map(([k, v]) => [k, { price: priceNow(k), regular: v.regular, per: v.per }]));

  if (url.pathname === '/api/saoke/me' && request.method === 'GET') {
    return json(request, { ok: true, packs: view(ent), prices, promoUntil: new Date(PROMO_UNTIL).toISOString() });
  }

  if (url.pathname === '/api/saoke/claim' && request.method === 'POST') {
    let d = {};
    try { d = await request.json(); } catch {}
    const pack = String(d.pack || ''), k = String(d.k || ''), label = String(d.label || '').slice(0, 60);
    const p = ent.packs[pack];
    if (!PACKS[pack] || !p) return json(request, { ok: false, error: 'not_owned' }, 403);
    if (!/^[A-Za-z0-9:_-]{4,48}$/.test(k)) return json(request, { ok: false, error: 'bad_key' }, 400);
    p.slots = p.slots || [];
    if (!p.slots.some((x) => x.k === k)) {
      if (p.slots.length >= p.buys * PACKS[pack].per) return json(request, { ok: false, error: 'full', packs: view(ent) }, 409);
      p.slots.push({ k, label, at: new Date().toISOString() });
      await env.RATE_KV.put(entKey, JSON.stringify(ent));
    }
    return json(request, { ok: true, packs: view(ent) });
  }

  if (url.pathname === '/api/saoke/order' && request.method === 'POST') {
    let d = {};
    try { d = await request.json(); } catch {}
    const pack = String(d.pack || '');
    const phone = String(d.phone || '').replace(/[^\d]/g, '').replace(/^84/, '0');
    if (!PACKS[pack]) return json(request, { ok: false, error: 'bad_pack' }, 400);
    if (!/^0[1-9]\d{8}$/.test(phone)) return json(request, { ok: false, error: 'bad_phone' }, 400);
    const q = await quote(pack, d.coupon);
    if (!q.ok) return json(request, { ok: false, error: q.error }, 400);
    const amount = q.total;
    const suffix = [...crypto.getRandomValues(new Uint8Array(4))].map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    const code = `SAOKE ${pack} ${phone} ${suffix}`;
    await env.RATE_KV.put(`saoke:order:${code}`, JSON.stringify({ uid: user.uid, email: user.email, pack, amount, coupon: q.coupon, at: new Date().toISOString() }), { expirationTtl: 60 * 60 * 24 * 60 });
    return json(request, { ok: true, code, amount, base: q.base, discount: q.discount, coupon: q.coupon, pack, email: user.email });
  }
  return json(request, { ok: false, error: 'not_found' }, 404);
}
