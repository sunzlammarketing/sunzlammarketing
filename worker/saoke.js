// API riêng cho web Sao Kể Bạn Nghe (https://sao-ke-ban-nghe.vercel.app):
// mua gói trả phí PHẢI đăng nhập Google (Firebase Auth, dự án "sao-ke-ban-nghe"),
// SePay báo đủ tiền → tự ghi quyền dùng gói cho đúng tài khoản đó. Không cần ai bấm tay.
//
// - POST /api/saoke/order  (Authorization: Bearer <Firebase ID token>) body {pack, phone}
//      → tạo mã đơn "SAOKE <gói> <SĐT> <8 ký tự>", giá do MÁY CHỦ quyết định; lưu KV saoke:order:<mã>.
// - GET  /api/saoke/me     (Authorization: Bearer …) → {packs: {SKCS: {buys, cap, slots}, …}} gói đã mua.
// - POST /api/saoke/claim  (Authorization: Bearer …) body {pack, k, label} → dùng 1 lượt của gói cho 1 người
//      (k = mã hoá ngày giờ nơi sinh, do web tính). Mỗi lượt mua: SKCS, SKVIP = 2 người; SKCN = 1 gia đình; SKGD = 2 cặp ghép đôi; mỗi lượt SKVIP kèm 5 cặp ghép đôi (SKVIPGD).
// - GET  /api/saoke/quote?pack=&coupon=  → {base, discount, total, coupon} (giá cuối do máy chủ tính)
// - grantSaoke(env, code)  : gọi từ webhook SePay (worker/sepay.js) khi mã SAOKE có tiền về;
//      đủ tiền → thêm 1 lượt mua vào KV saoke:ent:<uid>. Gọi lại nhiều lần cũng không sao (nhớ theo mã đơn).
// - Tài khoản ADMINS: /me trả admin: true → web mở miễn phí mọi gói để thử.
// - GET  /api/saoke/admin/orders, POST /api/saoke/admin/order  : trang quản lý đơn (/quan-ly), chỉ tài khoản ADMINS.
//      Huỷ / Hoàn tiền → khoá lượt của đơn đó; Đã trả (xác nhận tay) → mở lượt.
// ID token được kiểm chữ ký bằng khoá công khai của Google, không cần khoá bí mật nào.

const PROJECT = 'sao-ke-ban-nghe';
// Giá gốc / giá ưu đãi (đến hết PROMO_UNTIL) / số người mỗi lượt mua
const PACKS = {
  SKCS: { name: 'Luận giải bản đồ sao & tử vi chuyên sâu', regular: 99000, promo: 79000, per: 2 },
  SKCN: { name: 'Xem Tử vi Tết cho Gia đình', regular: 75000, promo: 39000, per: 1 },
  SKVIP: { name: 'Gói VIP', regular: 189000, promo: 99000, per: 2 },
  SKGD: { name: 'Ghép đôi bản đồ sao', regular: 49000, promo: 29000, per: 2 }, // 1 lượt = 2 cặp ghép đôi
  // Lượt ghép đôi đi kèm Gói VIP: mỗi lượt mua VIP được 5 cặp; không bán riêng (internal)
  SKVIPGD: { name: 'Ghép đôi kèm Gói VIP', regular: 0, promo: 0, per: 5, internal: true },
};
const PROMO_FROM = Date.parse('2026-11-20T00:00:00+07:00'); // đợt ưu đãi 20/11 – 30/11/2026 (áp ngay từ 20/11 theo yêu cầu)
const PROMO_UNTIL = Date.parse('2026-11-30T23:59:59+07:00');
// Sheet "Đơn hàng Sao Kể" (Apps Script riêng của Sao Kể): tab "Mã giảm giá"
const SAOKE_SHEET = 'https://script.google.com/macros/s/AKfycbz-RlRxdniOxuMSLGHBn3V8Xigf0zZMIumPIs3z3twQWt6wIafJAW7HtY7wQ3nzF9iJZA/exec';
const MAX_OFF = 0.7; // tổng giảm (khuyến mãi + mã) không quá 70% giá gốc: giá cuối không dưới 30% giá gốc
const ADMINS = ['saokebannghe@gmail.com']; // tài khoản Google được vào trang quản lý đơn
const ORIGINS = ['https://sao-ke-ban-nghe.vercel.app', 'http://localhost:4330'];

