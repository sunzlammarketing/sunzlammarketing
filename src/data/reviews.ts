// Review THẬT của khách hàng. Chỉ thêm review có thật và đã được khách đồng ý cho đăng
// (lưu ảnh chụp tin nhắn/bình luận gốc làm bằng chứng). Không tự viết review mẫu:
// review giả là quảng cáo gian dối, vi phạm Luật Bảo vệ quyền lợi người tiêu dùng.
//
// Mảng trống → khu "Khách hàng nói gì" tự ẩn trên web.
// - product: slug sản phẩm (src/data/products.ts hoặc skills.ts) để hiện trên trang sản phẩm đó.
//   Bỏ trống → review chung, hiện ở trang chủ và mọi trang sản phẩm.
// - image: (tuỳ chọn) ảnh chụp review gốc, đặt trong public/reviews/, ví dụ '/reviews/chi-huong.webp'.
export interface Review {
  name: string; // tên hoặc tên viết tắt khách đồng ý hiển thị, vd "Chị Hương"
  role: string; // nghề / ngành, vd "Chủ shop mỹ phẩm, Hà Nội"
  text: string; // nguyên văn hoặc rút gọn, không sửa ý
  product?: string;
  image?: string;
  date?: string; // vd '10/2026'
}

export const REVIEWS: Review[] = [];

export const reviewsFor = (slug?: string) =>
  REVIEWS.filter((r) => !r.product || r.product === slug);
