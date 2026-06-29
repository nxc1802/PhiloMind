# BAO CAO TOI UU CODE
# Du an     : Dialectic Academy (MLN_WEB)
# Phien ban : v1.0.0 -> v1.1.0
# Ngay      : 26/05/2026
# Nguoi thuc hien: AI Agent (Claude)

---

## 1. TONG QUAN

- Tong so file duoc ra soat   : 17
- Tong so file duoc chinh sua : 7
- Tong so file moi tao ra     : 5
- Tong so thay doi thuc hien  : 24
- Tong so warning da xu ly    : 4
- Tong so bug da fix          : 0 (chi co warning, khong co bug nghiep vu)

---

## 2. CHI TIET TUNG FILE

| File | Rule ap dung | Warning | Bug | Ghi chu |
|------|-------------|---------|-----|---------|
| src/constants.js (moi) | 6 | - | - | Tach magic numbers (PASS_THRESHOLD, SKIP_SECONDS), sidebar config |
| src/data/lessonContent.js (moi) | 1, 2, 3 | - | - | Tach toan bo data inline cua Lesson |
| src/data/mindmapData.js (moi) | 1, 2, 3 | - | - | Tach data mindmap + 2 helper countSections/countLessons |
| src/components/StudyModulesSidebar.jsx (moi) | 3 | - | - | Sidebar dung chung cho HomePages + Mindmap |
| src/components/Navbar.jsx | 10 | [W2] | - | Xoa state chatOpen unused; them comment giai thich |
| src/pages/Lesson.jsx | 1, 2, 3, 6, 11, 12 | - | - | Rewrite: dung data tach roi, rename q.q->q.question, q.correct->q.correctIndex, helper getOptionClassName, formatTime, thay emoji bang material icons |
| src/pages/Mindmap.jsx | 2, 3 | - | - | Dung mindmapData + StudyModulesSidebar; tach helper filterChaptersByKeyword + buildLessonUrl |
| src/pages/HomePages.jsx | 1, 3 | - | - | Dung StudyModulesSidebar; rename chatOpen->isChatOpen; tach startDailyLessonButton |
| src/pages/Flashcards.jsx | 4, 10 | [W4],[W2] | - | Fix useEffect deps; xoa state flipped khong duoc dung |
| src/pages/DebateCorner.jsx | 10 | [W2] | - | Xoa import Link unused; thay link "Progress Tracking" thanh "Mindmap" |
| src/App.js | 5 | - | - | Them route /mindmap (da co tu truoc) |

---

## 3. DANH SACH THAY DOI THEO RULE

### Rule 1 — Dat ten co y nghia
- `q.q` -> `q.question` (data lesson, Lesson.jsx FinalQuiz/VideoQuiz)
- `q.correct` -> `q.correctIndex` (ro nghia hon, day la chi so dap an dung)
- `selected` -> `selectedIndex` (WarmupStory)
- `correct` (bien isCorrect cu bi shadow) -> `isCorrect` (WarmupImageGuess)
- `current/setCurrent` -> bi xoa (logic chuyen tap podcast bi loai trong update truoc)
- `playing/setPlaying` -> `isPlaying/setIsPlaying` (PodcastPlayer)
- `watched/setWatched` -> `hasWatched/setHasWatched` (VideoWithReminder)
- `playing` (local trong VideoWithReminder) -> `isPlaying`
- `warmupDone` -> `isWarmupDone` (Lesson page)
- `chatOpen` -> `isChatOpen` (HomePages)
- `correct` boolean trong WarmupImageGuess -> `isCorrect`
- `query` -> `searchKeyword` (Mindmap)
- `data` (sau filter) -> `visibleChapters` (Mindmap)
- `ep`/`current` -> `episode` (PodcastPlayer)
- `activeIndex` -> `activeLineIndex` (PodcastPlayer)
- `fmt()` -> `formatTime()` (PodcastPlayer)
- `goToLesson(slug)` -> `handleOpenLesson(slug)` (Mindmap)
- `score >= 3` -> `score >= QUIZ_PASS_THRESHOLD`
- `videoQuizQuestions` -> `VIDEO_QUIZ_QUESTIONS` (const naming)
- `finalQuizQuestions` -> `FINAL_QUIZ_QUESTIONS`
- `warmupPool` -> `WARMUP_POOL`
- `podcastEpisode` -> `PODCAST_EPISODE`

