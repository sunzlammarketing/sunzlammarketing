// Sản phẩm trang Tài liệu (/tai-lieu). Thêm/sửa sản phẩm tại đây.
// - price: số tiền VND (vd 49000). Để null nếu chưa có giá → hiện "Liên hệ".
// - image: ảnh xem trước (bỏ vào public/products/<slug>/cover.webp, tỉ lệ 4:3, ~1200×900).
//   Kèm og.jpg 1200×630 cùng thư mục (ảnh khi chia sẻ link) và trang-N.webp + trang-N-thumb.webp cho gallery.
//   Để trống thì tự vẽ ảnh bìa theo màu + icon.
// - buyUrl: link mua riêng (Zalo, Shopee...). Để trống → mở Messenger fanpage kèm tin nhắn soạn sẵn.
export interface Product {
  slug: string;
  icon: string;
  color: string;
  type: { vi: string; en: string };
  tag: { vi: string; en: string };
  name: { vi: string; en: string };
  desc: { vi: string; en: string };
  price: number | null;
  originalPrice?: number; // giá gốc (gạch ngang) — chỉ hiện khi lớn hơn price
  // Giá mở bán có hạn: trong khoảng from → until bán promo.price, kèm dòng "Giá chính thức" = price
  // (KHÔNG gạch giá, không nhãn %: tránh rủi ro giảm giá >50% theo TT 39/2025/TT-BCT).
  // Hết hạn web tự quay về price (cả hiển thị lẫn số tiền QR). Thời gian theo giờ VN (+07:00).
  promo?: { price: number; from: string; until: string };
  cta?: { vi: string; en: string }; // chữ trên nút mua (mặc định "Mua ngay")
  image?: string;
  buyUrl?: string;
  code?: string; // mã ngắn trong nội dung chuyển khoản (không dấu). Bỏ trống → tự tạo từ slug
  // Trang chi tiết (/tai-lieu/<slug>) — tuỳ chọn, có thì hiện:
  intro?: { vi: string; en: string };       // đoạn giới thiệu dài
  includes?: { vi: string[]; en: string[] }; // "Bạn nhận được gì"
  forWho?: { vi: string[]; en: string[] };   // "Phù hợp với ai"
  gallery?: string[];                        // ảnh chụp thêm (public/products/...)
}

const EBOOK_TEMPLATE = { vi: 'Ebook + Template - Tài liệu Marketing', en: 'Ebook + Template - Marketing Resource' };
const EBOOK = { vi: 'Ebook - Tài liệu Marketing', en: 'Ebook - Marketing Resource' };
const TEMPLATE = { vi: 'Template - Tài liệu Marketing', en: 'Template - Marketing Resource' };

