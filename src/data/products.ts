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
    slug: 'template-nghien-cuu-4c',
    code: 'TNC4C',
    icon: '🔍',
    color: '#0e7490',
    type: { vi: 'Excel / Google Sheet · 9 tab', en: 'Excel / Google Sheet · 9 tabs' },
    tag: TEMPLATE,
    name: {
      vi: 'Template Nghiên cứu 4C: Doanh nghiệp, Sản phẩm, Khách hàng, Đối thủ',
      en: 'Template: 4C Research: Company, Product, Customer, Competitor',
    },
    desc: {
      vi: 'Nghiên cứu xong trước khi viết content: 4C + bối cảnh thị trường, bản đồ 6 cấp độ nhu cầu, khám phá và chấm điểm insight, tổng hợp định vị, content pillars và KPI trong một file.',
      en: 'Do the research before you write: 4C + market context, a 6-level awareness map, insight discovery and scoring, and a strategy summary of positioning, content pillars and KPIs in one file.',
    },
    price: 0,
    originalPrice: 49000,
    intro: {
      vi: 'Content nhạt thường không do viết dở mà do thiếu nguyên liệu: không rõ mình mạnh ở đâu, khách nói gì, đối thủ đang bỏ trống chỗ nào. Template này đi theo đúng thứ tự một người làm chiến lược thu thập thông tin: hiểu “mình” (Doanh nghiệp) → biến sản phẩm thành lý do để mua (Sản phẩm) → vẽ chân dung và ngôn ngữ của khách (Khách hàng) → tìm khoảng trống khác biệt (Đối thủ), cộng thêm Bối cảnh thị trường với xu hướng, mùa vụ, quy định ngành. Từ đó bạn map nội dung theo 6 cấp độ nhu cầu, viết và chấm điểm insight, rồi chốt bản định hướng gồm định vị, content pillars, vai trò kênh và KPI. Mỗi ô đều có câu hỏi gợi ý và ví dụ mẫu, kèm nguyên tắc điền, danh sách công cụ tra cứu và checklist 8 hạng mục tự tính tiến độ.',
      en: 'Bland content is usually not bad writing but missing raw material: you don’t know your strengths, what customers say or where competitors leave a gap. This template follows the order a strategist gathers information: understand yourself (Company) → turn the product into reasons to buy (Product) → map your customer and their words (Customer) → find the gap to stand out (Competitor), plus Market context with trends, seasons and industry rules. Then you map content across 6 awareness levels, write and score insights, and lock a brief with positioning, content pillars, channel roles and KPIs. Every cell has a guiding question and an example, plus filling rules, a list of research tools and an 8-item checklist that tracks progress automatically.',
    },
    includes: {
      vi: [
        'File Excel / Google Sheet 9 tab, điền theo 8 bước có sẵn thứ tự',
        'Doanh nghiệp: 19 hạng mục từ định vị, tone of voice, mục tiêu SMART, baseline đến “điều không được nói” + bảng SWOT',
        'Sản phẩm: 17 câu hỏi nghiên cứu (lợi ích, USP, bằng chứng, phản đối thường gặp…) + bảng FAB biến tính năng thành lợi ích',
        'Khách hàng: persona theo cột với nhân khẩu học, hành vi online, Jobs-to-be-done, động lực, rào cản, ngôn ngữ khách hàng',
        'Đối thủ: so sánh 3 đối thủ với thương hiệu mình về định vị, giá, nội dung, quảng cáo, KOL/KOC + bảng chỉ số chi tiết theo từng kênh (Website, sàn TMĐT, Facebook, TikTok, Instagram, YouTube, Zalo…)',
        'Bối cảnh thị trường: xu hướng, kênh mua sắm, quy định quảng cáo + lịch mùa vụ và sự kiện 12 tháng',
        '6 cấp độ nhu cầu: mục đích, kênh, định dạng, CTA, KPI và tỷ trọng nội dung cho từng cấp',
        'Bản đồ khám phá insight + bảng viết và chấm điểm insight theo 4 tiêu chí (thang 20 điểm)',
        'Nguyên tắc điền, công cụ tra cứu gợi ý và checklist hoàn thành nghiên cứu tự tính tiến độ',
      ],
      en: [
        '9-tab Excel / Google Sheet file, filled in 8 ordered steps',
        'Company: 19 items from positioning, tone of voice, SMART goals and baseline to “things we can’t say” + a SWOT table',
        'Product: 17 research questions (benefits, USP, proof, common objections…) + a FAB table that turns features into benefits',
        'Customer: one column per persona with demographics, online behaviour, jobs-to-be-done, motivations, barriers and customer language',
        'Competitor: 3 competitors vs. your brand on positioning, price, content, ads and KOL/KOC + a per-channel metrics table (website, marketplaces, Facebook, TikTok, Instagram, YouTube, Zalo…)',
        'Market context: trends, shopping channels, ad regulations + a 12-month season and event calendar',
        '6 awareness levels: purpose, channels, formats, CTA, KPIs and content share for each level',
        'Insight discovery map + an insight writing and scoring table on 4 criteria (out of 20)',
        'Filling rules, suggested research tools and a research checklist with automatic progress',
      ],
    },
    forWho: {
      vi: [
        'Người làm content, marketer cần nền dữ liệu trước khi lên kế hoạch',
        'Chủ shop, doanh nghiệp nhỏ muốn hiểu rõ khách hàng và đối thủ trước khi chi tiền quảng cáo',
        'Freelancer, agency cần một bộ câu hỏi chuẩn để làm brief với khách hàng mới',
        'Ai sắp ra sản phẩm mới, mở kênh mới hoặc làm lại chiến lược content',
      ],
      en: [
        'Content creators and marketers who need groundwork before planning',
        'Shop owners and small businesses who want to understand customers and competitors before spending on ads',
        'Freelancers and agencies who need a standard question set to brief new clients',
        'Anyone launching a new product or channel, or rebuilding their content strategy',
      ],
    },
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
    slug: 'template-lich-content-tet-2027',
    code: 'LCT27',
    icon: '🧧',
    color: '#c2410c',
    type: { vi: 'Excel / Google Sheet · 7 tab', en: 'Excel / Google Sheet · 7 tabs' },
    tag: TEMPLATE,
    name: { vi: 'Template Lịch Content Tết 2027', en: 'Template: Tet 2027 Content Calendar' },
    desc: {
      vi: 'Lịch content Tết Đinh Mùi 2027 chia 4 chặng từ 02/11/2026 đến 28/02/2027, có sẵn 43 đầu việc và ý tưởng theo tuần, các mốc quan trọng và bảng tự đếm tiến độ.',
      en: 'A Tet 2027 content calendar in 4 stages from 2 Nov 2026 to 28 Feb 2027, with 43 weekly tasks and ideas, key dates and automatic progress tracking.',
    },
    price: 0,
    originalPrice: 49000,
    intro: {
      vi: 'Mùa Tết thắng thua từ tháng 11: KOL/KOC kín lịch và tăng giá, đơn vị vận chuyển chốt hạn giao, còn đối thủ đã lên bài từ sớm. Template này chia mùa Tết 2027 thành 4 chặng rõ ràng. Chuẩn bị (02/11 – 29/11/2026): chốt thông điệp, sản phẩm, quay sẵn content, booking KOL/KOC. Hâm nóng (30/11 – 27/12): gợi ý quà, tận dụng 12.12, thu thập data khách. Bùng nổ (28/12/2026 – 05/02/2027): content chốt đơn, ưu đãi rõ ràng, nhắc hạn chót giao hàng. Giữ chân (06/02 – 28/02/2027): lì xì, chăm sóc khách cũ, tổng kết. Mỗi chặng có sẵn đầu việc và ý tưởng content theo tuần, kèm loại và định dạng gợi ý; bạn chỉ cần chọn, sửa cho hợp brand và điền kênh, ngày đăng, người phụ trách, trạng thái. Các ngày âm lịch (Ông Công Ông Táo 30/01, Giao thừa 05/02, mùng 1 Tết 06/02/2027, Vía Thần Tài, Rằm tháng Giêng) đã quy đổi sẵn sang dương lịch.',
      en: 'Tet is won or lost in November: KOLs/KOCs get booked up and raise prices, couriers set delivery cut-offs and competitors start posting early. This template splits the Tet 2027 season into 4 clear stages. Prepare (2–29 Nov 2026): lock the message and products, shoot content in advance, book KOLs/KOCs. Warm up (30 Nov – 27 Dec): gift ideas, ride 12.12, collect customer data. Peak (28 Dec 2026 – 5 Feb 2027): sales content, clear offers, delivery cut-off reminders. Retain (6–28 Feb 2027): lucky-money offers, caring for past customers, wrap-up. Each stage has weekly tasks and content ideas with suggested type and format; you pick, adapt to your brand and fill in channel, date, owner and status. Lunar dates (Kitchen Gods 30 Jan, New Year’s Eve 5 Feb, Tet day 6 Feb 2027, God of Wealth day, first full moon) are already converted to the solar calendar.',
    },
    includes: {
      vi: [
        'File Excel / Google Sheet 7 tab: Hướng dẫn, Tổng quan, 4 tab cho 4 chặng, Mốc quan trọng',
        '43 đầu việc và ý tưởng content gợi ý theo 17 tuần, mỗi dòng có loại (việc chuẩn bị / content / tin nhắn) và định dạng',
        'Cột tự điền: kênh, ngày đăng / deadline, người phụ trách, trạng thái, link bài, ghi chú',
        'Tab Tổng quan tự đếm số việc hoàn thành, đang làm và % tiến độ của từng chặng',
        '12 mốc quan trọng từ 11.11 đến Rằm tháng Giêng, kèm thứ trong tuần, chặng và gợi ý content',
        'Ý tưởng dùng chung cho nhiều ngành: mỹ phẩm, F&B, thời trang, quà tặng…',
      ],
      en: [
        '7-tab Excel / Google Sheet file: Guide, Overview, one tab per stage, Key dates',
        '43 suggested tasks and content ideas across 17 weeks, each with a type (prep / content / message) and format',
        'Columns to fill in: channel, publish date / deadline, owner, status, post link, notes',
        'The Overview tab counts done and in-progress tasks and the % progress of each stage automatically',
        '12 key dates from 11.11 to the first full moon, with weekday, stage and content ideas',
        'Ideas that fit many industries: cosmetics, F&B, fashion, gifts…',
      ],
    },
    forWho: {
      vi: [
        'Chủ shop online, doanh nghiệp bán quà Tết, set quà, đồ ăn, mỹ phẩm, thời trang',
        'Người làm content, marketer phụ trách chiến dịch Tết của thương hiệu',
        'Team nhỏ cần chia việc và theo dõi tiến độ trong một file chung',
        'Ai từng bị “dồn việc” sát Tết và muốn bắt đầu sớm từ tháng 11',
      ],
      en: [
        'Online shops and businesses selling Tet gifts, gift sets, food, cosmetics or fashion',
        'Content creators and marketers running a brand’s Tet campaign',
        'Small teams who need to split tasks and track progress in one shared file',
        'Anyone who has rushed everything right before Tet and wants to start in November',
      ],
    },
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
    slug: 'template-bat-benh-ads',
    code: 'BBADS',
    icon: '🩺',
    color: '#be123c',
    type: { vi: 'Excel / Google Sheet · 3 tab', en: 'Excel / Google Sheet · 3 tabs' },
    tag: TEMPLATE,
    name: { vi: 'Template “Bắt bệnh Ads”', en: 'Template: “Ads Diagnosis”' },
    desc: {
      vi: 'Ads không ra đơn? Đừng tắt vội. Nhập 8 con số của 2 tuần, file tự tính phễu 4 chỉ số CPM, CTR, CPC, CR và chỉ ra lỗi nằm ở bước nào, nên sửa gì trước.',
      en: 'Ads not selling? Don’t switch them off yet. Enter 8 numbers from 2 weeks and the file calculates a 4-metric funnel (CPM, CTR, CPC, CR), shows which step is failing and what to fix first.',
    },
    price: 0,
    originalPrice: 49000,
    intro: {
      vi: 'Khi quảng cáo không ra đơn, phản xạ thường gặp là tắt chiến dịch, đổi tệp, đổi nội dung và tăng giảm ngân sách cùng lúc, rồi không biết cái nào mới là nguyên nhân. Template này đọc quảng cáo theo phễu 4 con số, từ trên xuống: THẤY (CPM – giá 1.000 lượt hiển thị), BẤM (CTR liên kết – % người thấy rồi bấm), GIÁ (CPC – giá mỗi lượt bấm), MUA (CR – % người bấm rồi mua). Bạn chỉ nhập chi tiêu, lượt hiển thị, lượt click vào liên kết và số đơn của tuần trước và tuần này. File tự tính 4 chỉ số, mức xấu đi so với tuần trước, gắn trạng thái Ổn / Theo dõi / Cần sửa, rồi đưa ra chẩn đoán: bệnh chính là gì, lỗi nằm ở đâu (tệp, creative hay trang bán hàng) và 3 việc nên làm. Nguyên tắc là sửa đúng một chỗ trước, và luôn so với số của chính bạn thay vì con số trung bình trên mạng.',
      en: 'When ads don’t sell, the usual reflex is to switch campaigns off, change the audience, the creative and the budget all at once, and then nobody knows what the cause was. This template reads your ads as a 4-number funnel, top to bottom: SEE (CPM – cost per 1,000 impressions), CLICK (link CTR – % who see and click), COST (CPC – cost per click), BUY (CR – % who click and buy). You only enter spend, impressions, link clicks and orders for last week and this week. The file calculates the 4 metrics and how much each got worse, labels them OK / Watch / Fix, and gives a diagnosis: the main problem, where it sits (audience, creative or sales page) and 3 things to do. The rule: fix one thing first, and always compare with your own numbers instead of internet averages.',
    },
    includes: {
      vi: [
        'File Excel / Google Sheet 3 tab: Bắt bệnh Ads, Hướng dẫn, Tra cứu',
        'Chỉ nhập 8 ô (chi tiêu, hiển thị, click liên kết, đơn hàng × 2 tuần), có ghi chú lấy số ở đâu trong Ads Manager',
        'Tự tính CPM, CTR liên kết, CPC, CR, % thay đổi và mức xấu đi so với tuần trước',
        'Trạng thái Ổn / Theo dõi / Cần sửa, ngưỡng mặc định 10% và 20% có thể tự chỉnh',
        'Kết quả chẩn đoán tự động: bệnh chính, lỗi nằm ở đâu, 3 việc nên làm',
        'Bảng tra cứu 5 tình huống (CPM tăng, CTR giảm, CR giảm, không có bệnh rõ ràng, thiếu số liệu) có thể sửa lời khuyên theo ngành',
        'Số liệu mẫu có sẵn để xem file chạy thế nào trước khi nhập số thật',
      ],
      en: [
        '3-tab Excel / Google Sheet file: Ads Diagnosis, Guide, Lookup',
        'Only 8 inputs (spend, impressions, link clicks, orders × 2 weeks), with notes on where to find each in Ads Manager',
        'Calculates CPM, link CTR, CPC, CR, % change and how much each got worse vs. last week',
        'OK / Watch / Fix labels with default 10% and 20% thresholds you can change',
        'Automatic diagnosis: the main problem, where it sits and 3 things to do',
        'A lookup table of 5 cases (CPM up, CTR down, CR down, no clear problem, missing data) whose advice you can adapt to your industry',
        'Sample numbers included so you can see how it works before entering yours',
      ],
    },
    forWho: {
      vi: [
        'Chủ shop tự chạy quảng cáo Facebook / Instagram',
        'Người mới chạy ads chưa biết đọc chỉ số theo thứ tự nào',
        'Marketer cần báo cáo nhanh hằng tuần: chiến dịch đang lỗi ở đâu, đề xuất sửa gì',
        'Ai đang định tắt chiến dịch vì “không ra đơn” nhưng chưa rõ nguyên nhân',
      ],
      en: [
        'Shop owners running their own Facebook / Instagram ads',
        'Ads beginners who don’t know in what order to read the metrics',
        'Marketers who need a quick weekly report: where the campaign is failing and what to fix',
        'Anyone about to switch off a campaign for “no sales” without knowing why',
      ],
    },
  },
  {
    slug: 'template-bo-loc-dung-nguoi',
    code: 'BLDN',
    icon: '🎯',
    color: '#7c3aed',
    type: { vi: 'Excel / Google Sheet · 3 tab', en: 'Excel / Google Sheet · 3 tabs' },
    tag: TEMPLATE,
    name: { vi: 'Template “Bộ lọc Đúng người”', en: 'Template: “Right-Fit Filter”' },
    desc: {
      vi: 'Content bán được hàng không cần nhiều người xem, nó cần đúng người xem. Trả lời 5 câu trước khi đăng, file chấm điểm và cho biết đây là content bán hàng hay content giải trí.',
      en: 'Content that sells doesn’t need many viewers, it needs the right ones. Answer 5 questions before posting and the file scores it as sales content or entertainment.',
    },
    price: 0,
    originalPrice: 49000,
    intro: {
      vi: 'Nhiều video lên xu hướng, hàng nghìn lượt xem mà không ra đơn nào, vì ai xem cũng thấy vui nhưng không ai thấy video đang nói về mình. Template này là bộ lọc 5 câu hỏi để kiểm tra một content trước khi đăng: câu đầu có gọi đúng người cần mua không, có nói đúng MỘT nỗi đau cụ thể không, người không có nỗi đau đó có tự lướt qua không, có cho thấy sản phẩm xử lý nỗi đau thế nào không, và có một bước tiếp theo rõ ràng để mua không. Bạn ghi ý tưởng content, người cần mua và nỗi đau chính, rồi chọn Có / Chưa cho từng câu. File chấm điểm trên 5: từ 4 câu Có là content bán hàng, 3 câu là gần đạt, dưới 3 là content giải trí, và với mỗi câu Chưa sẽ hiện luôn cách sửa. Tab So sánh giúp chấm 2 content cạnh nhau để thấy cái nào nên dùng để bán.',
      en: 'Plenty of videos go viral with thousands of views and zero orders, because everyone enjoys them but nobody feels the video is about them. This template is a 5-question filter to check a piece of content before posting: does the first line call out the buyer, does it speak to ONE specific pain, will people without that pain scroll past, does it show how the product solves it, and is there one clear next step to buy. You note the content idea, the buyer and the main pain, then answer Yes / Not yet for each question. The file scores it out of 5: 4–5 Yes is sales content, 3 is close, under 3 is entertainment, and every “Not yet” shows how to fix it. The Compare tab scores 2 pieces side by side so you can see which one to use for selling.',
    },
    includes: {
      vi: [
        'File Excel / Google Sheet 3 tab: Bộ lọc Đúng người, So sánh 2 content, Tra cứu',
        '5 câu hỏi kiểm tra, mỗi câu có ví dụ đạt và dấu hiệu chưa đạt',
        'Tự chấm điểm trên 5 và phân loại: content bán hàng / gần đạt / content giải trí, kèm việc nên làm',
        'Gợi ý cách sửa hiện ngay cạnh câu trả lời “Chưa”',
        'Tab So sánh: chấm 2 content cạnh nhau, ví dụ video bắt trend và video nói đúng nỗi đau',
        'Ví dụ mẫu điền sẵn để xem cách dùng, câu chữ gợi ý sửa có thể chỉnh theo ngành',
      ],
      en: [
        '3-tab Excel / Google Sheet file: Right-Fit Filter, Compare 2 pieces, Lookup',
        '5 check questions, each with a passing example and a warning sign',
        'Automatic score out of 5 and a label: sales content / close / entertainment, with what to do next',
        'Fix suggestions appear right next to every “Not yet” answer',
        'Compare tab: score 2 pieces side by side, e.g. a trend video vs. a pain-focused video',
        'A filled-in example to show how it works; the fix wording can be adapted to your industry',
      ],
    },
    forWho: {
      vi: [
        'Chủ shop, người bán hàng tự quay video và viết caption',
        'Người làm content có lượt xem cao nhưng ít đơn',
        'KOC, affiliate muốn video ra đơn chứ không chỉ ra view',
        'Trưởng nhóm content cần tiêu chí chung để duyệt kịch bản trước khi quay',
      ],
      en: [
        'Shop owners and sellers who shoot their own videos and write captions',
        'Content creators with high views but few orders',
        'KOCs and affiliates who want orders, not just views',
        'Content leads who need shared criteria to review scripts before shooting',
      ],
    },
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
];