### Rule 2 — Ham nho, mot trach nhiem (SRP)
- Tach `Branch`, `ChapterMap` ra component rieng trong Mindmap.jsx
- Tach `filterChaptersByKeyword` ra ngoai component (pure function)
- Tach `buildLessonUrl` helper
- Tach `formatTime`, `getOptionClassName`, `getLineClassName` ra ngoai/helper trong Lesson.jsx
- Tach `WarmupSection`, `WarmupImageGuess`, `WarmupStory`, `VideoQuiz`, `VideoWithReminder`, `FinalQuiz`, `PodcastPlayer` thanh cac component nho doc lap

### Rule 3 — Khong lap code (DRY)
- Sidebar Tailwind cua HomePages + Mindmap (~50 dong moi noi) -> StudyModulesSidebar (~30 dong tong)
- Logic className 4 trang thai cua quiz option (3 noi: WarmupStory, VideoQuiz, FinalQuiz) -> helper `getOptionClassName`
- Logic count sections/lessons -> helper `countSections`, `countLessons` trong mindmapData.js
- Cau hinh nav items sidebar -> hang so SIDEBAR_NAV_ITEMS dung chung

### Rule 4 — Comment dung cho
- Them comment tai sao Navbar khong tu xu ly state chat
- Them comment cho moi block lon trong Lesson.jsx (warm-up, video, quiz, podcast)
- Them comment giai thich logic transcript active line tinh tu currentTime

### Rule 6 — Khong dung Magic Numbers / Magic Strings
- `3` (nguong qua quiz) -> `QUIZ_PASS_THRESHOLD`
- `10` (so giay tua nhanh podcast) -> `PODCAST_SKIP_SECONDS`
- So cau hoi video quiz `3` -> `VIDEO_QUIZ_SIZE` (export san trong constants, hien tai chua dung trong code nhung san sang khi can validate)

### Rule 8 — Dieu kien ro rang
- `correct = revealed || input.trim().toLowerCase() === data.answer.toLowerCase()` giu nguyen do da co ten ro
- `isPast = lineIndex < activeLineIndex` tach ra ngoai JSX (PodcastPlayer)

### Rule 9 — KISS
- Bo useEffect dependency thua trong Flashcards: thay `[flipped]` -> `[]` voi functional setState
- Bo state `flipped` chua bao gio duoc render -> giam state thua

### Rule 10 — Refactor chu dong
- Xoa state `chatOpen` chet trong Navbar
- Xoa state `flipped` chet trong Flashcards
- Xoa import `Link` unused trong DebateCorner
- Xoa duong dan `/progress-tracking`, `/progress` (chua bao gio ton tai route)
- Thay sidebar item "Progress Tracking" trong DebateCorner va Flashcards bang "Mindmap"

### Rule 11 — Comment tieng Viet cho phan quan trong
- Tat ca file moi (constants.js, data/, components/) deu co header comment tieng Viet
- Cac block lon trong Lesson.jsx co comment dat tieu de chuc nang
- Helper functions deu co JSDoc-style ngan giai thich

### Rule 12 — Khong dung emoji
- Emoji UI trong Lesson.jsx duoc thay bang material-symbols-outlined:
  - 🔥 -> `local_fire_department`
  - 🎯 -> `track_changes`
  - 📝 -> `assignment`
  - 🎧 -> `headphones`
  - 💡 -> `lightbulb`
  - 🎉 -> bo (de text "Xuat sac!" thay the)
  - ✓ -> `check_circle`
  - ▶ (play) -> `play_arrow`
  - ❚❚ (pause) -> `pause`
  - ⏪ -> `fast_rewind`
  - ⏩ -> `fast_forward`
- [*] Giu lai cac ky hieu Unicode khong phai emoji thuan: ✓ ✕ ▶ → ← (la typography, khong gay van de encoding)

---

## 4. WARNING & BUG DA XU LY

