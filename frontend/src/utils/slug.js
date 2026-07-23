const TITLE_TO_SLUG = {
  "Nguồn gốc của triết học": "nguon-goc-triet-hoc",
  "Khái niệm triết học": "khai-niem-triet-hoc",
  "Triết học - hạt nhân lý luận của thế giới quan": "triet-hoc-hat-nhan-the-gioi-quan",
  "Vấn đề cơ bản của triết học": "van-de-co-ban",
  "Sự ra đời và phát triển": "su-ra-doi",
  "Đối tượng và chức năng": "doi-tuong-chuc-nang",
  "Vai trò trong đời sống xã hội": "vai-tro-xa-hoi",
  "Vật chất và phương thức tồn tại của vật chất": "vat-chat-va-phuong-thuc-ton-tai",
  "Nguồn gốc, bản chất và kết cấu của ý thức": "nguon-goc-ban-chat-y-thuc",
  "Mối quan hệ giữa vật chất và ý thức": "moi-quan-he-vat-chat-y-thuc",
  "Hai loại hình biện chứng và phép biện chứng duy vật": "hai-loai-hinh-bien-chung",
  "Nội dung của phép biện chứng duy vật": "noi-dung-phep-bien-chung-duy-vat",
  "Quan niệm về nhận thức trong lịch sử triết học": "quan-niem-nhan-thuc-lich-su",
  "Lý luận nhận thức duy vật biện chứng": "ly-luan-nhan-thuc-duy-vat-bien-chung",
  "Phạm trù vật chất": "pham-tru-vat-chat",
  "Phương thức tồn tại của vật chất": "phuong-thuc-ton-tai",
  "Nguồn gốc và bản chất của ý thức": "ban-chat-y-thuc",
  "Mối quan hệ vật chất – ý thức": "quan-he-vc-yt",
  "Hai nguyên lý cơ bản": "hai-nguyen-ly",
  "Các cặp phạm trù": "cap-pham-tru",
  "Ba quy luật cơ bản": "ba-quy-luat",
  "Bản chất của nhận thức": "ban-chat-nhan-thuc",
  "Thực tiễn và vai trò của thực tiễn": "thuc-tien",
  "Chân lý": "chan-ly",
  "Sản xuất vật chất": "san-xuat-vat-chat",
  "Biện chứng LLSX – QHSX": "llsx-qhsx",
  "Cơ sở hạ tầng & kiến trúc thượng tầng": "ha-tang-thuong-tang",
  "Nguồn gốc giai cấp": "nguon-goc-giai-cap",
  "Đấu tranh giai cấp": "dau-tranh-giai-cap",
  "Nhà nước và cách mạng xã hội": "nha-nuoc-cach-mang",
  "Bản chất con người": "ban-chat-con-nguoi",
  "Quần chúng và lãnh tụ": "quan-chung-lanh-tu"
};

const SLUG_TO_TITLE = Object.entries(TITLE_TO_SLUG).reduce((acc, [title, slug]) => {
  acc[slug] = title;
  return acc;
}, {});

export function getSlugFromTitle(title) {
  if (!title) return "";
  return TITLE_TO_SLUG[title] || title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function getTitleFromSlug(slug) {
  return SLUG_TO_TITLE[slug] || slug;
}
