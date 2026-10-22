// Skill AI (Claude Skill) bán trên web: trang /skill và /skill/<slug>.
// Mỗi skill dùng chung luồng mua với Tài liệu (BuyButton + PaymentModal + Google Sheet),
// nên có đủ các trường của Product (name, desc, price, code...).
// Số liệu (dòng, KB, số mẫu...) lấy từ file SKILL.md thật của skill.
import type { Product } from './products';

export interface Skill extends Product {
  file: string; // tên file .skill khách nhận
  stats: { value: string; label: { vi: string; en: string } }[];
  situations: { problem: string; picks: string[] }[]; // bảng tra tình huống → mẫu
  steps: { title: string; text: string }[]; // quy trình skill chạy
  groups: { code: string; name: string; goal: string; items: string[] }[]; // thư viện mẫu
  legal: string[]; // điểm soát pháp lý
  output: string; // ví dụ định dạng kết quả
  includes: string[]; // khách nhận được gì
  requires: string[]; // yêu cầu để dùng
  compat: string; // một dòng tương thích hiển thị ở hero
  platforms: { name: string; badge: string; best?: boolean; note?: string; warn?: boolean; steps: string[] }[]; // warn: ghi chú dạng lưu ý (icon !) // cách cài theo nền tảng
  tryPrompts: { label: string; text: string }[]; // câu mẫu để thử ngay
  updated: string; // ghi chú cập nhật giao diện nền tảng
  // So sánh ✕ / ✓: chỉ ghi điều skill thật sự làm (theo SKILL.md)
  compare: {
    without: { title: string; no: string[]; warn: string[]; fit: string };
    with: { title: string; ok: string[]; star: string[]; fit: string };
  };
}

