/**
 * Script thống nhất và tạo tài liệu API chi tiết cho PhiloMind (docs/api_documentation.md).
 * Chạy bằng lệnh: node docs/generate_api_doc.js
 */

const fs = require('fs');
const path = require('path');

const API_GROUPS = [
  {
    name: "1. Authentication & User Management (Xác thực & Người dùng)",
    description: "Quản lý tài khoản người học, cập nhật chuỗi ngày học liên tục (streak) và CRUD người dùng cho trang Admin.",
    endpoints: [
      {
        method: "POST",
        path: "/api/auth/register",
        summary: "Đăng ký người dùng mới",
        role: "Public",
        body: {
          email: { type: "string", required: true, description: "Email đăng ký" },
          name: { type: "string", required: true, description: "Tên hiển thị người dùng" },
          password: { type: "string", required: false, description: "Mật khẩu đăng nhập (mock)" }
        },
        response: {
          status: 201,
          body: {
            id: "uuid-user-1234",
            email: "student@philomind.local",
            name: "Nguyễn Văn A",
            streak: 0,
            createdAt: "2026-05-31T00:00:00.000Z"
          }
        }
      },
      {
        method: "POST",
        path: "/api/auth/login",
        summary: "Đăng nhập hệ thống",
        role: "Public",
        body: {
          email: { type: "string", required: true, description: "Email đăng nhập" },
          password: { type: "string", required: false, description: "Mật khẩu đăng nhập (mock)" }
        },
        response: {
          status: 200,
          body: {
            id: "uuid-user-1234",
            email: "student@philomind.local",
            name: "Nguyễn Văn A",
            streak: 3,
            createdAt: "2026-05-31T00:00:00.000Z"
          }
        }
      },
      {
        method: "GET",
        path: "/api/users",
        summary: "Lấy danh sách tất cả người dùng (Admin)",
        role: "Admin",
        query: {
          take: { type: "number", required: false, description: "Số lượng bản ghi tối đa (mặc định 50)" },
          skip: { type: "number", required: false, description: "Số bản ghi bỏ qua để phân trang" }
        },
        response: {
          status: 200,
          body: [
            {
              id: "uuid-user-1234",
              email: "student@philomind.local",
              name: "Nguyễn Văn A",
              streak: 3,
              createdAt: "2026-05-31T00:00:00.000Z"
            }
          ]
        }
      },
      {
        method: "GET",
        path: "/api/users/:id",
        summary: "Lấy chi tiết thông tin một người dùng",
        role: "Admin/Owner",
        params: {
          id: { type: "string", required: true, description: "ID của người dùng cần lấy" }
        },
        response: {
          status: 200,
          body: {
            id: "uuid-user-1234",
            email: "student@philomind.local",
            name: "Nguyễn Văn A",
            streak: 3,
            createdAt: "2026-05-31T00:00:00.000Z",
            progress: [
              { id: "progress-1", nodeId: "node-1", status: "completed" }
            ],
            reviews: [
              { id: "review-1", flashcardId: "card-1", ease: 3 }
            ]
          }
        }
      },
      {
        method: "PUT",
        path: "/api/users/:id",
        summary: "Cập nhật thông tin người dùng (Admin)",
        role: "Admin",
        params: {
          id: { type: "string", required: true, description: "ID của người dùng" }
        },
        body: {
          name: { type: "string", required: false, description: "Tên mới của người dùng" },
          email: { type: "string", required: false, description: "Email mới" },
          streak: { type: "number", required: false, description: "Số ngày học liên tục" }
        },
        response: {
          status: 200,
          body: {
            id: "uuid-user-1234",
            email: "student_updated@philomind.local",
            name: "Nguyễn Văn A Đã Sửa",
            streak: 5,
            createdAt: "2026-05-31T00:00:00.000Z"
          }
        }
      },
      {
        method: "DELETE",
        path: "/api/users/:id",
        summary: "Xóa người dùng (Admin)",
        role: "Admin",
        params: {
          id: { type: "string", required: true, description: "ID của người dùng cần xóa" }
        },
        response: {
          status: 200,
          body: {
            success: true,
            message: "User deleted successfully"
          }
        }
      }
    ]
  },
  {
    name: "2. Courses & PDF Documents (Khóa học & Tài liệu học tập)",
    description: "Tạo và hiển thị các không gian khóa học. Tải tài liệu PDF lên để AI phân tích tự động thành sơ đồ học tập.",
    endpoints: [
      {
        method: "POST",
        path: "/api/courses",
        summary: "Tạo khóa học mới",
        role: "User/Admin",
        body: {
          title: { type: "string", required: true, description: "Tiêu đề khóa học (Ví dụ: Triết học Mác-Lênin)" },
          description: { type: "string", required: false, description: "Mô tả tổng quát về nội dung học tập" },
          userId: { type: "string", required: true, description: "ID người dùng sở hữu khóa học này" }
        },
        response: {
          status: 201,
          body: {
            id: "course-uuid-999",
            title: "Triết học Mác-Lênin",
            description: "Nghiên cứu các quy luật vận động chung nhất...",
            userId: "default-user-id",
            createdAt: "2026-05-31T00:00:00.000Z"
          }
        }
      },
      {
        method: "GET",
        path: "/api/courses",
        summary: "Lấy danh sách khóa học",
        role: "User/Admin",
        query: {
          userId: { type: "string", required: false, description: "Lọc theo ID người học. Nếu bỏ qua sẽ trả về toàn bộ khóa học." }
        },
        response: {
          status: 200,
          body: [
            {
              id: "course-uuid-999",
              title: "Triết học Mác-Lênin",
              description: "Nghiên cứu các quy luật vận động chung nhất...",
              userId: "default-user-id",
              createdAt: "2026-05-31T00:00:00.000Z",
              documents: [],
              _count: { chapters: 3 }
            }
          ]
        }
      },
      {
        method: "GET",
        path: "/api/courses/:id",
        summary: "Chi tiết một khóa học (Admin)",
        role: "User/Admin",
        params: {
          id: { type: "string", required: true, description: "ID khóa học" }
        },
        response: {
          status: 200,
          body: {
            id: "course-uuid-999",
            title: "Triết học Mác-Lênin",
            description: "Nghiên cứu các quy luật vận động chung nhất...",
            userId: "default-user-id",
            createdAt: "2026-05-31T00:00:00.000Z"
          }
        }
      },
      {
        method: "PUT",
        path: "/api/courses/:id",
        summary: "Cập nhật thông tin khóa học (Admin)",
        role: "Admin",
        params: {
          id: { type: "string", required: true, description: "ID khóa học" }
        },
        body: {
          title: { type: "string", required: false, description: "Tiêu đề mới" },
          description: { type: "string", required: false, description: "Mô tả mới" }
        },
        response: {
          status: 200,
          body: {
            id: "course-uuid-999",
            title: "Triết học Mác-Lênin Cập Nhật",
            description: "Mô tả mới",
            userId: "default-user-id",
            createdAt: "2026-05-31T00:00:00.000Z"
          }
        }
      },
      {
        method: "DELETE",
        path: "/api/courses/:id",
        summary: "Xóa khóa học (Admin)",
        role: "Admin",
        params: {
          id: { type: "string", required: true, description: "ID khóa học" }
        },
        response: {
          status: 200,
          body: {
            success: true,
            message: "Course and related chapters/nodes deleted successfully"
          }
        }
      },
      {
        method: "POST",
        path: "/api/courses/:id/upload",
        summary: "Tải lên tài liệu giáo trình để phân tích lộ trình tự động",
        role: "User",
        params: {
          id: { type: "string", required: true, description: "ID khóa học đích nhận tài liệu" }
        },
        body: {
          fileName: { type: "string", required: true, description: "Tên file PDF/TXT tài liệu" },
          content: { type: "string", required: true, description: "Nội dung văn bản được trích xuất từ tài liệu" }
        },
        response: {
          status: 202,
          body: {
            id: "doc-uuid-555",
            fileName: "GiaoTrinhTrietHoc.pdf",
            fileUrl: "https://mock-bucket.local/course-uuid-999/GiaoTrinhTrietHoc.pdf",
            courseId: "course-uuid-999",
            status: "parsing"
          }
        }
      }
    ]
  },
  {
    name: "3. Chapters (Chương học)",
    description: "Quản lý các chương lớn trong khóa học. Đơn vị trung gian gom nhóm các bài học cụ thể.",
    endpoints: [
      {
        method: "POST",
        path: "/api/chapters",
        summary: "Tạo chương mới (Admin)",
        role: "Admin",
        body: {
          title: { type: "string", required: true, description: "Tiêu đề chương (Ví dụ: Chương 1: Khái lược về triết học)" },
          orderIndex: { type: "number", required: true, description: "Thứ tự hiển thị (Ví dụ: 1)" },
          courseId: { type: "string", required: true, description: "ID khóa học chứa chương này" }
        },
        response: {
          status: 201,
          body: {
            id: "chap-uuid-001",
            title: "Chương 1: Khái lược về triết học",
            orderIndex: 1,
            courseId: "course-uuid-999"
          }
        }
      },
      {
        method: "GET",
        path: "/api/chapters",
        summary: "Lấy danh sách tất cả chương (Admin)",
        role: "Admin",
        query: {
          courseId: { type: "string", required: false, description: "Lọc chương theo ID khóa học" }
        },
        response: {
          status: 200,
          body: [
            {
              id: "chap-uuid-001",
              title: "Chương 1: Khái lược về triết học",
              orderIndex: 1,
              courseId: "course-uuid-999"
            }
          ]
        }
      },
      {
        method: "GET",
        path: "/api/chapters/:id",
        summary: "Lấy chi tiết một chương (Admin)",
        role: "Admin",
        params: {
          id: { type: "string", required: true, description: "ID chương" }
        },
        response: {
          status: 200,
          body: {
            id: "chap-uuid-001",
            title: "Chương 1: Khái lược về triết học",
            orderIndex: 1,
            courseId: "course-uuid-999"
          }
        }
      },
      {
        method: "PUT",
        path: "/api/chapters/:id",
        summary: "Cập nhật chương (Admin)",
        role: "Admin",
        params: {
          id: { type: "string", required: true, description: "ID chương" }
        },
        body: {
          title: { type: "string", required: false, description: "Tiêu đề mới" },
          orderIndex: { type: "number", required: false, description: "Thứ tự mới" }
        },
        response: {
          status: 200,
          body: {
            id: "chap-uuid-001",
            title: "Chương 1: Khái lược về triết học Cập Nhật",
            orderIndex: 2,
            courseId: "course-uuid-999"
          }
        }
      },
      {
        method: "DELETE",
        path: "/api/chapters/:id",
        summary: "Xóa chương (Admin)",
        role: "Admin",
        params: {
          id: { type: "string", required: true, description: "ID chương" }
        },
        response: {
          status: 200,
          body: {
            success: true,
            message: "Chapter and all nested nodes deleted successfully"
          }
        }
      }
    ]
  },
  {
    name: "4. Concept Nodes & Learning Journey (Bài học & Sơ đồ lộ trình)",
    description: "Các điểm kiến thức cốt lõi. Chứa nội dung tóm tắt, trích dẫn gốc, độ khó, thời lượng đọc và cập nhật tiến trình học.",
    endpoints: [
      {
        method: "GET",
        path: "/api/courses/:id/journey",
        summary: "Lấy toàn bộ sơ đồ lộ trình học tập (Mindmap)",
        role: "User",
        params: {
          id: { type: "string", required: true, description: "ID khóa học" }
        },
        query: {
          userId: { type: "string", required: true, description: "ID người dùng để hiển thị tiến độ học tập tương ứng" }
        },
        response: {
          status: 200,
          body: [
            {
              id: "chap-uuid-001",
              title: "Khái lược về Triết học",
              orderIndex: 1,
              courseId: "course-uuid-999",
              nodes: [
                {
                  id: "node-uuid-111",
                  title: "Nguồn gốc của triết học",
                  summary: "Triết học ra đời từ nguồn gốc nhận thức và nguồn gốc xã hội...",
                  quickTake: "Triết học xuất hiện từ hoạt động thực tiễn của con người.",
                  difficulty: "Medium",
                  timeToRead: "8 min read",
                  orderIndex: 1,
                  chapterId: "chap-uuid-001",
                  progress: [
                    { id: "prog-1", status: "available" }
                  ],
                  _count: { flashcards: 3 }
                }
              ]
            }
          ]
        }
      },
      {
        method: "GET",
        path: "/api/courses/nodes/:nodeId",
        summary: "Lấy chi tiết nội dung của một bài học (Concept Node)",
        role: "User",
        params: {
          nodeId: { type: "string", required: true, description: "ID của Concept Node" }
        },
        query: {
          userId: { type: "string", required: true, description: "ID người dùng để lấy trạng thái tiến độ và spaced repetition" }
        },
        response: {
          status: 200,
          body: {
            id: "node-uuid-111",
            title: "Nguồn gốc của triết học",
            summary: "Triết học ra đời từ...",
            originalText: "Triết học có hai nguồn gốc chính: Nguồn gốc nhận thức và Nguồn gốc xã hội...",
            quickTake: "Triết học xuất hiện từ hoạt động thực tiễn.",
            difficulty: "Medium",
            timeToRead: "8 min read",
            orderIndex: 1,
            chapterId: "chap-uuid-001",
            podcast: {
              id: "pod-1",
              nodeId: "node-uuid-111",
              audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
              transcript: [
                { speaker: "Host", text: "Chào mừng các bạn đến với bài học hôm nay..." }
              ]
            },
            flashcards: [
              { id: "fc-1", question: "Triết học ra đời từ nguồn gốc nào?", answer: "Nguồn gốc nhận thức và xã hội." }
            ],
            progress: [
              { id: "prog-1", status: "available" }
            ],
            chapter: {
              id: "chap-uuid-001",
              title: "Khái lược về Triết học",
              course: {
                id: "course-uuid-999",
                title: "Triết học Mác-Lênin"
              }
            }
          }
        }
      },
      {
        method: "POST",
        path: "/api/nodes",
        summary: "Tạo Concept Node mới (Admin)",
        role: "Admin",
        body: {
          title: { type: "string", required: true, description: "Tên bài học" },
          summary: { type: "string", required: true, description: "Tóm tắt ngắn gọn (max 5 dòng)" },
          originalText: { type: "string", required: true, description: "Trích dẫn giáo trình học thuật gốc" },
          quickTake: { type: "string", required: true, description: "Ý chính rút gọn nhanh" },
          difficulty: { type: "string", required: true, description: "Độ khó: 'Easy' | 'Medium' | 'Hard'" },
          timeToRead: { type: "string", required: true, description: "Thời lượng đọc (ví dụ: '8 min read')" },
          orderIndex: { type: "number", required: true, description: "Thứ tự sắp xếp trong chương" },
          chapterId: { type: "string", required: true, description: "ID chương chứa bài học này" }
        },
        response: {
          status: 201,
          body: {
            id: "node-uuid-111",
            title: "Nguồn gốc của triết học",
            summary: "Triết học ra đời từ...",
            originalText: "Giáo trình trích dẫn gốc...",
            quickTake: "Ý chính rút gọn.",
            difficulty: "Medium",
            timeToRead: "8 min read",
            orderIndex: 1,
            chapterId: "chap-uuid-001"
          }
        }
      },
      {
        method: "PUT",
        path: "/api/nodes/:nodeId",
        summary: "Cập nhật Concept Node (Admin)",
        role: "Admin",
        params: {
          nodeId: { type: "string", required: true, description: "ID Concept Node cần sửa" }
        },
        body: {
          title: { type: "string", required: false, description: "Tiêu đề mới" },
          summary: { type: "string", required: false, description: "Tóm tắt mới" },
          originalText: { type: "string", required: false, description: "Trích dẫn mới" },
          quickTake: { type: "string", required: false, description: "Ý chính mới" },
          difficulty: { type: "string", required: false, description: "Độ khó mới" },
          timeToRead: { type: "string", required: false, description: "Thời lượng đọc mới" },
          orderIndex: { type: "number", required: false, description: "Thứ tự sắp xếp mới" }
        },
        response: {
          status: 200,
          body: {
            id: "node-uuid-111",
            title: "Nguồn gốc triết học Cập Nhật",
            summary: "Tóm tắt đã sửa...",
            originalText: "Trích dẫn đã sửa...",
            quickTake: "Ý chính đã sửa.",
            difficulty: "Hard",
            timeToRead: "12 min read",
            orderIndex: 1,
            chapterId: "chap-uuid-001"
          }
        }
      },
      {
        method: "DELETE",
        path: "/api/nodes/:nodeId",
        summary: "Xóa Concept Node (Admin)",
        role: "Admin",
        params: {
          nodeId: { type: "string", required: true, description: "ID Concept Node cần xóa" }
        },
        response: {
          status: 200,
          body: {
            success: true,
            message: "Concept node and nested flashcards, progress records deleted successfully"
          }
        }
      },
      {
        method: "PATCH",
        path: "/api/courses/nodes/:nodeId/progress",
        summary: "Cập nhật trạng thái tiến trình học tập của Concept Node",
        role: "User",
        params: {
          nodeId: { type: "string", required: true, description: "ID của Concept Node" }
        },
        body: {
          userId: { type: "string", required: true, description: "ID người dùng đang học" },
          status: { type: "string", required: true, description: "Trạng thái mới: 'locked' | 'available' | 'in_progress' | 'completed'" }
        },
        response: {
          status: 200,
          body: {
            id: "prog-uuid-abc",
            userId: "default-user-id",
            nodeId: "node-uuid-111",
            status: "completed",
            updatedAt: "2026-05-31T01:00:00.000Z"
          }
        }
      }
    ]
  },
  {
    name: "5. Spaced Repetition Flashcards (Thẻ nhớ lặp lại ngắt quãng)",
    description: "Thẻ ôn tập từ khóa học giúp ghi nhớ lâu dài qua thuật toán SM-2 (Again, Hard, Good, Easy). Hỗ trợ CRUD từ Admin.",
    endpoints: [
      {
        method: "GET",
        path: "/api/flashcards/due",
        summary: "Lấy danh sách thẻ nhớ cần học (Spaced Repetition)",
        role: "User",
        query: {
          userId: { type: "string", required: true, description: "ID người dùng" },
          courseId: { type: "string", required: false, description: "ID khóa học (tùy chọn) để lọc thẻ ôn tập" }
        },
        response: {
          status: 200,
          body: [
            {
              id: "fc-uuid-222",
              nodeId: "node-uuid-111",
              tag: "Triết học Mác",
              question: "Định nghĩa vật chất của Lênin giải quyết mặt thứ nhất vấn đề cơ bản thế nào?",
              answer: "Khẳng định vật chất là cái thứ nhất, ý thức có sau và phản ánh vật chất khách quan."
            }
          ]
        }
      },
      {
        method: "POST",
        path: "/api/flashcards/review",
        summary: "Gửi kết quả ôn tập thẻ nhớ (Cập nhật lịch SM-2 và tăng Streak)",
        role: "User",
        body: {
          userId: { type: "string", required: true, description: "ID người dùng đang ôn" },
          flashcardId: { type: "string", required: true, description: "ID thẻ nhớ vừa lật" },
          ease: { type: "number", required: true, description: "Mức độ dễ: 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)" }
        },
        response: {
          status: 201,
          body: {
            id: "rev-uuid-777",
            flashcardId: "fc-uuid-222",
            userId: "default-user-id",
            ease: 3,
            interval: 5,
            nextReview: "2026-06-05T01:00:00.000Z"
          }
        }
      },
      {
        method: "POST",
        path: "/api/flashcards",
        summary: "Tạo thẻ nhớ thủ công (Admin)",
        role: "Admin",
        body: {
          nodeId: { type: "string", required: true, description: "ID bài học (Concept Node) liên kết" },
          tag: { type: "string", required: true, description: "Nhãn gom nhóm (Ví dụ: Vật chất, Ý thức, Phép biện chứng)" },
          question: { type: "string", required: true, description: "Câu hỏi ở mặt trước thẻ" },
          answer: { type: "string", required: true, description: "Đáp án diễn giải ở mặt sau thẻ" }
        },
        response: {
          status: 201,
          body: {
            id: "fc-uuid-222",
            nodeId: "node-uuid-111",
            tag: "Vật chất",
            question: "Đáp án vật chất là gì?",
            answer: "Thực tại khách quan tồn tại độc lập..."
          }
        }
      },
      {
        method: "GET",
        path: "/api/flashcards",
        summary: "Lấy danh sách tất cả các thẻ nhớ trong hệ thống (Admin)",
        role: "Admin",
        query: {
          nodeId: { type: "string", required: false, description: "Lọc thẻ nhớ theo bài học" }
        },
        response: {
          status: 200,
          body: [
            {
              id: "fc-uuid-222",
              nodeId: "node-uuid-111",
              tag: "Vật chất",
              question: "Câu hỏi ôn tập?",
              answer: "Câu trả lời đúng."
            }
          ]
        }
      },
      {
        method: "GET",
        path: "/api/flashcards/:id",
        summary: "Lấy thông tin chi tiết một thẻ nhớ (Admin)",
        role: "Admin",
        params: {
          id: { type: "string", required: true, description: "ID thẻ nhớ" }
        },
        response: {
          status: 200,
          body: {
            id: "fc-uuid-222",
            nodeId: "node-uuid-111",
            tag: "Vật chất",
            question: "Câu hỏi ôn tập?",
            answer: "Câu trả lời đúng."
          }
        }
      },
      {
        method: "PUT",
        path: "/api/flashcards/:id",
        summary: "Cập nhật nội dung thẻ nhớ (Admin)",
        role: "Admin",
        params: {
          id: { type: "string", required: true, description: "ID thẻ nhớ" }
        },
        body: {
          tag: { type: "string", required: false, description: "Nhãn mới" },
          question: { type: "string", required: false, description: "Câu hỏi mới" },
          answer: { type: "string", required: false, description: "Đáp án mới" }
        },
        response: {
          status: 200,
          body: {
            id: "fc-uuid-222",
            nodeId: "node-uuid-111",
            tag: "Vật chất Cập Nhật",
            question: "Câu hỏi mới?",
            answer: "Đáp án mới."
          }
        }
      },
      {
        method: "DELETE",
        path: "/api/flashcards/:id",
        summary: "Xóa thẻ nhớ (Admin)",
        role: "Admin",
        params: {
          id: { type: "string", required: true, description: "ID thẻ nhớ cần xóa" }
        },
        response: {
          status: 200,
          body: {
            success: true,
            message: "Flashcard deleted successfully"
          }
        }
      }
    ]
  },
  {
    name: "6. Socratic AI Debate (Tranh luận Socratic trí tuệ nhân tạo)",
    description: "Khu vực tranh luận giữa người học và trợ lý ảo Socratic giúp làm sâu sắc lý luận bằng phản biện đa chiều.",
    endpoints: [
      {
        method: "GET",
        path: "/api/debates/topics",
        summary: "Lấy toàn bộ danh sách kịch bản/chủ đề tranh luận có sẵn",
        role: "User/Admin",
        response: {
          status: 200,
          body: [
            {
              id: "topic-uuid-abc",
              title: "Tính khách quan của Vật chất",
              description: "Tranh biện về quan điểm vật chất có trước ý thức...",
              initialPrompt: "Xin chào đồng chí! Tôi muốn tranh biện...",
              createdAt: "2026-05-31T00:00:00.000Z"
            }
          ]
        }
      },
      {
        method: "POST",
        path: "/api/debates/topics",
        summary: "Tạo kịch bản tranh luận mới (Admin)",
        role: "Admin",
        body: {
          title: { type: "string", required: true, description: "Tiêu đề kịch bản" },
          description: { type: "string", required: true, description: "Mô tả ngắn" },
          initialPrompt: { type: "string", required: true, description: "Lời mở đầu phái Socratic khêu gợi phản biện" }
        },
        response: {
          status: 201,
          body: {
            id: "topic-uuid-abc",
            title: "Tính khách quan của Vật chất",
            description: "Tranh biện về quan điểm...",
            initialPrompt: "Xin chào đồng chí!...",
            createdAt: "2026-05-31T00:00:00.000Z"
          }
        }
      },
      {
        method: "PUT",
        path: "/api/debates/topics/:id",
        summary: "Cập nhật kịch bản tranh luận (Admin)",
        role: "Admin",
        params: {
          id: { type: "string", required: true, description: "ID kịch bản" }
        },
        body: {
          title: { type: "string", required: false, description: "Tiêu đề mới" },
          description: { type: "string", required: false, description: "Mô tả mới" },
          initialPrompt: { type: "string", required: false, description: "Lời mở đầu mới" }
        },
        response: {
          status: 200,
          body: {
            id: "topic-uuid-abc",
            title: "Tính khách quan của Vật chất (Cập nhật)",
            description: "Mô tả đã sửa...",
            initialPrompt: "Lời mở đầu đã sửa...",
            createdAt: "2026-05-31T00:00:00.000Z"
          }
        }
      },
      {
        method: "DELETE",
        path: "/api/debates/topics/:id",
        summary: "Xóa kịch bản tranh luận (Admin)",
        role: "Admin",
        params: {
          id: { type: "string", required: true, description: "ID kịch bản cần xóa" }
        },
        response: {
          status: 200,
          body: {
            success: true,
            message: "Debate topic deleted successfully"
          }
        }
      },
      {
        method: "GET",
        path: "/api/debates/topic/:topicId",
        summary: "Lấy hoặc khởi tạo phiên đối thoại tranh luận theo Kịch Bản (Topic)",
        role: "User",
        params: {
          topicId: { type: "string", required: true, description: "ID của kịch bản tranh luận" }
        },
        query: {
          userId: { type: "string", required: true, description: "ID người dùng" }
        },
        response: {
          status: 200,
          body: {
            id: "deb-uuid-333",
            topicId: "topic-uuid-abc",
            userId: "default-user-id",
            transcript: [
              { speaker: "Host", text: "Xin chào đồng chí! Tôi có một luận điểm muốn phản biện cùng đồng chí: 'Ý thức quyết định vật chất'...", time: 0 }
            ]
          }
        }
      },
      {
        method: "POST",
        path: "/api/debates/topic/:topicId/message",
        summary: "Gửi tin nhắn phản biện theo Kịch Bản và nhận rebuttals có lịch sử liên tục",
        role: "User",
        params: {
          topicId: { type: "string", required: true, description: "ID kịch bản" }
        },
        body: {
          userId: { type: "string", required: true, description: "ID người dùng" },
          message: { type: "string", required: true, description: "Luận cứ biện chứng của sinh viên" }
        },
        response: {
          status: 200,
          body: {
            id: "deb-uuid-333",
            topicId: "topic-uuid-abc",
            userId: "default-user-id",
            transcript: [
              { speaker: "Host", text: "Xin chào...", time: 0 },
              { speaker: "User", text: "Vật chất khách quan tồn tại độc lập...", time: 1779223000 },
              { speaker: "Host", text: "Nhưng ý chí chủ quan có thể dời non lấp bể, chẳng phải đó là biểu hiện của ý thức quyết định vật chất sao?", time: 1779223050 }
            ]
          }
        }
      },
      {
        method: "GET",
        path: "/api/debates/:nodeId",
        summary: "Lấy hoặc khởi tạo cuộc hội thoại tranh luận theo Nút Bài Học",
        role: "User",
        params: {
          nodeId: { type: "string", required: true, description: "ID của bài học đang tranh luận" }
        },
        query: {
          userId: { type: "string", required: true, description: "ID người dùng" }
        },
        response: {
          status: 200,
          body: {
            id: "deb-uuid-333",
            nodeId: "node-uuid-111",
            userId: "default-user-id",
            transcript: [
              { speaker: "Host", text: "Chào mừng bạn! Chúng ta hãy tranh luận về luận điểm: Vật chất là thực tại khách quan...", time: 0 }
            ]
          }
        }
      },
      {
        method: "POST",
        path: "/api/debates/:nodeId/message",
        summary: "Gửi tin nhắn lập luận và nhận phản hồi phản biện Socratic theo bài học",
        role: "User",
        params: {
          nodeId: { type: "string", required: true, description: "ID của bài học" }
        },
        body: {
          userId: { type: "string", required: true, description: "ID người dùng" },
          message: { type: "string", required: true, description: "Lập luận/Câu trả lời của học viên gửi lên" }
        },
        response: {
          status: 200,
          body: {
            id: "deb-uuid-333",
            nodeId: "node-uuid-111",
            userId: "default-user-id",
            transcript: [
              { speaker: "Host", text: "Chào mừng...", time: 0 },
              { speaker: "User", text: "Tôi nghĩ vật chất có trước vì...", time: 1779223000 },
              { speaker: "Host", text: "Một lập luận thú vị! Tuy nhiên, nếu bạn cho rằng vật chất có trước hoàn toàn, hãy giải thích trường hợp ý chí con người có thể làm biến đổi thiên nhiên?", time: 1779223050 }
            ]
          }
        }
      },
      {
        method: "GET",
        path: "/api/debates/all",
        summary: "Danh sách tất cả cuộc tranh luận đang diễn ra của học viên (Admin)",
        role: "Admin",
        response: {
          status: 200,
          body: [
            {
              id: "deb-uuid-333",
              nodeId: "node-uuid-111",
              userId: "default-user-id",
              node: { title: "Nguồn gốc của triết học" },
              user: { name: "Nguyễn Văn A" }
            }
          ]
        }
      },
      {
        method: "DELETE",
        path: "/api/debates/:id",
        summary: "Xóa phiên tranh luận học viên (Admin)",
        role: "Admin",
        params: {
          id: { type: "string", required: true, description: "ID cuộc tranh luận cần xóa" }
        },
        response: {
          status: 200,
          body: {
            success: true,
            message: "Debate history deleted successfully"
          }
        }
      }
    ]
  },
  {
    name: "7. Podcasts & AI Speech Synthesis (Âm thanh bài học & Chuyển văn bản thành giọng nói)",
    description: "Các bài tóm tắt nói dạng podcast được tổng hợp tự động từ AI. Hỗ trợ CRUD và Preview từ Admin.",
    endpoints: [
      {
        method: "GET",
        path: "/api/podcasts",
        summary: "Lấy danh sách các podcast bài học (Admin)",
        role: "Admin",
        response: {
          status: 200,
          body: [
            {
              id: "pod-1",
              nodeId: "node-uuid-111",
              audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
              node: { title: "Nguồn gốc của triết học" }
            }
          ]
        }
      },
      {
        method: "POST",
        path: "/api/podcasts",
        summary: "Tạo podcast học tập thủ công (Admin)",
        role: "Admin",
        body: {
          nodeId: { type: "string", required: true, description: "ID bài học (Concept Node) liên kết" },
          audioUrl: { type: "string", required: true, description: "Đường dẫn URL chứa file âm thanh WAV/MP3" },
          transcript: { type: "object", required: true, description: "Kịch bản đồng bộ dạng mảng đối tượng { speaker: string, text: string, time?: number }" }
        },
        response: {
          status: 201,
          body: {
            id: "pod-uuid-888",
            nodeId: "node-uuid-111",
            audioUrl: "https://mock-bucket.local/podcasts/manual.wav",
            transcript: [
              { speaker: "Host", text: "Xin chào các học viên..." }
            ]
          }
        }
      },
      {
        method: "PUT",
        path: "/api/podcasts/:id",
        summary: "Cập nhật thông tin podcast (Admin)",
        role: "Admin",
        params: {
          id: { type: "string", required: true, description: "ID podcast" }
        },
        body: {
          audioUrl: { type: "string", required: false, description: "URL file âm thanh mới" },
          transcript: { type: "object", required: false, description: "Kịch bản tóm tắt nói mới" }
        },
        response: {
          status: 200,
          body: {
            id: "pod-uuid-888",
            nodeId: "node-uuid-111",
            audioUrl: "https://mock-bucket.local/podcasts/manual_updated.wav",
            transcript: [
              { speaker: "Host", text: "Xin chào các học viên đã cập nhật..." }
            ]
          }
        }
      },
      {
        method: "DELETE",
        path: "/api/podcasts/:id",
        summary: "Xóa podcast (Admin)",
        role: "Admin",
        params: {
          id: { type: "string", required: true, description: "ID podcast cần xóa" }
        },
        response: {
          status: 200,
          body: {
            success: true,
            message: "Podcast deleted successfully"
          }
        }
      },
      {
        method: "POST",
        path: "/api/podcasts/synthesize",
        summary: "Tổng hợp giọng nói TTS dạng Preview để nghe thử trước khi tạo chính thức (Admin)",
        role: "Admin",
        body: {
          nodeId: { type: "string", required: true, description: "ID bài học cần liên kết" },
          scriptText: { type: "string", required: true, description: "Kịch bản lời thoại thô dạng tiếng Việt để máy đọc" }
        },
        response: {
          status: 201,
          body: {
            audioUrl: "https://supabase-bucket.local/temp/preview-abc.wav",
            transcript: [
              { speaker: "Host", text: "Chào mừng các bạn học sinh đến với bài giảng hôm nay...", time: 0 }
            ]
          }
        }
      }
    ]
  },
  {
    name: "8. Concept Node Warmups (Phần khởi động làm nóng bài học)",
    description: "Quản lý các phần khởi động đa dạng kiểu (image-guess đoán thuật ngữ qua hình ảnh hoặc story đọc truyện trả lời câu hỏi) kết nối bài học thực tiễn.",
    endpoints: [
      {
        method: "GET",
        path: "/api/nodes/:nodeId/warmups",
        summary: "Lấy danh sách các warmup khởi động của một bài học",
        role: "User/Admin",
        params: {
          nodeId: { type: "string", required: true, description: "ID bài học" }
        },
        response: {
          status: 200,
          body: [
            {
              id: "warm-uuid-123",
              nodeId: "node-uuid-111",
              type: "image-guess",
              title: "Nhìn hình đoán thuật ngữ",
              image: "https://mock-image.local/vat_chat.png",
              blanks: "V _ T  C H _ T",
              answer: "VẬT CHẤT",
              reveal: "Vật chất biện chứng là thực tại khách quan..."
            }
          ]
        }
      },
      {
        method: "POST",
        path: "/api/nodes/:nodeId/warmups",
        summary: "Tạo thêm câu hỏi khởi động Warmup cho bài học (Admin)",
        role: "Admin",
        params: {
          nodeId: { type: "string", required: true, description: "ID bài học" }
        },
        body: {
          type: { type: "string", required: true, description: "Kiểu khởi động: 'image-guess' hoặc 'story'" },
          title: { type: "string", required: true, description: "Tiêu đề câu hỏi khởi động" },
          image: { type: "string", required: false, description: "Đường dẫn ảnh (dành cho image-guess)" },
          blanks: { type: "string", required: false, description: "Từ khóa dạng khuyết chữ (dành cho image-guess)" },
          answer: { type: "string", required: false, description: "Đáp án đúng (dành cho image-guess)" },
          story: { type: "string", required: false, description: "Nội dung câu chuyện (dành cho story)" },
          question: { type: "string", required: false, description: "Câu hỏi chiêm nghiệm trắc nghiệm (dành cho story)" },
          options: { type: "array", required: false, description: "Mảng các phương án lựa chọn dạng mảng chuỗi (dành cho story)" },
          correctIndex: { type: "number", required: false, description: "Mã số index đáp án chính xác (dành cho story)" },
          reveal: { type: "string", required: true, description: "Lời lý giải khoa học mở khóa khi học viên hoàn thành" }
        },
        response: {
          status: 201,
          body: {
            id: "warm-uuid-123",
            nodeId: "node-uuid-111",
            type: "image-guess",
            title: "Nhìn hình đoán thuật ngữ",
            image: "https://mock-image.local/vat_chat.png",
            blanks: "V _ T  C H _ T",
            answer: "VẬT CHẤT",
            reveal: "Vật chất biện chứng..."
          }
        }
      },
      {
        method: "DELETE",
        path: "/api/warmups/:id",
        summary: "Xóa phần khởi động Warmup (Admin)",
        role: "Admin",
        params: {
          id: { type: "string", required: true, description: "ID của Warmup cần xóa" }
        },
        response: {
          status: 200,
          body: {
            success: true,
            message: "Warmup deleted successfully"
          }
        }
      }
    ]
  }
];

