# Toàn bộ mã nguồn phần "Lesson" từ dự án MLN_FE

Tài liệu này chứa toàn bộ các file mã nguồn liên quan đến chức năng bài học ("lesson" và "Hành trình Khai Sáng - PhilosophyJourney") của dự án `MLN_FE`.

## Danh sách các file bao gồm:
1. **[src/pages/Lesson.jsx](file:///Volumes/WorkSpace/Project/PhiloMind/temp_mln_fe/src/pages/Lesson.jsx)**: Trang quản lý bài học chính, định tuyến giữa giao diện bản đồ tư duy bài học (Mindmap) và bài học thực tế (Philosophy Journey).
2. **[src/pages/Lesson.css](file:///Volumes/WorkSpace/Project/PhiloMind/temp_mln_fe/src/pages/Lesson.css)**: Định dạng CSS cho trang bài học.
3. **[src/components/LessonMindmap.jsx](file:///Volumes/WorkSpace/Project/PhiloMind/temp_mln_fe/src/components/LessonMindmap.jsx)**: Component hiển thị sơ đồ tư duy tổng quát cho toàn bộ syllabus của môn học.
4. **[src/data/lessonContent.js](file:///Volumes/WorkSpace/Project/PhiloMind/temp_mln_fe/src/data/lessonContent.js)**: Dữ liệu câu hỏi, nội dung warm-up và podcast dùng cho các bài học.
5. **[src/pages/PhilosophyJourney.jsx](file:///Volumes/WorkSpace/Project/PhiloMind/temp_mln_fe/src/pages/PhilosophyJourney.jsx)**: Component xử lý logic bài học nhập vai tương tác "Hành trình Khai Sáng" (Nguồn gốc triết học).
6. **[src/data/journeyContent.js](file:///Volumes/WorkSpace/Project/PhiloMind/temp_mln_fe/src/data/journeyContent.js)**: Dữ liệu hội thoại, các chặng và câu hỏi kiểm tra của bài học tương tác "Hành trình Khai Sáng".
7. **[src/components/journey/JourneyArt.jsx](file:///Volumes/WorkSpace/Project/PhiloMind/temp_mln_fe/src/components/journey/JourneyArt.jsx)**: Các tài nguyên ảnh đồ họa vector SVG động cho các chặng và avatar nhân vật trong bài học tương tác.
8. **[src/components/journey/GuideSpeech.jsx](file:///Volumes/WorkSpace/Project/PhiloMind/temp_mln_fe/src/components/journey/GuideSpeech.jsx)**: Component hiển thị hội thoại bong bóng thoại dạng gõ chữ (typewriter) dẫn dắt bài học.
9. **[src/data/mindmapData.js](file:///Volumes/WorkSpace/Project/PhiloMind/temp_mln_fe/src/data/mindmapData.js)**: Dữ liệu cấu trúc chương trình học để hiển thị lên sơ đồ tư duy tổng.

---

## 1. `src/pages/Lesson.jsx`

```jsx
import React, { useRef } from "react";
import { useSearchParams } from "react-router-dom";
import PageShell from "../components/PageShell";
import LessonMindmap from "../components/LessonMindmap";
import PhilosophyJourney from "./PhilosophyJourney";
import { findLessonBySlug, findNextLesson } from "../data/mindmapData";

// ============================================================================
// TRANG BAI HOC
// Cau truc: Muc luc tong (so do tu duy) -> chon 1 bai -> hien noi dung bai.
//
// Hien tai project tap trung vao MOT bai hoc hoan chinh duy nhat:
//   "Nguon goc cua triet hoc" (slug: nguon-goc-triet-hoc) — duoc trien khai
//   thanh bai hoc tuong tac choi don "Hanh trinh Khai Sang" (PhilosophyJourney).
// Cac bai con lai trong so do hien placeholder "dang phat trien".
// ============================================================================

const JOURNEY_SLUG = "nguon-goc-triet-hoc";

// Bai chua co noi dung -> hien thong bao goi gon, huong nguoi hoc ve bai da hoan thien.
function ComingSoon({ title, onBack }) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-10 text-center max-w-2xl mx-auto">
      <span className="material-symbols-outlined text-6xl text-red-800/30">construction</span>
      <h2 className="text-xl font-bold text-gray-800 mt-3">{title}</h2>
      <p className="text-gray-500 mt-1 mb-5 max-w-md mx-auto">
        Bài học này đang được phát triển. Hãy bắt đầu với bài học tương tác đã hoàn thiện:
        <strong className="text-red-800"> "Nguồn gốc của triết học"</strong>.
      </p>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 bg-red-800 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-red-900 transition-colors"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Quay lại mục lục
      </button>
    </div>
  );
}

const Lesson = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const lessonSlug = searchParams.get("lesson");
  const activeLesson = lessonSlug ? findLessonBySlug(lessonSlug) : null;

  // Ref toi phan noi dung bai hoc de cuon xuong khi chon 1 nhanh tren so do
  const lessonContentRef = useRef(null);

  // Bam 1 bai hoc tren so do -> cap nhat URL va cuon toi noi dung bai hoc
  const handleOpenLesson = (slug) => {
    if (!slug) return;
    setSearchParams({ lesson: slug });
    requestAnimationFrame(() => {
      lessonContentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  // Quay lai muc luc: xoa tham so lesson khoi URL -> mindmap hien lai
  const handleBackToMindmap = () => setSearchParams({});

  const isJourney = activeLesson?.slug === JOURNEY_SLUG;

  return (
    <PageShell activeKey="lessons">
      <div className="px-6 md:px-12 py-8 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <span>Trang chủ</span>
          <span>›</span>
          <strong className={activeLesson ? "" : "text-red-800"}>Bài học</strong>
          {activeLesson && (
            <>
              <span>›</span>
              <strong className="text-red-800">{activeLesson.title}</strong>
            </>
          )}
        </div>

        {/* MUC LUC TONG — chi hien khi chua chon bai */}
        {!activeLesson && (
          <div className="mb-10">
            <LessonMindmap activeSlug={lessonSlug} onOpenLesson={handleOpenLesson} />
          </div>
        )}

        {/* NOI DUNG BAI HOC */}
        <div ref={lessonContentRef} className="scroll-mt-20">
          {activeLesson ? (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleBackToMindmap}
                className="inline-flex items-center gap-1 text-sm font-semibold text-red-800 hover:text-red-900 mb-5"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Quay lại mục lục bài học
              </button>

              {isJourney ? (
                <PhilosophyJourney
                  nextLesson={findNextLesson(activeLesson.slug)}
                  onNextLesson={(slug) => handleOpenLesson(slug)}
                />
              ) : (
                <ComingSoon title={activeLesson.title} onBack={handleBackToMindmap} />
              )}
            </div>
          ) : (
            <div className="border-t border-gray-200 pt-12 pb-16 text-center">
              <span className="material-symbols-outlined text-6xl text-red-800/30">touch_app</span>
              <h2 className="text-xl font-bold text-gray-800 mt-3">Chọn một bài học để bắt đầu</h2>
              <p className="text-gray-500 mt-1 max-w-md mx-auto">
                Bấm vào bài <strong className="text-red-800">"Nguồn gốc của triết học"</strong> trên sơ đồ
                tư duy phía trên để vào bài học tương tác đã hoàn thiện.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default Lesson;
```

---

## 2. `src/pages/Lesson.css`

```css
.lesson-page {
  background: #f8f4e3;
  min-height: 100vh;
  font-family: "Hanken Grotesk", sans-serif;
  color: #111c2c;
}

/* HEADER */

.lesson-header {
  height: 70px;
  background: white;
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.lesson-logo {
  font-size: 28px;
  font-weight: bold;
  color: #570013;
}

.lesson-nav {
  display: flex;
  gap: 28px;
}

.lesson-nav a {
  text-decoration: none;
  color: #555;
  font-weight: 500;
}

.lesson-nav a.active {
  color: #570013;
  border-bottom: 2px solid #570013;
  padding-bottom: 4px;
}

.lesson-user {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #800020;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* LAYOUT */

.lesson-layout {
  display: flex;
}

/* SIDEBAR */

.lesson-sidebar {
  width: 270px;
  background: white;
  border-right: 1px solid #ddd;
  padding: 25px 18px;
  position: fixed;
  top: 70px;
  bottom: 0;
}

.sidebar-top h3 {
  color: #570013;
  margin-bottom: 6px;
}

.sidebar-top p {
  color: #666;
  font-size: 14px;
}

.sidebar-nav {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sidebar-nav a,
.sidebar-nav div {
  padding: 12px 14px;
  border-radius: 10px;
  text-decoration: none;
  color: #333;
}

.sidebar-nav .active {
  background: #800020;
  color: white;
}

.daily-btn {
  margin-top: 30px;
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 12px;
  background: #570013;
  color: white;
  cursor: pointer;
}

/* MAIN */

.lesson-main {
  margin-left: 270px;
  padding: 35px;
  width: 100%;
}

.breadcrumb {
  display: flex;
  gap: 10px;
  color: #666;
  margin-bottom: 20px;
}

.lesson-title-box h1 {
  color: #570013;
  font-size: 36px;
  margin-bottom: 12px;
}

.lesson-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
}

.lesson-meta span {
  background: #eee;
  padding: 6px 12px;
  border-radius: 20px;
}

/* GRID */

.lesson-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 25px;
}

/* VIDEO */

.video-box {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
}

.video-box img {
  width: 100%;
  display: block;
}

.play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90px;
  height: 90px;
  border-radius: 50%;
  border: none;
  background: rgba(87, 0, 19, 0.9);
  color: white;
  font-size: 30px;
  cursor: pointer;
}

/* CONTENT */

.lesson-card {
  background: white;
  margin-top: 25px;
  padding: 35px;
  border-radius: 20px;
}

.quote-box {
  border-left: 5px solid #800020;
  padding-left: 20px;
  margin-bottom: 30px;
}

.quote-box p {
  font-size: 24px;
  color: #570013;
  font-style: italic;
}

.quote-box span {
  display: block;
  margin-top: 10px;
  color: #666;
}

.lesson-card h2 {
  color: #570013;
  margin-bottom: 16px;
}

.lesson-card p {
  line-height: 1.7;
}

.lesson-card ul {
  margin-top: 15px;
}

.lesson-card li {
  margin-bottom: 12px;
}

/* MINDMAP */

.mindmap-box {
  margin: 40px 0;
  text-align: center;
}

.mindmap-box img {
  width: 100%;
  border-radius: 16px;
  margin-top: 15px;
}

/* MOVEMENT */

.movement-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-top: 20px;
}

.movement-card {
  background: #fff0f0;
  border-radius: 14px;
  padding: 18px;
}

.movement-card h5 {
  color: #570013;
  margin-bottom: 10px;
}

/* BUTTONS */

.lesson-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}

.btn-outline,
.btn-primary {
  padding: 14px 22px;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
}

.btn-outline {
  border: 2px solid #570013;
  background: white;
  color: #570013;
}

.btn-primary {
  border: none;
  background: #570013;
  color: white;
}

/* SIDEBAR RIGHT */

.syllabus {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  height: fit-content;
  position: sticky;
  top: 100px;
}

.syllabus-header {
  background: #800020;
  color: white;
  padding: 25px;
}

.progress {
  height: 8px;
  background: rgba(255,255,255,0.2);
  border-radius: 20px;
  margin: 16px 0;
}

.progress-fill {
  width: 25%;
  height: 100%;
  background: white;
  border-radius: 20px;
}

.syllabus-list {
  padding: 20px;
}

.lesson-item {
  padding: 14px;
  border-radius: 12px;
  margin-bottom: 12px;
}

.lesson-item.active {
  background: #ffe5e5;
  color: #570013;
  font-weight: bold;
}

.lesson-item.completed {
  background: #f2fff2;
}

.lesson-item.locked {
  opacity: 0.6;
}

.pdf-btn {
  width: calc(100% - 40px);
  margin: 20px;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: #545e76;
  color: white;
  cursor: pointer;
}
```

---

## 3. `src/components/LessonMindmap.jsx`

```jsx
import React, { useMemo, useState } from "react";
import {
  MINDMAP_CHAPTERS,
  countSections,
  countLessons,
} from "../data/mindmapData";

// Mục lục tổng dạng sơ đồ tư duy, tích hợp ngay trong trang Lesson
// Bấm vào 1 nhánh -> gọi onOpenLesson(slug) để nhảy tới bài học tương ứng
// activeSlug: slug bài học đang mở -> tô đậm nhánh đó trên sơ đồ

// Lọc dữ liệu mindmap theo từ khoá; giữ đề mục/bài học khớp keyword
function filterChaptersByKeyword(chapters, keyword) {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) return chapters;

  const matchesKeyword = (text) =>
    text.toLowerCase().includes(normalizedKeyword);

  return chapters
    .map((chapter) => ({
      ...chapter,
      sections: chapter.sections
        .map((section) => ({
          ...section,
          lessons: section.lessons.filter((lesson) =>
            matchesKeyword(lesson.title)
          ),
        }))
        .filter(
          (section) =>
            section.lessons.length > 0 || matchesKeyword(section.title)
        ),
    }))
    .filter((chapter) => chapter.sections.length > 0);
}

// Nhánh nhỏ: 1 đề mục + danh sách bài học bên trong
function Branch({ section, activeSlug, onOpenLesson }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex items-center pt-6 shrink-0">
        <div className="h-0.5 w-8 bg-gray-400" />
      </div>

      <div className="flex-1 min-w-0">
        {/* Click đề mục -> mở bài học đầu tiên của đề mục đó */}
        <button
          onClick={() => onOpenLesson(section.lessons[0]?.slug)}
          className="group inline-flex items-center gap-2 max-w-full text-left bg-white border-2 border-red-800 text-red-800 font-bold px-5 py-2.5 rounded-xl shadow-sm hover:bg-red-800 hover:text-white transition-all hover:shadow-lg hover:-translate-y-0.5"
        >
          <span className="material-symbols-outlined text-base">topic</span>
          {section.title}
          <span className="material-symbols-outlined text-base opacity-0 group-hover:opacity-100 transition-opacity">
            arrow_forward
          </span>
        </button>

        <div className="mt-3 ml-8 space-y-2 relative">
          <div className="absolute left-0 top-0 bottom-3 w-0.5 bg-gray-300" />
          {section.lessons.map((lesson) => {
            const isActive = lesson.slug === activeSlug;
            return (
              <div key={lesson.id} className="flex items-center gap-3 min-w-0">
                <div className="h-0.5 w-6 bg-gray-300 shrink-0" />
                <button
                  onClick={() => onOpenLesson(lesson.slug)}
                  className={`group flex items-center gap-2 max-w-full text-left px-4 py-2 rounded-lg border transition-all text-sm font-medium hover:shadow-md ${
                    isActive
                      ? "bg-red-800 text-white border-red-800 shadow-md"
                      : "bg-blue-50 hover:bg-red-800 hover:text-white text-gray-800 border-gray-200 hover:border-red-800"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-sm transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-red-800 group-hover:text-white"
                    }`}
                  >
                    menu_book
                  </span>
                  {lesson.title}
                  <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    chevron_right
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Sơ đồ 1 chương: node gốc bên trái, các nhánh bên phải
function ChapterMap({ chapter, activeSlug, onOpenLesson }) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 md:p-8 mb-6">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-72 shrink-0">
          <div
            className={`bg-gradient-to-br ${chapter.color} text-white rounded-2xl p-6 shadow-lg lg:sticky lg:top-24`}
          >
            <span className="inline-block bg-white/20 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded mb-3">
              {chapter.title}
            </span>
            <h3 className="font-bold text-xl leading-tight mb-3">
              {chapter.subtitle}
            </h3>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <span className="material-symbols-outlined text-base">
                account_tree
              </span>
              {countSections(chapter)} đề mục
              <span>·</span>
              {countLessons(chapter)} bài học
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-8 relative">
          <div className="absolute left-0 top-6 bottom-6 w-0.5 bg-gray-300 hidden lg:block" />
          {chapter.sections.map((section) => (
            <Branch
              key={section.id}
              section={section}
              activeSlug={activeSlug}
              onOpenLesson={onOpenLesson}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LessonMindmap({ activeSlug, onOpenLesson }) {
  const [searchKeyword, setSearchKeyword] = useState("");

  const visibleChapters = useMemo(
    () => filterChaptersByKeyword(MINDMAP_CHAPTERS, searchKeyword),
    [searchKeyword]
  );

  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-red-800">
              account_tree
            </span>
            <span className="text-xs uppercase tracking-wider text-red-800 font-bold">
              Mục lục tổng
            </span>
          </div>
          <h2 className="font-bold text-2xl text-gray-900">
            Sơ đồ tư duy bài học
          </h2>
          <p className="text-gray-500 text-sm">
            Cấu trúc <strong>Chương → Đề mục → Bài học</strong>. Bấm vào bất kỳ
            nhánh nào để nhảy tới bài học bên dưới.
          </p>
        </div>

        <div className="relative w-full md:max-w-xs">
          <input
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            type="text"
            placeholder="Tìm bài học trong sơ đồ..."
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-full pl-11 pr-4 py-2.5 focus:ring-2 focus:ring-red-800 focus:border-transparent outline-none"
          />
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
            search
          </span>
        </div>
      </div>

      {visibleChapters.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-gray-300">
          <span className="material-symbols-outlined text-5xl text-gray-300">
            search_off
          </span>
          <p className="text-gray-500 mt-2">
            Không tìm thấy bài học khớp với "{searchKeyword}"
          </p>
        </div>
      ) : (
        visibleChapters.map((chapter) => (
          <ChapterMap
            key={chapter.id}
            chapter={chapter}
            activeSlug={activeSlug}
            onOpenLesson={onOpenLesson}
          />
        ))
      )}
    </section>
  );
}
```

---

## 4. `src/data/lessonContent.js`

```javascript
// Dữ liệu nội dung Lesson — tách khỏi component để file JSX gọn nhẹ (Rule 2, Rule 3)
// Khi cần đổi nội dung warmup, quiz, podcast: chỉ sửa file này, không động vào UI

// --- Pool các kiểu warm-up; chọn ngẫu nhiên 1 mục mỗi lần mở bài ---
export const WARMUP_POOL = [
  {
    type: "image-guess",
    title: "Nhìn hình đoán chữ",
    hint: "Bức ảnh này gợi ý đến khái niệm trung tâm của bài học.",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&auto=format&fit=crop",
    blanks: "V _ T   C H _ T",
    answer: "vật chất",
    reveal:
      "Đây chính là phạm trù trung tâm của bài học: VẬT CHẤT — thực tại khách quan tồn tại độc lập với ý thức.",
  },
  {
    type: "story",
    title: "Câu chuyện dẫn dắt",
    story:
      "Một người mù sờ vào con voi và nói: \"Con voi giống như cái cột nhà.\" Người khác sờ vào tai và bảo: \"Không, nó giống cái quạt.\" Mỗi người đều mô tả đúng một phần, nhưng không ai thấy được toàn thể.",
    question:
      "Câu chuyện này gợi cho bạn liên tưởng tới đặc điểm nào của nhận thức cảm tính?",
    options: [
      "Nhận thức cảm tính phản ánh đầy đủ bản chất sự vật",
      "Nhận thức cảm tính chỉ phản ánh từng mặt riêng lẻ của sự vật",
      "Nhận thức cảm tính luôn sai lầm",
    ],
    correctIndex: 1,
    reveal:
      "Đúng vậy — đây là lý do triết học Mác-Lênin nhấn mạnh phải đi từ cảm tính lên lý tính để nắm bắt bản chất.",
  },
  {
    type: "image-guess",
    title: "Nhìn hình đoán khái niệm",
    hint: "Hình ảnh dòng sông không bao giờ ngừng chảy.",
    image:
      "https://images.unsplash.com/photo-1437482078695-73f5ca6c96e2?w=900&auto=format&fit=crop",
    blanks: "V _ N   Đ _ N G",
    answer: "vận động",
    reveal:
      "VẬN ĐỘNG là phương thức tồn tại của vật chất — không có vật chất nào không vận động.",
  },
  {
    type: "story",
    title: "Mẩu chuyện triết học",
    story:
      "Heraclitus từng nói: \"Không ai tắm hai lần trên cùng một dòng sông.\" Vì khi bạn bước xuống lần thứ hai, dòng nước đã khác, và chính bạn cũng đã khác.",
    question: "Câu nói này thể hiện quan điểm gì?",
    options: [
      "Mọi sự vật đều bất biến",
      "Vận động và biến đổi là tuyệt đối",
      "Chỉ có ý thức là tồn tại",
    ],
    correctIndex: 1,
    reveal:
      "Chính xác. Đây là tư tưởng tiền đề cho phép biện chứng — mọi sự vật đều luôn vận động, biến đổi và phát triển.",
  },
];

// --- Mini-quiz hiển thị ngay sau khi user xem xong video ---
export const VIDEO_QUIZ_QUESTIONS = [
  {
    question: "Theo định nghĩa của Lênin, vật chất là gì?",
    options: [
      "Là các sự vật cụ thể tồn tại trong tự nhiên",
      "Là một phạm trù triết học chỉ thực tại khách quan",
      "Là sản phẩm của ý thức con người",
    ],
    correctIndex: 1,
  },
  {
    question: "Vật chất tồn tại bằng phương thức nào?",
    options: ["Đứng yên", "Vận động", "Tách rời không gian và thời gian"],
    correctIndex: 1,
  },
  {
    question: "Định nghĩa vật chất của Lênin giải quyết vấn đề nào của triết học?",
    options: [
      "Vấn đề đạo đức",
      "Hai mặt vấn đề cơ bản của triết học",
      "Vấn đề logic hình thức",
    ],
    correctIndex: 1,
  },
];

// --- Quiz tổng kết cuối bài ---
// Mỗi câu có thêm `explanation`: hiển thị khi người học trả lời đúng
export const FINAL_QUIZ_QUESTIONS = [
  {
    question: "Đặc điểm nào KHÔNG phải của vật chất theo quan điểm duy vật biện chứng?",
    options: [
      "Tồn tại khách quan",
      "Phụ thuộc vào ý thức con người",
      "Vận động không ngừng",
      "Có thể nhận thức được",
    ],
    correctIndex: 1,
    explanation:
      "Vật chất tồn tại khách quan, độc lập với ý thức. Nói vật chất phụ thuộc vào ý thức là quan điểm duy tâm, trái với chủ nghĩa duy vật biện chứng.",
  },
  {
    question: "Hình thức vận động nào là cao nhất?",
    options: ["Cơ học", "Vật lý", "Hóa học", "Xã hội"],
    correctIndex: 3,
    explanation:
      "Vận động xã hội là hình thức cao nhất và phức tạp nhất, bao hàm trong nó các hình thức vận động thấp hơn (cơ, lý, hóa, sinh).",
  },
  {
    question: "Không gian và thời gian là gì?",
    options: [
      "Hình thức tồn tại của vật chất",
      "Sản phẩm của tư duy thuần túy",
      "Tồn tại độc lập với vật chất",
    ],
    correctIndex: 0,
    explanation:
      "Không gian và thời gian là những hình thức tồn tại khách quan của vật chất đang vận động, không thể tách rời khỏi vật chất.",
  },
  {
    question: "Câu nào sau đây thể hiện đúng quan điểm duy vật biện chứng?",
    options: [
      "Ý thức quyết định vật chất",
      "Vật chất quyết định ý thức, ý thức tác động trở lại vật chất",
      "Vật chất và ý thức tồn tại song song không liên hệ",
    ],
    correctIndex: 1,
    explanation:
      "Vật chất là cái có trước và quyết định ý thức; đồng thời ý thức có tính độc lập tương đối và tác động trở lại vật chất thông qua hoạt động thực tiễn.",
  },
];

// --- Podcast tập hiện tại + transcript đồng bộ thời gian ---
// transcript[i].t = mốc thời gian (giây) của câu thoại i
export const PODCAST_EPISODE = {
  id: "ep1",
  title: "Vật chất – Hiểu cho đúng theo Lênin",
  host: "ThS. Nguyễn Văn A",
  cover:
    "https://images.unsplash.com/photo-1485579149621-3123dd979885?w=600&auto=format&fit=crop",
  src: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_5e3edee2cd.mp3",
  transcript: [
    { t: 0,  text: "Xin chào các bạn, chào mừng đến với podcast Triết học Mác – Lênin." },
    { t: 4,  text: "Trong tập hôm nay, chúng ta cùng đi sâu vào phạm trù vật chất." },
    { t: 9,  text: "Đây là một trong những phạm trù trung tâm của triết học duy vật biện chứng." },
    { t: 14, text: "V.I. Lênin định nghĩa: \"Vật chất là một phạm trù triết học\"," },
    { t: 19, text: "\"dùng để chỉ thực tại khách quan được đem lại cho con người trong cảm giác\"." },
    { t: 26, text: "Định nghĩa này có ba nội dung cơ bản mà chúng ta cần lưu ý." },
    { t: 31, text: "Thứ nhất, vật chất là cái tồn tại khách quan, độc lập với ý thức." },
    { t: 37, text: "Thứ hai, vật chất là cái mà con người có thể nhận thức được." },
    { t: 43, text: "Thứ ba, vật chất không đồng nhất với bất kỳ dạng cụ thể nào của nó." },
    { t: 50, text: "Định nghĩa của Lênin đã giải quyết triệt để vấn đề cơ bản của triết học." },
    { t: 57, text: "Đồng thời mở đường cho khoa học tiếp tục khám phá các dạng vật chất mới." },
    { t: 64, text: "Cảm ơn các bạn đã lắng nghe. Hẹn gặp lại ở tập sau!" },
  ],
};

// --- Danh sách bài học trong syllabus bên phải ---
export const SYLLABUS_ITEMS = [
  { status: "completed", title: "Bài mở đầu: Nhập môn Triết học" },
  { status: "active",    title: "Bài 1: Vật chất và các hình thức tồn tại" },
  { status: "locked",    title: "Bài 2: Nguồn gốc và bản chất của ý thức" },
  { status: "locked",    title: "Bài 3: Mối quan hệ giữa vật chất và ý thức" },
  { status: "locked",    title: "Bài 4: Hai nguyên lý của phép biện chứng" },
];
```

---

## 5. `src/pages/PhilosophyJourney.jsx`

```jsx
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useToast } from "../components/Toast";
import useLocalStorage from "../hooks/useLocalStorage";
import { SceneArt } from "../components/journey/JourneyArt";
import DialogueSequence, { SpeechBubble } from "../components/journey/GuideSpeech";
import primitiveSituationVideo from "../video/primitive-situation.mp4";
import introVideo from "../video/Video mở đầu.mp4";
import socialVideo from "../video/Video mở đầu (xã hội).mp4";
import {
  INTRO,
  ROUND_COGNITIVE,
  ROUND_SOCIAL,
  ROUND_SUMMARY,
  JOURNEY_FINAL_QUIZ,
  COMPLETION,
} from "../data/journeyContent";
import {
  JOURNEY_STORAGE_KEY,
  JOURNEY_TOTAL_PIECES,
  JOURNEY_FINAL_PASS,
} from "../constants";

// ============================================================================
// BAI HOC TUONG TAC "HANH TRINH KHAI SANG" — Nguon goc cua triet hoc.
//
// Day la bai hoc DUY NHAT, hoan chinh, chuyen the tu kich ban day hoc tren lop
// sang che do CHOI DON: nguoi hoc dong vai nguoi tra loi; he thong (nhan vat
// dan duong Sophia + cac NPC) dat cau hoi va dong cac vai con lai.
//
// Luong: Dan nhap -> Vong Nhan thuc -> Vong Xa hoi -> Hop nhat -> Quiz -> Hoan thanh.
// Tien do duoc luu localStorage de F5/quay lai khong mat (quan trong khi trinh dein).
// ============================================================================

// Thu tu cac chang + nhan hien tren thanh tien do
const STAGES = ["intro", "cognitive", "social", "summary", "quiz", "done"];
const STAGE_LABELS = {
  intro: "Khởi hành",
  cognitive: "Nhận thức",
  social: "Xã hội",
  summary: "Hợp nhất",
  quiz: "Tổng kết",
  done: "Hoàn thành",
};

const INITIAL_STATE = { stage: "intro", pieces: [], startPoint: null, score: null, merged: false };

// --- Tao className cho 1 dap an dua tren trang thai (dung chung moi cau hoi) ---
function getOptionClass({ resolved, picked, isCorrect, isWrongPick }) {
  const base =
    "w-full text-left rounded-xl border-2 px-4 py-3.5 font-medium transition-all flex items-center gap-3 ";
  if (resolved && isCorrect) return base + "border-green-500 bg-green-50 text-green-900";
  if (isWrongPick) return base + "border-red-500 bg-red-50 text-red-900";
  if (resolved) return base + "border-gray-200 opacity-60";
  return base + "border-gray-200 hover:border-red-400 hover:bg-red-50 bg-white";
}

// ============================================================================
// CAU HOI CHAM DIEM — phai chon dung moi qua; chon sai duoc danh dau & cho thu lai.
// ============================================================================
function GradedQuestion({ prompt, options, correctFeedback, wrongFeedback, onPass, passLabel = "Tiếp tục" }) {
  const [wrongPicks, setWrongPicks] = useState([]);
  const [solved, setSolved] = useState(false);

  const handlePick = (index) => {
    if (solved) return;
    if (options[index].correct) {
      setSolved(true);
    } else if (!wrongPicks.includes(index)) {
      setWrongPicks((prev) => [...prev, index]);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
      <p className="font-semibold text-lg mb-4 text-gray-900">{prompt}</p>
      <div className="space-y-2.5">
        {options.map((opt, index) => (
          <button
            key={index}
            type="button"
            disabled={solved}
            onClick={() => handlePick(index)}
            className={getOptionClass({
              resolved: solved,
              isCorrect: opt.correct,
              isWrongPick: wrongPicks.includes(index),
            })}
          >
            <span className="material-symbols-outlined text-xl shrink-0">
              {solved && opt.correct
                ? "check_circle"
                : wrongPicks.includes(index)
                ? "cancel"
                : "radio_button_unchecked"}
            </span>
            {opt.text}
          </button>
        ))}
      </div>

      {!solved && wrongPicks.length > 0 && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-base flex items-start gap-2 j-bubble-in">
          <span className="material-symbols-outlined text-base shrink-0">error</span>
          <span>{wrongFeedback}</span>
        </div>
      )}

      {solved && (
        <div className="mt-4 bg-green-50 border border-green-200 p-4 rounded-lg j-bubble-in">
          <p className="font-bold text-green-800 flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-base">lightbulb</span>
            Chính xác!
          </p>
          <p className="text-base text-green-900/90 leading-relaxed">{correctFeedback}</p>
          <button
            type="button"
            onClick={onPass}
            className="mt-4 inline-flex items-center gap-1.5 bg-red-800 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-red-900 transition-colors"
          >
            {passLabel}
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      )}
    </div>
  );
}

// --- Banner canh hoat hoa + tieu de chang (da thu gon chieu cao cho gon mat) ---
function SceneBanner({ scene, badge, title, subtitle }) {
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-md mb-5 h-24 md:h-32">
      <SceneArt scene={scene} className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
      <div className="absolute bottom-0 left-0 p-3.5 md:p-4 text-white">
        {badge && (
          <span className="inline-block bg-white/20 backdrop-blur text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-1">
            {badge}
          </span>
        )}
        <h2 className="text-lg md:text-2xl font-bold drop-shadow leading-tight">{title}</h2>
        {subtitle && <p className="text-white/85 text-xs md:text-sm">{subtitle}</p>}
      </div>
    </div>
  );
}

// --- Banner dang VIDEO: thay cho SceneBanner SVG o nhung chang co clip minh hoa.
// Video tu phat (muted) khi vao chang -> truyen tai boi canh thay cho mo ta bang chu.
// Co controls de nguoi hoc bat tieng / xem lai. Tieu de chang nam o thanh duoi.
function VideoScene({ src, badge, title, subtitle, muted = true, autoPlay = true }) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-md mb-5 bg-black">
      <div className="relative">
        <video
          // React khong phai luc nao cung set dung DOM property `muted` qua JSX attribute,
          // nen set truc tiep qua ref de dam bao video co tieng khi muted=false.
          ref={(el) => {
            if (el) el.muted = muted;
          }}
          src={src}
          controls
          autoPlay={autoPlay}
          loop
          playsInline
          preload="metadata"
          className="w-full aspect-video bg-black"
        />
        {badge && (
          <span className="absolute top-3 left-3 inline-block bg-black/55 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded pointer-events-none">
            {badge}
          </span>
        )}
      </div>
      <div className="bg-gradient-to-r from-red-900 to-red-800 px-4 md:px-5 py-2.5 text-white">
        <h2 className="text-base md:text-xl font-bold leading-tight">{title}</h2>
        {subtitle && <p className="text-white/80 text-xs md:text-sm">{subtitle}</p>}
      </div>
    </div>
  );
}

// --- Bang "mo khoa manh ghep" ---
function PieceReward({ label, onNext }) {
  return (
    <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-6 text-center text-white shadow-xl j-unlock">
      <span className="material-symbols-outlined text-5xl">extension</span>
      <p className="text-sm uppercase tracking-wider font-semibold mt-1 opacity-90">
        Mảnh ghép tri thức
      </p>
      <p className="text-2xl font-bold mt-1 mb-4">{label}</p>
      <button
        type="button"
        onClick={onNext}
        className="bg-white text-orange-700 px-6 py-2.5 rounded-lg font-bold hover:bg-orange-50 transition-colors inline-flex items-center gap-1.5"
      >
        Tiếp tục hành trình
        <span className="material-symbols-outlined text-base">arrow_forward</span>
      </button>
    </div>
  );
}

// ============================================================================
// CHANG 1 — DAN NHAP
// ============================================================================
function IntroStage({ onComplete }) {
  const [phase, setPhase] = useState(0); // 0: hoi thoai, 1: chon diem khoi hanh
  const [chosen, setChosen] = useState(null);

  const introLines = useMemo(
    () => INTRO.lines.map((text) => ({ who: "guide", text })),
    []
  );

  return (
    <div>
      <VideoScene src={introVideo} badge={INTRO.subtitle} title={INTRO.title} />
      {phase === 0 && (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 md:p-6">
          <DialogueSequence
            lines={introLines}
            onComplete={() => setPhase(1)}
            ctaLabel="Chọn điểm khởi hành"
          />
        </div>
      )}

      {phase === 1 && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          <p className="font-semibold text-lg mb-1 text-gray-900">
            Bạn muốn bắt đầu hành trình từ đâu?
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Một lựa chọn nhập vai — mọi nền văn minh đều dẫn tới cùng một bước ngoặt.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            {INTRO.startPoints.map((sp) => (
              <button
                key={sp.id}
                type="button"
                onClick={() => setChosen(sp.id)}
                className={`rounded-xl border-2 p-4 text-center transition-all ${
                  chosen === sp.id
                    ? "border-red-800 bg-red-50 shadow-md"
                    : "border-gray-200 hover:border-red-300 hover:bg-red-50/40"
                }`}
              >
                <span className="material-symbols-outlined text-3xl text-red-800">
                  {sp.icon}
                </span>
                <p className="font-bold text-gray-900 mt-1">{sp.label}</p>
                <p className="text-xs text-gray-500">{sp.place}</p>
              </button>
            ))}
          </div>

          {chosen && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 j-bubble-in">
              <p className="text-sm text-indigo-900 leading-relaxed mb-3">
                {INTRO.startConfirm}
              </p>
              <button
                type="button"
                onClick={() => onComplete(chosen)}
                className="inline-flex items-center gap-1.5 bg-red-800 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-red-900 transition-colors"
              >
                Lên đường
                <span className="material-symbols-outlined text-base">rocket_launch</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CHANG 2 — VONG NHAN THUC: "GIAI MA SAM TRUYEN"
// ============================================================================
function CognitiveStage({ onComplete }) {
  const R = ROUND_COGNITIVE;
  // phase: 0 dan thoai (Sophia ke boi canh) · 1 cau hoi nhap vai · 2 buoc ngoat · 3 cau hoi chot · 4 duc ket
  const [phase, setPhase] = useState(0);
  const [revealedSteps, setRevealedSteps] = useState(1);

  const allStepsShown = revealedSteps >= R.conclusion.steps.length;

  // Duc ket TU DONG mo lan luot tung buoc (giam tuong tac — khong phai bam tay)
  useEffect(() => {
    if (phase !== 4 || allStepsShown) return;
    const t = setTimeout(() => setRevealedSteps((c) => c + 1), 1100);
    return () => clearTimeout(t);
  }, [phase, revealedSteps, allStepsShown]);

  return (
    <div>
      <VideoScene src={primitiveSituationVideo} badge={R.badge} title={R.title} subtitle={R.subtitle} />

      {phase === 0 && (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 md:p-6">
          <DialogueSequence lines={R.setup} onComplete={() => setPhase(1)} ctaLabel="Trả lời" />
        </div>
      )}

      {phase === 1 && (
        <GradedQuestion
          prompt={R.myth.prompt}
          options={R.myth.options}
          correctFeedback={R.myth.correctFeedback}
          wrongFeedback={R.myth.wrongFeedback}
          onPass={() => setPhase(2)}
          passLabel="Tiếp tục"
        />
      )}

      {phase === 2 && (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 md:p-6">
          <DialogueSequence lines={R.twist} onComplete={() => setPhase(3)} ctaLabel="Trả lời Lyra" />
        </div>
      )}

      {phase === 3 && (
        <GradedQuestion
          prompt={R.shift.prompt}
          options={R.shift.options}
          correctFeedback={R.shift.correctFeedback}
          wrongFeedback={R.shift.wrongFeedback}
          onPass={() => setPhase(4)}
          passLabel="Đúc kết kiến thức"
        />
      )}

      {phase === 4 && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">timeline</span>
            {R.conclusion.title}
          </h3>
          <div className="space-y-3">
            {R.conclusion.steps.slice(0, revealedSteps).map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-4 bg-gradient-to-r from-red-50 to-amber-50 border border-red-100 rounded-xl p-4 j-card-reveal"
              >
                <div className="h-11 w-11 rounded-lg bg-red-800 text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">{step.icon}</span>
                </div>
                <div>
                  <p className="font-bold text-red-900">{step.head}</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>

          {!allStepsShown ? (
            <p className="mt-4 text-sm text-gray-400 inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base animate-pulse">more_horiz</span>
              Đang đúc kết…
            </p>
          ) : (
            <div className="mt-5">
              <PieceReward label={R.pieceLabel} onNext={() => onComplete("cognitive")} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CHANG 3 — VONG XA HOI: "DAI HOI BO TOC"
// ============================================================================
function ChainGame({ chain, onSuccess }) {
  const { showToast } = useToast();
  // Xao tron 1 lan khi mount; nguoi hoc se chon lai dung thu tu nhan qua
  const shuffled = useMemo(() => {
    const arr = [...chain.items];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [chain.items]);

  const [placed, setPlaced] = useState([]); // mang id theo thu tu da chon dung
  const [wrongId, setWrongId] = useState(null);
  const done = placed.length === chain.items.length;

  const handlePick = (item) => {
    if (done || placed.includes(item.id)) return;
    if (item.order === placed.length) {
      const next = [...placed, item.id];
      setPlaced(next);
      setWrongId(null);
      if (next.length === chain.items.length) {
        showToast(chain.successFeedback, "success");
      }
    } else {
      setWrongId(item.id);
      showToast("Chưa đúng thứ tự — hãy bắt đầu từ nguyên nhân gốc rễ.", "warning");
      setTimeout(() => setWrongId(null), 500);
    }
  };

  const itemById = (id) => chain.items.find((it) => it.id === id);

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-red-900 mb-1 flex items-center gap-2">
        <span className="material-symbols-outlined">link</span>
        {chain.title}
      </h3>
      <p className="text-sm text-gray-500 mb-4">{chain.instruction}</p>

      {/* Chuoi da lap rap */}
      <div className="space-y-2 mb-5">
        {placed.map((id, index) => {
          const item = itemById(id);
          return (
            <div key={id}>
              <div className="flex items-center gap-3 bg-green-50 border-2 border-green-400 rounded-xl px-4 py-3 j-unlock">
                <span className="h-7 w-7 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {index + 1}
                </span>
                <span className="material-symbols-outlined text-green-700">{item.icon}</span>
                <span className="text-sm text-green-900 font-medium">{item.text}</span>
              </div>
              {index < chain.items.length - 1 && (
                <div className="flex justify-center text-gray-300">
                  <span className="material-symbols-outlined">arrow_downward</span>
                </div>
              )}
            </div>
          );
        })}
        {done && (
          <p className="text-center text-green-700 font-semibold text-sm mt-2 j-bubble-in">
            {chain.successFeedback}
          </p>
        )}
      </div>

      {/* Cac mat xich chua chon */}
      {!done && (
        <div className="grid sm:grid-cols-2 gap-3">
          {shuffled
            .filter((it) => !placed.includes(it.id))
            .map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePick(item)}
                className={`flex items-center gap-3 text-left rounded-xl border-2 px-4 py-3 transition-all ${
                  wrongId === item.id
                    ? "border-red-500 bg-red-50 j-shake"
                    : "border-gray-200 bg-white hover:border-red-400 hover:bg-red-50"
                }`}
              >
                <span className="material-symbols-outlined text-red-800 shrink-0">{item.icon}</span>
                <span className="text-sm text-gray-800">{item.text}</span>
              </button>
            ))}
        </div>
      )}

      {done && (
        <div className="mt-5">
          <PieceReward label={chain.reward.replace("Bạn đã thu thập được mảnh ghép: ", "")} onNext={onSuccess} />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CHANG 3 — VONG XA HOI: "DAI HOI BO TOC"
// ============================================================================
function SocialStage({ onComplete }) {
  const R = ROUND_SOCIAL;
  // phase: 0 dan thoai (Sophia ke boi canh) · 1 nhap 2 vai · 2 cau hoi cot loi · 3 canh bao · 4 mini-game chuoi
  const [phase, setPhase] = useState(0);
  const [roleIndex, setRoleIndex] = useState(0);

  const role = R.roles[roleIndex];

  const handleRolePass = () => {
    if (roleIndex < R.roles.length - 1) {
      setRoleIndex((i) => i + 1);
    } else {
      setPhase(2); // sang cau hoi cot loi
    }
  };

  return (
    <div>
      <VideoScene src={socialVideo} badge={R.badge} title={R.title} subtitle={R.subtitle} />

      {phase === 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setPhase(1)}
            className="inline-flex items-center gap-1.5 bg-red-800 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-red-900 transition-colors"
          >
            Vào vai trải nghiệm
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      )}

      {phase === 1 && (
        <div className="space-y-4">
          <div className="bg-gray-900 text-white rounded-xl px-4 py-2.5 text-sm font-semibold inline-flex items-center gap-2">
            <span className="material-symbols-outlined text-base">theater_comedy</span>
            {role.label}
          </div>
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
            <SpeechBubble who={role.who} text={role.intro} animate={false} />
          </div>
          <GradedQuestion
            key={role.who}
            prompt={role.question}
            options={role.options}
            correctFeedback={role.feedbackCorrect}
            wrongFeedback={role.feedbackWrong}
            onPass={handleRolePass}
            passLabel={roleIndex < R.roles.length - 1 ? "Sang vai tiếp theo" : "Tới đại hội bộ tộc"}
          />
        </div>
      )}

      {phase === 2 && (
        <div className="space-y-4">
          <GradedQuestion
            prompt={R.keyQuestion.prompt}
            options={R.keyQuestion.options}
            correctFeedback={R.keyQuestion.correctFeedback}
            wrongFeedback={R.keyQuestion.wrongFeedback}
            onPass={() => setPhase(3)}
            passLabel="Ghi nhớ điều cốt lõi"
          />
        </div>
      )}

      {phase === 3 && (
        <div className="space-y-4">
          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-xl p-4 j-bubble-in">
            <p className="text-amber-900 font-bold flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined">warning</span>
              GHI NHỚ
            </p>
            <ul className="space-y-2">
              {R.warning.map((text, i) => (
                <li key={i} className="flex items-start gap-2 text-amber-900 leading-relaxed">
                  <span className="material-symbols-outlined text-base text-amber-600 mt-0.5 shrink-0">
                    chevron_right
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={() => setPhase(4)}
            className="inline-flex items-center gap-1.5 bg-red-800 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-red-900 transition-colors"
          >
            Lắp ráp chuỗi nhân quả
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      )}

      {phase === 4 && <ChainGame chain={R.chain} onSuccess={() => onComplete("social")} />}
    </div>
  );
}

// ============================================================================
// CHANG 4 — HOP NHAT TRI THUC (lap rap so do)
// ============================================================================
function SummaryStage({ merged, onMerge, onComplete }) {
  const R = ROUND_SUMMARY;

  // Truoc khi ghep — moi goi nguoi hoc ghep 2 manh
  if (!merged) {
    return (
      <div>
        <SceneBanner scene={R.scene} badge="Hợp nhất tri thức" title={R.title} />
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 md:p-8 text-center">
          <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white items-center justify-center shadow-lg j-glow">
            <span className="material-symbols-outlined text-4xl">extension</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-red-900 mt-4">
            Bạn đã thu thập đủ 2 mảnh ghép tri thức!
          </h3>
          <p className="text-gray-600 mt-2 max-w-lg mx-auto leading-relaxed">
            Hãy ghép hai mảnh <strong>Nguồn gốc nhận thức</strong> và{" "}
            <strong>Nguồn gốc xã hội</strong> lại với nhau để hé lộ bức tranh hoàn chỉnh về
            nguồn gốc của Triết học.
          </p>
          <button
            type="button"
            onClick={onMerge}
            className="mt-6 inline-flex items-center gap-2 bg-red-800 text-white px-7 py-3.5 rounded-xl font-bold text-lg hover:bg-red-900 transition-colors shadow-md active:scale-95"
          >
            <span className="material-symbols-outlined">join_full</span>
            Ghép 2 mảnh tri thức
          </button>
          <p className="hidden lg:block text-xs text-gray-400 mt-4">
            Mẹo: bạn cũng có thể bấm “Ghép” ngay tại Bảng Hợp Nhất bên phải →
          </p>
        </div>
      </div>
    );
  }

  // Sau khi ghep — duc ket hoan chinh
  return (
    <div>
      <SceneBanner scene={R.scene} badge="Đúc kết hoàn chỉnh" title={R.title} />
      <div className="bg-gradient-to-br from-red-50 via-white to-amber-50 border border-red-100 rounded-2xl p-6 md:p-7 shadow-md j-unlock">
        {/* Trung tam: Triet hoc ra doi */}
        <div className="text-center">
          <div className="inline-block rounded-2xl px-6 py-4 text-white bg-gradient-to-br from-red-700 to-red-900 shadow-lg j-glow">
            <span className="material-symbols-outlined text-3xl">hub</span>
            <p className="font-bold text-xl mt-1">{R.center}</p>
            <p className="text-xs text-white/80 mt-0.5">{R.centerNote}</p>
          </div>
        </div>

        {/* Hai nguon goc da hop nhat */}
        <div className="grid md:grid-cols-2 gap-3 mt-6">
          {R.branches.map((b) => (
            <div
              key={b.id}
              className={`rounded-xl p-4 text-white bg-gradient-to-br ${b.color} shadow`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined">{b.icon}</span>
                <h4 className="font-bold">{b.title}</h4>
              </div>
              <ul className="space-y-1.5 text-sm text-white/90">
                {b.points.map((p, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="material-symbols-outlined text-sm mt-0.5">chevron_right</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Cau duc ket hoan chinh */}
        <div className="mt-6 bg-white border-l-4 border-red-700 rounded-r-xl p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-red-700 font-bold mb-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">auto_awesome</span>
            Đúc kết hoàn chỉnh
          </p>
          <p className="text-gray-800 leading-relaxed">{R.finalStatement}</p>
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onComplete}
            className="inline-flex items-center gap-1.5 bg-red-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-900 transition-colors shadow-md active:scale-95"
          >
            Làm bài kiểm tra tổng kết
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// BANG HOP NHAT (sidebar ben phai) — tich luy manh ghep + thao tac ghep
// ============================================================================
function PieceSlot({ branch, index, collected, active }) {
  if (collected) {
    return (
      <div className={`rounded-xl p-3.5 text-white bg-gradient-to-br ${branch.color} shadow-sm j-unlock`}>
        <div className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-full bg-white/25 flex items-center justify-center text-xs font-bold shrink-0">
            {index + 1}
          </span>
          <span className="material-symbols-outlined">{branch.icon}</span>
          <h4 className="font-bold text-sm leading-tight">{branch.title}</h4>
          <span className="material-symbols-outlined ml-auto text-white/90">check_circle</span>
        </div>
        <p className="text-xs text-white/90 mt-2 leading-relaxed">{branch.tagline}</p>
      </div>
    );
  }
  return (
    <div
      className={`rounded-xl p-3.5 border-2 border-dashed transition-all ${
        active ? "border-red-300 bg-red-50/50" : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
            active ? "bg-red-200 text-red-800" : "bg-gray-200 text-gray-400"
          }`}
        >
          {index + 1}
        </span>
        <span className={`material-symbols-outlined ${active ? "text-red-400" : "text-gray-300"}`}>
          {active ? "hourglass_top" : "lock"}
        </span>
        <span className={`text-sm font-semibold ${active ? "text-red-700" : "text-gray-400"}`}>
          {active ? "Đang khám phá…" : "Chưa mở khóa"}
        </span>
      </div>
    </div>
  );
}

function KnowledgePanel({ pieces, activePieceId, canMerge, merged, onMerge }) {
  const branches = ROUND_SUMMARY.branches;
  return (
    <aside className="lg:sticky lg:top-[5.5rem]">
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-red-900 to-red-800 px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined">extension</span>
            <h3 className="font-bold">Nguồn Gốc Triết Học</h3>
            <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold tabular-nums">
              {pieces.length}/{JOURNEY_TOTAL_PIECES}
            </span>
          </div>
        </div>

        <div className="p-4 space-y-2.5">
          <PieceSlot
            branch={branches[0]}
            index={0}
            collected={pieces.includes(branches[0].id)}
            active={activePieceId === branches[0].id}
          />

          {/* Dau noi giua 2 manh */}
          <div className="flex justify-center">
            <span
              className={`material-symbols-outlined text-2xl ${
                merged ? "text-green-500" : canMerge ? "text-red-500 animate-pulse" : "text-gray-300"
              }`}
            >
              {merged ? "link" : "add"}
            </span>
          </div>

          <PieceSlot
            branch={branches[1]}
            index={1}
            collected={pieces.includes(branches[1].id)}
            active={activePieceId === branches[1].id}
          />

          {/* Vung thao tac ghep — bo khoi "Triet hoc ra doi" sau khi ghep theo yeu cau */}
          {!merged && (
            <div className="pt-2">
              {canMerge ? (
                <button
                  type="button"
                  onClick={onMerge}
                  className="w-full inline-flex items-center justify-center gap-2 bg-red-800 text-white px-4 py-3 rounded-xl font-bold hover:bg-red-900 transition-colors shadow-md j-glow active:scale-95"
                >
                  <span className="material-symbols-outlined">join_full</span>
                  Ghép 2 mảnh
                </button>
              ) : (
                <p className="text-center text-xs text-gray-400 leading-relaxed px-2">
                  Hoàn thành cả 2 phần học để mở khóa thao tác ghép.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// ============================================================================
// CHANG 5 — QUIZ TONG KET (tung cau mot, cho lam lai khi sai)
// ============================================================================
function FinalQuizStage({ onComplete }) {
  const { showToast } = useToast();
  const questions = JOURNEY_FINAL_QUIZ;
  const total = questions.length;

  const [index, setIndex] = useState(0);
  const [wrongPicks, setWrongPicks] = useState([]);
  const [solved, setSolved] = useState(false);
  const [score, setScore] = useState(0);

  const q = questions[index];

  const handlePick = (optIndex) => {
    if (solved) return;
    if (optIndex === q.correctIndex) {
      if (wrongPicks.length === 0) setScore((s) => s + 1);
      setSolved(true);
    } else if (!wrongPicks.includes(optIndex)) {
      setWrongPicks((prev) => [...prev, optIndex]);
    }
  };

  const goNext = () => {
    if (index === total - 1) {
      const passed = score >= JOURNEY_FINAL_PASS;
      showToast(
        passed
          ? `Xuất sắc! Bạn đúng ngay ${score}/${total} câu.`
          : `Bạn đúng ngay ${score}/${total} câu — ôn lại nhé.`,
        passed ? "success" : "warning"
      );
      onComplete(score);
      return;
    }
    setIndex((i) => i + 1);
    setWrongPicks([]);
    setSolved(false);
  };

  const progress = Math.round((index / total) * 100);

  return (
    <div className="bg-white rounded-2xl shadow-md border border-red-200 p-6 md:p-7">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-red-800">assignment</span>
        <span className="text-xs uppercase tracking-wider text-red-800 font-bold">
          Kiểm tra tổng kết hành trình
        </span>
      </div>
      <h2 className="text-2xl font-bold text-red-900 mb-4">Bạn đã hiểu nguồn gốc triết học?</h2>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-red-800 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-sm text-gray-500 tabular-nums shrink-0">{index + 1}/{total}</span>
      </div>

      <p className="font-semibold text-lg mb-4 text-gray-900">
        Câu {index + 1}. {q.question}
      </p>
      <div className="space-y-2.5">
        {q.options.map((opt, optIndex) => (
          <button
            key={optIndex}
            type="button"
            disabled={solved}
            onClick={() => handlePick(optIndex)}
            className={getOptionClass({
              resolved: solved,
              isCorrect: optIndex === q.correctIndex,
              isWrongPick: wrongPicks.includes(optIndex),
            })}
          >
            <span className="material-symbols-outlined text-xl shrink-0">
              {solved && optIndex === q.correctIndex
                ? "check_circle"
                : wrongPicks.includes(optIndex)
                ? "cancel"
                : "radio_button_unchecked"}
            </span>
            {opt}
          </button>
        ))}
      </div>

      {!solved && wrongPicks.length > 0 && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          Chưa chính xác — hãy thử một đáp án khác.
        </div>
      )}

      {solved && (
        <div className="mt-4 bg-green-50 border border-green-200 p-4 rounded-lg j-bubble-in">
          <p className="font-bold text-green-800 flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-base">lightbulb</span>
            Chính xác!
          </p>
          <p className="text-sm text-green-900/90 leading-relaxed">{q.explanation}</p>
          <button
            type="button"
            onClick={goNext}
            className="mt-4 inline-flex items-center gap-1.5 bg-red-800 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-red-900 transition-colors"
          >
            {index === total - 1 ? "Xem kết quả" : "Câu tiếp theo"}
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CHANG 6 — HOAN THANH
// ============================================================================
function CompletionStage({ score, onReplay, nextLesson, onNextLesson }) {
  const total = JOURNEY_FINAL_QUIZ.length;
  return (
    <div className="relative overflow-hidden rounded-3xl shadow-xl bg-gradient-to-br from-[#0A3CA0] via-[#062E81] to-[#041C52] text-white text-center">
      {/* Hoa tiet nen — vong tron mo, tao chieu sau */}
      <div className="absolute -right-20 -top-20 w-72 h-72 bg-blue-400/25 rounded-full blur-3xl" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-amber-300/15 rounded-full blur-3xl" />

      <div className="relative p-8 md:p-10">
        {/* Bang chung hoan thanh */}
        <div className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 backdrop-blur px-4 py-1.5 rounded-full text-sm font-bold mb-6">
          <span className="material-symbols-outlined text-base">verified</span>
          Hoàn thành hành trình
        </div>

        {/* Huy hieu */}
        <div className="flex flex-col items-center j-unlock">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center shadow-2xl ring-4 ring-white/25">
            <span className="material-symbols-outlined text-5xl text-white">military_tech</span>
          </div>
          <p className="text-xs uppercase tracking-widest text-blue-100 mt-4 font-bold">Huy hiệu đạt được</p>
          <h2 className="text-3xl font-bold mt-1">{COMPLETION.badge}</h2>
          <p className="text-white/75 text-sm">{COMPLETION.badgeNote}</p>
        </div>

        {/* Ket qua kiem tra */}
        <div className="bg-white/12 border border-white/20 backdrop-blur rounded-2xl px-6 py-4 mt-6 inline-block">
          <p className="text-sm text-blue-50/90">Kết quả kiểm tra</p>
          <p className="text-2xl font-bold tabular-nums">{score}/{total} câu đúng ngay lần đầu</p>
        </div>

        <p className="max-w-xl mx-auto text-white/90 leading-relaxed mt-6">{COMPLETION.message}</p>

        <blockquote className="max-w-lg mx-auto border-l-4 border-amber-300 pl-4 text-left mt-6 italic text-white/90">
          "{COMPLETION.quote.text}"
          <footer className="text-sm text-amber-200 not-italic mt-1">— {COMPLETION.quote.author}</footer>
        </blockquote>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onReplay}
            className="inline-flex items-center gap-1.5 bg-white/15 border border-white/30 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/25 transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-base">replay</span>
            Chơi lại hành trình
          </button>

          {nextLesson && (
            <button
              type="button"
              onClick={() => onNextLesson?.(nextLesson.slug)}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-300 to-orange-400 text-blue-950 px-6 py-3 rounded-xl font-bold hover:from-amber-400 hover:to-orange-500 transition-colors shadow-lg active:scale-95"
            >
              Bài học tiếp theo
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// THANH TIEN DO CHANG + MANH GHEP
// ============================================================================
function JourneyHeader({ stage, pieces, onBack, onReset }) {
  const steps = STAGES.slice(0, 5);
  const activeIndex = STAGES.indexOf(stage);
  const canGoBack = activeIndex > 0;
  const currentLabel = STAGE_LABELS[steps[Math.min(activeIndex, steps.length - 1)]];

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 md:p-5 mb-6 sticky top-4 z-20">
      {/* --- Hang dieu khien: Quay lai · vi tri hien tai · manh ghep · lam lai --- */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          title="Quay lại chặng trước"
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
            canGoBack
              ? "border-red-800 text-red-800 bg-white hover:bg-red-800 hover:text-white shadow-sm active:scale-95"
              : "border-gray-100 text-gray-300 cursor-not-allowed"
          }`}
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span className="hidden sm:inline">Quay lại</span>
        </button>

        {/* Nhan chang hien tai — nhin la biet dang o dau */}
        <div className="text-center min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold leading-none">
            Chặng {Math.min(activeIndex + 1, steps.length)}/{steps.length}
          </p>
          <p className="text-sm md:text-base font-bold text-red-900 truncate leading-tight mt-0.5">
            {currentLabel}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div
            className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full"
            title="Mảnh ghép tri thức đã thu thập"
          >
            <span className="material-symbols-outlined text-amber-600 text-base">extension</span>
            <span className="text-sm font-bold text-amber-700 tabular-nums">
              {pieces.length}/{JOURNEY_TOTAL_PIECES}
            </span>
          </div>
          <button
            type="button"
            onClick={onReset}
            title="Bắt đầu lại từ đầu"
            className="inline-flex items-center justify-center h-9 w-9 rounded-full text-gray-400 hover:text-white hover:bg-red-700 border border-gray-200 hover:border-red-700 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">restart_alt</span>
          </button>
        </div>
      </div>

      {/* --- Stepper truc quan: vong tron danh so noi bang duong tien trinh --- */}
      <div className="flex items-start">
        {steps.map((s, i) => {
          const done = i < activeIndex;
          const active = i === activeIndex;
          return (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-1.5 shrink-0 w-14 md:w-16">
                <div
                  className={`h-9 w-9 md:h-10 md:w-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    done
                      ? "bg-green-500 text-white shadow-sm"
                      : active
                      ? "bg-red-800 text-white ring-4 ring-red-100 shadow-md scale-110"
                      : "bg-white text-gray-400 border-2 border-gray-200"
                  }`}
                >
                  {done ? (
                    <span className="material-symbols-outlined text-lg">check</span>
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`text-[11px] md:text-xs font-semibold text-center leading-tight ${
                    active ? "text-red-800" : done ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {STAGE_LABELS[s]}
                </span>
              </div>

              {i < steps.length - 1 && (
                <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden mt-[15px] md:mt-[17px]">
                  <div
                    className={`h-full rounded-full bg-green-500 transition-all duration-500 ${
                      done ? "w-full" : "w-0"
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT GOC — dieu phoi toan bo hanh trinh
// ============================================================================
export default function PhilosophyJourney({ nextLesson = null, onNextLesson }) {
  const [state, setState] = useLocalStorage(JOURNEY_STORAGE_KEY, INITIAL_STATE);

  const setStage = useCallback(
    (patch) => setState((prev) => ({ ...prev, ...patch })),
    [setState]
  );

  const collectPiece = useCallback(
    (pieceId, nextStage) =>
      setState((prev) => ({
        ...prev,
        pieces: prev.pieces.includes(pieceId) ? prev.pieces : [...prev.pieces, pieceId],
        stage: nextStage,
      })),
    [setState]
  );

  const reset = useCallback(() => setState(INITIAL_STATE), [setState]);

  // Ghep 2 manh tri thuc -> tao duc ket hoan chinh
  const mergePieces = useCallback(() => setStage({ merged: true }), [setStage]);

  // Quay lai: lui ve chang (phan) lien truoc, tung buoc mot — khong ve lai tu dau
  const goBack = useCallback(
    () =>
      setState((prev) => {
        const idx = STAGES.indexOf(prev.stage);
        if (idx <= 0) return prev;
        return { ...prev, stage: STAGES[idx - 1] };
      }),
    [setState]
  );

  const { stage, pieces, score, merged } = state;

  // Sidebar "Bang Hop Nhat" chi hien o cac chang hoc (Nhan thuc/Xa hoi/Hop nhat)
  const showPanel = stage === "cognitive" || stage === "social" || stage === "summary";
  const activePieceId =
    stage === "cognitive" ? "cognitive" : stage === "social" ? "social" : null;

  return (
    <div className={`${showPanel ? "max-w-6xl" : "max-w-3xl"} mx-auto transition-all`}>
      {/* Tieu de bai hoc */}
      <div className="mb-5">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-800 px-3 py-1.5 rounded-full text-xs font-bold mb-2">
          <span className="material-symbols-outlined text-base">explore</span>
          Bài học tương tác · Chương 1.1
        </div>
        <h1 className="font-bold text-3xl md:text-4xl text-red-900">
          Hành trình Khai Sáng: Nguồn gốc của Triết học
        </h1>
        <p className="text-gray-500 mt-1">
          Học qua trò chơi nhập vai — bạn là người trả lời, hệ thống dẫn dắt và đặt câu hỏi.
        </p>
      </div>

      {stage !== "done" && (
        <JourneyHeader stage={stage} pieces={pieces} onBack={goBack} onReset={reset} />
      )}

      {showPanel ? (
        // --- Layout 2 cot: noi dung bai hoc (trai) + Bang Hop Nhat (phai) ---
        <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
          <div className="min-w-0">
            {stage === "cognitive" && (
              <CognitiveStage onComplete={(piece) => collectPiece(piece, "social")} />
            )}
            {stage === "social" && (
              <SocialStage onComplete={(piece) => collectPiece(piece, "summary")} />
            )}
            {stage === "summary" && (
              <SummaryStage
                merged={merged}
                onMerge={mergePieces}
                onComplete={() => setStage({ stage: "quiz" })}
              />
            )}
          </div>

          <KnowledgePanel
            pieces={pieces}
            activePieceId={activePieceId}
            canMerge={stage === "summary" && pieces.length >= JOURNEY_TOTAL_PIECES && !merged}
            merged={merged}
            onMerge={mergePieces}
          />
        </div>
      ) : (
        // --- Cac chang 1 cot: Dan nhap / Quiz / Hoan thanh ---
        <>
          {stage === "intro" && (
            <IntroStage onComplete={(startPoint) => setStage({ startPoint, stage: "cognitive" })} />
          )}

          {stage === "quiz" && (
            <FinalQuizStage
              onComplete={(finalScore) => setStage({ score: finalScore, stage: "done" })}
            />
          )}

          {stage === "done" && (
            <CompletionStage
              score={score ?? 0}
              onReplay={reset}
              nextLesson={nextLesson}
              onNextLesson={onNextLesson}
            />
          )}
        </>
      )}
    </div>
  );
}
```

---

## 6. `src/data/journeyContent.js`

```javascript
// ============================================================================
// NOI DUNG BAI HOC TUONG TAC: "HANH TRINH KHAI SANG"
// Chu de: Nguon goc cua triet hoc (Chuong 1 - Khai luoc ve Triet hoc)
//
// Toan bo loi thoai, cau hoi, dap an, phan giai duoc tach khoi UI (Rule 2, Rule 3).
// Khi can chinh noi dung bai giang -> chi sua file nay, khong dong vao component.
//
// Bam sat noi dung ly thuyet goc: triet hoc ra doi the ky VIII-VI TCN tu HAI nguon goc
//   (1) Nguon goc nhan thuc  (2) Nguon goc xa hoi.
// Co che choi don: nguoi hoc dong vai NGUOI TRA LOI; he thong (nhan vat dan duong + cac
// NPC) dat cau hoi va dong cac vai con lai -> tao cam giac dang hoc cung mot nhom.
// ============================================================================

// --- Cac nhan vat NPC (he thong dong vai) ---
export const CHARACTERS = {
  guide: {
    id: "guide",
    name: "Sophia",
    role: "Người Khai Sáng dẫn đường",
    avatar: "guide", // khoa tra cuu illustration avatar
    color: "from-indigo-500 to-violet-600",
  },
  elder: {
    id: "elder",
    name: "Già làng Kael",
    role: "Trưởng bộ tộc",
    avatar: "elder",
    color: "from-amber-500 to-orange-600",
  },
  skeptic: {
    id: "skeptic",
    name: "Người hoài nghi Lyra",
    role: "Kẻ phản biện trong bộ tộc",
    avatar: "skeptic",
    color: "from-cyan-500 to-blue-600",
  },
  slave: {
    id: "slave",
    name: "Người lao động Borin",
    role: "Tầng lớp lao động chân tay",
    avatar: "slave",
    color: "from-stone-500 to-stone-700",
  },
  noble: {
    id: "noble",
    name: "Quý tộc Theon",
    role: "Tầng lớp lao động trí óc",
    avatar: "noble",
    color: "from-fuchsia-500 to-purple-600",
  },
};

// ============================================================================
// MAN DAN NHAP — VONG 1: CO MAY THOI GIAN & DIEM KHOI DAU
// ============================================================================
export const INTRO = {
  scene: "timeMachine",
  title: "Cỗ Máy Thời Gian",
  subtitle: "Thế kỷ VIII – VI trước Công nguyên",
  // Lời dẫn tuần tự cua nhan vat dan duong
  lines: [
    "Nhiệm vụ của bạn: đi tìm một thứ 'vũ khí tư duy' hoàn toàn mới — có tên là TRIẾT HỌC. Nhưng để tìm thấy nó, ta phải vượt qua 2 thử thách, đại diện cho 2 NGUỒN GỐC khai sinh ra triết học.",
  ],
  // Diem khoi hanh de nguoi hoc chon (mang tinh nhap vai, khong cham diem)
  startPoints: [
    { id: "athens", label: "Quảng trường Athena", place: "Hy Lạp", icon: "account_balance" },
    { id: "ganges", label: "Bên bờ sông Hằng", place: "Ấn Độ", icon: "water" },
    { id: "yellowriver", label: "Lưu vực Hoàng Hà", place: "Trung Hoa", icon: "temple_buddhist" },
  ],
  startConfirm:
    "Tuyệt vời! Dù khởi hành từ đâu, mọi nền văn minh cổ đại đều cùng chạm tới một bước ngoặt tư duy giống nhau. Lên đường thôi!",
};

// ============================================================================
// VONG 2 — THU THACH NHAN THUC: "GIAI MA SAM TRUYEN"
// Muc tieu su pham: nguoi hoc trai nghiem tu duy huyen thoai, gap mau thuan,
// roi tu nhan ra nhu cau tu duy ly luan -> NGUON GOC NHAN THUC.
// ============================================================================
export const ROUND_COGNITIVE = {
  id: "cognitive",
  scene: "earthquake",
  badge: "Thử thách 1 / 2",
  title: "Giải mã sấm truyền",
  subtitle: "Nguồn gốc nhận thức",
  pieceLabel: "NGUỒN GỐC NHẬN THỨC",

  // Mo canh — boi canh da duoc the hien qua VIDEO o tren (VideoScene).
  // Phan thoai chi con dan dat nhap vai + dat van de. Nguoi hoc dong vai mot
  // thanh vien bo toc co dai.
  setup: [
    { who: "elder", text: "Tai họa này từ đâu mà ra?! Hỡi người trẻ kia, hãy giải thích cho cả bộ tộc!" },
  ],

  // Cau hoi 1 (cham diem): rut ra tu video — cach nguoi co dai giai thich hien tuong tu nhien.
  // Dap an dung: A (tu duy than thoai / sieu nhien) -> dat nen cho NGUON GOC NHAN THUC.
  myth: {
    prompt:
      "Con người thời cổ đại thường dùng cách nào để giải thích về các hiện tượng tự nhiên lớn (như mưa giông, sấm chớp, động đất)?",
    options: [
      {
        text: "Cho rằng đó là sự giận dữ hoặc ý chí của các vị thần linh siêu nhiên.",
        correct: true,
      },
      {
        text: "Dựa vào các quy luật khoa học và sự vận động của Trái Đất để chứng minh.",
        correct: false,
      },
      {
        text: "Xem đó là những hiện tượng ngẫu nhiên, không có nguyên nhân hay ý nghĩa gì.",
        correct: false,
      },
    ],
    correctFeedback:
      "Chính xác! Khi chưa có tri thức khoa học, con người cổ đại giải thích mọi hiện tượng tự nhiên bằng THẦN THOẠI và TÍN NGƯỠNG — coi đó là ý chí hay cơn thịnh nộ của thần linh. Đây chính là hình thức 'triết lý' sơ khai đầu tiên của loài người.",
    wrongFeedback:
      "Chưa đúng. Hãy nhớ bối cảnh trong video: thời cổ đại CHƯA có khoa học để chứng minh (loại đáp án B), và con người luôn khao khát tìm nguyên nhân chứ không xem mọi việc là ngẫu nhiên vô nghĩa (loại đáp án C). Họ giải thích tự nhiên bằng niềm tin vào thần linh siêu nhiên.",
  },

  // Buoc ngoat: NPC hoai nghi xuat hien tao mau thuan
  twist: [
    { who: "skeptic", text: "Trời ơi, sao số phận chúng ta khổ thế này! Mưa giông, lũ lụt, hạn hán rồi động đất... năm nào cũng ập tới. Chúng ta đã quỳ lạy, đã tế bao nhiêu lễ vật cho thần linh, vậy mà thiên tai VẪN cứ giáng xuống, chẳng gì đổi thay. Lẽ nào chúng ta mãi mãi bất lực, hay có điều gì khác mà chúng ta chưa biết về thiên nhiên, chẳng hề phụ thuộc vào tâm trạng của các vị thần?" },
  ],

  // Cau hoi 2: nguoi hoc tra loi nguoi hoai nghi -> chot duoc su chuyen dich tu duy
  shift: {
    prompt: "Câu hỏi của Lyra hé lộ điều gì đang BẮT ĐẦU thay đổi trong cách con người suy nghĩ?",
    options: [
      {
        text: "Con người bắt đầu đi tìm quy luật, lý lẽ để giải thích thế giới — thay cho thần thánh.",
        correct: true,
      },
      {
        text: "Con người quyết định tế lễ nhiều hơn nữa cho chắc chắn.",
        correct: false,
      },
      {
        text: "Con người từ bỏ hoàn toàn việc tìm hiểu thế giới.",
        correct: false,
      },
    ],
    correctFeedback:
      "Chính xác! Khoảnh khắc con người ngờ vực thần thoại và đi tìm QUY LUẬT bằng lý lẽ — đó là lúc tư duy lý luận, tức TRIẾT HỌC, bắt đầu nảy mầm.",
    wrongFeedback:
      "Chưa đúng. Hãy để ý: Lyra không kêu gọi tế lễ — cô ấy đang đi tìm một 'quy luật tự nhiên'. Đó mới là mầm mống của tư duy mới.",
  },

  // Duc ket: 4 buoc tien hoa cua tu duy -> mo khoa NGUON GOC NHAN THUC
  conclusion: {
    title: "Đúc kết: Nguồn gốc nhận thức của triết học",
    steps: [
      {
        icon: "psychology",
        head: "1. Nhu cầu tự nhiên",
        body: "Nhận thức, hiểu biết thế giới xung quanh là nhu cầu tự nhiên của con người để sinh tồn.",
      },
      {
        icon: "auto_stories",
        head: "2. Tư duy huyền thoại",
        body: "Thần thoại và tín ngưỡng nguyên thủy là loại hình triết lý ĐẦU TIÊN dùng để giải thích thế giới.",
      },
      {
        icon: "hub",
        head: "3. Phát triển tư duy trừu tượng",
        body: "Khi nhận thức lớn lên, con người biết trừu tượng hóa, khái quát hóa các tri thức riêng lẻ thành cái chung.",
      },
      {
        icon: "emoji_objects",
        head: "4. Triết học ra đời",
        body: "Triết học là hình thức tư duy lý luận đầu tiên THAY THẾ tư duy huyền thoại — giải thích thế giới bằng khái niệm, phạm trù, quy luật phổ quát.",
      },
    ],
    reward: "Bạn đã thu thập được mảnh ghép: NGUỒN GỐC NHẬN THỨC!",
  },
};

// ============================================================================
// VONG 3 — THU THACH XA HOI: "CUOC HOP DAI HOI BO TOC"
// Muc tieu su pham: nguoi hoc doi goc nhin (no le vs quy toc), tu nhan ra
// chi tang lop lao dong tri oc moi du dieu kien lam triet hoc -> NGUON GOC XA HOI.
// ============================================================================
export const ROUND_SOCIAL = {
  id: "social",
  scene: "society",
  badge: "Thử thách 2 / 2",
  title: "...khi phương thức sản xuất thay đổi...",
  subtitle: "Nguồn gốc xã hội",
  pieceLabel: "NGUỒN GỐC XÃ HỘI",

  // Mo canh — Sophia ke so luoc boi canh (ngan gon) roi moi nguoi hoc nhap vai.
  setup: [
    { who: "guide", text: "Bối cảnh: many thế hệ trôi qua, khi phương thức sản xuất thay đổi — con người biết rèn đồng, rèn sắt, của cải bắt đầu dư thừa — xã hội phân chia thành Chủ nô và Nô lệ." },
    { who: "guide", text: "Để hiểu ai mới đủ điều kiện làm triết học, hãy thử sống MỘT NGÀY trong hai vai khác nhau nhé." },
  ],

  // Trai nghiem 2 vai lan luot — moi vai 1 lua chon nho minh hoa quy thoi gian/dieu kien
  roles: [
    {
      who: "slave",
      label: "Vai 1: Người lao động chân tay",
      intro: "Trời chưa sáng, Borin đã phải ra đồng cày cuốc, vác đá xây tháp tới kiệt sức.",
      question: "Cuối ngày, kiệt quệ vì lo từng bữa ăn — bạn có thời gian và sức lực để ngồi suy ngẫm về nguồn gốc vũ trụ không?",
      options: [
        { text: "Không. Mình chỉ kịp ăn vội rồi ngủ để mai lại lao động.", correct: true },
        { text: "Có. Mình thức trắng đêm để viết một học thuyết triết học.", correct: false },
      ],
      feedbackCorrect:
        "Đúng vậy. Lao động chân tay nặng nhọc và nỗi lo sinh tồn không để lại điều kiện nào cho việc nghiên cứu lý luận.",
      feedbackWrong:
        "Khó lắm! Một người kiệt sức vì lao động chân tay và lo miếng ăn gần như không còn thời gian, sức lực cho tư duy lý luận.",
    },
    {
      who: "noble",
      label: "Vai 2: Tầng lớp quý tộc / trí thức",
      intro: "Theon có của cải dư thừa, không phải lao động chân tay. Chiều đến, ông thong dung ngắm sao trời và đàm đạo cùng bạn hữu.",
      question: "Với điều kiện sống như vậy, Theon có thể làm gì?",
      options: [
        { text: "Dành thời gian quan sát, suy ngẫm và hệ thống hóa tri thức thành học thuyết.", correct: true },
        { text: "Cũng chẳng làm được gì vì quá bận đi cày.", correct: false },
      ],
      feedbackCorrect:
        "Chính xác. Có của cải dư thừa và thời gian rảnh, tầng lớp trí óc mới đủ điều kiện để nghiên cứu và sáng tạo lý luận.",
      feedbackWrong:
        "Không phải. Theon KHÔNG phải lao động chân tay — ông có dư thời gian để suy ngẫm, đó là điểm mấu chốt.",
    },
  ],

  // Cau hoi cot loi cua "dai hoi"
  keyQuestion: {
    prompt:
      "Tại đại hội bộ tộc, câu hỏi lớn được đặt ra: NHÓM NÀO đủ điều kiện, thời gian và nhu cầu để hệ thống hóa tri thức thành học thuyết và trở thành các 'Nhà thông thái'?",
    options: [
      { text: "Tầng lớp lao động trí óc (quý tộc, trí thức).", correct: true },
      { text: "Tầng lớp lao động chân tay (nô lệ).", correct: false },
      { text: "Cả hai nhóm đều như nhau.", correct: false },
    ],
    correctFeedback:
      "Hoàn toàn đúng! Chỉ khi lao động trí óc TÁCH KHỎI lao động chân tay, tầng lớp trí thức mới xuất hiện và có điều kiện hệ thống hóa tri thức thành triết học.",
    wrongFeedback:
      "Hãy nhớ lại trải nghiệm vừa rồi: chỉ tầng lớp có của cải dư thừa và thời gian rảnh (lao động trí óc) mới đủ điều kiện làm việc đó.",
  },

  // Loi canh bao cot loi — tach thanh 3 y nho cho de doc (render duoi dang danh sach)
  warning: [
    "Triết học KHÔNG THỂ ra đời trong một xã hội mông muội, dã man. Nó chỉ ra đời khi xã hội đạt đến một trình độ tương đối cao của sản xuất xã hội, phân công lao động xã hội hình thành, giai cấp phân hóa rõ và mạnh, nhà nước ra đời.",
    "Tầng lớp tri thức xuất hiện đóng vai trò quan trọng trong việc hệ thống hóa toàn bộ tri thức của thời đại để xây dựng nên các học thuyết, lý luận, triết thuyết.",
    "Triết học, ngay từ khi xuất hiện đã mang trong mình tính giai cấp sâu sắc.",
  ],

  // Mini-game: sap xep chuoi nhan qua dung thu tu -> mo khoa NGUON GOC XA HOI
  chain: {
    title: "Lắp ráp chuỗi nhân quả: Vì sao triết học ra đời?",
    instruction: "Chọn các mắt xích theo ĐÚNG thứ tự nhân quả, từ gốc tới ngọn.",
    // order = thu tu dung (0..n)
    items: [
      { id: "c1", order: 0, icon: "agriculture", text: "Sản xuất phát triển, chế độ tư hữu hình thành, của cải dư thừa." },
      { id: "c2", order: 1, icon: "groups", text: "Xã hội phân chia giai cấp (chế độ chiếm hữu nô lệ)." },
      { id: "c3", order: 2, icon: "engineering", text: "Lao động trí óc tách khỏi lao động chân tay." },
      { id: "c4", order: 3, icon: "school", text: "Tầng lớp trí thức xuất hiện và hệ thống hóa tri thức thành triết học." },
    ],
    successFeedback:
      "Chuỗi nhân quả đã sáng lên! Đây chính là NGUỒN GỐC XÃ HỘI của triết học.",
    reward: "Bạn đã thu thập được mảnh ghép: NGUỒN GỐC XÃ HỘI!",
  },
};

// ============================================================================
// VONG 4 — TONG KET: LAP RAP SO DO & THU HOACH
// ============================================================================
export const ROUND_SUMMARY = {
  scene: "synthesis",
  title: "Hợp nhất tri thức",
  // Hai nhanh nguoi hoc da mo khoa
  branches: [
    {
      id: "cognitive",
      title: "Nguồn gốc nhận thức",
      icon: "psychology",
      tagline: "Nhu cầu hiểu biết thế giới → tư duy lý luận thay thế huyền thoại.",
      points: [
        "Nhu cầu tự nhiên: hiểu biết thế giới.",
        "Tư duy huyền thoại → tư duy trừu tượng, khái quát.",
        "Triết học = tư duy lý luận đầu tiên thay thế huyền thoại.",
      ],
      color: "from-cyan-600 to-blue-700",
    },
    {
      id: "social",
      title: "Nguồn gốc xã hội",
      icon: "groups",
      tagline: "Điều kiện xã hội chín muồi → tầng lớp trí thức ra đời.",
      points: [
        "Sản xuất phát triển, tư hữu & giai cấp xuất hiện.",
        "Lao động trí óc tách khỏi lao động chân tay.",
        "Tầng lớp trí thức hệ thống hóa tri thức thành học thuyết.",
      ],
      color: "from-fuchsia-600 to-purple-700",
    },
  ],
  center: "TRIẾT HỌC RA ĐỜI",
  centerNote: "Thế kỷ VIII – VI TCN, ở cả phương Đông và phương Tây",
  // Cau dúc ket hoan chinh — hien khi nguoi hoc ghep 2 manh lai voi nhau
  finalStatement:
    "Triết học ra đời từ sự HỢP NHẤT của hai nguồn gốc: NHU CẦU NHẬN THỨC thế giới của con người và những ĐIỀU KIỆN XÃ HỘI chín muồi — phân công lao động, giai cấp, và sự xuất hiện của tầng lớp trí thức.",
  guideLines: [
    "Chúc mừng nhà du hành! Bạn đã ghép xong bức tranh hoàn chỉnh.",
    "Triết học không từ trên trời rơi xuống. Nó nảy sinh từ chính NHU CẦU HIỂU BIẾT của con người (nguồn gốc nhận thức)...",
    "...và từ những ĐIỀU KIỆN XÃ HỘI chín muồi: phân công lao động, giai cấp, tầng lớp trí thức (nguồn gốc xã hội).",
  ],
};

// --- Quiz tong ket cuoi hanh trinh (cung co kien thuc) ---
export const JOURNEY_FINAL_QUIZ = [
  {
    question: "Triết học ra đời vào khoảng thời gian nào?",
    options: ["Thế kỷ XV – XVI sau CN", "Thế kỷ VIII – VI trước CN", "Thế kỷ I sau CN", "Thời kỳ đồ đá cũ"],
    correctIndex: 1,
    explanation:
      "Triết học ra đời khoảng thế kỷ VIII – VI trước Công nguyên, ở cả phương Đông và phương Tây, tại các trung tâm văn minh lớn.",
  },
  {
    question: "Triết học có mấy nguồn gốc cơ bản?",
    options: ["Một: nguồn gốc thần thánh", "Hai: nhận thức và xã hội", "Ba: kinh tế, chính trị, văn hóa", "Không có nguồn gốc xác định"],
    correctIndex: 1,
    explanation:
      "Triết học có hai nguồn gốc: nguồn gốc nhận thức (nhu cầu hiểu biết, vượt qua tư duy huyền thoại) và nguồn gốc xã hội (phân công lao động, giai cấp, tầng lớp trí thức).",
  },
  {
    question: "Về nguồn gốc nhận thức, triết học là hình thức tư duy thay thế cho cái gì?",
    options: ["Thay thế khoa học tự nhiên", "Thay thế tư duy huyền thoại và tôn giáo", "Thay thế lao động chân tay", "Thay thế nghệ thuật"],
    correctIndex: 1,
    explanation:
      "Triết học là hình thức tư duy lý luận đầu tiên thay thế cho tư duy huyền thoại và tôn giáo, giải thích thế giới bằng khái niệm, phạm trù, quy luật phổ quát.",
  },
  {
    question: "Điều kiện xã hội nào là tiền đề cho triết học ra đời?",
    options: [
      "Xã hội mông muội, chưa phân hóa",
      "Phân công lao động, giai cấp xuất hiện, lao động trí óc tách khỏi chân tay",
      "Mọi người đều làm nông nghiệp như nhau",
      "Xã hội không có của cải dư thừa",
    ],
    correctIndex: 1,
    explanation:
      "Triết học ra đời khi sản xuất phát triển, tư hữu và giai cấp xuất hiện, lao động trí óc tách khỏi lao động chân tay, hình thành tầng lớp trí thức có điều kiện hệ thống hóa tri thức.",
  },
  {
    question: "Vì sao tầng lớp trí thức (lao động trí óc) lại là người sáng tạo ra triết học?",
    options: [
      "Vì họ khỏe mạnh hơn",
      "Vì họ có của cải dư thừa, thời gian và nhu cầu để nghiên cứu, hệ thống hóa tri thức",
      "Vì họ được thần linh ban cho",
      "Vì họ làm nhiều việc chân tay hơn",
    ],
    correctIndex: 1,
    explanation:
      "Nhờ có của cải dư thừa và không phải lao động chân tay, tầng lớp trí thức có điều kiện và nhu cầu nghiên cứu, đủ năng lực hệ thống hóa các quan niệm thành học thuyết, lý luận.",
  },
];

export const COMPLETION = {
  badge: "Nhà Khai Sáng",
  badgeNote: "Chương 1.1 — Nguồn gốc của triết học",
  message:
    "Bạn đã hoàn thành Hành trình Khai Sáng và nắm được trọn vẹn hai nguồn gốc của triết học. Tri thức là ngọn đuốc — hãy tiếp tục thắp sáng!",
  quote: {
    text: "Các nhà triết học đã chỉ giải thích thế giới bằng nhiều cách khác nhau, song vấn đề là cải tạo thế giới.",
    author: "Karl Marx, Luận cương về Feuerbach",
  },
};
```

---

## 7. `src/components/journey/JourneyArt.jsx`

```jsx
import React from "react";

// ============================================================================
// HINH ANH HOAT HOA cho bai hoc "Hanh trinh Khai Sang"
// Tat ca deu la SVG noi tuyen + animation bang CSS (class j-*) dinh nghia trong index.css.
// Ly do dung SVG thay vi anh/GIF ngoai mang:
//   - Khong phu thuoc mang -> chay muot khi trinh dien, khong loi 404.
//   - Nhe, sac net o moi do phan giai, animation chay bang transform (GPU) -> hieu nang cao.
//   - Ton trong prefers-reduced-motion (xem index.css) cho nguoi nhay cam voi chuyen dong.
// ============================================================================

// --- Avatar nhan vat (he thong dong vai) ---
// Moi nhan vat 1 chan dung hinh hoc co mau rieng -> nguoi hoc de phan biet ai dang noi.
export function Avatar({ id, size = 44, className = "" }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 64 64",
    className,
    role: "img",
    "aria-hidden": true,
  };

  switch (id) {
    case "guide": // Sophia — Nguoi Khai Sang: ngon duoc tri tue
      return (
        <svg {...common}>
          <defs>
            <radialGradient id="gd-guide" cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#6d28d9" />
            </radialGradient>
          </defs>
          <circle cx="32" cy="32" r="30" fill="url(#gd-guide)" />
          <g className="j-flicker" style={{ transformOrigin: "32px 30px" }}>
            <path d="M32 14c5 6 8 10 8 16a8 8 0 11-16 0c0-6 3-10 8-16z" fill="#fde68a" />
            <path d="M32 22c2.5 3 4 5.5 4 8.5a4 4 0 11-8 0c0-3 1.5-5.5 4-8.5z" fill="#fb923c" />
          </g>
          <circle cx="32" cy="48" r="6" fill="#ede9fe" />
        </svg>
      );
    case "elder": // Gia lang — rau dai
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="30" fill="#d97706" />
          <circle cx="32" cy="26" r="11" fill="#fde2bf" />
          <path d="M22 30c0 12 4 22 10 22s10-10 10-22c-3 4-6 5-10 5s-7-1-10-5z" fill="#f5f5f4" />
          <rect x="24" y="14" width="16" height="6" rx="3" fill="#92400e" />
          <circle cx="28" cy="26" r="1.6" fill="#1f2937" />
          <circle cx="36" cy="26" r="1.6" fill="#1f2937" />
        </svg>
      );
    case "skeptic": // Nguoi hoai nghi — dau cham hoi
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="30" fill="#0891b2" />
          <circle cx="32" cy="30" r="12" fill="#cffafe" />
          <circle cx="27" cy="29" r="1.8" fill="#0e7490" />
          <circle cx="37" cy="29" r="1.8" fill="#0e7490" />
          <path d="M28 35c2 1.5 6 1.5 8 0" stroke="#0e7490" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <text x="44" y="20" fontSize="18" fontWeight="700" fill="#fde047" className="j-bob">?</text>
        </svg>
      );
    case "slave": // Lao dong chan tay — mang tren vai
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="30" fill="#57534e" />
          <circle cx="32" cy="27" r="10" fill="#e7d3bf" />
          <path d="M16 44c4-6 10-9 16-9s12 3 16 9z" fill="#78716c" />
          <rect x="14" y="20" width="36" height="3.4" rx="1.7" fill="#451a03" transform="rotate(-12 32 22)" />
          <circle cx="29" cy="26" r="1.5" fill="#1f2937" />
          <circle cx="35" cy="26" r="1.5" fill="#1f2937" />
        </svg>
      );
    case "noble": // Quy toc / tri thuc — cuon sach + vuong mien
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="30" fill="#9333ea" />
          <circle cx="32" cy="28" r="11" fill="#f3e8ff" />
          <path d="M22 18l4 5 6-6 6 6 4-5v6H22z" fill="#facc15" />
          <circle cx="28" cy="28" r="1.6" fill="#4c1d95" />
          <circle cx="36" cy="28" r="1.6" fill="#4c1d95" />
          <path d="M28 33c2 1.2 6 1.2 8 0" stroke="#7e22ce" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="30" fill="#9ca3af" />
        </svg>
      );
  }
}

// --- Canh nen hoat hoa theo tung vong ---
export function SceneArt({ scene, className = "" }) {
  const wrap = `w-full h-full ${className}`;

  if (scene === "timeMachine") {
    return (
      <svg viewBox="0 0 400 240" className={wrap} role="img" aria-label="Cỗ máy thời gian và bản đồ văn minh cổ đại">
        <defs>
          <radialGradient id="sky" cx="50%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#312e81" />
            <stop offset="100%" stopColor="#0f0a2e" />
          </radialGradient>
          <radialGradient id="portal" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="60%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#4c1d95" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="240" fill="url(#sky)" />
        {/* Sao lap lanh */}
        {[[40, 40], [90, 70], [150, 30], [330, 50], [280, 90], [360, 120], [60, 140], [200, 25]].map(
          ([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.6" fill="#fff" className="j-twinkle" style={{ animationDelay: `${i * 0.4}s` }} />
          )
        )}
        {/* Cong xoay thoi gian */}
        <g style={{ transformOrigin: "200px 130px" }} className="j-spin-slow">
          <circle cx="200" cy="130" r="70" fill="url(#portal)" />
          <circle cx="200" cy="130" r="70" fill="none" stroke="#a78bfa" strokeWidth="2" strokeDasharray="6 10" />
          <circle cx="200" cy="130" r="52" fill="none" stroke="#ddd6fe" strokeWidth="1.5" strokeDasharray="3 14" />
        </g>
        {/* Ban do van minh — 3 diem sang */}
        {[
          { x: 140, y: 130, label: "Hy Lạp" },
          { x: 200, y: 150, label: "Ấn Độ" },
          { x: 255, y: 120, label: "Trung Hoa" },
        ].map((m, i) => (
          <g key={i} className="j-pulse-soft" style={{ animationDelay: `${i * 0.6}s`, transformOrigin: `${m.x}px ${m.y}px` }}>
            <circle cx={m.x} cy={m.y} r="6" fill="#fbbf24" />
            <circle cx={m.x} cy={m.y} r="11" fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.6" />
          </g>
        ))}
      </svg>
    );
  }

  if (scene === "earthquake") {
    return (
      <svg viewBox="0 0 400 240" className={wrap} role="img" aria-label="Trận động đất phá hủy ngôi đền và mùa màng">
        <defs>
          <linearGradient id="eq-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7f1d1d" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
        <rect width="400" height="240" fill="url(#eq-sky)" />
        {/* Tia set */}
        <path className="j-flash" d="M250 10l-18 70h22l-16 80 60-100h-26l20-50z" fill="#fde047" />
        {/* Den co dai rung lac */}
        <g className="j-shake" style={{ transformOrigin: "200px 200px" }}>
          <rect x="120" y="80" width="160" height="14" fill="#e7e5e4" />
          <path d="M120 80l80 -26 80 26z" fill="#f5f5f4" />
          {[132, 168, 204, 240].map((x) => (
            <rect key={x} x={x} y="94" width="14" height="86" fill="#d6d3d1" />
          ))}
          <rect x="120" y="180" width="160" height="12" fill="#a8a29e" />
        </g>
        {/* Khe nut mat dat */}
        <rect x="0" y="200" width="400" height="40" fill="#451a03" />
        <path className="j-crack-grow" d="M150 200l16 40M250 200l-14 40M200 200l4 40" stroke="#1c1917" strokeWidth="3" fill="none" />
      </svg>
    );
  }

  if (scene === "society") {
    return (
      <svg viewBox="0 0 400 240" className={wrap} role="img" aria-label="Xã hội phân chia giai cấp: lao động chân tay và tầng lớp trí thức">
        <defs>
          <linearGradient id="soc-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fed7aa" />
          </linearGradient>
        </defs>
        <rect width="400" height="240" fill="url(#soc-sky)" />
        <circle cx="330" cy="50" r="26" fill="#fbbf24" className="j-pulse-soft" style={{ transformOrigin: "330px 50px" }} />
        <rect x="0" y="190" width="400" height="50" fill="#a16207" />
        {/* Lao dong chan tay — cuoc xuong dong */}
        <g style={{ transformOrigin: "110px 150px" }}>
          <circle cx="110" cy="120" r="14" fill="#e7d3bf" />
          <rect x="100" y="134" width="20" height="40" rx="6" fill="#78716c" />
          <g className="j-dig" style={{ transformOrigin: "120px 150px" }}>
            <rect x="118" y="120" width="5" height="50" rx="2" fill="#451a03" transform="rotate(35 120 150)" />
          </g>
        </g>
        {/* Quy toc / tri thuc — ngam sao, cuon sach */}
        <g>
          <circle cx="290" cy="118" r="14" fill="#f3e8ff" />
          <path d="M276 130h28l-4 46h-20z" fill="#9333ea" />
          <rect x="296" y="140" width="22" height="16" rx="2" fill="#facc15" className="j-bob" style={{ transformOrigin: "307px 148px" }} />
        </g>
        {/* Duong phan chia giai cap */}
        <line x1="200" y1="90" x2="200" y2="200" stroke="#92400e" strokeWidth="2" strokeDasharray="5 6" />
      </svg>
    );
  }

  // synthesis (du phong) — hai nhanh hoi tu ve tam
  return (
    <svg viewBox="0 0 400 240" className={wrap} role="img" aria-label="Hai nguồn gốc hợp nhất tạo nên triết học">
      <rect width="400" height="240" fill="#1e1b4b" />
      <circle cx="200" cy="120" r="40" fill="#7c3aed" className="j-glow" style={{ transformOrigin: "200px 120px" }} />
      <line x1="80" y1="60" x2="200" y2="120" stroke="#22d3ee" strokeWidth="3" className="j-draw" />
      <line x1="320" y1="60" x2="200" y2="120" stroke="#e879f9" strokeWidth="3" className="j-draw" style={{ animationDelay: "0.4s" }} />
      <circle cx="80" cy="60" r="18" fill="#0891b2" />
      <circle cx="320" cy="60" r="18" fill="#a21caf" />
    </svg>
  );
}
```

---

## 8. `src/components/journey/GuideSpeech.jsx`

```jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Avatar } from "./JourneyArt";
import { CHARACTERS } from "../../data/journeyContent";
import { TYPEWRITER_SPEED_MS, NPC_REVEAL_DELAY_MS } from "../../constants";

// ============================================================================
// HE THONG HOI THOAI cho bai hoc tuong tac.
// Co che choi don: he thong dong cac vai (NPC) va lan luot "noi" voi nguoi hoc
// qua cac bong bong thoai -> tao cam giac dang hoc cung mot nhom nguoi.
// ============================================================================

// Kiem tra nguoi dung co bat "giam chuyen dong" khong -> tat hieu ung go chu cho de chiu.
function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Hook hieu ung go chu (typewriter). Tra ve { shown, done, finishNow }.
function useTypewriter(fullText, enabled = true) {
  const [shown, setShown] = useState(enabled ? "" : fullText);
  const [done, setDone] = useState(!enabled);
  const timerRef = useRef(null);

  useEffect(() => {
    clearInterval(timerRef.current);
    // Neu tat hieu ung (reduced-motion) -> hien toan bo ngay
    if (!enabled || prefersReducedMotion()) {
      setShown(fullText);
      setDone(true);
      return;
    }
    setShown("");
    setDone(false);
    let index = 0;
    timerRef.current = setInterval(() => {
      index += 1;
      setShown(fullText.slice(0, index));
      if (index >= fullText.length) {
        clearInterval(timerRef.current);
        setDone(true);
      }
    }, TYPEWRITER_SPEED_MS);
    return () => clearInterval(timerRef.current);
  }, [fullText, enabled]);

  const finishNow = useCallback(() => {
    clearInterval(timerRef.current);
    setShown(fullText);
    setDone(true);
  }, [fullText]);

  return { shown, done, finishNow };
}

// Mot bong bong thoai: avatar + ten vai + noi dung.
function SpeechBubble({ who, text, animate, onTypingDone }) {
  const character = CHARACTERS[who] || CHARACTERS.guide;
  const { shown, done, finishNow } = useTypewriter(text, animate);

  useEffect(() => {
    if (done) onTypingDone?.();
  }, [done, onTypingDone]);

  return (
    <div className="flex items-start gap-3 j-bubble-in">
      <div
        className={`shrink-0 rounded-full bg-gradient-to-br ${character.color} p-0.5 shadow-md`}
      >
        <Avatar id={character.avatar} size={44} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-bold text-sm text-gray-900">{character.name}</span>
          <span className="text-[11px] text-gray-400">{character.role}</span>
        </div>
        <div
          className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm text-gray-800 leading-relaxed"
          onClick={() => !done && finishNow()}
        >
          {shown}
          {!done && <span className="j-caret" aria-hidden>▋</span>}
        </div>
      </div>
    </div>
  );
}

// Chuoi hoi thoai phat lan luot.
// MAC DINH autoPlay = true: cac dong thoai TU DONG hien lan luot (sau khi go xong
// 1 dong, tu cho NPC_REVEAL_DELAY_MS roi hien dong ke) -> nguoi hoc khong phai
// bam "Tiep" cho tung cau (giam tuong tac). Bam vao bong bong de go nhanh het cau.
// Khi het thoai -> hien 1 nut CTA duy nhat de di tiep (diem tuong tac chu chot).
export default function DialogueSequence({ lines, onComplete, ctaLabel = "Tiếp tục", autoPlay = true }) {
  const [visibleCount, setVisibleCount] = useState(1);
  const [currentTypingDone, setCurrentTypingDone] = useState(false);
  const scrollAnchorRef = useRef(null);
  const advanceTimerRef = useRef(null);

  const isLastVisible = visibleCount >= lines.length;
  const allDone = isLastVisible && currentTypingDone;

  // Cuon nhe toi dong moi nhat cho de theo doi
  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [visibleCount, currentTypingDone]);

  // Reset khi danh sach loi thay doi (chuyen sang doan hoi thoai khac)
  useEffect(() => {
    setVisibleCount(1);
    setCurrentTypingDone(false);
  }, [lines]);

  const showNextLine = useCallback(() => {
    setCurrentTypingDone(false);
    setVisibleCount((c) => c + 1);
  }, []);

  // Tu dong chuyen sang dong thoai ke khi dong hien tai da go xong
  useEffect(() => {
    clearTimeout(advanceTimerRef.current);
    if (autoPlay && currentTypingDone && !isLastVisible) {
      advanceTimerRef.current = setTimeout(showNextLine, NPC_REVEAL_DELAY_MS);
    }
    return () => clearTimeout(advanceTimerRef.current);
  }, [autoPlay, currentTypingDone, isLastVisible, showNextLine]);

  return (
    <div>
      <div className="space-y-4">
        {lines.slice(0, visibleCount).map((line, index) => {
          const isCurrent = index === visibleCount - 1;
          return (
            <SpeechBubble
              key={index}
              who={line.who}
              text={line.text}
              animate={isCurrent}
              onTypingDone={isCurrent ? () => setCurrentTypingDone(true) : undefined}
            />
          );
        })}
        <div ref={scrollAnchorRef} />
      </div>

      <div className="mt-5 flex justify-end">
        {!allDone ? (
          !autoPlay && (
            <button
              type="button"
              onClick={showNextLine}
              disabled={!currentTypingDone || isLastVisible}
              className="inline-flex items-center gap-1.5 bg-gray-800 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Tiếp
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          )
        ) : (
          <button
            type="button"
            onClick={onComplete}
            className="inline-flex items-center gap-1.5 bg-red-800 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-red-900 transition-colors j-bubble-in"
          >
            {ctaLabel}
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        )}
      </div>
    </div>
  );
}

// Xuat lai SpeechBubble de cac vong dung lai khi can hien 1 cau thoai don le.
export { SpeechBubble };
```

---

## 9. `src/data/mindmapData.js`

```javascript
// Dữ liệu cấu trúc sơ đồ tư duy: Chương -> Đề mục -> Bài học
// Tách riêng để Mindmap.jsx tập trung vào trình bày (Rule 2, Rule 3)

export const MINDMAP_CHAPTERS = [
  {
    id: "ch1",
    title: "Chương 1",
    subtitle: "Triết học và vai trò của triết học trong đời sống xã hội",
    color: "from-red-700 to-red-900",
    sections: [
      {
        id: "ch1-s1",
        title: "Khái lược về Triết học",
        lessons: [
          { id: "l1-1", title: "Nguồn gốc của triết học",      slug: "nguon-goc-triet-hoc" },
          { id: "l1-2", title: "Khái niệm triết học",          slug: "khai-niem-triet-hoc" },
          { id: "l1-3", title: "Vấn đề cơ bản của triết học",  slug: "van-de-co-ban" },
        ],
      },
      {
        id: "ch1-s2",
        title: "Triết học Mác – Lênin",
        lessons: [
          { id: "l1-4", title: "Sự ra đời và phát triển",       slug: "su-ra-doi" },
          { id: "l1-5", title: "Đối tượng và chức năng",        slug: "doi-tuong-chuc-nang" },
          { id: "l1-6", title: "Vai trò trong đời sống xã hội", slug: "vai-tro-xa-hoi" },
        ],
      },
    ],
  },
  {
    id: "ch2",
    title: "Chương 2",
    subtitle: "Chủ nghĩa duy vật nghiên cứu",
    color: "from-amber-700 to-amber-900",
    sections: [
      {
        id: "ch2-s1",
        title: "Vật chất và ý thức",
        lessons: [
          { id: "l2-1", title: "Phạm trù vật chất",                 slug: "pham-tru-vat-chat" },
          { id: "l2-2", title: "Phương thức tồn tại của vật chất",  slug: "phuong-thuc-ton-tai" },
          { id: "l2-3", title: "Nguồn gốc và bản chất của ý thức",  slug: "ban-chat-y-thuc" },
          { id: "l2-4", title: "Mối quan hệ vật chất – ý thức",     slug: "quan-he-vc-yt" },
        ],
      },
      {
        id: "ch2-s2",
        title: "Phép biện chứng duy vật",
        lessons: [
          { id: "l2-5", title: "Hai nguyên lý cơ bản", slug: "hai-nguyen-ly" },
          { id: "l2-6", title: "Các cặp phạm trù",     slug: "cap-pham-tru" },
          { id: "l2-7", title: "Ba quy luật cơ bản",   slug: "ba-quy-luat" },
        ],
      },
      {
        id: "ch2-s3",
        title: "Lý luận nhận thức",
        lessons: [
          { id: "l2-8",  title: "Bản chất của nhận thức",            slug: "ban-chat-nhan-thuc" },
          { id: "l2-9",  title: "Thực tiễn và vai trò của thực tiễn", slug: "thuc-tien" },
          { id: "l2-10", title: "Chân lý",                            slug: "chan-ly" },
        ],
      },
    ],
  },
  {
    id: "ch3",
    title: "Chương 3",
    subtitle: "Chủ nghĩa duy vật lịch sử",
    color: "from-emerald-700 to-emerald-900",
    sections: [
      {
        id: "ch3-s1",
        title: "Hình thái kinh tế – xã hội",
        lessons: [
          { id: "l3-1", title: "Sản xuất vật chất",                       slug: "san-xuat-vat-chat" },
          { id: "l3-2", title: "Biện chứng LLSX – QHSX",                  slug: "llsx-qhsx" },
          { id: "l3-3", title: "Cơ sở hạ tầng & kiến trúc thượng tầng",   slug: "ha-tang-thuong-tang" },
        ],
      },
      {
        id: "ch3-s2",
        title: "Giai cấp và đấu tranh giai cấp",
        lessons: [
          { id: "l3-4", title: "Nguồn gốc giai cấp",          slug: "nguon-goc-giai-cap" },
          { id: "l3-5", title: "Đấu tranh giai cấp",          slug: "dau-tranh-giai-cap" },
          { id: "l3-6", title: "Nhà nước và cách mạng xã hội", slug: "nha-nuoc-cach-mang" },
        ],
      },
      {
        id: "ch3-s3",
        title: "Con người và vai trò của quần chúng",
        lessons: [
          { id: "l3-7", title: "Bản chất con người",   slug: "ban-chat-con-nguoi" },
          { id: "l3-8", title: "Quần chúng và lãnh tụ", slug: "quan-chung-lanh-tu" },
        ],
      },
    ],
  },
];

// Helper tính tổng số đề mục và bài học của một chương
export const countSections = (chapter) => chapter.sections.length;
export const countLessons  = (chapter) =>
  chapter.sections.reduce((total, section) => total + section.lessons.length, 0);

// Danh sách phẳng tất cả bài học kèm ngữ cảnh chương/đề mục
// Dùng để tra cứu nhanh tiêu đề bài học từ slug trong trang Lesson
export const ALL_LESSONS = MINDMAP_CHAPTERS.flatMap((chapter) =>
  chapter.sections.flatMap((section) =>
    section.lessons.map((lesson) => ({
      ...lesson,
      chapterTitle: chapter.title,
      chapterSubtitle: chapter.subtitle,
      sectionTitle: section.title,
    }))
  )
);

// Tra cứu 1 bài học theo slug; trả về null nếu không tồn tại
export const findLessonBySlug = (slug) =>
  ALL_LESSONS.find((lesson) => lesson.slug === slug) || null;

// Tra cứu bài học KẾ TIẾP theo thứ tự phẳng; trả về null nếu là bài cuối
export const findNextLesson = (slug) => {
  const index = ALL_LESSONS.findIndex((lesson) => lesson.slug === slug);
  if (index === -1 || index >= ALL_LESSONS.length - 1) return null;
  return ALL_LESSONS[index + 1];
};
```
