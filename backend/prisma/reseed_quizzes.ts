import { PrismaClient } from "@prisma/client";
import * as path from "path";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("Reading parsed questions...");
  const ch1Path = path.join(__dirname, "data", "ch1.json");
  const ch2Path = path.join(__dirname, "data", "ch2.json");
  const ch3Path = path.join(__dirname, "data", "ch3.json");

  const ch1_quizzes = JSON.parse(fs.readFileSync(ch1Path, "utf8"));
  const ch2_quizzes = JSON.parse(fs.readFileSync(ch2Path, "utf8"));
  const ch3_quizzes = JSON.parse(fs.readFileSync(ch3Path, "utf8"));

  function getRandomQuestions(quizzes: any[], count: number) {
    const shuffled = [...quizzes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  const mockExamQuestions = [
    ...getRandomQuestions(ch1_quizzes, 20),
    ...getRandomQuestions(ch2_quizzes, 20),
    ...getRandomQuestions(ch3_quizzes, 20),
  ].sort(() => 0.5 - Math.random());

  console.log("Mock exam generated with", mockExamQuestions.length, "questions.");

  console.log("Deleting old mcq quizzes...");
  await prisma.quiz.deleteMany({
    where: { type: "mcq" }
  });

  const nodes = await prisma.conceptNode.findMany({
    select: {
      id: true,
      orderIndex: true,
      chapter: {
        select: {
          title: true,
          orderIndex: true
        }
      }
    },
    orderBy: [
      { chapter: { orderIndex: 'asc' } },
      { orderIndex: 'asc' }
    ]
  });

  const ch1Nodes = nodes.filter(n => n.chapter.title.includes("Chương 1") || n.chapter.orderIndex === 1);
  const ch2Nodes = nodes.filter(n => n.chapter.title.includes("Chương 2") || n.chapter.orderIndex === 2);
  const ch3Nodes = nodes.filter(n => n.chapter.title.includes("Chương 3") || n.chapter.orderIndex === 3);

  if (ch1Nodes.length > 0) {
    await prisma.quiz.create({
      data: {
        nodeId: ch1Nodes[0].id,
        type: "mcq",
        title: "Trắc nghiệm Chương 1: Triết học và vai trò của triết học",
        description: "Bài trắc nghiệm ôn tập tổng hợp kiến thức Chương 1.",
        questions: ch1_quizzes as any,
      },
    });
    console.log("Seeded Chapter 1 Quiz with", ch1_quizzes.length, "questions");
  } else {
    console.log("No Chapter 1 nodes found!");
  }

  if (ch2Nodes.length > 0) {
    await prisma.quiz.create({
      data: {
        nodeId: ch2Nodes[0].id,
        type: "mcq",
        title: "Trắc nghiệm Chương 2: Chủ nghĩa duy vật biện chứng",
        description: "Bài trắc nghiệm ôn tập tổng hợp kiến thức Chương 2.",
        questions: ch2_quizzes as any,
      },
    });
    console.log("Seeded Chapter 2 Quiz with", ch2_quizzes.length, "questions");
  } else {
    console.log("No Chapter 2 nodes found!");
  }

  if (ch3Nodes.length > 0) {
    await prisma.quiz.create({
      data: {
        nodeId: ch3Nodes[0].id,
        type: "mcq",
        title: "Trắc nghiệm Chương 3: Chủ nghĩa duy vật lịch sử",
        description: "Bài trắc nghiệm ôn tập tổng hợp kiến thức Chương 3.",
        questions: ch3_quizzes as any,
      },
    });
    console.log("Seeded Chapter 3 Quiz with", ch3_quizzes.length, "questions");
  } else {
    console.log("No Chapter 3 nodes found!");
  }

  await prisma.quiz.create({
    data: {
      nodeId: null,
      type: "mcq",
      title: "Đề thi thử học thuật số 1: Tổng hợp Triết học Mác - Lênin",
      description: "Đề thi thử mô phỏng kỳ thi chính thức (60 câu, mỗi chương 20 câu ngẫu nhiên).",
      questions: mockExamQuestions as any,
    },
  });
  console.log("Seeded Mock Exam successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