export const PRODUCTS: Product[] = [
  {
    slug: 'nhap-mon-marketing',
    code: 'NMM',
    icon: '📘',
    color: '#2e2a8c',
    type: { vi: 'PDF · 24 trang', en: 'PDF · 24 pages' },
    tag: EBOOK,
    image: '/products/nhap-mon-marketing/cover.webp',
    name: { vi: 'Ebook Nhập môn Marketing cho người mới', en: 'Ebook: Marketing basics for beginners' },
    desc: {
      vi: 'Nắm chắc nền tảng và cách tư duy của người làm marketing trong 8 chương: giải thích dễ hiểu, ví dụ thực tế từ 8 ngành, bài tập áp dụng ngay cho sản phẩm của bạn.',
      en: 'Master the foundations and mindset of a marketer in 8 chapters: plain explanations, real examples from 8 industries and exercises you apply to your own product.',
    },
    price: 49000,
    originalPrice: 99000,
    intro: {
      vi: 'Mới học marketing, bạn gặp ngay một “cơn bão” thuật ngữ: insight, STP, 4P, funnel, CAC, ROAS… Mỗi nguồn dạy một mảnh nên biết nhiều từ mới mà vẫn không biết bắt đầu từ đâu. Ebook này sắp xếp lại kiến thức nền tảng theo đúng thứ tự một người làm marketing suy nghĩ: hiểu khách hàng → chọn khách hàng → thiết kế giá trị → đưa giá trị đến khách → lập kế hoạch → đo lường. Mỗi chương gồm khái niệm cốt lõi viết bằng lời thường, một tình huống “Trước / Sau” ở một ngành khác nhau (tiệm bánh mì, trung tâm tiếng Anh, phòng tập, quán trà, shop thời trang, nha khoa, homestay, shop mỹ phẩm), sai lầm thường gặp và bài tập nhanh. Làm hết bài tập cho một sản phẩm thật, đến chương 7 bạn ghép lại thành một kế hoạch marketing 1 trang hoàn chỉnh.',
      en: 'Starting out in marketing, you hit a storm of jargon: insight, STP, 4P, funnel, CAC, ROAS… Every source teaches one piece, so you learn new words but still don’t know where to start. This ebook puts the fundamentals in the order a marketer actually thinks: understand customers → choose customers → design value → deliver value → plan → measure. Each chapter has the core concepts in plain words, a “Before / After” case from a different industry (bakery, English centre, gym, tea shop, fashion shop, dental clinic, homestay, skincare shop), common mistakes and a quick exercise. Do the exercises for one real product and by chapter 7 you combine them into a complete one-page marketing plan.',
    },
    includes: {
      vi: [
        'Ebook PDF 24 trang, bản 10/2026',
        '8 chương theo lộ trình Hiểu → Chọn → Triển khai → Đo & tối ưu: Marketing là gì, khách hàng & insight, STP & chân dung khách hàng, Marketing Mix 4P–7P, hành trình & phễu, kênh marketing, kế hoạch 1 trang, đo lường & KPI',
        '8 tình huống “Trước / Sau” ở 8 ngành, mỗi tình huống rút ra một bài học',
        'Mẫu dùng ngay: câu định vị, persona, bộ câu hỏi phỏng vấn khách hàng, bảng 7P, khung kế hoạch marketing 1 trang',
        'Bảng chỉ số cốt lõi kèm công thức (CTR, CR, CPA/CAC, AOV, ROAS, CLV) và ví dụ tính ROAS hoà vốn',
        'Sai lầm thường gặp + bài tập nhanh cuối mỗi chương',
        'Tóm tắt cả cuốn trên 1 trang để in, 40 thuật ngữ marketing, lộ trình tự học 30 ngày và checklist sau khi đọc',
      ],
      en: [
        '24-page PDF ebook, October 2026 edition',
        '8 chapters along the Understand → Choose → Execute → Measure path: what marketing is, customers & insight, STP & personas, the 4P–7P marketing mix, journey & funnel, channels, the one-page plan, metrics & KPIs',
        '8 “Before / After” cases from 8 industries, each with a takeaway',
        'Ready-to-use templates: positioning statement, persona, customer interview questions, 7P table, one-page marketing plan',
        'Core metrics with formulas (CTR, CR, CPA/CAC, AOV, ROAS, CLV) and a break-even ROAS worked example',
        'Common mistakes + a quick exercise at the end of every chapter',
        'One-page summary to print, 40 marketing terms, a 30-day self-study plan and a post-reading checklist',
      ],
    },
    forWho: {
      vi: [
        'Sinh viên, người mới đi làm muốn theo nghề marketing',
        'Người trái ngành chuyển sang marketing, cần một “bản đồ” trước khi học sâu',
        'Chủ shop, chủ doanh nghiệp nhỏ tự làm marketing, muốn chi tiền đúng chỗ',
        'Nhân viên sales, CSKH, thiết kế muốn hiểu marketing để phối hợp tốt hơn',
      ],
      en: [
        'Students and new graduates who want a career in marketing',
        'Career switchers who need a map before going deeper',
        'Shop owners and small businesses doing their own marketing who want to spend wisely',
        'Sales, customer service and design staff who want to understand marketing to work better together',
      ],
    },
    gallery: [
      '/products/nhap-mon-marketing/trang-3.webp',
      '/products/nhap-mon-marketing/trang-9.webp',
      '/products/nhap-mon-marketing/trang-19.webp',
      '/products/nhap-mon-marketing/trang-20.webp',
    ],
  },
  {
    slug: 'ebook-50-cong-thuc-viet-content',
    code: 'EB50CT',
    icon: '✍️',
    color: '#403bd3',
    type: { vi: 'PDF · 32 trang', en: 'PDF · 32 pages' },
    tag: EBOOK,
    image: '/products/ebook-50-cong-thuc/cover.webp',
    name: {
      vi: 'Ebook 50 công thức viết content theo tình huống bán hàng',
      en: 'Ebook: 50 content formulas for real sales situations',
    },
    desc: {
      vi: 'Gặp tình huống nào, mở đúng công thức đó. 50 công thức chia theo 10 nhóm tình huống bán hàng, mỗi công thức có khung điền sẵn, ví dụ thực tế và mẹo dùng, kèm soát pháp lý quảng cáo.',
      en: 'Find your situation, open the matching formula. 50 formulas in 10 sales-situation groups, each with a fill-in template, a real example and tips, plus a Vietnamese ad-law check.',
    },
    price: 49000,
    originalPrice: 89000,
    intro: {
      vi: 'Phần lớn caption không bán được vì viết sai tình huống: khách hỏi giá rồi im mà vẫn đăng bài giới thiệu, cần doanh số gấp mà lại kể chuyện thương hiệu. Ebook này bắt đầu từ vấn đề bạn đang gặp. Tra bảng "Chọn mẫu theo tình huống", lấy 3 công thức gợi ý, điền bảng biến (sản phẩm, khách hàng, nỗi đau, lợi ích, bằng chứng, ưu đãi) một lần rồi dùng lại cho cả 50 mẫu. Mỗi công thức gồm các bước của khung, "Dùng khi", khung mẫu có [biến] tô màu, ví dụ minh họa hoàn chỉnh cho nhiều ngành (F&B, mỹ phẩm, thời trang, gia dụng, khóa học) và mẹo tránh rủi ro pháp lý, rủi ro uy tín. Cuối sách có checklist 8 điểm trước khi bấm đăng và tóm tắt quy định quảng cáo mới nhất (Luật Quảng cáo sửa đổi 2026, Thông tư 39/2025/TT-BCT).',
      en: 'Most captions fail because they fit the wrong situation: posting a brand intro when customers ask the price and go silent, or telling a brand story when you need sales this week. This ebook starts from your problem. Look up the "Pick by situation" table, take the 3 suggested formulas, fill in your variables once (product, customer, pain, benefit, proof, offer) and reuse them across all 50. Each formula has its steps, "Use when", a fill-in template with highlighted [variables], a complete example across industries (F&B, cosmetics, fashion, home goods, courses) and tips to avoid legal and reputation risks. It ends with an 8-point pre-publish checklist and a summary of the latest Vietnamese ad rules.',
    },
    includes: {
      vi: [
        'Ebook PDF 32 trang, bản 10/2026',
        '50 công thức chia 10 nhóm: kinh điển (AIDA, PAS, BAB, FAB, 4P), kể chuyện, bằng chứng xã hội, ưu đãi & khẩn cấp, ra mắt sản phẩm, giáo dục, tương tác, xử lý phản đối, chăm sóc khách cũ, caption theo nền tảng',
        '50 khung mẫu có [biến] điền sẵn + 50 ví dụ minh họa hoàn chỉnh',
        'Bảng tra "Chọn mẫu theo tình huống": 8 vấn đề bán hàng phổ biến, mỗi vấn đề 4 công thức nên thử',
        'Bảng biến điền một lần, dùng lại cho cả 50 mẫu',
        'Format riêng cho TikTok, Instagram, Shopee/Lazada/TikTok Shop, Zalo OA, thông báo livestream',
        'Checklist 8 điểm trước khi đăng + lưu ý pháp lý quảng cáo VN',
      ],
      en: [
        '32-page PDF ebook, October 2026 edition',
        '50 formulas in 10 groups: classics (AIDA, PAS, BAB, FAB, 4P), storytelling, social proof, offers & urgency, launches, education, engagement, objection handling, repeat customers, platform-specific captions',
        '50 fill-in templates with [variables] + 50 complete examples',
        '"Pick by situation" table: 8 common sales problems, 4 formulas to try for each',
        'A variables sheet you fill once and reuse for all 50 templates',
        'Formats for TikTok, Instagram, Shopee/Lazada/TikTok Shop, Zalo OA and livestream announcements',
        '8-point pre-publish checklist + Vietnamese ad-law notes',
      ],
    },
    forWho: {
      vi: [
        'Chủ shop online, người bán hàng tự viết content mỗi ngày',
        'Người làm content, marketer cần nhiều góc viết để A/B test',
        'Khách hỏi nhiều mà ít chốt, cần câu trả lời cho "Sao đắt vậy?", "Có hiệu quả thật không?"',
        'Sắp chạy sale, ra mắt sản phẩm, livestream hoặc muốn gọi khách cũ quay lại',
        'Muốn AI viết luôn theo bộ công thức này: xem thêm Skill viết content theo tình huống bán hàng',
      ],
      en: [
        'Online shop owners who write their own content every day',
        'Content creators and marketers who need many angles to A/B test',
        'Sellers who get lots of questions but few orders, and need answers to "Why so expensive?" or "Does it really work?"',
        'Anyone planning a sale, a launch, a livestream or a win-back campaign',
        'Want AI to write with these formulas for you? See the Sales-situation content writing skill',
      ],
    },
    gallery: [
      '/products/ebook-50-cong-thuc/trang-2.webp',
      '/products/ebook-50-cong-thuc/trang-3.webp',
      '/products/ebook-50-cong-thuc/trang-6.webp',
      '/products/ebook-50-cong-thuc/trang-31.webp',
    ],
  },
  {
    slug: 'pheu-marketing-aarrr',
    icon: '🔻',
    color: '#16a34a',
    type: { vi: 'PDF + Template', en: 'PDF + Template' },
    tag: EBOOK_TEMPLATE,
    name: { vi: 'Ebook + Template Phễu Marketing AARRR', en: 'Ebook + Template: AARRR Marketing Funnel' },
    desc: {
      vi: 'Ebook hướng dẫn phễu Marketing AARRR, kèm template giúp bạn vẽ và đo lường hành trình khách hàng qua 5 giai đoạn.',
      en: 'An ebook on the AARRR marketing funnel, with a template to map and measure the customer journey across five stages.',
    },
    price: 49000,
    originalPrice: 99000,
  },
  {
    slug: '30-prompt-ai-cho-marketer',
    code: 'PAI30',
    icon: '🤖',
    color: '#dc2626',
    type: { vi: 'PDF + Template', en: 'PDF + Template' },
    tag: EBOOK_TEMPLATE,
    name: { vi: 'Ebook + Template 30 prompt AI cho Marketer', en: 'Ebook + Template: 30 AI Prompts for Marketers' },
    desc: {
      vi: '30 prompt AI cho công việc Marketing, kèm ebook hướng dẫn và template để tuỳ chỉnh theo mục tiêu, sản phẩm và khách hàng.',
      en: '30 AI prompts for marketing work, with an ebook and a template to adapt them to your goals, product and customers.',
    },
    price: 0,
    originalPrice: 49000,
  },
  {
    slug: 'check-phap-ly-quang-cao-2026',
    code: 'PLQC26',
    icon: '⚖️',
    color: '#4f46e5',
    type: { vi: 'PDF + Template', en: 'PDF + Template' },
    tag: EBOOK_TEMPLATE,
    name: { vi: 'Ebook + Template Check pháp lý quảng cáo 2026 cho Shop & KOC', en: 'Ebook + Template: 2026 Advertising Legal Checks for Shops & KOCs' },
    desc: {
      vi: 'Ebook và template hỗ trợ Shop, KOC rà soát nội dung quảng cáo, ghi chú các điểm cần kiểm tra trước khi đăng.',
      en: 'An ebook and a template to help shops and KOCs review advertising content and record the checks needed before publishing.',
    },
    price: 0,
    originalPrice: 49000,
  },
  {
    slug: 'checklist-seo-on-page',
    code: 'CSOP',
    icon: '✅',
    color: '#272173',
    type: { vi: 'PDF 17 trang + Template', en: '17-page PDF + Template' },
    tag: EBOOK_TEMPLATE,
    image: '/products/checklist-seo-on-page/cover.webp',
    name: { vi: 'Ebook + Template Checklist 30 điểm tối ưu SEO On-page', en: 'Ebook + Template: 30-point On-page SEO Checklist' },
    desc: {
      vi: 'Kiểm tra từng bài viết chuẩn SEO trước khi bấm “Xuất bản”: 30 điểm chia 6 nhóm, 3 mức ưu tiên, ví dụ đúng/sai, công cụ miễn phí và template chấm điểm Google Sheet.',
      en: 'Check every article for SEO before you hit Publish: 30 points in 6 groups, 3 priority levels, right/wrong examples, free tools and a Google Sheet scoring template.',
    },
    price: 39000,
    originalPrice: 75000,
    intro: {
      vi: 'SEO on-page là phần bạn kiểm soát 100%: từ khoá, tiêu đề, cấu trúc, nội dung, hình ảnh, liên kết và tốc độ. Ebook gom 30 điểm cần kiểm tra trước khi đăng mỗi bài, tổng hợp từ hướng dẫn chính thức của Google Search Central và web.dev, cập nhật đến tháng 10/2026. Các điểm đi theo quy trình 3 bước: trước khi viết (điểm 01–05), trong khi viết và dàn trang (06–25), trước và sau khi đăng (26–30). Mỗi điểm có mức ưu tiên Bắt buộc / Quan trọng / Nên có, giải thích vì sao, cách làm, ví dụ đúng/sai và công cụ miễn phí. Kèm template Excel/Google Sheet chấm điểm tự động cho 10 bài viết và tab theo dõi số liệu Search Console sau khi đăng. Muốn chấm thử ngay? Dùng công cụ kiểm tra SEO on-page miễn phí của Sunz.',
      en: 'On-page SEO is the part you fully control: keywords, titles, structure, content, images, links and speed. This ebook collects the 30 points to check before publishing each article, compiled from Google Search Central and web.dev guidance, updated to October 2026. The points follow a 3-step workflow: before writing (01–05), while writing and laying out (06–25), before and after publishing (26–30). Each point has a priority level, why it matters, how to do it, right/wrong examples and free tools. Includes an Excel/Google Sheet template that scores up to 10 articles automatically, plus a tab to track Search Console results after publishing.',
    },
    includes: {
      vi: [
        'Ebook PDF 17 trang, cập nhật theo hướng dẫn Google 10/2026',
        '30 điểm chia 6 nhóm: từ khoá & ý định tìm kiếm, tiêu đề – meta – URL, cấu trúc, chất lượng nội dung, liên kết & hình ảnh, kỹ thuật',
        'Mỗi điểm: mức ưu tiên, vì sao, cách làm, ví dụ đúng/sai, công cụ miễn phí',
        'Checklist in nhanh 2 trang: in ra dùng cho mỗi bài viết',
        '“6 điều Google xác nhận bạn không cần lo”: bỏ các mẹo SEO lỗi thời',
        'Template chấm điểm Excel/Google Sheet: tự tính điểm, xếp loại cho 10 bài + tab theo dõi sau đăng',
      ],
      en: [
        '17-page PDF ebook, updated to Google guidance as of October 2026',
        '30 points in 6 groups: keywords & intent, title–meta–URL, structure, content quality, links & images, technical',
        'Each point: priority, why, how, right/wrong examples, free tools',
        '2-page quick checklist to print for every article',
        '“6 things Google says you don’t need to worry about”',
        'Excel/Google Sheet scoring template: auto score and rating for 10 articles + post-publish tracking tab',
      ],
    },
    forWho: {
      vi: [
        'Người viết content, SEO-er mới cần một quy trình kiểm tra rõ ràng',
        'Chủ shop, doanh nghiệp nhỏ tự viết blog cho website',
        'Trưởng nhóm content cần chuẩn chung để duyệt bài của cả team',
        'Ai đang dùng công cụ kiểm tra SEO on-page của Sunz và muốn hiểu sâu từng điểm',
      ],
      en: [
        'Content writers and new SEOs who need a clear checking process',
        'Shop owners and small businesses writing their own blog',
        'Content leads who need one standard to review the team’s articles',
        'Anyone using Sunz’s free on-page SEO checker who wants the full explanation',
      ],
    },
    gallery: [
      '/products/checklist-seo-on-page/trang-2.webp',
      '/products/checklist-seo-on-page/trang-6.webp',
      '/products/checklist-seo-on-page/trang-14.webp',
      '/products/checklist-seo-on-page/trang-15.webp',
    ],
  },
  {
    slug: 'template-nghien-cuu-4c',
    code: 'TNC4C',
    icon: '🔍',
    color: '#0e7490',
    type: { vi: 'Template', en: 'Template' },
    tag: TEMPLATE,
    name: {
      vi: 'Template Nghiên cứu 4C: Doanh nghiệp, Sản phẩm, Khách hàng, Đối thủ',
      en: 'Template: 4C Research: Company, Product, Customer, Competitor',
    },
    desc: {
      vi: 'Khung nghiên cứu 4C điền sẵn đề mục: Doanh nghiệp, Sản phẩm, Khách hàng, Đối thủ. Làm xong một lượt là có nền dữ liệu để lên chiến lược và viết content.',
      en: 'A 4C research framework with ready-made sections: Company, Product, Customer, Competitor. Fill it in once to get the groundwork for your strategy and content.',
    },
    price: null,
  },
  {
    slug: 'template-lich-content-tet-2027',
    code: 'LCT27',
    icon: '🧧',
    color: '#c2410c',
    type: { vi: 'Template', en: 'Template' },
    tag: TEMPLATE,
    name: { vi: 'Template Lịch Content Tết 2027', en: 'Template: Tet 2027 Content Calendar' },
    desc: {
      vi: 'Lịch content mùa Tết 2027 dựng sẵn theo từng giai đoạn, giúp bạn lên kế hoạch bài đăng, chương trình và kênh triển khai sớm, không bị dồn việc sát Tết.',
      en: 'A ready-made Tet 2027 content calendar organised by stage, so you can plan posts, promotions and channels early instead of rushing before the holiday.',
    },
    price: null,
  },
  {
    slug: 'template-bat-benh-ads',
    code: 'BBADS',
    icon: '🩺',
    color: '#be123c',
    type: { vi: 'Template', en: 'Template' },
    tag: TEMPLATE,
    name: { vi: 'Template “Bắt bệnh Ads”', en: 'Template: “Ads Diagnosis”' },
    desc: {
      vi: 'Template rà soát chiến dịch quảng cáo theo từng chỉ số, giúp tìm ra chỗ đang “có bệnh” trước khi tăng ngân sách hay đổi nội dung.',
      en: 'A template to review ad campaigns metric by metric and find what is going wrong before you raise the budget or change the creative.',
    },
    price: null,
  },
  {
    slug: 'template-bo-loc-dung-nguoi',
    code: 'BLDN',
    icon: '🎯',
    color: '#7c3aed',
    type: { vi: 'Template', en: 'Template' },
    tag: TEMPLATE,
    name: { vi: 'Template “Bộ lọc Đúng người”', en: 'Template: “Right-Fit Filter”' },
    desc: {
      vi: 'Bộ tiêu chí lọc khách hàng mục tiêu, giúp xác định đúng người cần nói chuyện để không tốn tiền quảng cáo và công sức cho tệp không phù hợp.',
      en: 'A set of criteria to filter your target customers, so you talk to the right people and stop spending ad money and effort on the wrong audience.',
    },
    price: null,
  },
];