export const SKILLS: Skill[] = [
  {
    slug: 'viet-content-theo-tinh-huong-ban-hang',
    code: 'SKILL50',
    icon: '🧠',
    color: '#4f46e5',
    type: { vi: 'Claude Skill', en: 'Claude Skill' },
    tag: { vi: 'Skill AI - Content bán hàng', en: 'AI Skill - Sales content' },
    name: {
      vi: 'Skill viết content theo tình huống bán hàng',
      en: 'Sales-situation content writing skill',
    },
    desc: {
      vi: 'Mô tả vấn đề bán hàng bạn đang gặp, AI tự chẩn đoán, chọn 2-3 công thức phù hợp trong bộ 50 công thức viết content theo tình huống bán hàng, viết caption hoàn chỉnh và soát pháp lý quảng cáo VN trước khi giao. Dùng được trên Claude, Codex, ChatGPT và Gemini.',
      en: 'Describe your sales problem; the AI diagnoses it, picks 2-3 of 50 situation-based sales content formulas, writes ready-to-post captions and checks Vietnamese ad law. Works on Claude, Codex, ChatGPT and Gemini.',
    },
    price: 399000,
    cta: { vi: 'Đăng ký ngay', en: 'Register now' },
    promo: { price: 99000, from: '2026-10-22T00:00:00+07:00', until: '2026-11-20T23:59:59+07:00' },
    file: 'viet-content-theo-tinh-huong-ban-hang-by-sunzlammarketing.skill',
    stats: [
      { value: '50', label: { vi: 'công thức viết content', en: 'content formulas' } },
      { value: '10', label: { vi: 'nhóm mục tiêu', en: 'goal groups' } },
      { value: '16', label: { vi: 'tình huống tra nhanh', en: 'quick-match situations' } },
      { value: '8', label: { vi: 'điểm soát pháp lý', en: 'legal checks' } },
      { value: '4', label: { vi: 'nền tảng AI dùng được', en: 'AI platforms supported' } },
      { value: '395', label: { vi: 'dòng hướng dẫn', en: 'lines of instructions' } },
    ],
    situations: [
      { problem: 'Khách chưa biết bạn là ai', picks: ['06 Câu chuyện người sáng lập', '08 Hậu trường sản xuất', '10 Một ngày của...', '26 Mẹo nhanh + gợi ý SP'] },
      { problem: 'Có người xem, ít người mua', picks: ['01 AIDA', '02 PAS', '11 Feedback khách hàng', '36 "Sao đắt vậy?"'] },
      { problem: 'Khách hỏi giá rồi im lặng', picks: ['36 "Sao đắt vậy?"', '37 "Có hiệu quả thật không?"', '39 Đổi trả không rủi ro', '18 Combo tiết kiệm'] },
      { problem: 'Cần doanh số nhanh trong tuần', picks: ['16 Flash sale theo giờ', '17 Số lượng giới hạn', '19 Quà tặng kèm', '20 Lời nhắc giờ chót'] },
      { problem: 'Sắp ra mắt sản phẩm mới', picks: ['21 Teaser nhá hàng', '22 Lý do ra đời', '23 Chính thức ra mắt', '24 Mở đặt trước'] },
      { problem: 'Trang ít tương tác', picks: ['31 Bạn chọn A hay B?', '34 Điền vào chỗ trống', '28 Lầm tưởng & sự thật', '35 Cùng đặt tên SP'] },
      { problem: 'Có nhiều khách cũ', picks: ['41 Tri ân khách quen', '42 Nhắc mua lại', '43 Gợi ý nâng cấp', '45 Gọi khách quay lại'] },
      { problem: 'Cần caption gấp cho một kênh', picks: ['46 TikTok hook 1 dòng', '47 Instagram tối giản', '48 Sàn TMĐT mô tả ngắn', '49 Zalo OA / tin nhắn'] },
    ],
    steps: [
      { title: 'Thu thập thông tin', text: 'Hỏi một lần, chỉ hỏi phần còn thiếu: sản phẩm, khách hàng, nỗi đau, lợi ích, bằng chứng, ưu đãi, kênh đăng, ngành.' },
      { title: 'Chẩn đoán tình huống', text: 'Đối chiếu vấn đề bạn mô tả với bảng tra 8 tình huống chính và 8 tình huống bổ sung.' },
      { title: 'Chọn 2-3 công thức', text: 'Chọn các công thức có góc tiếp cận khác nhau để bạn có lựa chọn thật hoặc chạy A/B test, kèm lý do vì sao hợp.' },
      { title: 'Viết caption hoàn chỉnh', text: 'Bám khung công thức nhưng viết bằng giọng thương hiệu: ngôn ngữ của khách, một thông điệp, một CTA, hook mạnh, đúng format từng kênh.' },
      { title: 'Soát pháp lý trước khi giao', text: 'Kiểm 8 điểm theo quy định quảng cáo VN mới nhất và checklist chất lượng, chỉ rõ chỗ cần sửa.' },
    ],
    groups: [
      { code: 'A', name: 'Công thức kinh điển', goal: 'Bán trực tiếp, chạy quảng cáo', items: ['AIDA', 'PAS', 'BAB', 'FAB', '4P'] },
      { code: 'B', name: 'Kể chuyện', goal: 'Xây niềm tin, khách mới', items: ['Câu chuyện người sáng lập', 'Hành trình khách hàng', 'Hậu trường sản xuất', 'Thú nhận sai lầm', 'Một ngày của...'] },
      { code: 'C', name: 'Bằng chứng xã hội', goal: 'Chốt khách đang phân vân', items: ['Feedback khách hàng', 'Con số biết nói', 'Trước & Sau', 'Repost nội dung của khách', 'Chuyên gia & chứng nhận'] },
      { code: 'D', name: 'Ưu đãi & khẩn cấp', goal: 'Đẩy doanh số ngắn hạn', items: ['Flash sale theo giờ', 'Số lượng giới hạn', 'Combo tiết kiệm', 'Quà tặng kèm', 'Lời nhắc giờ chót'] },
      { code: 'E', name: 'Ra mắt sản phẩm', goal: 'Launch, pre-order', items: ['Teaser nhá hàng', 'Lý do ra đời', 'Chính thức ra mắt', 'Mở đặt trước', 'Đã có hàng trở lại'] },
      { code: 'F', name: 'Giáo dục & giá trị', goal: 'Tăng tương tác, nuôi khách', items: ['Mẹo nhanh + gợi ý SP', 'Những sai lầm thường gặp', 'Lầm tưởng & sự thật', 'So sánh A và B', 'Checklist hướng dẫn chọn'] },
      { code: 'G', name: 'Tương tác kéo đơn', goal: 'Lấy comment, inbox', items: ['Bạn chọn A hay B?', 'Comment để nhận', 'Đoán giá / minigame', 'Điền vào chỗ trống', 'Cùng đặt tên sản phẩm'] },
      { code: 'H', name: 'Xử lý phản đối', goal: 'Khách hỏi nhiều mà không mua', items: ['"Sao đắt vậy?"', '"Có hiệu quả thật không?"', '"Khác gì hàng ngoài chợ?"', 'Đổi trả không rủi ro', 'Gom câu hỏi thường gặp'] },
      { code: 'I', name: 'Chăm sóc & bán lại', goal: 'Tăng giá trị vòng đời khách', items: ['Tri ân khách quen', 'Nhắc mua lại', 'Gợi ý nâng cấp', 'Mua kèm trọn bộ', 'Gọi khách quay lại'] },
      { code: 'J', name: 'Caption theo nền tảng', goal: 'Đăng nhanh đúng kênh', items: ['TikTok hook 1 dòng', 'Instagram tối giản', 'Sàn TMĐT mô tả ngắn', 'Zalo OA / tin nhắn', 'Thông báo livestream'] },
    ],
    legal: [
      'Nhãn "Quảng cáo" / #Ad cho nội dung quảng cáo trên mạng xã hội (Luật Quảng cáo sửa đổi, hiệu lực 01/01/2026)',
      'Không dùng "nhất", "duy nhất", "số 1" khi không có tài liệu chứng minh',
      'Mức giảm giá, giá trị quà tặng theo Thông tư 39/2025/TT-BCT; không nâng giá gốc trước khi giảm',
      'Mỹ phẩm, thực phẩm: không "trị", "chữa", công dụng khớp hồ sơ công bố',
      'Bằng chứng xã hội phải thật, xin phép khách trước khi dùng tên, ảnh, nhận xét',
      'Khan hiếm phải thật: số lượng, thời hạn đúng thực tế',
      'Minigame có thưởng may rủi có thể phải thông báo / đăng ký',
      'So sánh đối thủ phải có căn cứ, không hạ thấp sản phẩm người khác',
    ],
    output: `**Tình huống:** Khách hỏi giá rồi im lặng
**Mẫu chọn:** 36 "Sao đắt vậy?" · 39 Đổi trả không rủi ro

---
**Phiên bản 1 · Mẫu 36** (khách thấy giá cao nên im, cần chia nhỏ giá trị)
[caption hoàn chỉnh]

---
**Phiên bản 2 · Mẫu 39** (khách mua lần đầu còn ngại rủi ro)
[caption hoàn chỉnh]

---
⚖️ Soát pháp lý: Ổn / điểm cần sửa + cách sửa
📌 Cần bạn bổ sung: các thông tin còn trống
💡 Gợi ý đo: chỉ số nên so sánh giữa 2 phiên bản`,
    includes: [
      'File skill .zip để cài trên Claude và Codex',
      'Bộ dùng cho ChatGPT / Gemini: file .md + file Instructions dán sẵn',
      'PDF hướng dẫn cài đặt 2 trang cho cả 4 nền tảng',
    ],
    requires: [
      'Một trong các tài khoản: Claude (Free, Pro, Max, Team, Enterprise), Codex, ChatGPT hoặc Gemini',
      'Dùng tiếng Việt, tối ưu cho thị trường Việt Nam',
    ],
    compat: 'Dùng tốt nhất trên Claude · Tương thích Codex, ChatGPT, Gemini',
    platforms: [
      {
        name: 'Claude',
        badge: 'Tốt nhất',
        best: true,
        note: 'Skill tự kích hoạt khi bạn mô tả tình huống.',
        steps: [
          'Vào Settings › Capabilities, bật Code execution and file creation (gói Team/Enterprise: nhờ quản trị viên bật trong Organization settings › Plugins & skills).',
          'Vào Customize › Skills.',
          'Bấm +, chọn Create skill › Upload a skill.',
          'Chọn file .zip, giữ nguyên tên, không giải nén.',
          'Bật công tắc skill là xong.',
        ],
      },
      {
        name: 'Codex (OpenAI)',
        badge: 'Tương thích đầy đủ',
        note: 'Skill tự kích hoạt khi bạn mô tả tình huống.',
        steps: [
          'Giải nén file .zip, được thư mục chứa SKILL.md.',
          'Chép thư mục vào ~/.codex/skills/ (Mac/Linux) hoặc %USERPROFILE%\\.codex\\skills\\ (Windows).',
          'Khởi động lại Codex rồi mô tả tình huống bán hàng.',
        ],
      },
      {
        name: 'ChatGPT',
        warn: true,
        badge: 'Qua Project',
        note: 'AI đọc file làm tài liệu tham khảo, chất lượng có thể kém hơn một chút.',
        steps: [
          'Thanh bên › New project, đặt tên, ví dụ "Viết content bán hàng".',
          'Thêm file .md vào project.',
          'Bấm ••• › Project settings, dán nội dung file Instructions vào ô Instructions.',
          'Mở chat mới bên trong project và mô tả tình huống.',
        ],
      },
      {
        name: 'Gemini',
        warn: true,
        badge: 'Qua Gem',
        note: 'AI đọc file làm tài liệu tham khảo, chất lượng có thể kém hơn một chút.',
        steps: [
          'Vào gemini.google.com trên máy tính › Gems › New Gem.',
          'Đặt tên Gem, dán nội dung file Instructions vào ô Instructions.',
          'Ở mục Knowledge › Add files, tải lên file .md rồi bấm Save.',
          'Mở Gem và mô tả tình huống bán hàng.',
        ],
      },
    ],
    tryPrompts: [
      { label: 'Khách hỏi giá rồi im', text: 'Shop mình bán son dưỡng 189k, khách hay hỏi giá xong không mua. Viết caption Facebook giúp mình.' },
      { label: 'Cần doanh số nhanh', text: 'Cuối tuần này mình chạy flash sale bình giữ nhiệt, viết caption cho Facebook và Zalo OA.' },
      { label: 'Ra mắt sản phẩm', text: 'Tháng sau ra mắt trà hoa cúc mới, viết chuỗi caption nhá hàng đến mở bán.' },
      { label: 'Gọi đúng mẫu', text: 'Viết theo mẫu 36 "Sao đắt vậy?" cho khóa học Excel 1.490k.' },
    ],
    updated:
      'Thông tin cập nhật 10/2026. Giao diện các nền tảng có thể thay đổi, Sunz cập nhật hướng dẫn cho người mua.',
    compare: {
      without: {
        title: 'Tự viết / hỏi AI chung chung',
        no: [
          'Bắt đầu từ công thức, không từ vấn đề bán hàng đang gặp',
          'Thường chỉ ra một phiên bản, khó A/B test',
          'Không soát pháp lý quảng cáo Việt Nam',
          'AI dễ tự thêm số liệu, feedback cho "hay"',
        ],
        warn: ['Phải tự chỉnh độ dài, format cho từng kênh'],
        fit: 'đã thuộc công thức, có thời gian tự soát lỗi và pháp lý từng bài.',
      },
      with: {
        title: 'Dùng skill Sunz',
        ok: [
          'Chẩn đoán tình huống trước, rồi mới chọn công thức',
          '2-3 phiên bản góc khác nhau, sẵn sàng A/B test',
          'Tự soát 8 điểm pháp lý trước khi giao',
          'Không bịa: thiếu bằng chứng thì để [biến] cho bạn điền',
        ],
        star: ['50 công thức chia 10 nhóm mục tiêu', 'Format riêng TikTok, Instagram, sàn TMĐT, Zalo OA'],
        fit: 'cần caption bán được ngay, đúng tình huống, an toàn pháp lý.',
      },
    },
  },
];

export const skillUrl = (s: Skill) => `/skill/${s.slug}`;
