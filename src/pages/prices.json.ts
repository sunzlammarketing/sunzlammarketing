// Bảng giá cho Apps Script kiểm lại số tiền đơn hàng ở phía máy chủ (không tin số tiền trình duyệt gửi lên).
// Sinh từ cùng dữ liệu với web (products.ts, skills.ts) nên đổi giá ở đó là bảng này tự đổi theo.
import type { APIRoute } from 'astro';
import { PRODUCTS, productCode } from '../data/products';
import { SKILLS } from '../data/skills';

export const GET: APIRoute = () => {
  const prices: Record<string, { price: number | null; promo?: { price: number; from: string; until: string } }> = {};
  for (const p of [...PRODUCTS, ...SKILLS]) {
    prices[productCode(p)] = { price: p.price, ...(p.promo ? { promo: p.promo } : {}) };
  }
  return new Response(JSON.stringify({ prices }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'X-Robots-Tag': 'noindex' },
  });
};