export const priceNow = (pack, now = Date.now()) => (now >= PROMO_FROM && now <= PROMO_UNTIL ? PACKS[pack].promo : PACKS[pack].regular);

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
    return { uid: String(body.sub), email: String(body.email || ''), name: String(body.name || ''), verified: body.email_verified === true };
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
  // VIP mua trước khi có giới hạn 5 cặp: tự bổ sung lượt ghép đôi kèm theo
  if (ent.packs.SKVIP && !ent.packs.SKVIPGD) ent.packs.SKVIPGD = { buys: ent.packs.SKVIP.buys, codes: [], slots: [] };
  return ent;
}
const view = (ent) => Object.fromEntries(Object.entries(ent.packs).map(([k, v]) => [k, { buys: v.buys, cap: v.buys * (PACKS[k]?.per || 1), slots: (v.slots || []).map((x) => ({ k: x.k, label: x.label })) }]));

export async function grantSaoke(env, code) {
  const order = await readJSON(env, `saoke:order:${code}`);
  if (!order || order.st) return false; // đơn đã Huỷ / Hoàn tiền: không mở lượt
  const pay = await readJSON(env, `pay:${code}`);
  if (!pay || (pay.amount || 0) < order.amount) return false;
  const key = `saoke:ent:${order.uid}`;
  const ent = normEnt(await readJSON(env, key));
  ent.email = ent.email || order.email;
  const p = (ent.packs[order.pack] = ent.packs[order.pack] || { buys: 0, codes: [], slots: [] });
  if (p.codes.includes(code)) return true;
  p.codes.push(code);
  p.buys += 1;
  if (order.pack === 'SKVIP') { const g = (ent.packs.SKVIPGD = ent.packs.SKVIPGD || { buys: 0, codes: [], slots: [] }); if (!g.codes.includes(code)) { g.codes.push(code); g.buys += 1; } }
  await env.RATE_KV.put(key, JSON.stringify(ent));
  return true;
}

// Giá cuối cho 1 gói + mã giảm giá (mã kiểm ở Sheet Sao Kể). Không dưới 30% giá gốc, trừ mã giảm 100% (về 0đ).
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
  // Mã giảm 100% (Sheet đặt "%" = 100 hoặc số tiền ≥ giá) là mã tặng: về đúng 0đ, không áp mức sàn 30%
  const off = Number(d.discount) || 0, free = off >= base;
  const total = free ? 0 : Math.max(floor, base - off);
  return { ok: true, base, discount: base - total, total, coupon: d.coupon || code, capped: !free && base - off < floor, free };
}

export async function handleSaoke(request, env, url) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request) });
  if (url.pathname === '/api/saoke/quote' && request.method === 'GET') {
    const pack = String(url.searchParams.get('pack') || '');
    if (!PACKS[pack] || PACKS[pack].internal) return json(request, { ok: false, error: 'bad_pack' }, 400);
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
  const isAdmin = user.verified && ADMINS.includes(user.email.toLowerCase());
  if (url.pathname.startsWith('/api/saoke/admin/')) {
    if (!isAdmin) return json(request, { ok: false, error: 'not_admin', email: user.email }, 403);
    if (url.pathname === '/api/saoke/admin/orders' && request.method === 'GET') return json(request, await adminList(env));
    if (url.pathname === '/api/saoke/admin/order' && request.method === 'POST') {
      let d = {};
      try { d = await request.json(); } catch {}
      const r = await adminUpdate(env, String(d.code || ''), d, user.email);
      return json(request, r, r.ok ? 200 : 400);
    }
    return json(request, { ok: false, error: 'not_found' }, 404);
  }
  const entKey = `saoke:ent:${user.uid}`;
  const ent = normEnt(await readJSON(env, entKey));
  const prices = Object.fromEntries(Object.entries(PACKS).map(([k, v]) => [k, { price: priceNow(k), regular: v.regular, per: v.per }]));

  if (url.pathname === '/api/saoke/me' && request.method === 'GET') {
    // admin: tài khoản quản lý web được dùng miễn phí mọi gói để thử (web mở hết khi thấy admin: true)
    return json(request, { ok: true, packs: view(ent), prices, promoUntil: new Date(PROMO_UNTIL).toISOString(), admin: isAdmin });
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
    if (!PACKS[pack] || PACKS[pack].internal) return json(request, { ok: false, error: 'bad_pack' }, 400);
    if (!/^0[1-9]\d{8}$/.test(phone)) return json(request, { ok: false, error: 'bad_phone' }, 400);
    const q = await quote(pack, d.coupon);
    if (!q.ok) return json(request, { ok: false, error: q.error }, 400);
    const amount = q.total;
    const suffix = [...crypto.getRandomValues(new Uint8Array(4))].map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    const code = `SAOKE ${pack} ${phone} ${suffix}`;
    const name = String(d.name || '').replace(/\s+/g, ' ').trim().slice(0, 100);
    const at = new Date().toISOString();
    // Giữ đơn lâu dài (không tự xoá) để trang quản lý xem lại được; metadata giúp liệt kê nhanh
    await env.RATE_KV.put(`saoke:order:${code}`, JSON.stringify({ uid: user.uid, email: user.email, name, pack, amount, coupon: q.coupon, at }), { metadata: { at } });
    // Đơn 0đ (mã giảm 100%): ghi nhận "đã thanh toán 0đ" rồi cộng lượt ngay, không cần chuyển khoản
    let paid = false;
    if (amount === 0) {
      await env.RATE_KV.put(`pay:${code}`, JSON.stringify({ amount: 0, at: new Date().toISOString(), ids: [], free: true }));
      paid = await grantSaoke(env, code);
    }
    return json(request, { ok: true, code, amount, base: q.base, discount: q.discount, coupon: q.coupon, pack, email: user.email, paid });
  }
  return json(request, { ok: false, error: 'not_found' }, 404);
}

