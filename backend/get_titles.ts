import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const nodes = await prisma.conceptNode.findMany({
    select: { id: true, title: true }
  });
  console.log("=== TITLES ===");
  nodes.forEach(n => console.log(n.title));
  console.log("==============");
}

main().catch(console.error).finally(() => prisma.$disconnect());
