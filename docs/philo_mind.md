Proposal Dự Án

“AI Philosophy Learning Journey”

Mục tiêu dự án

Xây dựng một nền tảng học Triết học bằng AI theo hướng:

* trực quan
* dễ tiếp cận
* cá nhân hóa
* học theo hành trình tư duy

Thay vì đọc giáo trình tuyến tính truyền thống, người học sẽ:

* khám phá kiến thức qua mindmap
* học theo learning journey
* nghe podcast AI
* xem visual minh họa
* debate với AI tutor
* luyện flashcard

⸻

1. Problem Statement

Sinh viên học Triết hiện gặp các vấn đề:

* Giáo trình dài, nhiều chữ
* Khó hình dung quan hệ khái niệm
* Học thuộc nhưng không hiểu
* Khó duy trì hứng thú
* Không có công cụ tương tác để luyện tư duy phản biện

Các công cụ hiện tại:

* PDF viewer
* slide
* chatbot AI tổng quát

chưa được tối ưu riêng cho:

“cấu trúc tư duy của triết học”.

⸻

2. Vision

Biến giáo trình triết học thành:

“một không gian học tập tương tác”.

Người học không chỉ:

* đọc
* ghi nhớ

mà còn:

* khám phá
* liên kết khái niệm
* tranh luận
* nghe giải thích
* học theo tiến trình

⸻

3. Core Concept

Từ:

Giáo trình PDF → đọc tuyến tính

Thành:

Giáo trình
    ↓
AI phân tích cấu trúc
    ↓
Learning Journey + Mindmap
    ↓
Multi-modal learning experience

⸻

4. Core Features

4.1 AI Learning Journey

Chức năng

AI phân tích giáo trình và tạo:

* chapter
* concept hierarchy
* dependency graph
* roadmap học

Ví dụ

Triết học Mác-Lênin
 ├── Chủ nghĩa duy vật
 │     ├── Vật chất
 │     ├── Ý thức
 │     └── Mối quan hệ
 ├── Phép biện chứng
 │     ├── Mâu thuẫn
 │     ├── Lượng - chất
 │     └── Phủ định

Mục tiêu UX

Người dùng luôn biết:

* mình đang ở đâu
* đã học gì
* nên học gì tiếp theo

⸻

4.2 Interactive Mindmap UI

Chức năng

Hiển thị kiến thức dạng:

* graph
* zoomable canvas
* interactive node

Node có:

* trạng thái hoàn thành
* độ khó
* prerequisite
* progress

UX định hướng

Giống:

* Notion
* Obsidian Graph
* Figma canvas

⸻

4.3 Node Learning Experience

Mỗi node kiến thức sẽ có:

⸻

(1) Summary

Giải thích ngắn gọn:

* dễ hiểu
* ít học thuật hóa

⸻

(2) Original Content

Hiển thị:

* nội dung gốc giáo trình
* đoạn trích liên quan
* context đầy đủ

Đảm bảo:

* tính học thuật
* khả năng đối chiếu

⸻

(3) Visual Explanation

Bao gồm:

* sơ đồ mermaid
* AI illustration
* infographic đơn giản

Ví dụ:

* quan hệ vật chất ↔ ý thức
* quy luật lượng – chất

⸻

(4) AI Podcast

Tự động chuyển nội dung thành:

* audio learning
* giọng đọc truyền cảm
* pacing tối ưu cho học tập

Mục tiêu:

* học khi di chuyển
* giảm cảm giác “khô”

⸻

(5) AI Debate / Q&A

Người học có thể:

* hỏi đáp
* phản biện
* tranh luận

AI sẽ:

* giải thích đơn giản hơn
* đưa ví dụ thực tế
* challenge lập luận

⸻

(6) Flashcard & Recall

Tự động sinh:

* flashcard
* câu hỏi recall
* quiz nhanh

Áp dụng:

* spaced repetition
* active recall

⸻

5. User Flow

Flow chính

Upload giáo trình
        ↓
AI parse structure
        ↓
Generate learning journey
        ↓
Explore mindmap
        ↓
Open node
        ↓
Learn through:
    • summary
    • original text
    • visuals
    • audio
    • debate
    • flashcard

⸻

6. Design Philosophy

Triết lý thiết kế

“Don’t make users read more.”

App cần:

* giảm text overload
* tăng khám phá trực quan
* học theo từng bước nhỏ
* tăng tương tác

⸻

7. MVP Scope

MVP chỉ bao gồm:

Core

* upload PDF
* AI structure extraction
* learning journey
* interactive mindmap
* node detail page

Learning tools

* summary
* original content
* podcast
* chatbot
* flashcard

⸻

Không ưu tiên giai đoạn đầu

* social
* multiplayer
* realtime collaboration
* gamification phức tạp
* AI agent nâng cao

⸻

8. Technical Architecture

Frontend

Web App

* Next.js￼
* TypeScript
* TailwindCSS

Mindmap

* React Flow￼

⸻

Backend

API

* Node.js / NestJS

Database

* PostgreSQL￼

Storage

* Supabase￼
    hoặc
* Firebase￼

⸻

AI Layer

LLM

* OpenAI Platform￼

Embedding / Retrieval

* vector search
* semantic chunking

Text-to-Speech

* ElevenLabs￼
    hoặc
* OpenAI TTS

⸻

9. Suggested Database Model

Main entities

User
Course
Document
Chapter
ConceptNode
MindmapEdge
Flashcard
Podcast
Conversation
Progress

⸻

10. Future Expansion

Có thể mở rộng sang:

* luật
* lịch sử
* kinh tế chính trị
* y khoa lý thuyết
* học thuật chuyên sâu

⸻

11. Key Differentiator

Điểm khác biệt không nằm ở:

* AI summarize

mà nằm ở:

“AI-powered structured learning experience”.

⸻

12. Expected Outcome

Người học:

* hiểu nhanh hơn
* nhớ lâu hơn
* thấy triết học dễ tiếp cận hơn
* tăng khả năng tư duy phản biện

⸻

13. Suggested Product Names

* PhiloMind
* Dialectica
* TrietMap
* ThinkGraph
* MindDialectic
* Socratic
* Philospace

⸻

14. Development Roadmap

Phase 1 — MVP

* upload PDF
* AI parsing
* mindmap
* node learning page

Phase 2

* AI debate
* podcast
* flashcard system

Phase 3

* personalization
* progress analytics
* oral exam mode
* adaptive learning

⸻

15. Final Direction

Dự án nên định vị là:

“AI-native learning platform for philosophy and conceptual subjects.”

Không chỉ là:

* chatbot
* PDF reader
* flashcard app

mà là:

một hệ sinh thái học tư duy bằng AI.