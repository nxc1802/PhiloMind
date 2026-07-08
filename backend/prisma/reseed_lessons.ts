import { PrismaClient } from "@prisma/client";
import * as path from "path";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("Reading lesson manifest...");
  const manifestPath = path.resolve(__dirname, "../../data/lesson_components/manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  const convertedLessons = manifest.lessons.filter((l: any) => l.status === "converted");

  console.log(`Found ${convertedLessons.length} converted lessons to reseed.`);

  for (const lesson of convertedLessons) {
    console.log(`\nProcessing: ${lesson.title}`);
    
    // Read the json file
    const filePath = path.resolve(__dirname, "../../data/lesson_components", lesson.file);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      continue;
    }
    
    const lessonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const lessonFlow = lessonData.lessonFlow || [];
    const lessonMedia = lessonData.lessonMedia || [];

    // Find the node
    const node = await prisma.conceptNode.findFirst({
      where: { title: lesson.title }
    });

    if (!node) {
      console.warn(`Node not found in DB for title: ${lesson.title}`);
      continue;
    }

    // Update node
    await prisma.conceptNode.update({
      where: { id: node.id },
      data: {
        lessonFlow: lessonFlow as any,
        lessonMedia: lessonMedia as any,
        contentReady: true,
        lessonStatus: "published",
        lessonType: "flow"
      }
    });

    console.log(`Updated ConceptNode: ${node.title}`);

    // Clear Progress for this node to prevent UI crash with old components
    const deletedProgress = await prisma.progress.deleteMany({
      where: { nodeId: node.id }
    });

    console.log(`Cleared ${deletedProgress.count} Progress records for node: ${node.title}`);
  }

  console.log("\nReseed lessons completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
