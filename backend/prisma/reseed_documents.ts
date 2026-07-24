import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

async function main() {
  console.log("Reseeding PDF reference documents into PhiloMind database...");

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

  let course = await prisma.course.findFirst({
    where: { title: "Triết học Mác – Lênin" },
  });

  if (!course) {
    const user = await prisma.user.findFirst();
    if (!user) {
      throw new Error("No user found in database. Run main seed first.");
    }
    course = await prisma.course.create({
      data: {
        title: "Triết học Mác – Lênin",
        description:
          "Nghiên cứu các quy luật vận động chung nhất của tự nhiên, xã hội và tư duy thông qua phương pháp luận biện chứng duy vật.",
        userId: user.id,
      },
    });
  }

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
      console.log("Supabase client initialized for PDF uploads.");
      await supabaseClient.storage.createBucket("documents", {
        public: true,
        fileSizeLimit: 52428800,
      });
    } catch (e: any) {
      console.warn("Supabase bucket setup warning:", e.message);
    }
  }

  const uploadsDir = path.join(__dirname, "..", "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  await prisma.document.deleteMany({});
  console.log("Cleared existing Document records.");

  let seededCount = 0;

  for (const doc of docFiles) {
    const srcPath = path.resolve(__dirname, "../../data", doc.fileName);
    if (!fs.existsSync(srcPath)) {
      console.warn(`Source PDF file not found: ${srcPath}`);
      continue;
    }

    const destPath = path.join(uploadsDir, doc.fileName);
    try {
      fs.copyFileSync(srcPath, destPath);
    } catch (err: any) {
      console.warn(`Local copy failed for ${doc.fileName}: ${err.message}`);
    }

    let fileUrl = `/public/uploads/${doc.fileName}`;

    if (supabaseClient) {
      try {
        const fileBuffer = fs.readFileSync(srcPath);
        await supabaseClient.storage
          .from("documents")
          .upload(doc.fileName, fileBuffer, {
            contentType: "application/pdf",
            upsert: true,
          });

        const { data: urlData } = supabaseClient.storage
          .from("documents")
          .getPublicUrl(doc.fileName);

        if (urlData?.publicUrl) {
          fileUrl = urlData.publicUrl;
        }
      } catch (e: any) {
        console.warn(
          `Supabase upload failed for ${doc.fileName}: ${e.message}`,
        );
      }
    }

    const created = await prisma.document.create({
      data: {
        fileName: doc.fileName,
        fileUrl: fileUrl,
        courseId: course.id,
        status: "completed",
        title: doc.title,
        description: doc.description,
      },
    });

    console.log(`Seeded document: ${created.title} (${created.fileUrl})`);
    seededCount++;
  }

  console.log(`\nSuccessfully seeded ${seededCount} PDF reference documents!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