// ================= Trang quản lý đơn (/quan-ly) =================
// Giờ SePay ghi dạng "2026-11-23 10:05:00" (giờ Việt Nam) → đổi ra ISO
const isoVN = (t) => { if (!t) return ''; const x = String(t); if (/T/.test(x)) return x; const d = Date.parse(x.replace(' ', 'T') + '+07:00'); return isNaN(d) ? x : new Date(d).toISOString(); };
const dayVN = (iso) => (iso ? new Date(Date.parse(iso) + 7 * 3600e3).toISOString().slice(0, 10) : '');

async function listKeys(env, prefix) {
  const out = [];
  let cursor;
  do {
    const r = await env.RATE_KV.list({ prefix, cursor });
    out.push(...r.keys);
    cursor = r.list_complete ? null : r.cursor;
  } while (cursor);
  return out;
}

function orderStatus(order, pay) {
  if (order.st === 'huy' || order.st === 'hoan_tien') return order.st;
  if (pay && (pay.amount || 0) >= order.amount) return 'da_tra';
  if (pay && pay.amount > 0) return 'thieu';
  return 'cho_tra';
}

export async function adminList(env) {
  const keys = await listKeys(env, 'saoke:order:');
  const orders = (await Promise.all(keys.map(async (k) => {
    const code = k.name.slice('saoke:order:'.length);
    const [order, pay] = await Promise.all([readJSON(env, k.name), readJSON(env, `pay:${code}`)]);
    if (!order) return null;
    // Đơn cũ còn hạn tự xoá: ghi lại không hạn để giữ lâu dài (chỉ làm 1 lần mỗi đơn)
    if (k.expiration) await env.RATE_KV.put(k.name, JSON.stringify(order), { metadata: { at: order.at } });
    return { code, order, pay };
  }))).filter(Boolean);
  const ents = {};
  await Promise.all([...new Set(orders.map((o) => o.order.uid))].map(async (uid) => { ents[uid] = normEnt(await readJSON(env, `saoke:ent:${uid}`)); }));
  const today = dayVN(new Date().toISOString());
  const stats = { today: { n: 0, sum: 0 }, pending: { n: 0, sum: 0 }, total: { n: 0, sum: 0 }, count: {} };
  const rows = orders.map(({ code, order, pay }) => {
    const st = orderStatus(order, pay);
    const paidAt = pay ? isoVN(pay.at) : '';
    const paid = pay ? pay.amount || 0 : 0;
    const p = ents[order.uid]?.packs?.[order.pack];
    const usePack = order.pack === 'SKVIP' ? ['SKVIP', 'SKVIPGD'] : [order.pack];
    const usage = usePack.map((k) => { const q = ents[order.uid]?.packs?.[k]; return { pack: k, used: (q?.slots || []).length, cap: (q?.buys || 0) * (PACKS[k]?.per || 1), who: (q?.slots || []).map((x) => x.label || '').filter(Boolean).slice(0, 12) }; });
    stats.count[st] = (stats.count[st] || 0) + 1;
    if (st === 'da_tra') { stats.total.n++; stats.total.sum += paid; if (dayVN(paidAt) === today) { stats.today.n++; stats.today.sum += paid; } }
    if (st === 'cho_tra' || st === 'thieu') { stats.pending.n++; stats.pending.sum += order.amount - paid; }
    return {
      code, at: order.at, paidAt, st, email: order.email || '', name: order.name || '', phone: code.split(' ')[2] || '',
      pack: order.pack, packName: PACKS[order.pack]?.name || order.pack, amount: order.amount, paid, coupon: order.coupon || '',
      free: !!pay?.free, manual: !!pay?.manual, granted: !!p?.codes?.includes(code), note: order.note || '', usage,
    };
  }).sort((a, b) => String(b.at).localeCompare(String(a.at)));
  // Tiền về có mã SAOKE nhưng không tìm thấy đơn (khách ghi sai nội dung, đơn quá cũ…)
  const known = new Set(orders.map((o) => o.code));
  const stray = (await Promise.all((await listKeys(env, 'pay:SAOKE')).map((k) => k.name.slice(4)).filter((c) => !known.has(c)).slice(0, 50)
    .map(async (c) => { const p = await readJSON(env, `pay:${c}`); return p && { code: c, amount: p.amount || 0, at: isoVN(p.at) }; }))).filter(Boolean);
  return { ok: true, now: new Date().toISOString(), stats, orders: rows, stray };
}

