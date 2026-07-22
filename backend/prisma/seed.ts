import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import * as path from "path";
import * as fs from "fs";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

function loadConvertedLesson(filename: string) {
  const filePath = path.resolve(
    __dirname,
    "../../data/lesson_components",
    filename,
  );
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadConvertedLessonFlow(filename: string) {
  return loadConvertedLesson(filename).lessonFlow || [];
}

function loadConvertedLessonMedia(filename: string) {
  return loadConvertedLesson(filename).lessonMedia || [];
}

function stripOptionPrefix(value: string) {
  return value.replace(/^[A-D]\.\s*/i, "").trim();
}

function getQuestionAnswer(item: any) {
  if (item.cleanAnswer) return item.cleanAnswer;
  if (Array.isArray(item.options) && Number.isInteger(item.correctIndex)) {
    return stripOptionPrefix(item.options[item.correctIndex] || "");
  }
  return "";
}

function buildFlashcardsFromQuestionBank(
  questions: any[],
  nodeId: string,
  tag: string,
  limit = 30,
) {
  const seen = new Set<string>();

  return questions
    .filter((item) => item?.question && Array.isArray(item.options))
    .filter((item) => {
      if (seen.has(item.question)) return false;
      seen.add(item.question);
      return true;
    })
    .slice(0, limit)
    .map((item) => {
      const answer = getQuestionAnswer(item);
      const explanation = item.explanation
        ? ` Giải thích: ${item.explanation}`
        : "";

      return {
        nodeId,
        tag,
        question: item.question,
        answer: `Đáp án: ${answer}.${explanation}`.trim(),
      };
    });
}

function buildConceptDebateTranscript(node: any) {
  const prompt = `Chúng ta hãy cùng thảo luận về khái niệm "${node.title}". Hãy xem xét luận điểm sau: "${node.quickTake}". Đồng chí có đồng ý với quan điểm này không, hay đồng chí nhận thấy có điểm nào chưa nhất quán trong lập luận cốt lõi này? Tại sao?`;

  return [{ speaker: "Host", text: prompt, time: 0 }];
}

function buildDefaultLessonFlow(node: any) {
  const flow: any[] = [];

  if (node.videoUrl) {
    flow.push({
      id: "lesson-video",
      type: "media",
      title: "Video nhập môn",
      config: {
        mediaType: "video",
        url: node.videoUrl,
        title: node.title,
        subtitle: node.quickTake,
      },
      completionRule: { type: "viewed" },
    });
  }

  flow.push({
    id: "main-reading",
    type: "markdown",
    title: node.title,
    config: {
      content: node.originalText,
    },
    completionRule: { type: "viewed" },
  });

  flow.push({
    id: "quick-check",
    type: "mcq",
    title: "Kiểm tra nhanh",
    config: {
      question: `Ý chính của bài "${node.title}" là gì?`,
      options: [
        {
          id: "a",
          text: node.quickTake,
          isCorrect: true,
          explanation: node.summary,
        },
        {
          id: "b",
          text: "Đây chỉ là một nội dung phụ, chưa phản ánh trọng tâm bài học.",
          isCorrect: false,
        },
        {
          id: "c",
          text: "Bài học này không có mối liên hệ với thế giới quan và phương pháp luận.",
          isCorrect: false,
        },
      ],
    },
    completionRule: { type: "correct" },
  });

  flow.push({
    id: "final-summary",
    type: "final_summary",
    title: "Đúc kết bài học",
    config: {
      message: node.quickTake,
      keyTakeaways: [node.summary],
      rewards: { xp: 80, badge: "Hoàn thành bài học" },
    },
    completionRule: { type: "viewed" },
  });

  return flow;
}

function extractLessonMedia(lessonFlow: any[], node: any) {
  if (node.title === "Nguồn gốc của triết học") {
    return [
      {
        id: "origin-opening-video",
        type: "video",
        url: "https://www.youtube.com/watch?v=k_jbTWq-u50",
        title: "Triết học ra đời trong bước ngoặt tư duy của nhân loại",
        subtitle: "Thế kỷ VIII - VI TCN",
      },
      {
        id: "cognitive-video",
        type: "video",
        url: "https://www.youtube.com/watch?v=1VwbmgMTbkk",
        title: "Bối cảnh thảm họa thiên nhiên cổ đại",
        subtitle: "Động đất và cách con người cổ đại lý giải tự nhiên",
      },
      {
        id: "social-video",
        type: "video",
        url: "https://www.youtube.com/watch?v=JNutDwj92is",
        title: "Bối cảnh biến đổi xã hội",
        subtitle: "Phân công lao động, của cải dư thừa và phân chia giai cấp",
      },
    ];
  }

  const mediaItems = lessonFlow
    .filter((component) => component?.type === "media" && component.config?.url)
    .map((component) => ({
      id: component.id,
      type: component.config.mediaType || "video",
      url: component.config.url,
      title: component.config.title || component.title || node.title,
      subtitle: component.config.subtitle || node.quickTake,
      alt: component.config.alt,
      description: component.config.description,
      badge: component.config.badge,
    }));

  if (mediaItems.length > 0) return mediaItems;

  if (!node.videoUrl) return [];

  return [
    {
      id: "lesson-video",
      type: "video",
      url: node.videoUrl,
      title: node.title,
      subtitle: node.quickTake,
    },
  ];
}

function buildMaterialLessonFlow(node: any) {
  return [
    ...(node.videoUrl
      ? [
          {
            id: "lesson-video",
            type: "media",
            title: "Video nhập môn",
            config: {
              mediaType: "video",
              url: node.videoUrl,
              title: node.title,
              subtitle: node.quickTake,
            },
            completionRule: { type: "viewed" },
          },
        ]
      : []),
    {
      id: "material-opening",
      type: "dialogue",
      title: "Câu hỏi của lịch sử",
      linkedMediaId: node.videoUrl ? "lesson-video" : undefined,
      navigation_config: { showInProgress: false },
      config: {
        lines: [
          {
            who: "guide",
            text: "Trước mắt các nhà triết học là câu hỏi lớn: bản chất của thế giới này là gì? Từ đây hình thành hai con đường đối lập: duy tâm và duy vật.",
          },
          {
            who: "guide",
            text: "Bài học này dẫn bạn đi qua các quan niệm lịch sử về vật chất để hiểu vì sao định nghĩa của Lênin là bước phát triển quyết định.",
          },
        ],
      },
      completionRule: { type: "viewed" },
    },
    {
      id: "idealism-room",
      type: "mindmap_reveal",
      title: "Cánh cửa duy tâm",
      config: {
        center: "Duy tâm",
        nodes: [
          {
            id: "platon",
            label: "Platon",
            detail:
              "Học thuyết ý niệm xem thế giới vật chất chỉ là cái bóng mờ nhạt của thế giới ý niệm thuần túy, vĩnh cửu.",
          },
          {
            id: "protagoras",
            label: "Protagoras",
            detail:
              "Luận điểm 'con người là thước đo của vạn vật' nhấn mạnh sự lệ thuộc của thế giới vào cảm giác và nhận thức cá nhân.",
          },
        ],
        summary:
          "Các lập trường duy tâm tuy thừa nhận hiện tượng, nhưng phủ nhận đặc tính tồn tại khách quan của vật chất.",
      },
      completionRule: { type: "viewed" },
    },
    {
      id: "ancient-materialism",
      type: "matching_columns",
      title: "Chủ nghĩa duy vật thời cổ đại",
      config: {
        leftColumn: [
          { id: "thales", text: "Thales" },
          { id: "heraclitus", text: "Heraclitus" },
          { id: "anaximenes", text: "Anaximenes" },
          { id: "india", text: "Ấn Độ cổ đại - Tứ đại" },
          { id: "china", text: "Trung Quốc cổ đại - Ngũ hành" },
        ],
        rightColumn: [
          { id: "water", text: "Nước" },
          { id: "fire", text: "Lửa" },
          { id: "air", text: "Không khí" },
          { id: "four", text: "Đất, nước, lửa, gió" },
          { id: "five", text: "Kim, mộc, thủy, hỏa, thổ" },
        ],
        correctPairs: [
          { leftId: "thales", rightId: "water" },
          { leftId: "heraclitus", rightId: "fire" },
          { leftId: "anaximenes", rightId: "air" },
          { leftId: "india", rightId: "four" },
          { leftId: "china", rightId: "five" },
        ],
      },
      completionRule: { type: "correct" },
    },
    {
      id: "ancient-message",
      type: "multi_select",
      title: "Thông điệp rút ra",
      config: {
        question:
          "Chọn tất cả nhận định đúng về chủ nghĩa duy vật thời cổ đại.",
        options: [
          {
            id: "a",
            text: "Có giá trị vì dùng các yếu tố tự nhiên để giải thích thế giới thay vì lực lượng siêu nhiên.",
            isCorrect: true,
          },
          {
            id: "b",
            text: "Có hạn chế vì đồng nhất vật chất với một hoặc một vài dạng vật thể cụ thể.",
            isCorrect: true,
          },
          {
            id: "c",
            text: "Đã xây dựng được khái niệm vật chất hoàn chỉnh như quan niệm hiện đại.",
            isCorrect: false,
          },
        ],
        explanation:
          "Duy vật cổ đại là bước tiến chống giải thích siêu nhiên, nhưng còn trực quan và đồng nhất vật chất với dạng vật thể cụ thể.",
      },
      completionRule: { type: "correct" },
    },
    {
      id: "apeiron",
      type: "mcq",
      title: "Anaximander và Apeiron",
      config: {
        question:
          "Anaximander muốn vượt qua hạn chế nào của các nhà duy vật trước đó?",
        options: [
          {
            id: "a",
            text: "Đồng nhất vật chất với một vật thể cụ thể.",
            isCorrect: true,
            explanation:
              "Apeiron là nỗ lực tìm một bản chất chung đứng sau nước, lửa, không khí và các dạng vật thể riêng lẻ.",
          },
          {
            id: "b",
            text: "Phủ nhận sự tồn tại của vật chất.",
            isCorrect: false,
          },
          {
            id: "c",
            text: "Giải thích thế giới bằng thần linh.",
            isCorrect: false,
          },
        ],
      },
      completionRule: { type: "correct" },
    },
    {
      id: "modern-materialism",
      type: "matching_columns",
      title: "Duy vật thế kỷ XV-XVIII",
      config: {
        leftColumn: [
          { id: "telescope", text: "Kính thiên văn và mô hình hệ Mặt Trời" },
          { id: "lab", text: "Phòng thí nghiệm và dụng cụ đo lường" },
          { id: "machine", text: "Máy móc và hệ thống bánh răng" },
          { id: "map", text: "La bàn, bản đồ và tàu hàng hải" },
        ],
        rightColumn: [
          {
            id: "astronomy",
            text: "Thiên văn học cho thấy tự nhiên vận động theo quy luật khách quan.",
          },
          {
            id: "experiment",
            text: "Quan sát, thí nghiệm và kinh nghiệm trở thành phương pháp nhận thức quan trọng.",
          },
          {
            id: "mechanics",
            text: "Cơ học khiến nhiều nhà tư tưởng hình dung thế giới như một cỗ máy.",
          },
          {
            id: "geography",
            text: "Phát kiến địa lý mở rộng hiểu biết và làm suy yếu các quan niệm cũ.",
          },
        ],
        correctPairs: [
          { leftId: "telescope", rightId: "astronomy" },
          { leftId: "lab", rightId: "experiment" },
          { leftId: "machine", rightId: "mechanics" },
          { leftId: "map", rightId: "geography" },
        ],
      },
      completionRule: { type: "correct" },
    },
    {
      id: "modern-progress",
      type: "multi_select",
      title: "Điểm tiến bộ nổi bật",
      config: {
        question:
          "Chọn tất cả điểm tiến bộ của chủ nghĩa duy vật thế kỷ XV-XVIII so với thời cổ đại.",
        options: [
          {
            id: "a",
            text: "Bắt đầu dựa vào thành tựu khoa học tự nhiên thay vì chỉ phỏng đoán về một dạng vật chất đầu tiên.",
            isCorrect: true,
          },
          {
            id: "b",
            text: "Đề cao quan sát, thực nghiệm và lý trí.",
            isCorrect: true,
          },
          {
            id: "c",
            text: "Tiếp tục giải thích tự nhiên chủ yếu bằng thần linh.",
            isCorrect: false,
          },
          {
            id: "d",
            text: "Khẳng định giới tự nhiên tồn tại khách quan và vận động theo quy luật.",
            isCorrect: true,
          },
        ],
        explanation:
          "Duy vật cận đại tiến bộ nhờ gắn với khoa học tự nhiên và thực nghiệm, nhưng vẫn còn hạn chế máy móc, siêu hình.",
      },
      completionRule: { type: "correct" },
    },
    {
      id: "mechanical-limit",
      type: "mcq",
      title: "Hạn chế máy móc",
      config: {
        question:
          "Việc hình dung thế giới giống như một cỗ máy cho thấy hạn chế nào?",
        options: [
          {
            id: "a",
            text: "Thường xem sự vật tương đối biệt lập và chủ yếu giải thích vận động bằng dịch chuyển cơ học.",
            isCorrect: true,
            explanation:
              "Đây là hạn chế siêu hình của chủ nghĩa duy vật cận đại do ảnh hưởng nổi bật của cơ học cổ điển.",
          },
          {
            id: "b",
            text: "Cho rằng thế giới không tồn tại khách quan.",
            isCorrect: false,
          },
          {
            id: "c",
            text: "Hoàn toàn phủ nhận vai trò của khoa học tự nhiên.",
            isCorrect: false,
          },
        ],
      },
      completionRule: { type: "correct" },
    },
    {
      id: "lenin-definition",
      type: "markdown",
      title: "Định nghĩa vật chất của Lênin",
      config: {
        content: `${node.originalText}\n\nĐịnh nghĩa này nhấn mạnh ba điểm: vật chất tồn tại khách quan; vật chất được đem lại cho con người trong cảm giác; và vật chất không phụ thuộc vào cảm giác, ý thức của con người.`,
      },
      completionRule: { type: "viewed" },
    },
    {
      id: "material-final",
      type: "final_summary",
      title: "Hoàn thành bài Phạm trù vật chất",
      config: {
        message:
          "Bạn đã nắm được tiến trình lịch sử của quan niệm vật chất và ý nghĩa định nghĩa của Lênin.",
        keyTakeaways: [
          "Chủ nghĩa duy tâm phủ nhận hoặc làm mờ tính tồn tại khách quan của vật chất.",
          "Chủ nghĩa duy vật cổ đại có giá trị chống thần thoại nhưng còn trực quan.",
          "Chủ nghĩa duy vật cận đại dựa vào khoa học tự nhiên nhưng còn máy móc, siêu hình.",
          "Định nghĩa của Lênin xác lập vật chất là thực tại khách quan tồn tại độc lập với ý thức.",
        ],
        rewards: { xp: 140, badge: "Người giữ cánh cửa vật chất" },
      },
      completionRule: { type: "viewed" },
    },
  ];
}

async function main() {
  console.log(
    "Seeding PhiloMind philosophy sanctuary database with Vietnamese Marxist-Leninist Philosophy...",
  );

  const ch1QuizzesPath = path.join(__dirname, "data", "ch1.json");
  const ch2QuizzesPath = path.join(__dirname, "data", "ch2.json");
  const ch3QuizzesPath = path.join(__dirname, "data", "ch3.json");

  const seedingData = {
    ch1_quizzes: fs.existsSync(ch1QuizzesPath)
      ? JSON.parse(fs.readFileSync(ch1QuizzesPath, "utf8"))
      : [],
    ch2_quizzes: fs.existsSync(ch2QuizzesPath)
      ? JSON.parse(fs.readFileSync(ch2QuizzesPath, "utf8"))
      : [],
    ch3_quizzes: fs.existsSync(ch3QuizzesPath)
      ? JSON.parse(fs.readFileSync(ch3QuizzesPath, "utf8"))
      : [],
    mock_exam: [],
  };

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  let supabaseClient: any = null;

  if (
    supabaseUrl &&
    supabaseUrl !== "https://your-supabase-project.supabase.co" &&
    supabaseKey
  ) {
    try {
      supabaseClient = createClient(supabaseUrl, supabaseKey);
      console.log("Supabase client initialized for seeding storage uploads.");
    } catch (e: any) {
      console.warn(
        "Failed to initialize Supabase client for storage uploads:",
        e.message,
      );
    }
  }

  const userId = "default-user-id";
  const adminId = "default-admin-id";

  const studentHashedPassword = await bcrypt.hash("studentpassword", 10);
  const adminHashedPassword = await bcrypt.hash("adminpassword", 10);

  // 1. Upsert Default User
  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {
      name: "Nguyễn Văn A",
      streak: 5,
      password: studentHashedPassword,
      role: "student",
    },
    create: {
      id: userId,
      email: "student@philomind.local",
      name: "Nguyễn Văn A",
      streak: 5,
      password: studentHashedPassword,
      role: "student",
    },
  });
  console.log(`User created or verified: ${user.email} (${user.name})`);

  // 1.5 Upsert Admin User
  const admin = await prisma.user.upsert({
    where: { id: adminId },
    update: {
      name: "Admin PhiloMind",
      streak: 1,
      password: adminHashedPassword,
      role: "admin",
    },
    create: {
      id: adminId,
      email: "admin@philomind.local",
      name: "Admin PhiloMind",
      streak: 1,
      password: adminHashedPassword,
      role: "admin",
    },
  });
  console.log(`Admin created or verified: ${admin.email} (${admin.name})`);

  // Clean up any existing records
  await prisma.warmup.deleteMany({});
  await prisma.debate.deleteMany({});
  await prisma.debateTopic.deleteMany({});
  await prisma.quiz.deleteMany({});
  await prisma.flashcardReview.deleteMany({});
  await prisma.flashcard.deleteMany({});

  const existingCourses = await prisma.course.findMany({
    where: { title: "Triết học Mác – Lênin" },
  });
  if (existingCourses.length > 0) {
    console.log("Found existing course, cleaning up old hierarchy...");
    for (const c of existingCourses) {
      await prisma.flashcardReview.deleteMany({
        where: { flashcard: { node: { chapter: { courseId: c.id } } } },
      });
      await prisma.flashcard.deleteMany({
        where: { node: { chapter: { courseId: c.id } } },
      });
      await prisma.progress.deleteMany({
        where: { node: { chapter: { courseId: c.id } } },
      });
      await prisma.podcast.deleteMany({
        where: { node: { chapter: { courseId: c.id } } },
      });
      await prisma.conceptNode.deleteMany({
        where: { chapter: { courseId: c.id } },
      });
      await prisma.chapter.deleteMany({ where: { courseId: c.id } });
      await prisma.document.deleteMany({ where: { courseId: c.id } });
      await prisma.course.delete({ where: { id: c.id } });
    }
  }

  // 2. Create Course Workspace
  const course = await prisma.course.create({
    data: {
      title: "Triết học Mác – Lênin",
      description:
        "Nghiên cứu các quy luật vận động chung nhất của tự nhiên, xã hội và tư duy thông qua phương pháp luận biện chứng duy vật.",
      userId: user.id,
    },
  });
  console.log(`Course created: "${course.title}" (${course.id})`);

  // Draft lessons intentionally do not get a placeholder video. Invalid
  // placeholders surface as "This video is unavailable" in the learner player.
  const defaultYoutubeUrl = null;

  // 3. Create Chapters and Concept Nodes
  // Chapter 1
  const chapter1 = await prisma.chapter.create({
    data: {
      title:
        "Chương 1: Triết học và vai trò của triết học trong đời sống xã hội",
      orderIndex: 1,
      courseId: course.id,
    },
  });

  const ch1SectionIntro = await prisma.chapter.create({
    data: {
      title: "Khái lược về Triết học",
      orderIndex: 1,
      courseId: course.id,
      parentChapterId: chapter1.id,
    },
  });

  const ch1SectionMarxism = await prisma.chapter.create({
    data: {
      title: "Triết học Mác – Lênin",
      orderIndex: 2,
      courseId: course.id,
      parentChapterId: chapter1.id,
    },
  });

  const ch1Nodes = [
    {
      title: "Nguồn gốc của triết học",
      summary:
        "Triết học ra đời ở cả phương Đông và phương Tây vào khoảng thế kỷ VIII-VI TCN tại các trung tâm văn minh lớn, bắt nguồn từ hai nguồn gốc chính: Nguồn gốc nhận thức (nhu cầu thấu hiểu thế giới thông qua năng lực tư duy trừu tượng, thay thế tư duy huyền thoại và tôn giáo nguyên thủy bằng hệ thống lý luận lý tính) và Nguồn gốc xã hội (sự phân công lao động xã hội dẫn đến giai cấp xuất hiện, lao động trí óc tách biệt khỏi lao động chân tay và trí thức trở thành tầng lớp có điều kiện hệ thống hóa lý luận triết học).",
      originalText:
        "1. Khái lược về triết học\n\na) Nguồn gốc của triết học\nTriết học ra đời ở cả phương Đông và phương Tây khoảng thế kỷ VIII-VI trước Công nguyên tại các trung tâm văn minh lớn. Ý thức triết học xuất hiện không ngẫu nhiên mà có nguồn gốc thực tế từ tồn tại xã hội với trình độ nhất định của sự phát triển văn minh, văn hóa và khoa học.\nTriết học có hai nguồn gốc: Nguồn gốc nhận thức (nhu cầu tự nhiên hiểu biết thế giới, vượt qua tư duy huyền thoại) và Nguồn gốc xã hội (xã hội có giai cấp, lao động trí óc tách khỏi lao động chân tay, trí thức trở thành tầng lớp xã hội).\n\n* Nguồn gốc nhận thức\nNhận thức thế giới là nhu cầu tự nhiên của con người. Tư duy huyền thoại và tín ngưỡng nguyên thủy là loại hình triết lý đầu tiên mà con người dùng để giải thích thế giới. Triết học chính là hình thức tư duy lý luận đầu tiên thay thế tư duy huyền thoại và tôn giáo.\nSự phát triển của tư duy trừu tượng và năng lực khái quát trong nhận thức làm cho các quan điểm chung nhất về thế giới hình thành. Triết học ra đời đáp ứng nhu cầu đó của nhận thức - tổng hợp, trừu tượng hóa, khái quát hóa những tri thức riêng lẻ thành những khái niệm, phạm trù, quan điểm, quy luật có tính phổ quát.\n\n* Nguồn gốc xã hội\nTriết học không ra đời trong xã hội mông muội dã man. Nó ra đời khi nền sản xuất xã hội có sự phân công lao động và giai cấp xuất hiện - khi chế độ cộng sản nguyên thủy tan rã, chế độ chiếm hữu nô lệ hình thành, phương thức sản xuất dựa trên tư hữu tư liệu sản xuất được xác định.\nLao động trí óc tách khỏi lao động chân tay, trí thức xuất hiện thành tầng lớp xã hội. Tầng lớp này có điều kiện và nhu cầu nghiên cứu, có năng lực hệ thống hóa các quan niệm thành học thuyết và lý luận. Các nhà thông thái được xã hội công nhận làm các nhà tư tưởng.",
      quickTake:
        "Triết học xuất hiện khoảng thế kỷ VIII-VI TCN từ 2 nguồn gốc: Nhận thức (tư duy lý tính trừu tượng thay thế huyền thoại) và Xã hội (phân công lao động trí óc và sự phân chia giai cấp).",
      difficulty: "Medium",
      timeToRead: "8 min read",
      orderIndex: 1,
      videoUrl: "https://www.youtube.com/watch?v=k_jbTWq-u50",
      lessonType: "adventure",
      storyIntro: {
        enable: true,
        videoUrl: "https://www.youtube.com/watch?v=k_jbTWq-u50",
        background:
          "https://images.unsplash.com/photo-1447069387593-a5de0862481e?w=1200",
        character: {
          name: "Sophia",
          avatar: "guide",
          role: "Người Khai Sáng dẫn đường",
          color: "from-indigo-500 to-violet-600",
        },
        dialogs: [
          {
            id: "dialog_01",
            who: "guide",
            text: "Nhiệm vụ của bạn: đi tìm một thứ 'vũ khí tư duy' hoàn toàn mới — có tên là TRIẾT HỌC. Nhưng để tìm thấy nó, ta phải vượt qua 2 thử thách, đại diện cho 2 NGUỒN GỐC khai sinh ra triết học.",
          },
        ],
        startPoints: [
          {
            id: "athens",
            label: "Quảng trường Athena",
            place: "Hy Lạp",
            icon: "account_balance",
          },
          {
            id: "ganges",
            label: "Bên bờ sông Hằng",
            place: "Ấn Độ",
            icon: "water",
          },
          {
            id: "yellowriver",
            label: "Lưu vực Hoàng Hà",
            place: "Trung Hoa",
            icon: "temple_buddhist",
          },
        ],
        startConfirm:
          "Tuyệt vời! Dù khởi hành từ đâu, mọi nền văn minh cổ đại đều cùng chạm tới một bước ngoặt tư duy giống nhau. Lên đường thôi!",
      },
      lessonContents: [
        {
          id: "cognitive",
          scene: "earthquake",
          videoUrl: "https://www.youtube.com/watch?v=1VwbmgMTbkk",
          badge: "Thử thách 1 / 2",
          title: "Giải mã sấm truyền",
          subtitle: "Nguồn gốc nhận thức",
          pieceLabel: "NGUỒN GỐC NHẬN THỨC",
          setup: [
            {
              who: "elder",
              text: "Tai họa này từ đâu mà ra?! Hỡi người trẻ kia, hãy giải thích cho cả bộ tộc!",
            },
          ],
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
              "Chưa đúng. Hãy nhớ bối cảnh: thời cổ đại CHƯA có khoa học để chứng minh, và con người luôn khao khát tìm nguyên nhân chứ không xem mọi việc là ngẫu nhiên vô nghĩa. Họ giải thích tự nhiên bằng niềm tin vào thần linh siêu nhiên.",
          },
          twist: [
            {
              who: "skeptic",
              text: "Trời ơi, sao số phận chúng ta khổ thế này! Mưa giông, lũ lụt, hạn hán rồi động đất... năm nào cũng ập tới. Chúng ta đã quỳ lạy, đã tế bao nhiêu lễ vật cho thần linh, vậy mà thiên tai VẪN cứ giáng xuống, chẳng gì đổi thay. Lẽ nào chúng ta mãi mãi bất lực, hay có điều gì khác mà chúng ta chưa biết về thiên nhiên, chẳng hề phụ thuộc vào tâm trạng của các vị thần?",
            },
          ],
          shift: {
            prompt:
              "Câu hỏi của Lyra hé lộ điều gì đang BẮT ĐẦU thay đổi trong cách con người suy nghĩ?",
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
          },
        },
        {
          id: "social",
          scene: "society",
          videoUrl: "https://youtu.be/JNutDwj92is",
          badge: "Thử thách 2 / 2",
          title: "...khi phương thức sản xuất thay đổi...",
          subtitle: "Nguồn gốc xã hội",
          pieceLabel: "NGUỒN GỐC XÃ HỘI",
          setup: [
            {
              who: "guide",
              text: "Nhiều thế hệ trôi qua, khi phương thức sản xuất thay đổi — con người biết rèn đồng, rèn sắt, của cải bắt đầu dư thừa — xã hội phân chia thành Chủ nô và Nô lệ.",
            },
            {
              who: "guide",
              text: "Để hiểu ai mới đủ điều kiện làm triết học, hãy thử sống MỘT NGÀY trong hai vai khác nhau nhé.",
            },
          ],
          roles: [
            {
              who: "slave",
              label: "Vai 1: Người lao động chân tay",
              intro:
                "Trời chưa sáng, Borin đã phải ra đồng cày cuốc, vác đá xây tháp tới kiệt sức.",
              question:
                "Cuối ngày, kiệt quệ vì lo từng bữa ăn — bạn có thời gian và sức lực để ngồi suy ngẫm về nguồn gốc vũ trụ không?",
              options: [
                {
                  text: "Không. Mình chỉ kịp ăn vội rồi ngủ để mai lại lao động.",
                  correct: true,
                },
                {
                  text: "Có. Mình thức trắng đêm để viết một học thuyết triết học.",
                  correct: false,
                },
              ],
              feedbackCorrect:
                "Đúng vậy. Lao động chân tay nặng nhọc và nỗi lo sinh tồn không để lại điều kiện nào cho việc nghiên cứu lý luận.",
              feedbackWrong:
                "Khó lắm! Một người kiệt sức vì lao động chân tay và lo miếng ăn gần như không còn thời gian, sức lực cho tư duy lý luận.",
            },
            {
              who: "noble",
              label: "Vai 2: Tầng lớp quý tộc / trí thức",
              intro:
                "Theon có của cải dư thừa, không phải lao động chân tay. Chiều đến, ông thong dong ngắm sao trời và đàm đạo cùng bạn hữu.",
              question: "Với điều kiện sống như vậy, Theon có thể làm gì?",
              options: [
                {
                  text: "Dành thời gian quan sát, suy ngẫm và hệ thống hóa tri thức thành học thuyết.",
                  correct: true,
                },
                {
                  text: "Cũng chẳng làm được gì vì quá bận đi cày.",
                  correct: false,
                },
              ],
              feedbackCorrect:
                "Chính xác. Có của cải dư thừa và thời gian rảnh, tầng lớp trí óc mới đủ điều kiện để nghiên cứu và sáng tạo lý luận.",
              feedbackWrong:
                "Không phải. Theon KHÔNG phải lao động chân tay — ông có dư thời gian để suy ngẫm, đó là điểm mấu chốt.",
            },
          ],
          keyQuestion: {
            prompt:
              "Tại đại hội bộ tộc, câu hỏi lớn được đặt ra: NHÓM NÀO đủ điều kiện, thời gian và nhu cầu để hệ thống hóa tri thức thành học thuyết và trở thành các 'Nhà thông thái'?",
            options: [
              {
                text: "Tầng lớp lao động trí óc (quý tộc, trí thức).",
                correct: true,
              },
              { text: "Tầng lớp lao động chân tay (nô lệ).", correct: false },
              { text: "Cả hai nhóm đều như nhau.", correct: false },
            ],
            correctFeedback:
              "Hoàn toàn đúng! Chỉ khi lao động trí óc TÁCH KHỎI lao động chân tay, tầng lớp trí thức mới xuất hiện và có điều kiện hệ thống hóa tri thức thành triết học.",
            wrongFeedback:
              "Hãy nhớ lại trải nghiệm vừa rồi: chỉ tầng lớp có của cải dư thừa và thời gian rảnh (lao động trí óc) mới đủ điều kiện làm việc đó.",
          },
          warning: [
            "Triết học KHÔNG THỂ ra đời trong một xã hội mông muội, dã man. Nó chỉ ra đời khi xã hội đạt đến một trình độ tương đối cao của sản xuất xã hội, phân công lao động xã hội hình thành, giai cấp phân hóa rõ và mạnh, nhà nước ra đời.",
            "Tầng lớp tri thức xuất hiện đóng vai trò quan trọng trong việc hệ thống hóa toàn bộ tri thức của thời đại để xây dựng nên các học thuyết, lý luận, triết thuyết.",
            "Triết học, ngay từ khi xuất hiện đã mang trong mình tính giai cấp sâu sắc.",
          ],
        },
      ],
      minigame: {
        enable: true,
        type: "single_column_sorting",
        config: {
          title: "Lắp ráp chuỗi nhân quả: Vì sao triết học ra đời?",
          instruction:
            "Chọn các mắt xích theo ĐÚNG thứ tự nhân quả, từ gốc tới ngọn.",
          items: [
            {
              id: "c1",
              order: 0,
              icon: "agriculture",
              text: "Sản xuất phát triển, chế độ tư hữu hình thành, của cải dư thừa.",
            },
            {
              id: "c2",
              order: 1,
              icon: "groups",
              text: "Xã hội phân chia giai cấp (chế độ chiếm hữu nô lệ).",
            },
            {
              id: "c3",
              order: 2,
              icon: "engineering",
              text: "Lao động trí óc tách khỏi lao động chân tay.",
            },
            {
              id: "c4",
              order: 3,
              icon: "school",
              text: "Tầng lớp trí thức xuất hiện và hệ thống hóa tri thức thành triết học.",
            },
          ],
          successFeedback:
            "Chuỗi nhân quả đã sáng lên! Đây chính là NGUỒN GỐC XÃ HỘI của triết học.",
          reward: "NGUỒN GỐC XÃ HỘI",
        },
      },
      finalSummary: {
        title: "Hợp nhất tri thức",
        summary: {
          branches: [
            {
              id: "cognitive",
              title: "Nguồn gốc nhận thức",
              icon: "psychology",
              tagline:
                "Nhu cầu hiểu biết thế giới → tư duy lý luận thay thế huyền thoại.",
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
          finalStatement:
            "Triết học ra đời từ sự HỢP NHẤT của hai nguồn gốc: NHU CẦU NHẬN THỨC thế giới của con người và những ĐIỀU KIỆN XÃ HỘI chín muồi — phân công lao động, giai cấp, và sự xuất hiện của tầng lớp trí thức.",
          guideLines: [
            "Chúc mừng nhà du hành! Bạn đã ghép xong bức tranh hoàn chỉnh.",
            "Triết học không từ trên trời rơi xuống. Nó nảy sinh từ chính NHU CẦU HIỂU BIẾT của con người (nguồn gốc nhận thức)...",
            "...và từ những ĐIỀU KIỆN XÃ HỘI chín muồi: phân công lao động, giai cấp, tầng lớp trí thức (nguồn gốc xã hội).",
          ],
        },
        quiz: [
          {
            question: "Triết học ra đời vào khoảng thời gian nào?",
            options: [
              "Thế kỷ XV – XVI sau CN",
              "Thế kỷ VIII – VI trước CN",
              "Thế kỷ I sau CN",
              "Thời kỳ đồ đá cũ",
            ],
            correctIndex: 1,
            explanation:
              "Triết học ra đời khoảng thế kỷ VIII – VI trước Công nguyên, ở cả phương Đông và phương Tây, tại các trung tâm văn minh lớn.",
          },
          {
            question: "Triết học có mấy nguồn gốc cơ bản?",
            options: [
              "Một: nguồn gốc thần thánh",
              "Hai: nhận thức và xã hội",
              "Ba: kinh tế, chính trị, văn hóa",
              "Không có nguồn gốc xác định",
            ],
            correctIndex: 1,
            explanation:
              "Triết học có hai nguồn gốc: nguồn gốc nhận thức (nhu cầu hiểu biết, vượt qua tư duy huyền thoại) và nguồn gốc xã hội (phân công lao động, giai cấp, tầng lớp trí thức).",
          },
          {
            question:
              "Về nguồn gốc nhận thức, triết học là hình thức tư duy thay thế cho cái gì?",
            options: [
              "Thay thế khoa học tự nhiên",
              "Thay thế tư duy huyền thoại và tôn giáo",
              "Thay thế lao động chân tay",
              "Thay thế nghệ thuật",
            ],
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
            question:
              "Vì sao tầng lớp trí thức (lao động trí óc) lại là người sáng tạo ra triết học?",
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
        ],
        completion: {
          badge: "Nhà Khai Sáng",
          badgeNote: "Chương 1.1 — Nguồn gốc của triết học",
          message:
            "Bạn đã hoàn thành Hành trình Khai Sáng và nắm được trọn vẹn hai nguồn gốc của triết học. Tri thức là ngọn đuốc — hãy tiếp tục thắp sáng!",
          quote: {
            text: "Các nhà triết học đã chỉ giải thích thế giới bằng nhiều cách khác nhau, song vấn đề là cải tạo thế giới.",
            author: "Karl Marx, Luận cương về Feuerbach",
          },
        },
        rewards: {
          xp: 120,
          badge: "Nhà Khai Sáng",
        },
        actions: {
          retryButton: true,
          nextLessonButton: true,
        },
      },
    },
    {
      title: "Khái niệm triết học",
      summary:
        "Triết học là hình thái đặc biệt của ý thức xã hội, thể hiện thành hệ thống quan điểm lý luận chung nhất về thế giới, con người và tư duy.",
      originalText:
        "Triết học ra đời ở phương Đông và phương Tây như hoạt động tinh thần bậc cao. Các định nghĩa hiện đại nhấn mạnh triết học là hình thái đặc biệt của ý thức xã hội, nghiên cứu thế giới như một chỉnh thể và tìm ra những quy luật phổ biến nhất chi phối thế giới, con người và tư duy.",
      quickTake:
        "Triết học là hệ thống quan điểm lý luận chung nhất về thế giới, con người và tư duy.",
      difficulty: "Easy",
      timeToRead: "6 min read",
      orderIndex: 2,
      videoUrl: null,
    },
    {
      title: "Đối tượng của triết học trong lịch sử",
      summary:
        "Đối tượng của triết học thay đổi qua các thời kỳ, từ tri thức bao trùm ban đầu đến quan niệm khoa học về các quy luật chung nhất.",
      originalText:
        "Trong lịch sử, đối tượng của triết học có sự biến đổi cùng với sự phát triển của khoa học và đời sống xã hội. Triết học từng bao chứa nhiều tri thức chung, rồi dần xác định đối tượng riêng ở những vấn đề chung nhất của thế giới và tư duy.",
      quickTake:
        "Đối tượng triết học biến đổi lịch sử, nhưng hướng tới các vấn đề chung nhất.",
      difficulty: "Medium",
      timeToRead: "9 min read",
      orderIndex: 3,
      videoUrl: null,
    },
    {
      title: "Triết học - hạt nhân lý luận của thế giới quan",
      summary:
        "Triết học giữ vai trò hạt nhân lý luận của thế giới quan và với triết học Mác - Lênin trở thành khoa học về những quy luật chung nhất.",
      originalText:
        "Triết học là hạt nhân lý luận của thế giới quan. Với sự ra đời của triết học Mác - Lênin, triết học là hệ thống quan điểm lý luận chung nhất về thế giới và vị trí con người trong thế giới đó, là khoa học về những quy luật vận động, phát triển chung nhất của tự nhiên, xã hội và tư duy.",
      quickTake:
        "Triết học là hạt nhân lý luận của thế giới quan, khái quát những quy luật chung nhất.",
      difficulty: "Medium",
      timeToRead: "8 min read",
      orderIndex: 4,
      videoUrl: null,
    },
    {
      title: "Vấn đề cơ bản của triết học",
      summary:
        "Vấn đề quan hệ giữa vật chất và ý thức là vấn đề cơ bản của mọi hệ thống triết học.",
      originalText:
        "Vấn đề cơ bản lớn của mọi triết học, đặc biệt là triết học hiện đại, là vấn đề quan hệ giữa tư duy và tồn tại, giữa ý thức và vật chất.",
      quickTake: "Mối quan hệ biện chứng giữa vật chất và ý thức.",
      difficulty: "Hard",
      timeToRead: "12 min read",
      orderIndex: 5,
      videoUrl: null,
    },
    {
      title: "Biện chứng và siêu hình",
      summary:
        "Biện chứng và siêu hình là hai phương pháp nhận thức đối lập trong cách xem xét sự vật, hiện tượng.",
      originalText:
        "Phương pháp biện chứng xem xét sự vật trong mối liên hệ, vận động và phát triển. Phương pháp siêu hình xem xét sự vật trong trạng thái cô lập, tĩnh tại và ít chú ý đến sự chuyển hóa.",
      quickTake:
        "Biện chứng nhìn sự vật trong liên hệ và phát triển; siêu hình nhìn cô lập, tĩnh tại.",
      difficulty: "Medium",
      timeToRead: "9 min read",
      orderIndex: 6,
      videoUrl: null,
    },
    {
      title: "Sự ra đời và phát triển",
      summary:
        "Sự ra đời của triết học Mác - Lênin là một bước ngoặt cách mạng trong lịch sử triết học.",
      originalText:
        "Triết học Mác ra đời vào những năm 40 của thế kỷ XIX, là kết quả tất yếu của sự phát triển kinh tế - xã hội, khoa học tự nhiên và tư tưởng nhân loại.",
      quickTake: "Bước ngoặt vĩ đại giải phóng tư tưởng vô sản.",
      difficulty: "Medium",
      timeToRead: "10 min read",
      orderIndex: 7,
      videoUrl: null,
    },
    {
      title: "Đối tượng và chức năng",
      summary:
        "Đối tượng nghiên cứu là các quy luật chung nhất và thực hiện chức năng thế giới quan, phương pháp luận.",
      originalText:
        "Triết học Mác - Lênin nghiên cứu những quy luật chung nhất của tự nhiên, xã hội và tư duy, cung cấp thế giới quan duy vật và phương pháp luận biện chứng.",
      quickTake: "Cung cấp thế giới quan và phương pháp luận khoa học.",
      difficulty: "Easy",
      timeToRead: "7 min read",
      orderIndex: 8,
      videoUrl: null,
    },
    {
      title: "Vai trò trong đời sống xã hội",
      summary:
        "Triết học Mác - Lênin là vũ khí lý luận sắc bén của giai cấp công nhân.",
      originalText:
        "Triết học Mác - Lênin là thế giới quan và phương pháp luận khoa học, cách mạng cho hoạt động thực tiễn cải tạo thế giới của con người.",
      quickTake: "Công cụ cải tạo thế giới khách quan.",
      difficulty: "Medium",
      timeToRead: "8 min read",
      orderIndex: 9,
      videoUrl: null,
    },
  ];

  const createdCh1Nodes = [];
  for (const n of ch1Nodes) {
    const isOriginLesson = n.title === "Nguồn gốc của triết học";
    const isConceptLesson = n.title === "Khái niệm triết học";
    const isWorldviewCoreLesson =
      n.title === "Triết học - hạt nhân lý luận của thế giới quan";
    const isObjectLesson = n.title === "Đối tượng của triết học trong lịch sử";
    const isBasicProblemLesson = n.title === "Vấn đề cơ bản của triết học";
    const hasSeededLessonContent =
      isOriginLesson ||
      isConceptLesson ||
      isWorldviewCoreLesson ||
      isObjectLesson ||
      isBasicProblemLesson;
    const sectionChapter =
      n.orderIndex <= 6 ? ch1SectionIntro : ch1SectionMarxism;
    const sectionOrderIndex =
      sectionChapter.id === ch1SectionIntro.id
        ? n.orderIndex
        : n.orderIndex - 6;
    const lessonFlow = isOriginLesson
      ? loadConvertedLessonFlow("chapter-1-1a-nguon-goc-triet-hoc.json")
      : isConceptLesson
        ? loadConvertedLessonFlow("chapter-1-1b-khai-niem-triet-hoc.json")
        : isObjectLesson
          ? loadConvertedLessonFlow(
              "chapter-1-1c-doi-tuong-cua-triet-hoc-trong-lich-su.json",
            )
          : isWorldviewCoreLesson
            ? loadConvertedLessonFlow(
                "chapter-1-1d-triet-hoc-hat-nhan-the-gioi-quan.json",
              )
            : isBasicProblemLesson
              ? loadConvertedLessonFlow(
                  "chapter-1-1e-van-de-co-ban-cua-triet-hoc.json",
                )
              : buildDefaultLessonFlow(n);
    const lessonMedia = isOriginLesson
      ? loadConvertedLessonMedia("chapter-1-1a-nguon-goc-triet-hoc.json")
      : isConceptLesson
        ? loadConvertedLessonMedia("chapter-1-1b-khai-niem-triet-hoc.json")
        : isObjectLesson
          ? loadConvertedLessonMedia(
              "chapter-1-1c-doi-tuong-cua-triet-hoc-trong-lich-su.json",
            )
          : isWorldviewCoreLesson
            ? loadConvertedLessonMedia(
                "chapter-1-1d-triet-hoc-hat-nhan-the-gioi-quan.json",
              )
            : isBasicProblemLesson
              ? loadConvertedLessonMedia(
                  "chapter-1-1e-van-de-co-ban-cua-triet-hoc.json",
                )
              : extractLessonMedia(lessonFlow, n);
    const node = await prisma.conceptNode.create({
      data: {
        title: n.title,
        summary: n.summary,
        originalText: n.originalText,
        quickTake: n.quickTake,
        difficulty: n.difficulty,
        timeToRead: n.timeToRead,
        videoUrl: n.videoUrl,
        orderIndex: sectionOrderIndex,
        chapterId: sectionChapter.id,
        lessonType: "flow",
        lessonFlow: lessonFlow as any,
        lessonMedia: lessonMedia as any,
        contentReady: hasSeededLessonContent,
        lessonStatus: hasSeededLessonContent ? "published" : "draft",
      },
    });
    createdCh1Nodes.push(node);
    await prisma.progress.create({
      data: {
        userId: user.id,
        nodeId: node.id,
        status: n.orderIndex === 1 ? "available" : "locked",
      },
    });
  }

  // Chapter 2
  const chapter2 = await prisma.chapter.create({
    data: {
      title: "Chương 2: Chủ nghĩa duy vật biện chứng",
      orderIndex: 2,
      courseId: course.id,
    },
  });

  const ch2SectionMatter = await prisma.chapter.create({
    data: {
      title: "Vật chất và ý thức",
      orderIndex: 1,
      courseId: course.id,
      parentChapterId: chapter2.id,
    },
  });

  const ch2SectionDialectics = await prisma.chapter.create({
    data: {
      title: "Phép biện chứng duy vật",
      orderIndex: 2,
      courseId: course.id,
      parentChapterId: chapter2.id,
    },
  });

  const ch2SectionKnowledge = await prisma.chapter.create({
    data: {
      title: "Lý luận nhận thức",
      orderIndex: 3,
      courseId: course.id,
      parentChapterId: chapter2.id,
    },
  });

  const ch2Nodes = [
    {
      title: "Phạm trù vật chất",
      summary:
        "Vật chất là thực tại khách quan tồn tại độc lập với ý thức và được đem lại cho con người trong cảm giác.",
      originalText:
        "Vật chất là một phạm trù triết học dùng để chỉ thực tại khách quan được đem lại cho con người trong cảm giác, được cảm giác của chúng ta chép lại, chụp lại, phản ánh, và tồn tại không lệ thuộc vào cảm giác. - V.I. Lênin",
      quickTake: "Vật chất là thực tại khách quan tồn tại độc lập với ý thức.",
      difficulty: "Hard",
      timeToRead: "15 min read",
      orderIndex: 1,
      videoUrl: defaultYoutubeUrl,
    },
    {
      title: "Phương thức tồn tại của vật chất",
      summary:
        "Vận động là phương thức tồn tại của vật chất, không gian và thời gian là những hình thức tồn tại của nó.",
      originalText:
        "Vận động là thuộc tính cố hữu của vật chất, là phương thức tồn tại của vật chất. Không có vật chất không vận động cũng như không có vận động ngoài vật chất.",
      quickTake: "Vận động là phương thức tồn tại tuyệt đối của vật chất.",
      difficulty: "Medium",
      timeToRead: "10 min read",
      orderIndex: 2,
      videoUrl: defaultYoutubeUrl,
    },
    {
      title: "Nguồn gốc và bản chất của ý thức",
      summary:
        "Ý thức là sự phản ánh sáng tạo thực tại khách quan vào bộ não người.",
      originalText:
        "Ý thức có nguồn gốc tự nhiên (bộ não người và sự tác động của thế giới bên ngoài) và nguồn gốc xã hội (lao động và ngôn ngữ). Bản chất của ý thức là hình ảnh chủ quan của thế giới khách quan.",
      quickTake: "Ý thức là sự phản ánh năng động, sáng tạo bộ não người.",
      difficulty: "Hard",
      timeToRead: "12 min read",
      orderIndex: 3,
      videoUrl: defaultYoutubeUrl,
    },
    {
      title: "Mối quan hệ vật chất – ý thức",
      summary:
        "Vật chất quyết định ý thức, nhưng ý thức có tính độc lập tương đối và tác động trở lại mạnh mẽ.",
      originalText:
        "Vật chất quyết định ý thức về nguồn gốc, nội dung và sự biến đổi. Ngược lại, ý thức tác động trở lại vật chất thông qua hoạt động thực tiễn của con người.",
      quickTake:
        "Vật chất quyết định ý thức; ý thức tác động trở lại qua thực tiễn.",
      difficulty: "Hard",
      timeToRead: "11 min read",
      orderIndex: 4,
      videoUrl: defaultYoutubeUrl,
    },
    {
      title: "Hai nguyên lý cơ bản",
      summary:
        "Nguyên lý về mối liên hệ phổ biến và nguyên lý về sự phát triển của phép biện chứng.",
      originalText:
        "Mọi sự vật, hiện tượng đều tồn tại trong mối liên hệ phổ biến, ràng buộc lẫn nhau và luôn luôn trong quá trình vận động, phát triển không ngừng từ thấp đến cao.",
      quickTake: "Mọi sự vật liên hệ phổ biến và luôn phát triển đi lên.",
      difficulty: "Medium",
      timeToRead: "9 min read",
      orderIndex: 5,
      videoUrl: defaultYoutubeUrl,
    },
    {
      title: "Các cặp phạm trù",
      summary:
        "Sáu cặp phạm trù cơ bản phản ánh các mối liên hệ biện chứng phổ biến nhất.",
      originalText:
        "Các cặp phạm trù: Cái riêng và cái chung; Nguyên nhân và kết quả; Tất nhiên và ngẫu nhiên; Nội dung và hình thức; Bản chất và hiện tượng; Khả năng và hiện thực.",
      quickTake: "Các cặp quan hệ đối lập thống nhất phản ánh hiện thực.",
      difficulty: "Hard",
      timeToRead: "14 min read",
      orderIndex: 6,
      videoUrl: defaultYoutubeUrl,
    },
    {
      title: "Ba quy luật cơ bản",
      summary:
        "Quy luật Lượng - Chất, quy luật Mâu thuẫn và quy luật Phủ định của phủ định.",
      originalText:
        "Quy luật lượng chất chỉ ra cách thức phát triển. Quy luật mâu thuẫn chỉ ra nguồn gốc, động lực phát triển. Quy luật phủ định của phủ định chỉ ra khuynh hướng của phát triển.",
      quickTake:
        "Mâu thuẫn là động lực; Lượng đổi dẫn đến Chất đổi; Phát triển đường xoáy ốc.",
      difficulty: "Hard",
      timeToRead: "16 min read",
      orderIndex: 7,
      videoUrl: defaultYoutubeUrl,
    },
    {
      title: "Bản chất của nhận thức",
      summary:
        "Nhận thức là quá trình phản ánh hiện thực khách quan một cách tích cực, sáng tạo.",
      originalText:
        "Nhận thức đi từ trực quan sinh động đến tư duy trừu tượng, và từ tư duy trừu tượng đến thực tiễn - đó là con đường biện chứng của sự nhận thức chân lý.",
      quickTake:
        "Đi từ nhận thức cảm tính lên nhận thức lý tính rồi đến thực tiễn.",
      difficulty: "Medium",
      timeToRead: "8 min read",
      orderIndex: 8,
      videoUrl: defaultYoutubeUrl,
    },
    {
      title: "Thực tiễn và vai trò của thực tiễn",
      summary:
        "Thực tiễn là cơ sở, động lực, mục đích của nhận thức và là tiêu chuẩn của chân lý.",
      originalText:
        "Thực tiễn là toàn bộ hoạt động vật chất có mục đích, mang tính lịch sử - xã hội của con người nhằm cải tạo tự nhiên và xã hội.",
      quickTake: "Thực tiễn là tiêu chuẩn tối cao để kiểm nghiệm chân lý.",
      difficulty: "Medium",
      timeToRead: "10 min read",
      orderIndex: 9,
      videoUrl: defaultYoutubeUrl,
    },
    {
      title: "Chân lý",
      summary:
        "Chân lý là những tri thức phù hợp với thực tế khách quan và được thực tiễn kiểm nghiệm.",
      originalText:
        "Chân lý là tri thức có nội dung khách quan, phản ánh đúng đắn hiện thực khách quan và đã được thực tiễn kiểm nghiệm là đúng.",
      quickTake: "Tri thức khách quan đã được thực tiễn khẳng định.",
      difficulty: "Easy",
      timeToRead: "7 min read",
      orderIndex: 10,
      videoUrl: defaultYoutubeUrl,
    },
  ];

  const createdCh2Nodes = [];
  for (const n of ch2Nodes) {
    const hasSeededLessonContent = n.title === "Phạm trù vật chất";
    const sectionChapter =
      n.orderIndex <= 4
        ? ch2SectionMatter
        : n.orderIndex <= 7
          ? ch2SectionDialectics
          : ch2SectionKnowledge;
    const sectionOrderIndex =
      sectionChapter.id === ch2SectionMatter.id
        ? n.orderIndex
        : sectionChapter.id === ch2SectionDialectics.id
          ? n.orderIndex - 4
          : n.orderIndex - 7;
    const lessonFlow = hasSeededLessonContent
      ? buildMaterialLessonFlow(n)
      : buildDefaultLessonFlow(n);
    const node = await prisma.conceptNode.create({
      data: {
        title: n.title,
        summary: n.summary,
        originalText: n.originalText,
        quickTake: n.quickTake,
        difficulty: n.difficulty,
        timeToRead: n.timeToRead,
        videoUrl: n.videoUrl,
        orderIndex: sectionOrderIndex,
        chapterId: sectionChapter.id,
        lessonType: "flow",
        lessonFlow: lessonFlow as any,
        lessonMedia: extractLessonMedia(lessonFlow, n) as any,
        contentReady: hasSeededLessonContent,
        lessonStatus: hasSeededLessonContent ? "published" : "draft",
      },
    });
    createdCh2Nodes.push(node);
    await prisma.progress.create({
      data: { userId: user.id, nodeId: node.id, status: "locked" },
    });
  }

  // Chapter 3
  const chapter3 = await prisma.chapter.create({
    data: {
      title: "Chương 3: Chủ nghĩa duy vật lịch sử",
      orderIndex: 3,
      courseId: course.id,
    },
  });

  const ch3SectionFormation = await prisma.chapter.create({
    data: {
      title: "Hình thái kinh tế – xã hội",
      orderIndex: 1,
      courseId: course.id,
      parentChapterId: chapter3.id,
    },
  });

  const ch3SectionClass = await prisma.chapter.create({
    data: {
      title: "Giai cấp và đấu tranh giai cấp",
      orderIndex: 2,
      courseId: course.id,
      parentChapterId: chapter3.id,
    },
  });

  const ch3SectionHuman = await prisma.chapter.create({
    data: {
      title: "Con người và vai trò của quần chúng",
      orderIndex: 3,
      courseId: course.id,
      parentChapterId: chapter3.id,
    },
  });

  const ch3Nodes = [
    {
      title: "Sản xuất vật chất",
      summary:
        "Sản xuất vật chất là cơ sở tồn tại và phát triển của xã hội loài người.",
      originalText:
        "Sản xuất vật chất là hoạt động thực tiễn đặc trưng của con người, quyết định sự sinh tồn và biến đổi của mọi thiết chế xã hội lịch sử.",
      quickTake: "Sản xuất vật chất quyết định sự tồn tại xã hội.",
      difficulty: "Medium",
      timeToRead: "8 min read",
      orderIndex: 1,
      videoUrl: defaultYoutubeUrl,
    },
    {
      title: "Biện chứng LLSX – QHSX",
      summary:
        "Quy luật quan hệ sản xuất phù hợp với trình độ phát triển của lực lượng sản xuất.",
      originalText:
        "Lực lượng sản xuất quyết định sự hình thành và biến đổi của quan hệ sản xuất. Ngược lại, quan hệ sản xuất tác động thúc đẩy hoặc kìm hãm lực lượng sản xuất.",
      quickTake: "Lực lượng sản xuất quyết định quan hệ sản xuất.",
      difficulty: "Hard",
      timeToRead: "13 min read",
      orderIndex: 2,
      videoUrl: defaultYoutubeUrl,
    },
    {
      title: "Cơ sở hạ tầng và kiến trúc thượng tầng",
      summary:
        "Cơ sở hạ tầng quyết định kiến trúc thượng tầng chính trị, pháp lý tương ứng.",
      originalText:
        "Cơ sở hạ tầng là toàn bộ những quan hệ sản xuất hợp thành cơ cấu kinh tế của xã hội. Kiến trúc thượng tầng là hệ thống quan điểm chính trị, pháp quyền... và thiết chế tương ứng.",
      quickTake: "Kinh tế quyết định chính trị và hệ tư tưởng xã hội.",
      difficulty: "Hard",
      timeToRead: "12 min read",
      orderIndex: 3,
      videoUrl: defaultYoutubeUrl,
    },
    {
      title: "Nguồn gốc giai cấp",
      summary:
        "Giai cấp ra đời từ nguồn gốc kinh tế do sự chiếm đoạt tư hữu tư liệu sản xuất.",
      originalText:
        "Sự xuất hiện chế độ tư hữu về tư liệu sản xuất là nguồn gốc trực tiếp phân chia xã hội thành các giai cấp đối kháng.",
      quickTake: "Tư hữu tư liệu sản xuất hình thành giai cấp đối kháng.",
      difficulty: "Medium",
      timeToRead: "8 min read",
      orderIndex: 4,
      videoUrl: defaultYoutubeUrl,
    },
    {
      title: "Đấu tranh giai cấp",
      summary:
        "Đấu tranh giai cấp là động lực phát triển xã hội trong các xã hội có đối kháng giai cấp.",
      originalText:
        "Đấu tranh giai cấp là cuộc đấu tranh giữa các giai cấp có lợi ích căn bản đối lập nhau, đỉnh cao là cách mạng xã hội dẫn đến thay đổi hình thái xã hội.",
      quickTake:
        "Đấu tranh giai cấp là động lực lịch sử của xã hội có bóc lột.",
      difficulty: "Medium",
      timeToRead: "9 min read",
      orderIndex: 5,
      videoUrl: defaultYoutubeUrl,
    },
    {
      title: "Nhà nước và cách mạng xã hội",
      summary:
        "Nhà nước là công cụ chuyên chính giai cấp, cách mạng xã hội là bước chuyển đổi hình thái.",
      originalText:
        "Nhà nước ra đời do mâu thuẫn giai cấp không thể điều hòa. Cách mạng xã hội là phương thức chuyển từ hình thái kinh tế - xã hội thấp lên cao hơn.",
      quickTake: "Nhà nước là công cụ thống trị; Cách mạng lật đổ giai cấp cũ.",
      difficulty: "Hard",
      timeToRead: "14 min read",
      orderIndex: 6,
      videoUrl: defaultYoutubeUrl,
    },
    {
      title: "Bản chất con người",
      summary:
        "Con người là thực thể sinh học - xã hội, bản chất là tổng hòa các quan hệ xã hội.",
      originalText:
        "Trong tính hiện thực của nó, bản chất con người là tổng hòa những quan hệ xã hội. Con người vừa là sản phẩm vừa là chủ thể của lịch sử. - Karl Marx",
      quickTake: "Bản chất con người là tổng hòa các mối quan hệ xã hội.",
      difficulty: "Easy",
      timeToRead: "7 min read",
      orderIndex: 7,
      videoUrl: defaultYoutubeUrl,
    },
    {
      title: "Quần chúng và lãnh tụ",
      summary:
        "Quần chúng nhân dân là người sáng tạo chân chính ra lịch sử, lãnh tụ định hướng hành động.",
      originalText:
        "Quần chúng nhân dân là lực lượng quyết định sự phát triển của lịch sử. Lãnh tụ là người định hướng, tổ chức và cổ vũ quần chúng thực hiện nhiệm vụ lịch sử.",
      quickTake: "Quần chúng quyết định lịch sử; Lãnh tụ hướng dẫn cách mạng.",
      difficulty: "Medium",
      timeToRead: "10 min read",
      orderIndex: 8,
      videoUrl: defaultYoutubeUrl,
    },
  ];

  const createdCh3Nodes = [];
  for (const n of ch3Nodes) {
    const sectionChapter =
      n.orderIndex <= 3
        ? ch3SectionFormation
        : n.orderIndex <= 6
          ? ch3SectionClass
          : ch3SectionHuman;
    const sectionOrderIndex =
      sectionChapter.id === ch3SectionFormation.id
        ? n.orderIndex
        : sectionChapter.id === ch3SectionClass.id
          ? n.orderIndex - 3
          : n.orderIndex - 6;
    const lessonFlow = buildDefaultLessonFlow(n);
    const node = await prisma.conceptNode.create({
      data: {
        title: n.title,
        summary: n.summary,
        originalText: n.originalText,
        quickTake: n.quickTake,
        difficulty: n.difficulty,
        timeToRead: n.timeToRead,
        videoUrl: n.videoUrl,
        orderIndex: sectionOrderIndex,
        chapterId: sectionChapter.id,
        lessonType: "flow",
        lessonFlow: lessonFlow as any,
        lessonMedia: extractLessonMedia(lessonFlow, n) as any,
        contentReady: false,
        lessonStatus: "draft",
      },
    });
    createdCh3Nodes.push(node);
    await prisma.progress.create({
      data: { userId: user.id, nodeId: node.id, status: "locked" },
    });
  }

  const ch1FirstNode = createdCh1Nodes[0];

  // 4. Seed sample podcasts for published lessons
  if (ch1FirstNode) {
    await prisma.podcast.create({
      data: {
        nodeId: ch1FirstNode.id,
        audioUrl:
          "https://cdn.pixabay.com/download/audio/2022/03/15/audio_5e3edee2cd.mp3",
        transcript: [
          {
            time: 0,
            speaker: "Host",
            text: "Xin chào các bạn, hôm nay chúng ta bắt đầu với câu hỏi: triết học ra đời từ đâu?",
          },
          {
            time: 6,
            speaker: "Host",
            text: "Trước hết là nguồn gốc nhận thức: con người có nhu cầu hiểu biết thế giới và dần vượt qua cách giải thích bằng thần thoại.",
          },
          {
            time: 14,
            speaker: "Guest",
            text: "Khi con người đặt câu hỏi về quy luật tự nhiên thay vì chỉ quy mọi thứ cho thần linh, tư duy lý luận bắt đầu xuất hiện.",
          },
          {
            time: 23,
            speaker: "Host",
            text: "Nhưng triết học cũng cần nguồn gốc xã hội: sản xuất phát triển, của cải dư thừa, giai cấp hình thành và lao động trí óc tách khỏi lao động chân tay.",
          },
          {
            time: 35,
            speaker: "Guest",
            text: "Chỉ khi có tầng lớp trí thức đủ điều kiện suy ngẫm, tri thức rời rạc mới được hệ thống hóa thành học thuyết.",
          },
          {
            time: 45,
            speaker: "Host",
            text: "Vì vậy, triết học ra đời từ sự gặp nhau giữa nhu cầu nhận thức và những điều kiện xã hội chín muồi.",
          },
        ] as any,
      },
    });
    console.log("Seeded sample podcast for first lesson.");
  }

  // 4.1 Seed Specific Podcast for 'Phạm trù vật chất'
  const materialNode = createdCh2Nodes.find(
    (n) => n.title === "Phạm trù vật chất",
  );
  if (materialNode) {
    await prisma.podcast.create({
      data: {
        nodeId: materialNode.id,
        audioUrl:
          "https://cdn.pixabay.com/download/audio/2022/03/15/audio_5e3edee2cd.mp3",
        transcript: [
          {
            time: 0,
            speaker: "Host",
            text: "Xin chào các bạn, chào mừng đến với podcast Triết học Mác – Lênin.",
          },
          {
            time: 4,
            speaker: "Host",
            text: "Trong tập hôm nay, chúng ta cùng đi sâu vào phạm trù vật chất.",
          },
          {
            time: 9,
            speaker: "Host",
            text: "Đây là một trong những phạm trù trung tâm của triết học duy vật biện chứng.",
          },
          {
            time: 14,
            speaker: "Host",
            text: 'V.I. Lênin định nghĩa: "Vật chất là một phạm trù triết học",',
          },
          {
            time: 19,
            speaker: "Host",
            text: '"dùng để chỉ thực tại khách quan được đem lại cho con người trong cảm giác".',
          },
          {
            time: 26,
            speaker: "Host",
            text: "Định nghĩa này có ba nội dung cơ bản mà chúng ta cần lưu ý.",
          },
          {
            time: 31,
            speaker: "Host",
            text: "Thứ nhất, vật chất là cái tồn tại khách quan, độc lập với ý thức.",
          },
          {
            time: 37,
            speaker: "Host",
            text: "Thứ hai, vật chất là cái mà con người có thể nhận thức được.",
          },
          {
            time: 43,
            speaker: "Host",
            text: "Thứ ba, vật chất không đồng nhất với bất kỳ dạng cụ thể nào của nó.",
          },
          {
            time: 50,
            speaker: "Host",
            text: "Định nghĩa của Lênin đã giải quyết triệt để vấn đề cơ bản của triết học.",
          },
          {
            time: 57,
            speaker: "Host",
            text: "Đồng thời mở đường cho khoa học tiếp tục khám phá các dạng vật chất mới.",
          },
          {
            time: 64,
            speaker: "Host",
            text: "Cảm ơn các bạn đã lắng nghe. Hẹn gặp lại ở tập sau!",
          },
        ] as any,
      },
    });
    console.log("Seeded Marxist-Leninist Philosophy main podcast episode.");
  }

  // 5. Seed Flashcards from real question banks bundled in prisma/data.
  const promptsQuestions = [
    {
      question:
        "Tư duy triết học ra đời thay thế cho loại hình tư duy nào trước đó trong lịch sử tư tưởng nhân loại?",
      options: [
        "A. Tư duy khoa học và tư duy nghệ thuật",
        "B. Tư duy huyền thoại và tôn giáo nguyên thủy",
        "C. Tư duy siêu hình và cơ học cổ điển",
        "D. Tư duy kinh nghiệm và tư duy trực quan",
      ],
      correctIndex: 1,
      cleanAnswer: "Tư duy huyền thoại và tôn giáo nguyên thủy",
      explanation:
        "Tư duy triết học ra đời thay thế cho tư duy huyền thoại và tôn giáo nguyên thủy trước đó trong lịch sử tư tưởng nhân loại.",
    },
    {
      question: "Về mặt nguồn gốc xã hội, triết học chỉ ra đời khi nào?",
      options: [
        "A. Khi loài người mới xuất hiện và có nhu cầu giải thích tự nhiên",
        "B. Khi nền sản xuất xã hội chưa có sự phân công lao động",
        "C. Khi lao động trí óc đã tách khỏi lao động chân tay và xuất hiện giai cấp",
        "D. Khi chế độ cộng sản nguyên thủy đạt đến đỉnh cao",
      ],
      correctIndex: 2,
      cleanAnswer:
        "Khi lao động trí óc đã tách khỏi lao động chân tay và xuất hiện giai cấp",
      explanation:
        "Về mặt nguồn gốc xã hội, triết học chỉ ra đời khi lao động trí óc đã tách khỏi lao động chân tay và xuất hiện giai cấp.",
    },
    {
      question:
        'Thuật ngữ "Triết gia" (philosophos) xuất hiện đầu tiên ở nhà tư tưởng nào thời cổ đại để chỉ người nghiên cứu về bản chất của sự vật?',
      options: ["A. Socrates", "B. Aristotle", "C. Heraclitus", "D. Plato"],
      correctIndex: 2,
      cleanAnswer: "Heraclitus",
      explanation:
        'Thuật ngữ "Triết gia" (philosophos) xuất hiện đầu tiên ở Heraclitus thời cổ đại để chỉ người nghiên cứu về bản chất của sự vật.',
    },
    {
      question: 'Ở Hy Lạp cổ đại, thuật ngữ "philosophia" mang ý nghĩa là gì?',
      options: [
        "A. Yêu mến sự thông thái",
        "B. Con đường dẫn đến lẽ phải",
        "C. Khoa học của mọi khoa học",
        "D. Sự truy tìm bản chất của con người",
      ],
      correctIndex: 0,
      cleanAnswer: "Yêu mến sự thông thái",
      explanation:
        'Ở Hy Lạp cổ đại, thuật ngữ "philosophia" mang ý nghĩa là yêu mến sự thông thái.',
    },
    {
      question:
        'Trong triết học Ấn Độ cổ đại, thuật ngữ "Dar\'sana" có nghĩa gốc là gì?',
      options: [
        "A. Yêu mến sự thông thái",
        "B. Chiêm ngưỡng, sự suy ngẫm dẫn dắt đến lẽ phải",
        "C. Khám phá vũ trụ huyền bí",
        "D. Sự biểu hiện cao của trí tuệ",
      ],
      correctIndex: 1,
      cleanAnswer: "Chiêm ngưỡng, sự suy ngẫm dẫn dắt đến lẽ phải",
      explanation:
        'Trong triết học Ấn Độ cổ đại, thuật ngữ "Dar\'sana" có nghĩa gốc là chiêm ngưỡng, sự suy ngẫm dẫn dắt đến lẽ phải.',
    },
    {
      question: "Triết học là gì?",
      options: [
        "A. Là khoa học của mọi khoa học",
        "B. Là hình thái ý thức xã hội đặc biệt, hệ thống quan điểm lý luận chung nhất về thế giới, về con người và tư duy",
        "C. Là một bộ môn khoa học thực nghiệm nghiên cứu về tự nhiên",
        "D. Là niềm tin và những tín điều tôn giáo của loài người",
      ],
      correctIndex: 1,
      cleanAnswer:
        "Là hình thái ý thức xã hội đặc biệt, hệ thống quan điểm lý luận chung nhất về thế giới, về con người và tư duy",
      explanation:
        "Triết học là hình thái ý thức xã hội đặc biệt, hệ thống quan điểm lý luận chung nhất về thế giới, về con người và tư duy.",
    },
    {
      question:
        'Đối tượng nghiên cứu của triết học trong thời kỳ "Nền triết học tự nhiên" (Hy Lạp cổ đại) là gì?',
      options: [
        "A. Chỉ nghiên cứu về đời sống tâm linh",
        "B. Bao gồm tất cả những tri thức mà con người có được, là khoa học của các khoa học",
        "C. Chỉ nghiên cứu về các hiện tượng xã hội",
        "D. Tập trung vào các quy luật của kinh tế chính trị",
      ],
      correctIndex: 1,
      cleanAnswer:
        "Bao gồm tất cả những tri thức mà con người có được, là khoa học của các khoa học",
      explanation:
        'Đối tượng nghiên cứu của triết học trong thời kỳ "Nền triết học tự nhiên" (Hy Lạp cổ đại) bao gồm tất cả những tri thức mà con người có được, là khoa học của các khoa học.',
    },
    {
      question:
        "Ở Tây Âu thời trung cổ, triết học chịu sự quy định và chi phối của hệ tư tưởng nào?",
      options: [
        "A. Khoa học tự nhiên",
        "B. Cơ học cổ điển",
        "C. Thần học và hệ tư tưởng Kitô giáo",
        "D. Phật giáo",
      ],
      correctIndex: 2,
      cleanAnswer: "Thần học và hệ tư tưởng Kitô giáo",
      explanation:
        "Ở Tây Âu thời trung cổ, triết học chịu sự quy định và chi phối của thần học và hệ tư tưởng Kitô giáo.",
    },
    {
      question:
        'Khái niệm "thế giới quan" lần đầu tiên được nhà triết học nào sử dụng trong tác phẩm "Phê phán năng lực phán đoán"?',
      options: [
        "A. G.W.F. Hegel",
        "B. I. Kant",
        "C. F. Schelling",
        "D. C. Mác",
      ],
      correctIndex: 1,
      cleanAnswer: "I. Kant",
      explanation:
        'Khái niệm "thế giới quan" lần đầu tiên được nhà triết học I. Kant sử dụng trong tác phẩm "Phê phán năng lực phán đoán".',
    },
    {
      question: "Vấn đề cơ bản lớn của mọi triết học là gì?",
      options: [
        "A. Vấn đề nguồn gốc của loài người",
        "B. Vấn đề quan hệ giữa tự nhiên và xã hội",
        "C. Vấn đề quan hệ giữa tư duy với tồn tại (giữa ý thức và vật chất)",
        "D. Vấn đề khả năng sáng tạo của con người",
      ],
      correctIndex: 2,
      cleanAnswer:
        "Vấn đề quan hệ giữa tư duy với tồn tại (giữa ý thức và vật chất)",
      explanation:
        "Vấn đề cơ bản lớn của mọi triết học là vấn đề quan hệ giữa tư duy với tồn tại (giữa ý thức và vật chất).",
    },
  ];

  for (const item of promptsQuestions) {
    await prisma.flashcard.create({
      data: {
        nodeId: ch1FirstNode.id,
        tag: "Khái lược về triết học",
        question: item.question,
        answer: item.cleanAnswer,
      },
    });
  }

  const questionBankFlashcards = [
    ...buildFlashcardsFromQuestionBank(
      seedingData.ch1_quizzes,
      createdCh1Nodes[0].id,
      "Ngân hàng câu hỏi Chương 1",
    ),
    ...buildFlashcardsFromQuestionBank(
      seedingData.ch2_quizzes,
      createdCh2Nodes[0].id,
      "Ngân hàng câu hỏi Chương 2",
    ),
    ...buildFlashcardsFromQuestionBank(
      seedingData.ch3_quizzes,
      createdCh3Nodes[0].id,
      "Ngân hàng câu hỏi Chương 3",
    ),
  ];

  await prisma.flashcard.createMany({
    data: questionBankFlashcards,
  });
  console.log(
    `Seeded ${questionBankFlashcards.length + promptsQuestions.length} flashcards from bundled lesson/question-bank data.`,
  );

  // ==================== SEED: MCQ QUIZZES & MOCK EXAMS ====================
  if (createdCh1Nodes[0]) {
    await prisma.quiz.create({
      data: {
        nodeId: createdCh1Nodes[0].id,
        type: "mcq",
        title: "Trắc nghiệm Chương 1: Triết học và vai trò của triết học",
        description: "Bài trắc nghiệm ôn tập tổng hợp kiến thức Chương 1.",
        questions: seedingData.ch1_quizzes as any,
      },
    });
  }

  if (createdCh2Nodes[0]) {
    await prisma.quiz.create({
      data: {
        nodeId: createdCh2Nodes[0].id,
        type: "mcq",
        title: "Trắc nghiệm Chương 2: Chủ nghĩa duy vật biện chứng",
        description: "Bài trắc nghiệm ôn tập tổng hợp kiến thức Chương 2.",
        questions: seedingData.ch2_quizzes as any,
      },
    });
  }

  if (createdCh3Nodes[0]) {
    await prisma.quiz.create({
      data: {
        nodeId: createdCh3Nodes[0].id,
        type: "mcq",
        title: "Trắc nghiệm Chương 3: Chủ nghĩa duy vật lịch sử",
        description: "Bài trắc nghiệm ôn tập tổng hợp kiến thức Chương 3.",
        questions: seedingData.ch3_quizzes as any,
      },
    });
  }

  // Combined Mock Exam
  await prisma.quiz.create({
    data: {
      nodeId: null,
      type: "mcq",
      title: "Đề thi thử học thuật số 1: Tổng hợp Triết học Mác - Lênin",
      description:
        "Đề thi thử mô phỏng kỳ thi chính thức. Không có kết quả lập tức sau mỗi câu, điểm số và giải thích chi tiết sẽ hiển thị sau khi hoàn thành toàn bộ bài thi.",
      questions: seedingData.mock_exam as any,
    },
  });

  // ==================== SEED: PDF REFERENCE DOCUMENTS ====================
  console.log("Seeding PDF reference documents...");
  const docFiles = [
    {
      fileName: "Book_full.pdf",
      title: "Giáo trình Triết học Mác - Lênin (Bản đầy đủ)",
      description:
        "Toàn bộ nội dung giáo trình chính thức của Bộ Giáo dục và Đào tạo.",
    },
    {
      fileName: "Chuong_1.pdf",
      title: "Giáo trình Chương 1: Triết học và vai trò của triết học",
      description: "Tài liệu học tập chi tiết cho Chương 1.",
    },
    {
      fileName: "Chuong_2.pdf",
      title: "Giáo trình Chương 2: Chủ nghĩa duy vật biện chứng",
      description: "Tài liệu học tập chi tiết cho Chương 2.",
    },
    {
      fileName: "Chuong_3.pdf",
      title: "Giáo trình Chương 3: Chủ nghĩa duy vật lịch sử",
      description: "Tài liệu học tập chi tiết cho Chương 3.",
    },
    {
      fileName: "sum_chuong1_dai.pdf",
      title: "Tóm tắt chi tiết Chương 1",
      description: "Bản tóm tắt hệ thống kiến thức trọng tâm Chương 1.",
    },
    {
      fileName: "sum_chuong2_dai.pdf",
      title: "Tóm tắt chi tiết Chương 2",
      description: "Bản tóm tắt hệ thống kiến thức trọng tâm Chương 2.",
    },
    {
      fileName: "sum_chuong3_dai.pdf",
      title: "Tóm tắt chi tiết Chương 3",
      description: "Bản tóm tắt hệ thống kiến thức trọng tâm Chương 3.",
    },
  ];

  const uploadsDir = path.join(__dirname, "..", "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Create documents bucket if not exist
  if (supabaseClient) {
    try {
      const { data: bucketData, error: bucketError } =
        await supabaseClient.storage.createBucket("documents", {
          public: true,
          fileSizeLimit: 52428800, // 50MB
        });
      if (bucketError) {
        if (
          !bucketError.message.includes("already exists") &&
          !bucketError.message.includes("Already exists")
        ) {
          console.warn(
            'Failed to create bucket "documents":',
            bucketError.message,
          );
        } else {
          console.log('Supabase storage bucket "documents" already exists.');
        }
      } else {
        console.log(
          'Created Supabase storage bucket "documents" with public access.',
        );
      }
    } catch (e: any) {
      console.warn('Error verifying/creating bucket "documents":', e.message);
    }
  await prisma.document.deleteMany({});

  for (const doc of docFiles) {
    const srcPath = path.resolve(__dirname, "../../data", doc.fileName);
    if (!fs.existsSync(srcPath)) {
      console.warn(`Source PDF file not found: ${srcPath}`);
      continue;
    }

    // 1. Copy to local public uploads
    const destPath = path.join(uploadsDir, doc.fileName);
    try {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${doc.fileName} to local uploads folder.`);
    } catch (err: any) {
      console.warn(
        `Failed to copy ${doc.fileName} to local uploads: ${err.message}`,
      );
    }

    // 2. Default relative public URL
    let fileUrl = `/public/uploads/${doc.fileName}`;

    // 3. Try uploading to Supabase Storage if active
    if (supabaseClient) {
      try {
        const fileBuffer = fs.readFileSync(srcPath);
        const { data, error } = await supabaseClient.storage
          .from("documents")
          .upload(doc.fileName, fileBuffer, {
            contentType: "application/pdf",
            upsert: true,
          });

        if (error) throw error;

        const { data: urlData } = supabaseClient.storage
          .from("documents")
          .getPublicUrl(doc.fileName);

        if (urlData?.publicUrl) {
          fileUrl = urlData.publicUrl;
          console.log(
            `Uploaded ${doc.fileName} to Supabase Storage: ${fileUrl}`,
          );
        }
      } catch (e: any) {
        console.warn(
          `Supabase storage upload failed for ${doc.fileName}: ${e.message}. Falling back to local URL.`,
        );
      }
    }

    // 4. Create Document record in DB
    await prisma.document.create({
      data: {
        fileName: doc.fileName,
        fileUrl: fileUrl,
        courseId: course.id,
        status: "completed",
        title: doc.title,
        description: doc.description,
      },
    });
  }

  // ==================== SEED: PHILOSOFUN VIDEOS ====================
  console.log("Seeding Philosofun videos...");
  await prisma.philosofun.deleteMany({});
  const philosofunVideos = [
    {
      title: "Quan điểm toàn diện trong Triết học Mác - Lênin",
      description:
        "Tình huống phân tích quan điểm toàn diện và nguyên lý về mối liên hệ phổ biến trong Triết học Mác - Lênin qua các ví dụ thực tiễn sinh động.",
      videoUrl: "https://www.youtube.com/watch?v=zq3u-R-WAhQ",
    },
  ];

  for (const item of philosofunVideos) {
    await prisma.philosofun.create({
      data: item,
    });
    console.log(`Seeded Philosofun video: ${item.title}`);
  }


  // ==================== NEW SEED: DEBATE TOPICS / SCENARIOS ====================
  const debateTopicSeedData = [
    {
      title: "Chủ nghĩa Duy vật vs Chủ nghĩa Duy tâm",
      description:
        "Cuộc đối đầu kinh điển về bản chất thế giới. Liệu vật chất quyết định ý thức biện chứng hay thế giới chỉ là ảo ảnh cảm giác của ta?",
      initialPrompt:
        'Chào đồng chí! Chào mừng đến với đấu trường luận biện duy vật. Giới duy tâm chủ quan khẳng định: "Sự vật chỉ là sự phức hợp của các cảm giác". Đồng chí dùng lập luận duy vật biện chứng nào để bẻ gãy giả định phản khoa học này?',
    },
    {
      title: "Giá trị thặng dư trong kỷ nguyên số & AI",
      description:
        "Robot, thuật toán AI và hệ thống Cloud Automation có trực tiếp tạo ra giá trị thặng dư dôi ra không? Hay sức lao động của lập trình viên vẫn là nguồn sống duy nhất bị bóc lột?",
      initialPrompt:
        'Chào đồng chí! Thời đại tự động hóa làm dấy lên luồng ý kiến rằng "AI tạo ra mọi giá trị, học thuyết Marx đã lỗi thời". Theo thế giới quan kinh tế Mác-Lênin, máy móc chỉ chuyển dịch giá trị vào sản phẩm chứ không tạo thêm giá trị thặng dư. Lập trường của đồng chí thế nào?',
    },
    {
      title: "Ý thức và Trí tuệ nhân tạo (AI)",
      description:
        "Trí tuệ nhân tạo (AI) chạy trên linh kiện silicon có thể đạt tới trạng thái có ý thức thật sự hay không? Hay nó chỉ là một dạng phản ánh vật chất cấp cao?",
      initialPrompt:
        "Chào đồng chí! Triết học khẳng định ý thức là thuộc tính đặc hữu của bộ não người - một dạng vật chất sống tổ chức siêu việt. Vậy AI bán dẫn có thể có tâm lý, cảm xúc hay ý thức thực sự không? Phân tích biện chứng của đồng chí là gì?",
    },
  ];

  const createdDebateTopics = [];
  for (const topic of debateTopicSeedData) {
    createdDebateTopics.push(
      await prisma.debateTopic.create({
        data: topic,
      }),
    );
  }
  console.log("Seeded standard Debate Topics.");

  const allConceptNodes = [
    ...createdCh1Nodes,
    ...createdCh2Nodes,
    ...createdCh3Nodes,
  ];
  await prisma.debate.createMany({
    data: allConceptNodes.map((node) => ({
      nodeId: node.id,
      userId: user.id,
      transcript: buildConceptDebateTranscript(node) as any,
    })),
  });

  await prisma.debate.createMany({
    data: createdDebateTopics.map((topic) => ({
      topicId: topic.id,
      userId: user.id,
      transcript: [
        { speaker: "Host", text: topic.initialPrompt, time: 0 },
      ] as any,
    })),
  });
  console.log(
    `Seeded ${allConceptNodes.length} concept debates and ${createdDebateTopics.length} topic debates.`,
  );

  // ==================== NEW SEED: MULTIPLE WARMUPS FOR FIRST LESSON ====================
  if (ch1FirstNode) {
    await prisma.warmup.create({
      data: {
        nodeId: ch1FirstNode.id,
        type: "game",
        title: "KÍNH LỌC CUỘC ĐỜI (The Worldview Filter)",
        reveal:
          "Đồng chí đã hoàn thành xuất sắc trò chơi Kính Lọc Cuộc Đời và sẵn sàng tiếp cận tri thức triết học chính thức!",
      },
    });

    await prisma.warmup.create({
      data: {
        nodeId: ch1FirstNode.id,
        type: "story",
        title: "Từ sấm sét đến quy luật",
        story:
          "Một bộ tộc cổ đại tin rằng sấm sét là cơn giận của thần linh. Sau nhiều lần tế lễ mà thiên tai vẫn xảy ra, một người trẻ bắt đầu hỏi: liệu có quy luật tự nhiên nào đứng sau hiện tượng này không?",
        question:
          "Câu hỏi của người trẻ trong câu chuyện thể hiện nguồn gốc nào của triết học?",
        options: [
          "Nguồn gốc nhận thức",
          "Nguồn gốc kinh tế thị trường",
          "Nguồn gốc nghệ thuật",
        ] as any,
        correctIndex: 0,
        reveal:
          "Đúng. Đó là nguồn gốc nhận thức: nhu cầu hiểu biết thế giới và khuynh hướng vượt qua tư duy huyền thoại bằng lý lẽ.",
      },
    });

    await prisma.warmup.create({
      data: {
        nodeId: ch1FirstNode.id,
        type: "image-guess",
        title: "Hai mảnh ghép khai sinh triết học",
        image:
          "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=900&auto=format&fit=crop",
        blanks: "N H _ N   T H _ C   &   X _   H _ I",
        answer: "nhận thức và xã hội",
        reveal:
          "Chính xác. Triết học ra đời từ hai nguồn gốc cơ bản: nguồn gốc nhận thức và nguồn gốc xã hội.",
      },
    });
  }

  // ==================== WARMUPS FOR 'Phạm trù vật chất' ====================
  if (materialNode) {
    await prisma.warmup.create({
      data: {
        nodeId: materialNode.id,
        type: "image-guess",
        title: "Nhìn hình đoán khái niệm",
        image:
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&auto=format&fit=crop",
        blanks: "V _ T   C H _ T",
        answer: "vật chất",
        reveal:
          "Chính xác! Vật chất chính là phạm trù trung tâm cốt lõi của Chủ nghĩa duy vật biện chứng, tồn tại khách quan và độc lập hoàn toàn với ý thức.",
      },
    });

    await prisma.warmup.create({
      data: {
        nodeId: materialNode.id,
        type: "story",
        title: "Mẩu chuyện triết học kinh điển",
        story:
          'Heraclitus nói: "Không ai tắm hai lần trên cùng một dòng sông." Vì khi bạn bước xuống dòng nước lần thứ hai, cả dòng nước lẫn chính cơ thể bạn đã thay đổi.',
        question:
          "Ý nghĩa biện chứng sâu sắc của mẩu chuyện trên chỉ ra thuộc tính nào của vật chất?",
        options: [
          "Vật chất hoàn toàn đứng im tuyệt đối",
          "Vận động là phương thức tồn tại tuyệt đối, bất biến của vật chất",
          "Dòng sông chỉ là ảo ảnh ý thức",
        ] as any,
        correctIndex: 1,
        reveal:
          "Chính xác! Phép biện chứng khẳng định vận động là phương thức tồn tại cố hữu và tuyệt đối của mọi dạng vật chất trong vũ trụ khách quan.",
      },
    });
  }

  console.log(
    "Database seeded successfully with Vietnamese Marxist-Leninist Philosophy courses, topics, warmups, podcasts, and flashcards!",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
