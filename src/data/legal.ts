// Thông tin chủ sở hữu website + nội dung các trang chính sách (/chinh-sach/<slug>).
// Footer, trang chính sách đều đọc từ đây. Trường nào để trống ('') thì tự ẩn trên web.
// Khi có mã số thuế / đăng ký hộ kinh doanh: điền vào OWNER rồi build lại.
// Luồng bán: chuyển khoản QR → Sunz xác nhận thủ công, hoặc SePay tự xác nhận khi SEPAY_AUTO = true
// (src/data/payment.ts) → gửi link tải qua email
// (link hạn 30 ngày, tối đa 15 lượt tải/đơn — khớp MAX_DOWNLOADS trong tools/google-sheet-orders.gs).

import { SEPAY_AUTO } from './payment';

export const OWNER = {
  brand: 'Sunz Làm Marketing',
  name: 'Lê Văn Dũng', // cá nhân chủ sở hữu / người chịu trách nhiệm website
  taxCode: '', // mã số thuế cá nhân hoặc hộ kinh doanh
  address: '', // địa chỉ liên hệ
  phone: '', // số điện thoại / Zalo công khai
  email: 'sunzlammarketing@gmail.com',
  website: 'https://sunzlammarketing.com',
};

export const POLICY_UPDATED = '11/10/2026';

export interface Policy {
  slug: string;
  title: string;
  lead: string;
  sections: { h: string; html: string }[];
}

const contactLine = () =>
  `Email <a href="mailto:${OWNER.email}">${OWNER.email}</a>` +
  (OWNER.phone ? `, điện thoại/Zalo ${OWNER.phone}` : '') +
  `, hoặc qua <a href="/lien-he">trang Liên hệ</a>.`;

