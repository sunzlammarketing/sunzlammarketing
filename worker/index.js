// Cloudflare Worker: phục vụ web tĩnh (Astro) + đường dẫn tải tài liệu có bảo vệ /dl?t=<token>
// + API công cụ kiểm tra SEO on-page /api/seo/* (worker/seo-api.js)
// + /api/sepay: SePay báo tiền vào (worker/sepay.js) → lưu KV cho web Sao Kể + chuyển sang Apps Script tự xác nhận đơn.
// - Mọi đường dẫn khác: trả file tĩnh như cũ (env.ASSETS).
// - /dl: chuyển token sang Apps Script (tools/google-sheet-orders.gs, hàm doGet). Apps Script kiểm tra
//   chữ ký + hạn + số lượt tải, đọc file RIÊNG TƯ trên Drive và trả về base64; Worker trả file để
//   trình duyệt tải xuống ngay. Người mua không bao giờ thấy link Drive.
// Không có bí mật nào ở đây: khoá ký token chỉ nằm trong Apps Script.
import { handleSeoApi } from './seo-api.js';
import { APPS_SCRIPT } from './config.js';
import { handleSepay, handlePayStatus } from './sepay.js';
import { handleSaoke } from './saoke.js';

const SUPPORT = 'https://m.me/sunzlammarketing';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/dl') return download(url);
        if (url.pathname === '/api/order-status') {
      return orderStatus(request, url);
    }
    if (url.pathname === '/api/quote') return quote(request, env, url);
    if (url.pathname === '/api/sepay') return handleSepay(request, env);
    if (url.pathname === '/api/pay-status') return handlePayStatus(request, env, url);
    if (url.pathname.startsWith('/api/saoke/')) return handleSaoke(request, env, url);
    if (url.pathname.startsWith('/api/seo/')) return handleSeoApi(request, env, url);
    return env.ASSETS.fetch(request);
  },
};

async function download(url) {
  const token = url.searchParams.get('t') || '';
  if (!token || token.length > 2000) return page('Link tải không hợp lệ.', 400);

  let data;
  try {
    const res = await fetch(`${APPS_SCRIPT}?dl=${encodeURIComponent(token)}`, { redirect: 'follow' });
    data = await res.json();
  } catch {
    return page('Máy chủ tải đang bận, bạn thử lại sau ít phút nhé.', 502);
  }
  if (!data || !data.ok) return page(data?.error || 'Link tải không hợp lệ hoặc đã hết hạn.', 403);

  const bin = atob(data.b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const name = data.name || 'tai-lieu';
  const ascii = name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w.\- ]/g, '_');
  return new Response(bytes, {
    headers: {
      'Content-Type': data.mime || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`,
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}

function page(message, status) {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const html = `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Tải tài liệu · Sunz Làm Marketing</title></head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#f8fafc;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#0f172a">
<div style="max-width:440px;margin:24px;padding:28px;border-radius:20px;background:#fff;border:1px solid #e2e8f0;text-align:center;box-shadow:0 20px 40px -24px rgba(15,23,42,.3)">
<img src="/logo-mark.png" width="48" height="48" alt="Sunz" style="margin-bottom:12px">
<h1 style="font-size:20px;margin:0 0 8px">Chưa tải được tài liệu</h1>
<p style="color:#475569;line-height:1.6;margin:0 0 18px">${esc(message)}</p>
<a href="${SUPPORT}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:12px">Nhắn Sunz để được hỗ trợ</a>
</div></body></html>`;
  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}


async function orderStatus(request, url) {
  const reply = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex',
      },
    });

  if (request.method !== 'GET') {
    return reply({ ok: false, error: 'method_not_allowed' }, 405);
  }

  const token = url.searchParams.get('token') || '';
  const valid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!valid.test(token)) {
    return reply({ ok: false, error: 'invalid_token' }, 400);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(
      `${APPS_SCRIPT}?action=order-status&token=${encodeURIComponent(token)}`,
      {
        redirect: 'follow',
        signal: controller.signal,
      }
    );

    if (!res.ok) throw new Error('upstream_error');
    const data = await res.json();

    if (!data || !data.ok) {
      const missing = data?.error === 'not_found';
      return reply(
        {
          ok: false,
          error: missing ? 'not_found' : 'unavailable',
        },
        missing ? 404 : 503
      );
    }

    if (
      !['pending', 'confirmed', 'cancelled'].includes(data.payment) ||
      !['sent', 'not_sent'].includes(data.delivery)
    ) {
      throw new Error('invalid_response');
    }

    return reply({
      ok: true,
      payment: data.payment,
      delivery: data.delivery,
    });
  } catch {
    return reply({ ok: false, error: 'unavailable' }, 503);
  } finally {
    clearTimeout(timer);
  }
}

// Báo giá + kiểm mã giảm giá cho cửa sổ thanh toán: GET /api/quote?product=<mã SP>&coupon=<mã giảm giá>
// Giá và mã do Apps Script tính (bảng giá web + tab "Mã giảm giá"); giới hạn 20 lần thử mã / IP / giờ.
async function quote(request, env, url) {
  const reply = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
    });
  if (request.method !== 'GET') return reply({ ok: false, error: 'method_not_allowed' }, 405);
  const product = (url.searchParams.get('product') || '').trim().toUpperCase();
  const coupon = (url.searchParams.get('coupon') || '').trim().toUpperCase();
  if (!/^[A-Z0-9]{2,10}$/.test(product) || (coupon && !/^[A-Z0-9_-]{2,30}$/.test(coupon))) {
    return reply({ ok: false, error: coupon ? 'coupon_invalid' : 'bad_request' }, 400);
  }

  if (coupon && env.RATE_KV) {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const key = `coupon:${ip}:${Math.floor(Date.now() / 3600000)}`;
    const used = Number(await env.RATE_KV.get(key)) || 0;
    if (used >= 20) return reply({ ok: false, error: 'too_many_tries' }, 429);
    await env.RATE_KV.put(key, String(used + 1), { expirationTtl: 3700 });
  }

  try {
    const res = await fetch(
      `${APPS_SCRIPT}?action=quote&product=${encodeURIComponent(product)}&coupon=${encodeURIComponent(coupon)}`,
      { redirect: 'follow' }
    );
    const d = await res.json();
    if (d && d.ok) return reply({ ok: true, base: d.base, discount: d.discount, total: d.total, coupon: d.coupon });
    return reply({ ok: false, error: String(d?.error || 'unavailable') });
  } catch {
    return reply({ ok: false, error: 'unavailable' }, 503);
  }
}