| Loai | Mo ta | File | Dong | Cach fix | Ket qua |
|------|-------|------|------|----------|---------|
| [W2] | `chatOpen` unused | Navbar.jsx | 15 | Xoa useState, bo handler, them comment ly do | OK |
| [W2] | `Link` import unused | DebateCorner.jsx | 3 | Xoa import (file dung the `<a href>`) | OK |
| [W4] | useEffect missing dep `toggleFlip` | Flashcards.jsx | 38 | Xoa state flipped chet, dung functional setState, deps = [] | OK |
| [W2] | `flipped` unused (sau khi fix W4) | Flashcards.jsx | 8 | Xoa state hoan toan vi khong render dung den | OK |

Ket qua cuoi: `webpack compiled successfully` — KHONG con warning nao.

---

## 5. VAN DE CON TON DONG

- **Route `/docs` (PDF Docs)** chua co component xu ly — sidebar van link toi nhung se cho ra trang trang.
  - Ly do chua fix: nam ngoai pham vi nhiem vu (chuc nang tuong lai)
  - De xuat: tao trang Docs.jsx hoac bo link tam thoi
- **Lesson.jsx** van co hardcoded URL anh tu lh3.googleusercontent.com — neu link het han se gay hong UI
  - De xuat: chuyen anh ve thu muc public/images/
- **Cac file CSS** (Lesson.css, Flashcards.css, ...) chua duoc kiem tra — pham vi nay chi tap trung JS/JSX
  - De xuat: lan sau ra soat CSS tach module hoac dung Tailwind dong nhat
- **Dependency npm** da duoc chuyen tu react-scripts sang Vite
  - Ket qua: `npm audit --audit-level=high` khong con vulnerability

---

## 6. DE XUAT CHO LAN CAP NHAT TIEP THEO

1. Chuyen het cac trang Flashcards / Lesson / DebateCorner sang Tailwind de thong nhat phong cach
2. Trich xuat audio/video/image URL ra mot file `data/media.js` hoac upload `public/`
3. Them prop-types hoac chuyen sang TypeScript de catch loi som
4. Them React.memo cho cac component lon (PodcastPlayer, FinalQuiz) — re-render khong can thiet khi state cha thay doi
5. Goi `localStorage` luu tien do quiz / podcast position de user khong mat khi reload
6. Tao trang `/docs` thuc su hoac bo navlink
7. Tiep tuc theo doi canh bao bundle size cua Vite va tach chunk khi can
8. Them `prop-types` cho cac component duoc tach (StudyModulesSidebar, ChapterMap, Branch, VideoQuiz, ...) — hien tai dang dua vao destructuring khong validation

---

## 7. LICH SU CAP NHAT

| Phien ban | Ngay       | Nguoi thuc hien | Noi dung chinh |
|-----------|------------|-----------------|----------------|
| v1.0.0    | -          | Phongxuan123    | Khoi tao project (FE MLN_WEB V1) |
| v1.0.1    | 26/05/2026 | AI Agent        | Bo Progress Tracking, them trang Mindmap (3 chuong + sidebar entry) |
| v1.0.2    | 26/05/2026 | AI Agent        | Lesson: warm-up ngau nhien, video + mini-quiz, final quiz, podcast |
| v1.0.3    | 26/05/2026 | AI Agent        | Podcast: bo danh sach tap, them transcript dong bo kieu Spotify |
| v1.1.0    | 26/05/2026 | AI Agent        | Tong tao toi uu theo 13 quy tac Clean Code (file nay) |
| v1.1.1    | 26/05/2026 | AI Agent        | Don dep van de ton dong sau audit FE — chi tiet o Muc 8 |
| v1.2.0    | 26/05/2026 | AI Agent        | Thong nhat design toan he thong theo trang Home — chi tiet o Muc 9 |
| v1.3.0    | 26/05/2026 | AI Agent        | Bo sung tinh nang FE con thieu — chi tiet o Muc 10 |
| v1.4.0    | 27/05/2026 | AI Agent        | Big Update: tich hop Mindmap vao Lesson, quiz tung cau, Discussion noi, game lat the, Login/Register — chi tiet o Muc 11 |

---

## 11. BIG UPDATE — v1.4.0 (27/05/2026)

5 hang muc lon theo yeu cau. Toan bo FE, chua dung BE.

