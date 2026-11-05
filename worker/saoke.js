// API riêng cho web Sao Kể Bạn Nghe (https://sao-ke-ban-nghe.vercel.app):
// mua gói trả phí PHẢI đăng nhập Google (Firebase Auth, dự án "sao-ke-ban-nghe"),
// SePay báo đủ tiền → tự ghi quyền dùng gói cho đúng tài khoản đó. Không cần ai bấm tay.
//
// - POST /api/saoke/order  (Authorization: Bearer <Firebase ID token>) body {pack, phone}
//      → tạo mã đơn "SAOKE <gói> <SĐT> <8 ký tự>", giá do MÁY CHỦ quyết định; lưu KV saoke:order:<mã>.
// - GET  /api/saoke/me     (Authorization: Bearer …) → {packs: {SKCS: {...}, SKCN: {...}}} gói đã sở hữu.
// - grantSaoke(env, code)  : gọi từ webhook SePay (worker/sepay.js) khi mã SAOKE có tiền về;
//      đủ tiền → KV saoke:ent:<uid>. Gọi lại nhiều lần cũng không sao.
// ID token được kiểm chữ ký bằng khoá công khai của Google, không cần khoá bí mật nào.

const PROJECT = 'sao-ke-ban-nghe';
const PACKS = { SKCS: 'Bản giải chuyên sâu', SKCN: 'Gói Tết cả nhà' };
const PRICE_REGULAR = 75000;
const PRICE_PROMO = 52500;
const PROMO_UNTIL = Date.parse('2026-11-15T23:59:59+07:00');
const ORIGINS = ['https://sao-ke-ban-nghe.vercel.app', 'http://localhost:4330'];

export const priceNow = (now = Date.now()) => (now <= PROMO_UNTIL ? PRICE_PROMO : PRICE_REGULAR);

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

export async function grantSaoke(env, code) {
  const order = await readJSON(env, `saoke:order:${code}`);
  if (!order) return false;
  const pay = await readJSON(env, `pay:${code}`);
  if (!pay || (pay.amount || 0) < order.amount) return false;
  const key = `saoke:ent:${order.uid}`;
  const ent = (await readJSON(env, key)) || { email: order.email, packs: {} };
  if (ent.packs[order.pack]) return true;
  ent.packs[order.pack] = { at: new Date().toISOString(), code, amount: pay.amount };
  ent.email = ent.email || order.email;
  await env.RATE_KV.put(key, JSON.stringify(ent));
  return true;
}

export async function handleSaoke(request, env, url) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request) });
  const auth = request.headers.get('Authorization') || '';
  const user = auth.startsWith('Bearer ') ? await verifyIdToken(auth.slice(7)) : null;
  if (!user) return json(request, { ok: false, error: 'login_required' }, 401);
  const ent = (await readJSON(env, `saoke:ent:${user.uid}`)) || { packs: {} };

  if (url.pathname === '/api/saoke/me' && request.method === 'GET') {
    return json(request, { ok: true, packs: ent.packs || {}, price: priceNow(), regular: PRICE_REGULAR, promoUntil: new Date(PROMO_UNTIL).toISOString() });
  }

  if (url.pathname === '/api/saoke/order' && request.method === 'POST') {
    let d = {};
    try { d = await request.json(); } catch {}
    const pack = String(d.pack || '');
    const phone = String(d.phone || '').replace(/[^\d]/g, '').replace(/^84/, '0');
    if (!PACKS[pack]) return json(request, { ok: false, error: 'bad_pack' }, 400);
    if (!/^0[1-9]\d{8}$/.test(phone)) return json(request, { ok: false, error: 'bad_phone' }, 400);
    if (ent.packs && ent.packs[pack]) return json(request, { ok: false, error: 'owned' }, 409);
    const amount = priceNow();
    const suffix = [...crypto.getRandomValues(new Uint8Array(4))].map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    const code = `SAOKE ${pack} ${phone} ${suffix}`;
    await env.RATE_KV.put(`saoke:order:${code}`, JSON.stringify({ uid: user.uid, email: user.email, pack, amount, at: new Date().toISOString() }), { expirationTtl: 60 * 60 * 24 * 60 });
    return json(request, { ok: true, code, amount, pack, email: user.email });
  }
  return json(request, { ok: false, error: 'not_found' }, 404);
}