// Bỏ lượt mua của 1 đơn khỏi tài khoản khách (Huỷ / Hoàn tiền). Người đã mở vượt số lượt còn lại bị bỏ (mới nhất trước).
async function revoke(env, order, code) {
  const key = `saoke:ent:${order.uid}`;
  const ent = normEnt(await readJSON(env, key));
  let changed = false;
  for (const k of order.pack === 'SKVIP' ? ['SKVIP', 'SKVIPGD'] : [order.pack]) {
    const p = ent.packs[k];
    if (!p || !p.codes.includes(code)) continue;
    p.codes = p.codes.filter((c) => c !== code);
    p.buys = Math.max(0, p.buys - 1);
    p.slots = (p.slots || []).slice(0, p.buys * (PACKS[k]?.per || 1));
    changed = true;
  }
  if (changed) await env.RATE_KV.put(key, JSON.stringify(ent));
  return changed;
}

export async function adminUpdate(env, code, d, by) {
  const okey = `saoke:order:${code}`;
  const order = await readJSON(env, okey);
  if (!order) return { ok: false, error: 'no_order' };
  const pay = await readJSON(env, `pay:${code}`);
  if (typeof d.note === 'string') order.note = d.note.slice(0, 500);
  const st = d.st;
  if (st) {
    if (!['cho_tra', 'da_tra', 'huy', 'hoan_tien'].includes(st)) return { ok: false, error: 'bad_status' };
    if (st === 'huy' || st === 'hoan_tien') {
      order.st = st;
      await revoke(env, order, code);
    } else {
      delete order.st;
      if (st === 'da_tra') {
        // Xác nhận tay (khách trả tiền mặt / chuyển nhầm tài khoản…): ghi nhận đủ tiền rồi mở lượt
        if (!pay || (pay.amount || 0) < order.amount) await env.RATE_KV.put(`pay:${code}`, JSON.stringify({ amount: order.amount, at: new Date().toISOString(), ids: pay?.ids || [], manual: true, by, prev: pay?.amount || 0 }));
      } else if (pay && !pay.manual && !pay.free && pay.amount > 0) {
        return { ok: false, error: 'has_money' }; // đã có tiền thật về: không đưa về "Chờ trả"
      } else if (pay) {
        await env.RATE_KV.delete(`pay:${code}`); // bỏ xác nhận tay / đơn 0đ
        await revoke(env, order, code);
      }
    }
    order.log = [...(order.log || []), { at: new Date().toISOString(), st, by }].slice(-20);
  }
  await env.RATE_KV.put(okey, JSON.stringify(order), { metadata: { at: order.at } });
  if (st === 'da_tra') await grantSaoke(env, code);
  return { ok: true };
}
