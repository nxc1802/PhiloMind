// Dữ liệu trò chơi lật thẻ ghi nhớ (Shinkei-suijaku)
// Mỗi chương gồm các cặp: term (khái niệm/thuật ngữ) và desc (mô tả/câu trả lời)
// Người chơi tìm cặp term-desc khớp nhau; khớp thì loại bỏ, không khớp thì úp lại
export const MEMORY_CHAPTERS = {
  1: {
    title: "Nhập môn Triết học",
    pairs: [
      { id: "p1", term: "Triết học", desc: "Hệ thống tri thức lý luận chung nhất về thế giới" },
      { id: "p2", term: "Thế giới quan", desc: "Toàn bộ quan niệm của con người về thế giới" },
      { id: "p3", term: "Phương pháp luận", desc: "Lý luận về phương pháp nhận thức và cải tạo" },
      { id: "p4", term: "Vấn đề cơ bản", desc: "Quan hệ giữa vật chất và ý thức" },
      { id: "p5", term: "Bản thể luận", desc: "Học thuyết về sự tồn tại của thế giới" },
      { id: "p6", term: "Nhận thức luận", desc: "Học thuyết về khả năng nhận thức của con người" },
    ],
  },
  2: {
    title: "Chủ nghĩa Duy vật Biện chứng",
    pairs: [
      { id: "p1", term: "Vật chất", desc: "Phạm trù chỉ thực tại khách quan" },
      { id: "p2", term: "Ý thức", desc: "Sự phản ánh thế giới khách quan vào bộ não" },
      { id: "p3", term: "Vận động", desc: "Phương thức tồn tại của vật chất" },
      { id: "p4", term: "Không gian – thời gian", desc: "Hình thức tồn tại của vật chất" },
      { id: "p5", term: "Phản ánh", desc: "Thuộc tính chung của mọi dạng vật chất" },
      { id: "p6", term: "Đứng im", desc: "Trạng thái vận động trong thăng bằng tương đối" },
    ],
  },
  3: {
    title: "Phép Biện chứng Duy vật",
    pairs: [
      { id: "p1", term: "Lượng – chất", desc: "Thay đổi về lượng dẫn đến thay đổi về chất" },
      { id: "p2", term: "Mâu thuẫn", desc: "Nguồn gốc, động lực của sự phát triển" },
      { id: "p3", term: "Phủ định của phủ định", desc: "Khuynh hướng phát triển theo đường xoáy ốc" },
      { id: "p4", term: "Nguyên lý phát triển", desc: "Mọi sự vật luôn vận động đi lên" },
      { id: "p5", term: "Nguyên nhân – kết quả", desc: "Cặp phạm trù chỉ mối liên hệ sinh ra nhau" },
      { id: "p6", term: "Tất nhiên – ngẫu nhiên", desc: "Cặp phạm trù về cách thức sự vật xuất hiện" },
    ],
  },
  4: {
    title: "Học thuyết Giá trị Thặng dư",
    pairs: [
      { id: "p1", term: "Giá trị thặng dư", desc: "Phần giá trị dôi ra do công nhân tạo ra" },
      { id: "p2", term: "Hàng hóa sức lao động", desc: "Hàng hóa đặc biệt tạo ra giá trị lớn hơn bản thân" },
      { id: "p3", term: "Tư bản bất biến", desc: "Tư bản dưới dạng tư liệu sản xuất" },
      { id: "p4", term: "Tư bản khả biến", desc: "Tư bản dùng để mua sức lao động" },
      { id: "p5", term: "Tỷ suất giá trị thặng dư", desc: "Mức độ bóc lột lao động làm thuê" },
      { id: "p6", term: "Tích lũy tư bản", desc: "Biến giá trị thặng dư thành tư bản phụ thêm" },
    ],
  },
  5: {
    title: "Chủ nghĩa Duy vật Lịch sử",
    pairs: [
      { id: "p1", term: "Hình thái kinh tế – xã hội", desc: "Xã hội ở từng giai đoạn với kiểu QHSX đặc trưng" },
      { id: "p2", term: "Lực lượng sản xuất", desc: "Quan hệ giữa con người với tự nhiên trong sản xuất" },
      { id: "p3", term: "Quan hệ sản xuất", desc: "Quan hệ giữa người với người trong sản xuất" },
      { id: "p4", term: "Cơ sở hạ tầng", desc: "Toàn bộ QHSX hợp thành cơ cấu kinh tế" },
      { id: "p5", term: "Kiến trúc thượng tầng", desc: "Quan điểm chính trị, pháp luật và thiết chế tương ứng" },
      { id: "p6", term: "Đấu tranh giai cấp", desc: "Động lực phát triển của xã hội có giai cấp" },
    ],
  },
};
