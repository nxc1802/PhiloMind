// Dữ liệu thảo luận mẫu giữa người học và Admin
// role: "admin" -> hiển thị nổi bật hơn; "user" -> bình thường
// Khi có BE thật, danh sách này sẽ được thay bằng dữ liệu từ máy chủ
export const DISCUSSION_SEED = [
  {
    id: "d1",
    role: "user",
    author: "Minh Anh",
    time: "2 giờ trước",
    text: "Cho em hỏi sự khác nhau giữa vật chất với tư cách phạm trù triết học và vật chất cụ thể là gì ạ?",
  },
  {
    id: "d2",
    role: "admin",
    author: "Giảng viên Hưng",
    time: "1 giờ trước",
    text: "Vật chất (phạm trù triết học) là khái niệm khái quát mọi thực tại khách quan, còn vật chất cụ thể là từng dạng tồn tại riêng lẻ (cái bàn, dòng sông...). Phạm trù không đồng nhất với bất kỳ dạng cụ thể nào.",
  },
  {
    id: "d3",
    role: "user",
    author: "Quốc Bảo",
    time: "45 phút trước",
    text: "Em cảm ơn thầy, vậy vận động có phải là một dạng vật chất không ạ?",
  },
  {
    id: "d4",
    role: "admin",
    author: "Giảng viên Hưng",
    time: "30 phút trước",
    text: "Không, vận động là phương thức tồn tại của vật chất, không phải một dạng vật chất. Không có vật chất nào tồn tại mà không vận động.",
  },
];