// Sản phẩm hiện ở khu "Tài liệu nổi bật" trên trang chủ (4 cái = 1 hàng), đúng thứ tự. Đổi slug tại đây.
export const HOME_FEATURED = [
  'template-lich-content-tet-2027',
  'nhap-mon-marketing',
  'template-nghien-cuu-4c',
  'ebook-50-cong-thuc-viet-content',
];

// Tài liệu gợi ý ở cuối mỗi bài blog, theo chủ đề (slug trong src/data/categories.ts). Tối đa 2 cái/chủ đề.
export const RELATED_BY_CATEGORY: Record<string, string[]> = {
  'nen-tang-chien-luoc': ['nhap-mon-marketing', 'template-nghien-cuu-4c'],
  'khach-hang': ['template-nghien-cuu-4c', 'template-bo-loc-dung-nguoi'],
  'thuong-hieu': ['template-nghien-cuu-4c', 'nhap-mon-marketing'],
  'content-social': ['ebook-50-cong-thuc-viet-content', 'template-lich-content-tet-2027'],
  'seo-website': ['checklist-seo-on-page', '30-prompt-ai-cho-marketer'],
  digital: ['template-bat-benh-ads', 'check-phap-ly-quang-cao-2026'],
  growth: ['pheu-marketing-aarrr', 'template-bat-benh-ads'],
  'ecommerce-marketing': ['ebook-50-cong-thuc-viet-content', 'template-bo-loc-dung-nguoi'],
  'du-lieu-do-luong': ['template-bat-benh-ads', 'pheu-marketing-aarrr'],
};

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
