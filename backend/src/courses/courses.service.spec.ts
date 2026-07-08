import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { CoursesService } from "./courses.service";

describe("CoursesService lesson access guards", () => {
  let service: CoursesService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      conceptNode: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      progress: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
    };
    service = new CoursesService(prisma, {} as any, {} as any, {} as any);
  });

  it("blocks learner node details for draft lessons", async () => {
    prisma.conceptNode.findUnique.mockResolvedValue({
      id: "node-1",
      contentReady: false,
      lessonStatus: "draft",
      progress: [],
    });

    await expect(
      service.getNodeDetails("node-1", "user-1", "student"),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("allows admins to inspect draft lesson details", async () => {
    prisma.conceptNode.findUnique.mockResolvedValue({
      id: "node-1",
      contentReady: false,
      lessonStatus: "draft",
      progress: [],
    });

    await expect(
      service.getNodeDetails("node-1", "admin-user", "admin"),
    ).resolves.toMatchObject({ id: "node-1" });
  });

  it("rejects component progress that references unknown component ids", async () => {
    prisma.conceptNode.findUnique.mockResolvedValue({
      id: "node-1",
      contentReady: true,
      lessonStatus: "published",
      lessonFlow: [
        {
          id: "known-step",
          type: "markdown",
          config: { content: "Ready" },
        },
      ],
    });

    await expect(
      service.updateComponentProgress(
        "user-1",
        "node-1",
        "student",
        "missing-step",
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects publishing an empty lessonFlow", async () => {
    prisma.conceptNode.findUnique.mockResolvedValue({
      id: "node-1",
      contentReady: false,
      lessonStatus: "draft",
      lessonFlow: [],
      progress: [],
    });

    await expect(
      service.updateNode("node-1", {
        lessonFlow: [],
        contentReady: true,
        lessonStatus: "published",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.conceptNode.update).not.toHaveBeenCalled();
  });
});