function generateMarkdown() {
  let md = `# 📘 TÀI LIỆU API HỆ THỐNG PHILOMIND (CHI TIẾT & ĐẦY ĐỦ NHẤT)\n\n`;
  md += `> **Phiên bản:** 1.0.0  \n`;
  md += `> **Địa chỉ API cục bộ:** \`http://localhost:3001\`  \n`;
  md += `> **Swagger API Docs:** \`http://localhost:3001/docs\`  \n`;
  md += `> **Mô tả chung:** Hệ thống sử dụng tiền tố \`/api\` toàn cục (ngoại trừ các endpoint kiểm tra sức khỏe \`/\` và \`/health\`). Tất cả dữ liệu đầu vào và đầu ra đều ở định dạng **JSON** chuẩn. Các trường ID được định nghĩa dạng \`UUID\` hoặc \`String\` tự tăng.\n\n`;
  
  md += `## 📊 TỔNG QUAN HỆ THỐNG ENDPOINT\n\n`;
  md += `| Nhóm API | Số Endpoint | Mô Tả | Trạng Thái |\n`;
  md += `| :--- | :---: | :--- | :---: |\n`;
  
  API_GROUPS.forEach(g => {
    md += `| ${g.name.split(' (')[0]} | ${g.endpoints.length} | ${g.description} | Hoàn hảo |\n`;
  });
  md += `\n---\n\n`;

  md += `## 🔑 ĐỊNH NGHĨA CHI TIẾT TỪNG ENDPOINT\n\n`;

  API_GROUPS.forEach(g => {
    md += `### 📁 ${g.name}\n`;
    md += `*${g.description}*\n\n`;

    g.endpoints.forEach(e => {
      const color = e.method === "GET" ? "🟢" : e.method === "POST" ? "🔵" : e.method === "PUT" ? "🟡" : e.method === "PATCH" ? "🟠" : "🔴";
      md += `#### ${color} \`${e.method} ${e.path}\` - **${e.summary}**\n\n`;
      md += `* **Quyền truy cập:** \`${e.role}\`\n`;

      if (e.params) {
        md += `* **Tham số đường dẫn (Path Params):**\n`;
        md += `  \`\`\`json\n  {\n`;
        Object.entries(e.params).forEach(([key, val]) => {
          md += `    "${key}": "${val.type}" // ${val.required ? '[BẮT BUỘC]' : '[TÙY CHỌN]'} - ${val.description}\n`;
        });
        md += `  }\n  \`\`\`\n`;
      }

      if (e.query) {
        md += `* **Tham số truy vấn (Query Params):**\n`;
        md += `  \`\`\`json\n  {\n`;
        Object.entries(e.query).forEach(([key, val]) => {
          md += `    "${key}": "${val.type}" // ${val.required ? '[BẮT BUỘC]' : '[TÙY CHỌN]'} - ${val.description}\n`;
        });
        md += `  }\n  \`\`\`\n`;
      }

      if (e.body) {
        md += `* **Dữ liệu yêu cầu (Request Body):**\n`;
        md += `  \`\`\`json\n  {\n`;
        Object.entries(e.body).forEach(([key, val]) => {
          md += `    "${key}": "${val.type}" // ${val.required ? '[BẮT BUỘC]' : '[TÙY CHỌN]'} - ${val.description}\n`;
        });
        md += `  }\n  \`\`\`\n`;
      }

      md += `* **Kết quả trả về mẫu (Response):**\n`;
      md += `  * Trạng thái phản hồi: \`${e.response.status}\`\n`;
      md += `  \`\`\`json\n`;
      md += JSON.stringify(e.response.body, null, 2) + `\n`;
      md += `  \`\`\`\n\n`;
      md += `---\n\n`;
    });
  });

  md += `## ⚠️ DANH SÁCH LỖI THƯỜNG GẶP (ERROR HANDLING)\n\n`;
  md += `Hệ thống trả về các mã trạng thái HTTP chuẩn để thông báo lỗi một cách tường minh:\n\n`;
  md += `* **\`400 Bad Request\`**: Dữ liệu yêu cầu đầu vào không hợp lệ hoặc thiếu các trường bắt buộc (được kiểm tra tự động thông qua NestJS \`ValidationPipe\`).\n`;
  md += `  \`\`\`json\n  {\n    "statusCode": 400,\n    "message": ["title must be a string", "userId should not be empty"],\n    "error": "Bad Request"\n  }\n  \`\`\`\n`;
  md += `* **\`404 Not Found\`**: Không tìm thấy tài nguyên được yêu cầu (ví dụ: không có khóa học hoặc Concept Node nào với ID được truyền vào).\n`;
  md += `  \`\`\`json\n  {\n    "statusCode": 404,\n    "message": "Concept node not found",\n    "error": "Not Found"\n  }\n  \`\`\`\n`;
  md += `* **\`500 Internal Server Error\`**: Lỗi hệ thống hoặc lỗi kết nối dịch vụ bên thứ ba (Ví dụ: OpenRouter AI hoặc Hugging Face TTS worker gặp sự cố).\n`;
  md += `  \`\`\`json\n  {\n    "statusCode": 500,\n    "message": "Internal server error",\n    "error": "Internal Server Error"\n  }\n  \`\`\`\n`;

  return md;
}

const outputPath = path.join(__dirname, 'api_documentation.md');
fs.writeFileSync(outputPath, generateMarkdown(), 'utf8');

console.log("\x1b[32m%s\x1b[0m", "✔ [PhiloMind API Doc Generator] Thống nhất tài liệu thành công!");
console.log("\x1b[36m%s\x1b[0m", `✔ Đã tạo tệp tài liệu tại: ${outputPath}`);
console.log("Tổng số nhóm API: " + API_GROUPS.length);
console.log("Tổng số endpoint đã định nghĩa: " + API_GROUPS.reduce((acc, cur) => acc + cur.endpoints.length, 0));