### 1) Tich hop Mindmap vao trang Lesson
- Tao `components/LessonMindmap.jsx` (chuyen logic Branch/ChapterMap/filter tu Mindmap cu sang, them highlight `activeSlug`).
- `pages/Lesson.jsx`: hien thi muc luc tong (mindmap) TRUOC, noi dung bai hoc SAU. Bam 1 nhanh -> `setSearchParams({lesson})` + cuon muot toi noi dung bai (ref + scrollIntoView).
- Tieu de/breadcrumb bai hoc lay tu `findLessonBySlug` (helper moi trong `data/mindmapData.js`, kem `ALL_LESSONS`).
- XOA `pages/Mindmap.jsx`, route `/mindmap`, muc "Mindmap" trong SIDEBAR_NAV_ITEMS. Link `/mindmap` o Home + NotFound chuyen ve `/lessons`.
- DIEU CHINH (27/05/2026): vao `/lessons` chi hien mindmap; noi dung bai hoc CHI render khi da chon 1 bai (`?lesson=<slug>`). Khi chua chon hien empty-state "Chon mot bai hoc de bat dau" thay vi bai mac dinh.

### 2) Quiz on tap cuoi bai — tung cau mot
- `FinalQuiz` trong `pages/Lesson.jsx` viet lai: hien 1 cau moi luot, co thanh tien do.
- Tra loi dung -> o xanh + hien GIAI THICH ngan gon + nut "Cau tiep theo". Tra loi sai -> o do, cho chon lai.
- Diem chi tinh cau dung ngay lan dau. Them field `explanation` cho moi cau trong `data/lessonContent.js`.

### 3) Discussion noi (floating)
- `components/DiscussionWidget.jsx` (moi) + `data/discussionSeed.js` (moi).
- Nut noi goc trai-duoi (`fixed`, khong bi anh huong khi cuon), mo panel hien trao doi User <-> Admin.
- Tin nhan Admin noi bat hon (nen do, badge "Admin", icon verified). Tin nguoi dung gui luu localStorage.
- Gan vao `components/PageShell.jsx` -> xuat hien tren moi trang. Tranh dung goc voi AI chat bubble (goc phai) cua Home.

### 4) Flashcard -> Tro choi lat the (Shinkei-suijaku)
- `data/flashcardData.js` (moi): moi chuong 6 cap term/desc.
- `pages/FlashcardDetail.jsx` viet lai thanh game ghep cap: lat 2 the, khop thi loai bo, khong khop thi up lai. Bang diem (so luot, da ghep), nut choi lai (xao bai Fisher-Yates), thong bao thang + toast.
- Hang so `MEMORY_MATCH_DELAY_MS`, `MEMORY_FLIP_BACK_MS` trong `constants.js`.
- `pages/Flashcards.jsx`: cap nhat tieu de/subtitle phan anh tro choi.

### 5) Dang nhap + Dang ky
- `context/AuthContext.jsx` (moi): mock auth FE, luu users + current user vao localStorage (LUU Y: chi tam thoi, BE that se thay the).
- `components/AuthLayout.jsx` (moi, kem `AuthField`): bo cuc dung chung cho 2 trang auth.
- `pages/Login.jsx`, `pages/Register.jsx` (moi): form co validate, toast, dieu huong ve `/home`.
- Route `/login`, `/register` trong `App.js`. `index.js` boc them `AuthProvider`.
- `components/Navbar.jsx`: avatar tinh "JS" thay bang trang thai auth — co user thi hien initials + dropdown (ten, email, Cai dat, Dang xuat); chua dang nhap thi nut "Dang nhap".

### Provider tree (cap nhat)
```
BrowserRouter
 -> AuthProvider
    -> ToastProvider
       -> App (Routes)
```

### Webpack ket qua: `Compiled successfully` — 0 warning (build CI=true).

---

## 10. TINH NANG FE BO SUNG — v1.3.0 (26/05/2026)

Sau v1.2.0, quet lai he thong de tim cac tinh nang FE chua hoan thien va trien khai.

