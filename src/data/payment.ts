// Tài khoản NHẬN tiền cho thanh toán chuyển khoản (hiển thị công khai trên web).
// Tài khoản đã liên kết SePay: tiền vào → SePay báo webhook → đơn tự xác nhận, tự gửi email (xem SEPAY.md).
// bin: mã ngân hàng theo chuẩn NAPAS/VietQR (Sacombank = 970403), dùng cho ảnh QR img.vietqr.io.
export const BANK = {
  name: 'Sacombank',
  bin: '970403',
  account: '040100308489',
  holder: 'LE VAN DUNG',
};


// Link Web App của Google Apps Script để lưu đơn hàng vào Google Sheet (xem tools/google-sheet-orders.gs).
// Để trống → không lưu, thanh toán QR vẫn hoạt động bình thường.
export const ORDER_SHEET_URL =
  'https://script.google.com/macros/s/AKfycby6L7irtvK2zRWciRZIJ8f37BCWNqCJzgQPhhFrhLVehQfYxMwBmbR-jWLQn7CcMqkVsQ/exec';

// Bật SAU KHI đã cài xong SePay (webhook + secret Cloudflare + SEPAY_KEY trong Apps Script, xem SEPAY.md)
// và chuyển khoản thử thành công. true → web báo khách "xác nhận tự động trong 1–2 phút";
// false → giữ lời nhắn cũ "Sunz xác nhận thủ công" (webhook vẫn chạy nếu đã cài).
// Ảnh QR luôn lấy từ img.vietqr.io (đã chạy thật với SePay), không phụ thuộc cờ này.
export const SEPAY_AUTO = true; // bật 05/11/2026 sau khi chuyển thử 49k thành công