export const POLICIES: Policy[] = [
  {
    slug: 'dieu-khoan-su-dung',
    title: 'Điều khoản sử dụng',
    lead: 'Các điều khoản áp dụng khi bạn truy cập website và mua sản phẩm của Sunz Làm Marketing.',
    sections: [
      {
        h: '1. Phạm vi áp dụng',
        html: `<p>Website ${OWNER.brand} (sau đây gọi là "Sunz", "chúng tôi") chia sẻ kiến thức Marketing miễn phí và bán các sản phẩm số: ebook, template, checklist và skill AI. Khi truy cập hoặc mua hàng trên website, bạn đồng ý với các điều khoản dưới đây cùng <a href="/chinh-sach/chinh-sach-bao-mat">Chính sách bảo mật</a>, <a href="/chinh-sach/chinh-sach-thanh-toan">Chính sách thanh toán</a>, <a href="/chinh-sach/chinh-sach-giao-hang">Chính sách giao hàng</a> và <a href="/chinh-sach/chinh-sach-doi-tra-hoan-tien">Chính sách đổi trả, hoàn tiền</a>.</p>`,
      },
      {
        h: '2. Sản phẩm',
        html: `<ul>
<li>Sản phẩm là <b>sản phẩm số</b> (file PDF, Google Sheet, file skill .zip/.md...), không có hàng hóa vật lý.</li>
<li>Tên, mô tả, định dạng, số trang và giá của từng sản phẩm được ghi rõ trên trang chi tiết sản phẩm. Ảnh xem trước là trang thật trích từ sản phẩm.</li>
<li>Giá hiển thị là giá cuối cùng bạn thanh toán, tính bằng Việt Nam đồng (VNĐ). Giá ưu đãi (nếu có) ghi rõ thời hạn áp dụng; hết thời hạn, giá tự trở về giá thường.</li>
</ul>`,
      },
      {
        h: '3. Quy trình mua hàng',
        html: `<ol>
<li>Bấm "Mua ngay" / "Đăng ký ngay" và nhập email, số điện thoại (bắt buộc), họ tên (không bắt buộc).</li>
<li>Chuyển khoản theo mã QR hiển thị, đúng số tiền và nội dung chuyển khoản.</li>
<li>${SEPAY_AUTO ? 'Hệ thống tự xác nhận thanh toán khi tiền vào tài khoản' : 'Sunz xác nhận thanh toán'} và gửi link tải sản phẩm vào email của bạn (chi tiết tại <a href="/chinh-sach/chinh-sach-giao-hang">Chính sách giao hàng</a>).</li>
</ol>
<p>Hợp đồng mua bán được xác lập khi Sunz xác nhận đã nhận đủ tiền cho đơn hàng.</p>`,
      },
      {
        h: '4. Quyền sử dụng sản phẩm (bản quyền)',
        html: `<ul>
<li>Toàn bộ sản phẩm thuộc quyền sở hữu trí tuệ của ${OWNER.brand}. Khi mua, bạn được cấp <b>quyền sử dụng cá nhân</b>, không độc quyền, không chuyển nhượng.</li>
<li>Bạn được dùng sản phẩm cho công việc của mình hoặc của doanh nghiệp bạn đang làm, kể cả để tạo nội dung đăng bán hàng.</li>
<li><b>Không được</b> sao chép, chia sẻ link tải, đăng lại (reup), chia sẻ trong nhóm, bán lại hoặc phân phối sản phẩm dưới bất kỳ hình thức nào khi chưa có sự đồng ý bằng văn bản của Sunz.</li>
<li>Link tải được cấp riêng cho từng đơn hàng, có giới hạn thời gian và lượt tải. Sunz có quyền vô hiệu hóa link và từ chối hỗ trợ khi phát hiện chia sẻ trái phép.</li>
</ul>`,
      },
      {
        h: '5. Nội dung kiến thức và giới hạn trách nhiệm',
        html: `<ul>
<li>Bài viết, tài liệu và kết quả do skill AI tạo ra mang tính tham khảo, chia sẻ kinh nghiệm. Hiệu quả kinh doanh phụ thuộc vào sản phẩm, thị trường và cách bạn áp dụng; Sunz không cam kết một kết quả doanh số cụ thể.</li>
<li>Phần lưu ý pháp lý quảng cáo trong sản phẩm là gợi ý tham khảo theo quy định tại thời điểm biên soạn, không thay thế tư vấn pháp lý. Bạn tự chịu trách nhiệm về nội dung mình đăng tải.</li>
<li>Skill AI chạy trên nền tảng của bên thứ ba (Claude, ChatGPT, Gemini, Codex). Sunz không chịu trách nhiệm khi các nền tảng này thay đổi tính năng, giá, chính sách hoặc gián đoạn dịch vụ; Sunz sẽ cập nhật hướng dẫn sử dụng cho người mua khi có thay đổi.</li>
</ul>`,
      },
      {
        h: '6. Hành vi bị cấm',
        html: `<p>Không sử dụng website để: gửi thông tin giả mạo khi đặt hàng; tấn công, dò quét, làm quá tải hệ thống; thu thập dữ liệu tự động trái phép; đăng tải nội dung vi phạm pháp luật qua biểu mẫu liên hệ.</p>`,
      },
      {
        h: '7. Thay đổi điều khoản',
        html: `<p>Sunz có thể cập nhật các điều khoản này. Bản mới có hiệu lực kể từ khi đăng trên website; đơn hàng đã thanh toán trước đó áp dụng điều khoản tại thời điểm mua.</p>`,
      },
      {
        h: '8. Giải quyết khiếu nại, tranh chấp',
        html: `<p>Mọi thắc mắc, khiếu nại vui lòng gửi về ${contactLine()} Sunz phản hồi trong vòng 03 ngày làm việc. Tranh chấp được ưu tiên giải quyết bằng thương lượng; nếu không thành, các bên có quyền đưa ra cơ quan có thẩm quyền theo pháp luật Việt Nam.</p>`,
      },
    ],
  },
  {
    slug: 'chinh-sach-bao-mat',
    title: 'Chính sách bảo mật',
    lead: 'Sunz thu thập những thông tin gì, dùng vào việc gì và bảo vệ chúng ra sao.',
    sections: [
      {
        h: '1. Thông tin chúng tôi thu thập',
        html: `<ul>
<li><b>Khi mua hàng:</b> email, số điện thoại/Zalo, họ tên (không bắt buộc), sản phẩm, số tiền, mã đơn và thời gian đặt hàng.</li>
<li><b>Khi gửi biểu mẫu liên hệ:</b> họ tên, email, số điện thoại (nếu bạn điền) và nội dung tin nhắn.</li>
<li><b>Trên trình duyệt của bạn:</b> website lưu lựa chọn giao diện sáng/tối, ngôn ngữ và thông tin mua hàng gần nhất (để điền sẵn lần sau) trong bộ nhớ trình duyệt (localStorage). Dữ liệu này nằm trên máy bạn, không gửi về Sunz.</li>
<li>Sunz <b>không</b> thu thập số thẻ, mật khẩu hay thông tin đăng nhập ngân hàng. Thanh toán được thực hiện trong ứng dụng ngân hàng của bạn.</li>
</ul>`,
      },
      {
        h: '2. Mục đích sử dụng',
        html: `<ul>
<li>Xác nhận thanh toán, gửi link tải sản phẩm và hỗ trợ đơn hàng.</li>
<li>Trả lời câu hỏi, góp ý, yêu cầu hợp tác bạn gửi đến.</li>
<li>Gửi thông báo cập nhật sản phẩm bạn đã mua (ví dụ phiên bản skill mới).</li>
</ul>
<p>Sunz <b>không bán, không cho thuê</b> thông tin cá nhân của bạn và không dùng để quảng cáo của bên thứ ba.</p>`,
      },
      {
        h: '3. Nơi lưu trữ và bên thứ ba liên quan',
        html: `<ul>
<li>Thông tin đơn hàng được lưu trong Google Sheet thuộc tài khoản Google của Sunz; email giao hàng gửi từ Gmail của Sunz (Google).</li>
<li>Tin nhắn từ trang Liên hệ được chuyển qua dịch vụ biểu mẫu Formspree đến email của Sunz.</li>
<li>Website được lưu trữ trên Cloudflare và Vercel; các dịch vụ này có thể ghi nhận nhật ký kỹ thuật (địa chỉ IP, trình duyệt) để vận hành và chống tấn công.</li>
<li>Ảnh mã QR thanh toán được tạo bởi dịch vụ VietQR (chỉ gồm số tài khoản nhận, số tiền và nội dung chuyển khoản).</li>
</ul>`,
      },
      {
        h: '4. Thời gian lưu trữ',
        html: `<p>Thông tin đơn hàng được lưu để phục vụ hỗ trợ sau bán và nghĩa vụ kế toán, thuế theo quy định. Bạn có thể yêu cầu xóa thông tin không còn cần thiết cho các nghĩa vụ này.</p>`,
      },
      {
        h: '5. Quyền của bạn',
        html: `<p>Theo quy định về bảo vệ dữ liệu cá nhân, bạn có quyền yêu cầu xem, sửa, xóa thông tin cá nhân hoặc rút lại sự đồng ý xử lý dữ liệu. Gửi yêu cầu về ${contactLine()} Sunz xử lý trong vòng 03 ngày làm việc.</p>`,
      },
      {
        h: '6. Bảo mật thông tin',
        html: `<p>Dữ liệu đơn hàng chỉ người quản lý Sunz truy cập được. Link tải sản phẩm được ký mã hóa, có thời hạn và giới hạn lượt tải; file gốc được để ở chế độ riêng tư. Website dùng kết nối mã hóa HTTPS.</p>`,
      },
    ],
  },
  {
    slug: 'chinh-sach-thanh-toan',
    title: 'Chính sách thanh toán',
    lead: 'Hình thức thanh toán và cách Sunz xác nhận đơn hàng.',
    sections: [
      {
        h: '1. Hình thức thanh toán',
        html: `<p>Sunz nhận thanh toán bằng <b>chuyển khoản ngân hàng qua mã VietQR</b>${SEPAY_AUTO ? ' (đối soát tự động qua SePay)' : ''}. Sau khi bạn nhập thông tin, website hiển thị mã QR với số tài khoản, số tiền và nội dung chuyển khoản điền sẵn. Mở ứng dụng ngân hàng bất kỳ, quét mã và xác nhận.</p>
<p>Website hiện chưa nhận thanh toán bằng thẻ, ví điện tử hay tiền mặt.</p>`,
      },
      {
        h: '2. Lưu ý khi chuyển khoản',
        html: `<ul>
<li>Giữ nguyên <b>nội dung chuyển khoản</b> (dạng <code>SUNZ &lt;mã sản phẩm&gt; &lt;số điện thoại&gt; &lt;mã đơn&gt;</code>) để ${SEPAY_AUTO ? 'hệ thống tự nhận đúng đơn. Sửa hoặc xoá nội dung thì đơn phải chờ đối soát thủ công' : 'Sunz đối chiếu đúng đơn'}.</li>
<li>Chuyển <b>đúng số tiền</b> hiển thị. Chuyển thiếu, Sunz sẽ liên hệ để bạn bổ sung; chuyển thừa hoặc trùng, Sunz hoàn lại phần chênh lệch.</li>
<li>Chỉ chuyển vào tài khoản hiển thị trong mã QR trên website. Sunz không yêu cầu chuyển khoản qua tin nhắn từ tài khoản lạ.</li>
</ul>`,
      },
      {
        h: '3. Xác nhận thanh toán',
        html: SEPAY_AUTO
          ? `<p>Giao dịch đúng số tiền và nội dung chuyển khoản được <b>xác nhận tự động</b>, thường trong 1–2 phút kể từ khi tiền vào tài khoản. Link tải được gửi ngay vào email bạn đã nhập. Trường hợp nội dung chuyển khoản bị sai hoặc thiếu tiền, Sunz đối soát thủ công trong tối đa 24 giờ.</p>`
          : `<p>Sunz đối chiếu giao dịch và xác nhận thủ công, thường trong vòng vài giờ và tối đa 24 giờ kể từ khi nhận tiền. Sau khi xác nhận, link tải được gửi vào email bạn đã nhập.</p>`,
      },
      {
        h: '4. Hóa đơn',
        html: `<p>Nếu cần chứng từ cho đơn hàng, vui lòng liên hệ ${contactLine()}</p>`,
      },
    ],
  },
  {
    slug: 'chinh-sach-giao-hang',
    title: 'Chính sách giao hàng',
    lead: 'Sản phẩm số được giao qua email, không có phí vận chuyển.',
    sections: [
      {
        h: '1. Hình thức giao hàng',
        html: `<p>Tất cả sản phẩm là sản phẩm số và được giao <b>qua email</b>: Sunz gửi email "Thanh toán thành công" kèm nút tải từng file của sản phẩm. Không có giao hàng vật lý, <b>miễn phí giao hàng</b>.</p>`,
      },
      {
        h: '2. Thời gian giao',
        html: `<p>${SEPAY_AUTO ? 'Thường trong <b>1–2 phút</b> sau khi tiền vào tài khoản (xác nhận tự động). Trường hợp cần đối soát thủ công (nội dung chuyển khoản sai, thiếu tiền) thì tối đa <b>24 giờ</b>.' : 'Trong vòng <b>24 giờ</b> kể từ khi Sunz nhận được thanh toán, thường sớm hơn trong giờ hành chính.'} Nếu quá thời gian này chưa nhận được email, hãy kiểm tra hộp thư Spam/Quảng cáo rồi liên hệ ${contactLine()}</p>`,
      },
      {
        h: '3. Link tải',
        html: `<ul>
<li>Link tải dùng được trong <b>30 ngày</b> kể từ khi gửi, tối đa <b>15 lượt tải</b> cho mỗi đơn hàng (cộng tất cả các file).</li>
<li>Hãy tải và lưu file về máy hoặc Google Drive của bạn ngay sau khi nhận.</li>
<li>Link hết hạn hoặc hết lượt: liên hệ Sunz để được gửi link mới miễn phí cho đơn hàng hợp lệ.</li>
</ul>`,
      },
      {
        h: '4. Nhập sai email',
        html: `<p>Nếu bạn nhập nhầm email khi đặt hàng, liên hệ Sunz kèm số điện thoại và nội dung chuyển khoản để được gửi lại vào email đúng.</p>`,
      },
    ],
  },
  {
    slug: 'chinh-sach-doi-tra-hoan-tien',
    title: 'Chính sách đổi trả, hoàn tiền',
    lead: 'Sản phẩm số không thể "trả lại" như hàng vật lý, vì vậy Sunz áp dụng các trường hợp hoàn tiền rõ ràng dưới đây.',
    sections: [
      {
        h: '1. Trường hợp được hoàn tiền 100%',
        html: `<ul>
<li>Bạn đã thanh toán nhưng Sunz <b>không giao được sản phẩm</b> trong 72 giờ và bạn không muốn chờ thêm.</li>
<li>File bị lỗi, không mở được và Sunz <b>không khắc phục được</b> trong 03 ngày làm việc kể từ khi bạn báo lỗi.</li>
<li>Sản phẩm giao <b>khác với mô tả</b> trên trang sản phẩm (sai sản phẩm, thiếu file đã liệt kê).</li>
<li>Bạn <b>chuyển khoản trùng</b> cho cùng một đơn, hoặc chuyển thừa (hoàn phần chênh lệch).</li>
</ul>`,
      },
      {
        h: '2. Trường hợp đổi sản phẩm',
        html: `<p>Nếu bạn mua nhầm sản phẩm và <b>chưa tải file nào</b> (Sunz kiểm tra được lượt tải trên hệ thống), bạn có thể đổi sang sản phẩm khác cùng hoặc cao giá hơn (bù phần chênh lệch) trong vòng 07 ngày kể từ khi nhận email.</p>`,
      },
      {
        h: '3. Trường hợp không hoàn tiền',
        html: `<p>Do sản phẩm số có thể sao chép ngay khi tải về, Sunz không hoàn tiền khi sản phẩm đã được giao đúng mô tả và đã được tải, với lý do đổi ý, không còn nhu cầu, hoặc không biết cách dùng. Với trường hợp không biết cách dùng, Sunz luôn hỗ trợ hướng dẫn miễn phí.</p>`,
      },
      {
        h: '4. Cách yêu cầu và thời gian hoàn tiền',
        html: `<ol>
<li>Gửi yêu cầu về ${contactLine()} Ghi rõ số điện thoại đặt hàng, nội dung chuyển khoản, lý do và ảnh chụp lỗi (nếu có).</li>
<li>Sunz phản hồi trong vòng 03 ngày làm việc.</li>
<li>Khi yêu cầu được chấp nhận, tiền được chuyển khoản lại vào tài khoản bạn đã thanh toán trong vòng 07 ngày làm việc.</li>
</ol>
<p>Khi đã hoàn tiền, link tải của đơn hàng bị vô hiệu hóa và bạn không còn quyền sử dụng sản phẩm.</p>`,
      },
    ],
  },
];