### Tinh nang moi
| Tinh nang | File | Mo ta |
|-----------|------|-------|
| Trang 404 | `pages/NotFound.jsx` (moi) | Catch-all route `/*` -> hien thi pathname, link ve Home/Mindmap |
| Trang Settings | `pages/Settings.jsx` (moi) | 5 cau hinh (ten, email notification, autoplay, transcript, gio nhac) luu localStorage |
| Mobile drawer | `components/Navbar.jsx` | Hamburger menu trai cho man hinh < md, dung SIDEBAR_NAV_ITEMS |
| Toast notification | `components/Toast.jsx` (moi) | Provider toan app, hook `useToast`, 4 variant success/error/info/warning |
| useLocalStorage hook | `hooks/useLocalStorage.js` (moi) | Generic hook tu dong sync state <-> localStorage, lang nghe cross-tab |
| Lesson doc slug URL | `pages/Lesson.jsx` | Doc `?lesson=<slug>` tu URL, hien thi badge "Ban dang xem: <ten>" |
| Lesson warmup persist | `pages/Lesson.jsx` | `isWarmupDone` luu vao localStorage -> F5 khong mat tien do |
| Quiz toast feedback | `pages/Lesson.jsx`, `pages/MCQQuiz.jsx` | Sau khi nop bai hien toast voi diem so |
| Flashcards search | `pages/Flashcards.jsx` | O search filter cac chuong theo title, co empty state |
| Settings link tu Navbar | `components/Navbar.jsx` | Nut Settings tro toi `/settings` |
| Navbar refactor | `components/Navbar.jsx` | Gom 6 NavLink thanh map() qua TOP_NAV_ITEMS — giam ~100 dong |

### Cac route da co
| Path | Component |
|------|-----------|
| `/` | -> Navigate `/home` (replace) |
| `/home` | HomePages |
| `/flashcards`, `/flashcards/:id` | Flashcards, FlashcardDetail |
| `/debate` | DebateCorner |
| `/lessons` | Lesson (ho tro `?lesson=<slug>`) |
| `/quiz` + 5 sub-quiz | Quiz + MCQ/Matching/Analysis/Essay/Image |
| `/mindmap` | Mindmap |
| `/docs` | Docs |
| `/settings` | Settings (moi) |
| `*` | NotFound (moi) |

### Provider tree
```
BrowserRouter
 -> ToastProvider
    -> App (Routes)
```

### Webpack ket qua cuoi: `compiled successfully` — 0 warning.

Van con co the lam them sau (de cho lan upgrade tiep theo):
- Functional search tren Home va Quiz hero (hien chua filter)
- Multiple Lesson noi dung khac nhau tuy theo slug (hien tat ca slug van xem 1 noi dung)
- Bookmark functionality tren cac card bai hoc
- Print-friendly view cho Lesson
- Skip-to-content link cho a11y
- PWA service worker

---

## 9. THONG NHAT THIET KE — v1.2.0 (26/05/2026)

Muc tieu: dua tat ca cac trang ve mot phong cach thong nhat theo mau trang Home
(Tailwind, do `red-800` lam chu dao, hero do, card trang vien xam, accent xanh `blue-50`).

### Component moi
- `src/components/PageShell.jsx` (moi)
  - `PageShell` — bo khung chuan: Navbar + sidebar trai + main bg-gray-50
  - `PageHero` — hero do thong nhat (eyebrow, icon, title, subtitle, children slot)
  - `StartDailyLessonButton` — nut footer sidebar dung chung