export const MESSENGER = 'https://m.me/sunzlammarketing';
// Mã sản phẩm cho nội dung chuyển khoản: chữ đầu mỗi cụm của slug, giữ nguyên số (vd nhap-mon-marketing → NMM)
export const productCode = (p: Product) =>
  (p.code || p.slug.split('-').map((w) => (/^\d+$/.test(w) ? w : w[0])).join('')).toUpperCase().slice(0, 8);
export const productUrl = (p: Product) => `/tai-lieu/${p.slug}`;
export const buyHref = (p: Product) =>
  p.buyUrl || `${MESSENGER}?text=${encodeURIComponent(`Xin chào Sunz, mình muốn ${p.price === 0 ? 'nhận miễn phí tài liệu' : 'mua sản phẩm'}: ${p.name.vi}`)}`;
// Giá đang áp dụng tại thời điểm `at` (mặc định lúc build)
export const effectivePrice = (p: Product, at = Date.now()) => {
  const promoOn = p.promo && at >= Date.parse(p.promo.from) && at <= Date.parse(p.promo.until);
  const price = promoOn ? p.promo!.price : p.price;
  // Giá mở bán không hiển thị dạng giảm giá; chỉ originalPrice mới gạch ngang
  const old = promoOn ? null : p.originalPrice;
  const off = price != null && old && old > price ? Math.round((1 - price / old) * 100) : null;
  return { price, old: off ? old! : null, off, promo: promoOn ? p.promo! : null };
};
// Ngày (dd-mm, giờ VN) — dùng cho nhãn "đến hết 20-10" / "từ 21-10"
export const vnDay = (iso: string, plusMs = 0) =>
  new Date(Date.parse(iso) + plusMs).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' });
export const formatVnd = (n: number) => n.toLocaleString('vi-VN') + ' ₫';
