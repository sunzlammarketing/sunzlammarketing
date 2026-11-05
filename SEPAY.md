# Cài SePay: tự xác nhận thanh toán, tự gửi email

Luồng sau khi cài:

```
Khách quét QR, chuyển khoản → tiền vào Sacombank 040100308489
→ SePay báo webhook tới  https://sunzlammarketing.sunzlammarketing.workers.dev/api/sepay
→ Cloudflare Worker kiểm tra API Key → chuyển giao dịch sang Apps Script
→ Apps Script tìm đơn theo nội dung CK, đủ tiền thì đổi "Đã thanh toán" + gửi email link tải
→ cửa sổ thanh toán trên web tự báo "Thanh toán thành công" (kiểm tra mỗi 5 giây)
```

Mọi giao dịch tiền vào được ghi ở tab **Giao dịch SePay** trong Google Sheet đơn hàng.
Giao dịch "Không khớp đơn nào" hoặc "Thiếu tiền" thì xử lý tay như cũ: chọn "Đã thanh toán" ở cột Trạng thái.

## Bước 1. Tạo API Key

Tự đặt một chuỗi ngẫu nhiên dài, ví dụ 40 ký tự chữ + số (dùng trình tạo mật khẩu).
Chuỗi này dùng ở 3 chỗ dưới đây, phải giống hệt nhau. Không gửi chuỗi này cho ai, không dán vào code.

## Bước 2. Cloudflare Worker

Cloudflare → Workers & Pages → `sunzlammarketing` → Settings → Variables and Secrets → Add:
- Type: **Secret**
- Name: `SEPAY_KEY`
- Value: API Key ở bước 1

Nếu đã thêm `SEPAY_KEY` khi cài cho web Sao Kể thì giữ nguyên, dùng đúng giá trị đó cho các bước sau.

## Bước 3. Apps Script (Google Sheet đơn hàng)

1. Mở Sheet đơn hàng → Tiện ích mở rộng → Apps Script.
2. **Chép lại các `fileId`** trong khối `PRODUCTS` của bản đang chạy (ra Notepad).
3. Thay toàn bộ code bằng file `tools/google-sheet-orders.gs` mới, rồi dán lại các `fileId` vào đúng chỗ.
4. ⚙️ Cài đặt dự án → Thuộc tính tập lệnh → Thêm: `SEPAY_KEY` = API Key ở bước 1.
5. Chọn hàm `setup` → Chạy (tạo tab "Giao dịch SePay", hộp thoại báo đã có SEPAY_KEY).
6. Triển khai → Quản lý các bản triển khai → ✏️ → Phiên bản: **Phiên bản mới** → Triển khai.
   Giữ nguyên URL Web App (không tạo bản triển khai mới, vì web đang dùng URL cũ).

Bản mới thêm 2 cột cuối ở tab Đơn hàng: "Mã theo dõi (web)" và "Mã giao dịch SePay".

## Bước 4. SePay

Webhook này dùng chung với web Sao Kể. Nếu SePay đã có webhook gọi tới `/api/sepay` thì **không tạo thêm**,
chỉ kiểm tra lại các mục dưới (nhất là "Bỏ qua nếu… không có Code thanh toán: Không"). Chưa có thì:
my.sepay.vn → Tích hợp WebHooks → Thêm webhooks:
- Sự kiện: **Có tiền vào**
- Tài khoản ngân hàng: Sacombank 040100308489
- Bỏ qua nếu nội dung giao dịch không có Code thanh toán: **Không**
- Gọi đến URL: `https://sunzlammarketing.sunzlammarketing.workers.dev/api/sepay`
- Là webhook xác thực thanh toán: **Có**
- Gọi lại webhook khi lỗi: **Có**
- Kiểu chứng thực: **API Key**, nhập API Key ở bước 1
- Content type: `application/json`

## Bước 5. Thử

Mua thật 1 sản phẩm rẻ nhất trên web (chuyển từ một tài khoản khác của bạn), giữ cửa sổ thanh toán mở.
Đúng thì trong 1–2 phút: cửa sổ báo thành công, email giao hàng tới, tab "Giao dịch SePay" có dòng "Đã xác nhận đơn".
Lỗi thì xem: SePay → Nhật ký webhook (mã phản hồi), Apps Script → Lần thực thi.

## Bước 6. Bật trên web

Thử OK thì đổi `SEPAY_AUTO = true` trong `src/data/payment.ts` (hoặc nhắn Claude "bật SePay").
Web sẽ dùng QR của SePay và báo khách "xác nhận tự động trong 1–2 phút" ở cửa sổ thanh toán và trang chính sách.