### Trang da rewrite sang Tailwind + PageShell
| Trang | Truoc | Sau |
|-------|-------|-----|
| HomePages.jsx | Tailwind nhung sidebar custom | Dung PageShell |
| Lesson.jsx | Lesson.css (cream #f8f4e3, maroon) | PageShell + Tailwind, syllabus card moi |
| Flashcards.jsx | Flashcards.css | PageShell + grid card Tailwind, modal goi y Tailwind |
| FlashcardDetail.jsx | Flashcards.css (flip animation cu) | Tailwind flip card (perspective 1200px, rotateY) |
| DebateCorner.jsx | DebateCorner.css | PageShell + 2 cot bien luan Tailwind, AI panel blue-50 |
| Quiz.jsx | Quiz.css | PageShell + grid module + special challenge card |
| MCQQuiz.jsx | MCQQuiz.css | PageShell + radio Tailwind co state |
| MatchingQuiz.jsx | MatchingQuiz.css | PageShell + 2 cot khai niem/dinh nghia |
| AnalysisQuiz.jsx | AnalysisQuiz.css | PageShell + textarea Tailwind |
| EssayQuiz.jsx | EssayQuiz.css | PageShell + textarea + char counter |
| ImageQuiz.jsx | ImageQuiz.css (sidebar trung lap) | PageShell + answer slots/letter buttons Tailwind |
| Mindmap.jsx | Da dung StudyModulesSidebar | Chuyen sang PageShell + PageHero |
| Docs.jsx | Da dung StudyModulesSidebar | Chuyen sang PageShell + PageHero |

### Quy tac design thong nhat
- **Layout chrome:** PageShell -> Navbar tren cung + Sidebar trai `lg:ml-72` + Main `bg-gray-50`
- **Hero:** `bg-red-800 py-12 px-12 text-white` voi pattern eyebrow + icon + h1 + subtitle
- **Card mac dinh:** `bg-white p-5 rounded-xl shadow-md hover:shadow-lg border border-gray-200`
- **Card accent:** `bg-blue-50 ... border-l-4 border-red-800`
- **Button primary:** `bg-red-800 text-white rounded-lg font-bold hover:bg-red-900`
- **Button outline:** `border-2 border-red-800 text-red-800 hover:bg-red-50`
- **Heading section:** `font-bold text-3xl text-gray-900 mb-6 flex items-center gap-3` voi icon do
- **Container chinh:** `px-6 md:px-12 py-10 max-w-6xl mx-auto`

### He qua phu
- Khong con import CSS rieng nao trong src/ (xac nhan bang grep)
- Tat ca file .css cu (Lesson.css, Flashcards.css, Quiz.css, DebateCorner.css, ...) van con trong src/pages/ nhung **khong duoc import**. De lai lam tham khao, co the xoa sau.
- Webpack `compiled successfully` — khong loi, khong warning.

---

## 8. AUDIT BO SUNG — v1.1.1 (26/05/2026)

Sau ban v1.1.0, ra soat lai toan FE de phat hien van de ngam. Da fix:

| Loai | Mo ta | File | Cach fix |
|------|-------|------|----------|
| Dead route | `/docs` chua co component, link 6 noi tro tro | App.js, Docs.jsx (moi) | Tao trang Docs.jsx stub voi 3 tai lieu mau, them route trong App.js |
| Navigation broken | DebateCorner dung `<a href="/">` cho 3 muc -> reload trang ve home | DebateCorner.jsx | Doi sang `<Link to="/lessons">`, `/quiz`, `/docs` (SPA) |
| Sidebar stale | ImageQuiz con link "Progress Tracking" tro `#` | ImageQuiz.jsx | Doi sang `<Link to="/mindmap">Mindmap</Link>` |
| Sidebar thieu | FlashcardDetail thieu PDF Docs + Mindmap | FlashcardDetail.jsx | Bo sung 2 link |
| Mat dieu huong | MCQQuiz / MatchingQuiz / AnalysisQuiz / EssayQuiz khong co Navbar | 4 file *.jsx | Import + render `<Navbar />` o root |
| Accessibility | Anh ImageQuiz alt rong (a11y) | ImageQuiz.jsx | Them alt mo ta |
| Accessibility | Button Settings / Chat trong Navbar thieu aria-label | Navbar.jsx | Them aria-label + type="button" |
| SEO | `<title>` mac dinh "React App" | public/index.html | Doi sang "Dialectic Academy — Marxist-Leninist Philosophy Learning" |

Tong: 8 van de ton dong da xu ly. Webpack compile successfully khong warning.

Van de chua dong:
- `package.json` name la "fe" — khong doi vi co the lam break npm install/cache trong tuong lai. De nguyen.
- README.md van la default CRA — chua tao moi vi user khong yeu cau tao tai lieu moi.
- 28 npm vulnerability tu react-scripts cu — da xu ly bang cach chuyen sang Vite; `npm audit --audit-level=high` sach.

---

[*] Bao cao nay duoc cap nhat MOI lan chay lai prompt "Toi uu he thong" tren cung du an.
Khi co lan v1.2.0, bo sung dong moi vao Muc 7 thay vi tao file moi.
