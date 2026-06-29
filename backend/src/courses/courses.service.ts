import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { AIService } from "../ai/ai.service";
import { TTSService } from "../tts/tts.service";
import { SupabaseService } from "../supabase/supabase.service";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";
import { NodeSchemaValidator } from "./validators/node-schema.validator";
import { TtlCache } from "../common/ttl-cache";

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);
  private readonly coursesCache = new TtlCache<any[]>();
  private readonly documentsCache = new TtlCache<any[]>();
  private readonly warmupsCache = new TtlCache<any[]>();

  constructor(
    private prisma: PrismaService,
    private ai: AIService,
    private tts: TTSService,
    private supabase: SupabaseService,
  ) {}

  private clearReadCaches() {
    this.coursesCache.clear();
    this.documentsCache.clear();
    this.warmupsCache.clear();
  }

  async createCourse(userId: string, title: string, description?: string) {
    const course = await this.prisma.course.create({
      data: {
        title,
        description,
        userId,
      },
    });
    this.coursesCache.clear();
    return course;
  }

  async getCourses(userId?: string) {
    return this.coursesCache.getOrSet(`courses:${userId || "all"}`, 30000, () =>
      this.prisma.course.findMany({
        where: userId
          ? {
              OR: [{ userId }, { title: "Triết học Mác – Lênin" }],
            }
          : undefined,
        include: {
          documents: true,
          _count: {
            select: { chapters: true },
          },
        },
      }),
    );
  }

  /**
   * PDF Document Parser: extracts chapters, concept nodes, and triggers background podcast audio generation.
   */
  async processDocumentUpload(
    courseId: string,
    fileName: string,
    fileContent: string,
  ) {
    this.logger.log(
      `Parsing uploaded document: ${fileName} for course: ${courseId}...`,
    );

    // Create document record
    const document = await this.prisma.document.create({
      data: {
        fileName,
        fileUrl: `https://mock-bucket.local/${courseId}/${fileName}`,
        courseId,
        status: "parsing",
      },
    });
    this.documentsCache.clear();
    this.coursesCache.clear();

    // Run AI structured parse asynchronously to avoid blocking main thread
    this.extractStructureInBackground(courseId, document.id, fileContent);

    return document;
  }

  private async extractStructureInBackground(
    courseId: string,
    docId: string,
    content: string,
  ) {
    try {
      const parsedData = await this.ai.extractCourseStructure(
        courseId,
        content,
      );

      // Execute Prisma database writes inside transaction
      await this.prisma.$transaction(async (tx) => {
        for (const chap of parsedData.chapters) {
          const createdChapter = await tx.chapter.create({
            data: {
              title: chap.title,
              orderIndex: chap.orderIndex,
              courseId,
            },
          });

          for (const node of chap.nodes) {
            const createdNode = await tx.conceptNode.create({
              data: {
                title: node.title,
                summary: node.summary,
                originalText: node.originalText,
                quickTake: node.quickTake,
                difficulty: node.difficulty || "Medium",
                timeToRead: node.timeToRead || "10 min read",
                orderIndex: node.orderIndex,
                chapterId: createdChapter.id,
              },
            });

            // Create Node Flashcards
            if (node.flashcards && node.flashcards.length > 0) {
              await tx.flashcard.createMany({
                data: node.flashcards.map((f) => ({
                  nodeId: createdNode.id,
                  tag: f.tag || "General",
                  question: f.question,
                  answer: f.answer,
                })),
              });
            }

            // Create initial user progress
            const course = await tx.course.findUnique({
              where: { id: courseId },
            });
            if (course) {
              await tx.progress.create({
                data: {
                  userId: course.userId,
                  nodeId: createdNode.id,
                  status:
                    createdNode.orderIndex === 1 && chap.orderIndex === 1
                      ? "available"
                      : "locked",
                },
              });
            }
          }
        }
      });

      // Update document to completed
      await this.prisma.document.update({
        where: { id: docId },
        data: { status: "completed" },
      });

      this.logger.log(
        `Document processing completed successfully for: ${docId}`,
      );
      this.clearReadCaches();

      // Kicks off podcast audio synthesis in the background for each concept node
      this.generatePodcastsForCourseNodes(courseId);
    } catch (err) {
      this.logger.error(
        `Document processing failed for document: ${docId}. Error: ${err.message}`,
      );
      await this.prisma.document.update({
        where: { id: docId },
        data: { status: "failed" },
      });
      this.documentsCache.clear();
      this.coursesCache.clear();
    }
  }

  private async generatePodcastsForCourseNodes(courseId: string) {
    try {
      const nodes = await this.prisma.conceptNode.findMany({
        where: { chapter: { courseId } },
        include: { podcast: true },
      });

      for (const node of nodes) {
        if (node.podcast) continue; // Skip already generated podcasts

        // Generate podcast conversational script
        const script = await this.ai.generatePodcastScript(
          node.title,
          node.summary,
        );

        // Merge segments for speech input
        const mergedText = script.map((s) => s.text).join(" ");

        // Call TTS worker to generate physical WAV audio file
        const audioUrl = await this.tts.generateSpeech(mergedText, node.id);

        // Save podcast to database
        await this.prisma.podcast.create({
          data: {
            nodeId: node.id,
            audioUrl,
            transcript: script as any,
          },
        });
      }
    } catch (err) {
      this.logger.error(
        `Background course node podcast generation failed: ${err.message}`,
      );
    }
  }

  async getCourseJourney(courseId: string, userId: string) {
    const chapters = await this.prisma.chapter.findMany({
      where: { courseId },
      orderBy: { orderIndex: "asc" },
      include: {
        nodes: {
          orderBy: { orderIndex: "asc" },
          select: {
            id: true,
            title: true,
            summary: true,
            quickTake: true,
            orderIndex: true,
            difficulty: true,
            timeToRead: true,
            videoUrl: true,
            chapterId: true,
            lessonType: true,
            progress: {
              where: { userId },
              select: {
                id: true,
                status: true,
                lessonCompleted: true,
                flashcardCompleted: true,
                podcastCompleted: true,
                quizCompleted: true,
                activeComponentId: true,
                currentComponentIndex: true,
                completedComponentIds: true,
                componentResults: true,
              },
            },
            _count: { select: { flashcards: true } },
          },
        },
      },
    });

    if (!chapters) throw new NotFoundException("Course journey not found");
    return chapters;
  }

  async getNodeDetails(nodeId: string, userId: string) {
    const node = await this.prisma.conceptNode.findUnique({
      where: { id: nodeId },
      include: {
        podcast: true,
        flashcards: true,
        progress: { where: { userId } },
        chapter: { include: { course: { include: { documents: true } } } },
        warmups: true, // INCLUDE WARMUPS
      },
    });

    if (!node) throw new NotFoundException("Concept node not found");
    return node;
  }

  async getNodeCore(nodeId: string, userId: string) {
    const node = await this.prisma.conceptNode.findUnique({
      where: { id: nodeId },
      select: {
        id: true,
        title: true,
        difficulty: true,
        timeToRead: true,
        videoUrl: true,
        orderIndex: true,
        chapterId: true,
        lessonType: true,
        progress: {
          where: { userId },
          select: {
            id: true,
            status: true,
            lessonCompleted: true,
            flashcardCompleted: true,
            podcastCompleted: true,
            quizCompleted: true,
            activeComponentId: true,
            currentComponentIndex: true,
            completedComponentIds: true,
            componentResults: true,
          },
        },
      },
    });
    if (!node) throw new NotFoundException("Concept node not found");
    return node;
  }

  async completeNode(nodeId: string, userId: string) {
    // 1. Get the current node with its chapter
    const currentNode = await this.prisma.conceptNode.findUnique({
      where: { id: nodeId },
      include: { chapter: true },
    });
    if (!currentNode) throw new NotFoundException("Concept node not found");

    // 2. Mark progress of current node as completed
    const updateData = {
      status: "completed",
      lessonCompleted: true,
      quizCompleted: true,
    };

    await this.prisma.progress.upsert({
      where: { userId_nodeId: { userId, nodeId } },
      update: updateData,
      create: {
        userId,
        nodeId,
        ...updateData,
      },
    });

    // 3. Find the next node in the course
    let nextNode = null;

    // Try to find next node in the same chapter
    nextNode = await this.prisma.conceptNode.findFirst({
      where: {
        chapterId: currentNode.chapterId,
        orderIndex: { gt: currentNode.orderIndex },
      },
      orderBy: { orderIndex: "asc" },
    });

    // If not found in the same chapter, look in the next chapter
    if (!nextNode) {
      const nextChapter = await this.prisma.chapter.findFirst({
        where: {
          courseId: currentNode.chapter.courseId,
          orderIndex: { gt: currentNode.chapter.orderIndex },
        },
        orderBy: { orderIndex: "asc" },
      });

      if (nextChapter) {
        nextNode = await this.prisma.conceptNode.findFirst({
          where: { chapterId: nextChapter.id },
          orderBy: { orderIndex: "asc" },
        });
      }
    }

    // 4. If next node is found, unlock it (set progress status to 'available')
    if (nextNode) {
      const nextProgress = await this.prisma.progress.findFirst({
        where: { userId, nodeId: nextNode.id },
      });

      // Only unlock if it is currently locked or has no progress record
      if (!nextProgress || nextProgress.status === "locked") {
        await this.prisma.progress.upsert({
          where: { userId_nodeId: { userId, nodeId: nextNode.id } },
          update: { status: "available" },
          create: {
            userId,
            nodeId: nextNode.id,
            status: "available",
          },
        });
      }
    }

    return {
      completedNodeId: nodeId,
      nextNodeId: nextNode ? nextNode.id : null,
      nextNodeTitle: nextNode ? nextNode.title : null,
    };
  }

  async updateNodeProgress(
    userId: string,
    nodeId: string,
    status?: string,
    lessonCompleted?: boolean,
    flashcardCompleted?: boolean,
    podcastCompleted?: boolean,
    quizCompleted?: boolean,
  ) {
    const existing = await this.prisma.progress.findUnique({
      where: { userId_nodeId: { userId, nodeId } },
      select: {
        lessonCompleted: true,
        quizCompleted: true,
        status: true,
      },
    });

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (lessonCompleted !== undefined)
      updateData.lessonCompleted = lessonCompleted;
    if (flashcardCompleted !== undefined)
      updateData.flashcardCompleted = flashcardCompleted;
    if (podcastCompleted !== undefined)
      updateData.podcastCompleted = podcastCompleted;
    if (quizCompleted !== undefined) updateData.quizCompleted = quizCompleted;

    const finalLesson =
      lessonCompleted !== undefined
        ? lessonCompleted
        : existing
          ? existing.lessonCompleted
          : false;
    const finalQuiz =
      quizCompleted !== undefined
        ? quizCompleted
        : existing
          ? existing.quizCompleted
          : false;

    if (finalLesson && finalQuiz) {
      updateData.status = "completed";
    } else if (
      status === undefined &&
      existing &&
      existing.status !== "completed"
    ) {
      updateData.status = "in_progress";
    }

    return this.prisma.progress.upsert({
      where: { userId_nodeId: { userId, nodeId } },
      update: updateData,
      create: {
        userId,
        nodeId,
        status: updateData.status || "available",
        lessonCompleted: lessonCompleted || false,
        flashcardCompleted: flashcardCompleted || false,
        podcastCompleted: podcastCompleted || false,
        quizCompleted: quizCompleted || false,
      },
    });
  }

  // ==================== NEW CRUD METHODS FOR ADMIN ====================

  async getCourseById(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        documents: true,
        chapters: {
          include: {
            nodes: true,
          },
        },
      },
    });
    if (!course) throw new NotFoundException("Course not found");
    return course;
  }

  async updateCourse(id: string, title?: string, description?: string) {
    await this.getCourseById(id);
    const course = await this.prisma.course.update({
      where: { id },
      data: {
        title,
        description,
      },
    });
    this.coursesCache.clear();
    return course;
  }

  async deleteCourse(id: string) {
    const course = await this.getCourseById(id);

    // Cascade delete related entities
    const deleted = await this.prisma.$transaction(async (tx) => {
      // 1. Get all chapters in the course
      const chapters = await tx.chapter.findMany({ where: { courseId: id } });
      const chapterIds = chapters.map((c) => c.id);

      // 2. Get all nodes in these chapters
      const nodes = await tx.conceptNode.findMany({
        where: { chapterId: { in: chapterIds } },
      });
      const nodeIds = nodes.map((n) => n.id);

      // 3. Delete related reviews, flashcards, progress, podcast, debate
      await tx.flashcardReview.deleteMany({
        where: { flashcard: { nodeId: { in: nodeIds } } },
      });
      await tx.flashcard.deleteMany({ where: { nodeId: { in: nodeIds } } });
      await tx.progress.deleteMany({ where: { nodeId: { in: nodeIds } } });
      await tx.podcast.deleteMany({ where: { nodeId: { in: nodeIds } } });
      await tx.debate.deleteMany({ where: { nodeId: { in: nodeIds } } });

      // 4. Delete nodes and chapters
      await tx.conceptNode.deleteMany({
        where: { chapterId: { in: chapterIds } },
      });
      await tx.chapter.deleteMany({ where: { courseId: id } });
      await tx.document.deleteMany({ where: { courseId: id } });

      // 5. Delete course itself
      return tx.course.delete({ where: { id } });
    });
    this.clearReadCaches();
    return deleted;
  }

  async createChapter(
    title: string,
    orderIndex: number,
    courseId: string,
    parentChapterId?: string,
  ) {
    // Verify course exists
    await this.getCourseById(courseId);
    const chapter = await this.prisma.chapter.create({
      data: {
        title,
        orderIndex,
        courseId,
        parentChapterId: parentChapterId || null,
      },
    });
    this.coursesCache.clear();
    return chapter;
  }

  async getChapters(courseId?: string) {
    return this.prisma.chapter.findMany({
      where: courseId ? { courseId } : undefined,
      orderBy: { orderIndex: "asc" },
      include: {
        _count: { select: { nodes: true } },
      },
    });
  }

  async getChapterById(id: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id },
      include: { nodes: true },
    });
    if (!chapter) throw new NotFoundException("Chapter not found");
    return chapter;
  }

  async updateChapter(
    id: string,
    title?: string,
    orderIndex?: number,
    parentChapterId?: string,
  ) {
    await this.getChapterById(id);
    const chapter = await this.prisma.chapter.update({
      where: { id },
      data: {
        title,
        orderIndex,
        parentChapterId:
          parentChapterId !== undefined ? parentChapterId || null : undefined,
      },
    });
    this.coursesCache.clear();
    return chapter;
  }

  async deleteChapter(id: string) {
    await this.getChapterById(id);

    const chapter = await this.prisma.$transaction(async (tx) => {
      const nodes = await tx.conceptNode.findMany({ where: { chapterId: id } });
      const nodeIds = nodes.map((n) => n.id);

      await tx.flashcardReview.deleteMany({
        where: { flashcard: { nodeId: { in: nodeIds } } },
      });
      await tx.flashcard.deleteMany({ where: { nodeId: { in: nodeIds } } });
      await tx.progress.deleteMany({ where: { nodeId: { in: nodeIds } } });
      await tx.podcast.deleteMany({ where: { nodeId: { in: nodeIds } } });
      await tx.debate.deleteMany({ where: { nodeId: { in: nodeIds } } });

      await tx.conceptNode.deleteMany({ where: { chapterId: id } });
      return tx.chapter.delete({ where: { id } });
    });
    this.clearReadCaches();
    return chapter;
  }

  async createNode(dto: any) {
    await this.getChapterById(dto.chapterId);
    const lessonFlow = dto.lessonFlow || this.buildDefaultLessonFlow(dto);
    NodeSchemaValidator.validateNode(lessonFlow);
    const node = await this.prisma.conceptNode.create({
      data: {
        title: dto.title,
        summary: dto.summary,
        originalText: dto.originalText,
        quickTake: dto.quickTake,
        difficulty: dto.difficulty || "Medium",
        timeToRead: dto.timeToRead || "10 min read",
        videoUrl: dto.videoUrl || null,
        orderIndex: dto.orderIndex,
        chapterId: dto.chapterId,
        lessonType: "flow",
        lessonFlow: lessonFlow as any,
      },
    });
    this.coursesCache.clear();
    return node;
  }

  async getNodes(chapterId?: string) {
    return this.prisma.conceptNode.findMany({
      where: chapterId ? { chapterId } : undefined,
      orderBy: { orderIndex: "asc" },
      include: {
        chapter: {
          select: { title: true, courseId: true },
        },
      },
    });
  }

  async updateNode(nodeId: string, dto: any) {
    await this.getNodeDetails(nodeId, "admin-user");
    if (dto.lessonFlow !== undefined) {
      NodeSchemaValidator.validateNode(dto.lessonFlow);
    }
    const node = await this.prisma.conceptNode.update({
      where: { id: nodeId },
      data: {
        title: dto.title,
        summary: dto.summary,
        originalText: dto.originalText,
        quickTake: dto.quickTake,
        difficulty: dto.difficulty,
        timeToRead: dto.timeToRead,
        videoUrl: dto.videoUrl !== undefined ? dto.videoUrl : undefined,
        orderIndex: dto.orderIndex,
        lessonType: "flow",
        lessonFlow:
          dto.lessonFlow !== undefined ? (dto.lessonFlow as any) : undefined,
      },
    });
    this.coursesCache.clear();
    return node;
  }

  private buildDefaultLessonFlow(dto: any) {
    const flow: any[] = [];

    if (dto.videoUrl) {
      flow.push({
        id: "lesson-video",
        type: "media",
        title: "Video nhập môn",
        config: {
          mediaType: "video",
          url: dto.videoUrl,
          title: dto.title,
        },
        completionRule: { type: "viewed" },
      });
    }

    flow.push({
      id: "main-reading",
      type: "markdown",
      title: dto.title || "Nội dung bài học",
      config: {
        content:
          dto.originalText ||
          dto.summary ||
          "Nội dung bài học đang được cập nhật.",
      },
      completionRule: { type: "viewed" },
    });

    flow.push({
      id: "final-summary",
      type: "final_summary",
      title: "Đúc kết bài học",
      config: {
        message: dto.quickTake || dto.summary || "Hoàn thành bài học.",
        keyTakeaways: [
          dto.summary ||
            dto.quickTake ||
            "Nắm được nội dung trọng tâm của bài học.",
        ],
        rewards: { xp: 80, badge: "Hoàn thành bài học" },
      },
      completionRule: { type: "viewed" },
    });

    return flow;
  }

  async updateComponentProgress(
    userId: string,
    nodeId: string,
    activeComponentId?: string,
    currentComponentIndex?: number,
    completedComponentIds?: string[],
    componentResult?: any,
  ) {
    const existing = await this.prisma.progress.findUnique({
      where: { userId_nodeId: { userId, nodeId } },
      select: {
        status: true,
        componentResults: true,
      },
    });

    const previousResults = Array.isArray(existing?.componentResults)
      ? (existing?.componentResults as any[])
      : [];
    const nextResults = componentResult
      ? [
          ...previousResults.filter(
            (result) => result.componentId !== componentResult.componentId,
          ),
          {
            ...componentResult,
            completedAt:
              componentResult.completedAt || new Date().toISOString(),
          },
        ]
      : previousResults;

    const updateData: any = {
      status: existing?.status === "completed" ? "completed" : "in_progress",
    };
    if (activeComponentId !== undefined)
      updateData.activeComponentId = activeComponentId;
    if (currentComponentIndex !== undefined)
      updateData.currentComponentIndex = currentComponentIndex;
    if (completedComponentIds !== undefined)
      updateData.completedComponentIds = completedComponentIds as any;
    if (componentResult !== undefined)
      updateData.componentResults = nextResults as any;

    return this.prisma.progress.upsert({
      where: { userId_nodeId: { userId, nodeId } },
      update: updateData,
      create: {
        userId,
        nodeId,
        status: "in_progress",
        activeComponentId: activeComponentId || null,
        currentComponentIndex: currentComponentIndex || 0,
        completedComponentIds: (completedComponentIds || []) as any,
        componentResults: nextResults as any,
      },
    });
  }

  async deleteNode(nodeId: string) {
    await this.getNodeDetails(nodeId, "admin-user");

    const node = await this.prisma.$transaction(async (tx) => {
      await tx.flashcardReview.deleteMany({ where: { flashcard: { nodeId } } });
      await tx.flashcard.deleteMany({ where: { nodeId } });
      await tx.progress.deleteMany({ where: { nodeId } });
      await tx.podcast.deleteMany({ where: { nodeId } });
      await tx.debate.deleteMany({ where: { nodeId } });
      await tx.warmup.deleteMany({ where: { nodeId } }); // Cascade delete warmups

      return tx.conceptNode.delete({ where: { id: nodeId } });
    });
    this.clearReadCaches();
    return node;
  }

  // ==================== NEW PODCAST CRUD METHODS FOR ADMIN ====================

  async getPodcasts() {
    return this.prisma.podcast.findMany({
      include: {
        node: {
          select: { title: true, chapterId: true },
        },
      },
    });
  }

  async getPodcastById(id: string) {
    const podcast = await this.prisma.podcast.findUnique({
      where: { id },
      include: { node: true },
    });
    if (!podcast) throw new NotFoundException("Podcast not found");
    return podcast;
  }

  async createPodcast(dto: any) {
    await this.getNodeDetails(dto.nodeId, "admin-user");
    const podcast = await this.prisma.podcast.create({
      data: {
        nodeId: dto.nodeId,
        audioUrl: dto.audioUrl,
        transcript: dto.transcript,
      },
    });
    this.coursesCache.clear();
    return podcast;
  }

  async updatePodcast(id: string, dto: any) {
    await this.getPodcastById(id);
    const data: any = {};
    if (dto.audioUrl !== undefined) data.audioUrl = dto.audioUrl;
    if (dto.transcript !== undefined) data.transcript = dto.transcript;

    const podcast = await this.prisma.podcast.update({
      where: { id },
      data,
    });
    this.coursesCache.clear();
    return podcast;
  }

  async deletePodcast(id: string) {
    await this.getPodcastById(id);
    const podcast = await this.prisma.podcast.delete({
      where: { id },
    });
    this.coursesCache.clear();
    return podcast;
  }

  async synthesizePodcast(nodeId: string, scriptText: string) {
    const audioUrl = await this.tts.generateSpeech(scriptText, nodeId);
    return {
      audioUrl,
      transcript: [{ time: 0, speaker: "Host", text: scriptText }],
    };
  }

  // ==================== WARMUPS ====================

  async createWarmup(nodeId: string, dto: any) {
    const warmup = await this.prisma.warmup.create({
      data: {
        nodeId,
        type: dto.type,
        title: dto.title,
        image: dto.image || null,
        blanks: dto.blanks || null,
        answer: dto.answer || null,
        story: dto.story || null,
        question: dto.question || null,
        options: dto.options ? (dto.options as any) : null,
        correctIndex:
          dto.correctIndex !== undefined
            ? parseInt(dto.correctIndex, 10)
            : null,
        reveal: dto.reveal,
      },
    });
    this.warmupsCache.deletePrefix(`warmups:${nodeId}`);
    return warmup;
  }

  async getWarmups(nodeId: string) {
    return this.warmupsCache.getOrSet(`warmups:${nodeId}`, 60000, () =>
      this.prisma.warmup.findMany({
        where: { nodeId },
      }),
    );
  }

  async deleteWarmup(id: string) {
    const warmup = await this.prisma.warmup.delete({
      where: { id },
    });
    this.warmupsCache.clear();
    return warmup;
  }

  // ==================== DISCUSSIONS / COMMENTS ====================

  async createComment(
    nodeId: string,
    userId: string,
    content: string,
    role = "student",
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    const userName = user ? user.name || user.email.split("@")[0] : "Học viên";

    return this.prisma.comment.create({
      data: {
        nodeId,
        userId,
        userName,
        content,
        role,
      },
    });
  }

  async getComments(nodeId: string) {
    return this.prisma.comment.findMany({
      where: { nodeId },
      orderBy: { createdAt: "asc" },
    });
  }

  // ==================== BUCKET FILE UPLOADER ====================

  async saveUploadedFile(
    originalname: string,
    buffer: Buffer,
    mimetype: string,
  ) {
    // Save to public/uploads directory relative to root workspace
    // Since __dirname is in dist/src/courses, we navigate to the root directory
    const rootDir = path.resolve(__dirname, "..", "..", "..");
    const publicDir = path.join(rootDir, "public");
    const uploadDir = path.join(publicDir, "uploads");

    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueId = randomUUID();
    const ext = path.extname(originalname);
    const uniqueFilename = `${uniqueId}${ext}`;
    const filePath = path.join(uploadDir, uniqueFilename);

    fs.writeFileSync(filePath, buffer);

    // Return relative URL for static asset server as default fallback
    let publicUrl = `/public/uploads/${uniqueFilename}`;

    // Attempt Supabase upload if Supabase client is initialized
    try {
      const bucket = mimetype.startsWith("audio/") ? "podcasts" : "documents";
      const supabaseUrl = await this.supabase.uploadFile(
        bucket,
        uniqueFilename,
        buffer,
        mimetype,
      );
      if (
        supabaseUrl &&
        !supabaseUrl.includes("philomind-mock-storage.local")
      ) {
        publicUrl = supabaseUrl;
        this.logger.log(
          `File uploaded to Supabase Storage bucket [${bucket}] -> Public URL: ${publicUrl}`,
        );
      }
    } catch (err) {
      this.logger.error(
        `Failed to upload to Supabase storage bucket: ${err.message}. Using local storage fallback.`,
      );
    }

    return {
      url: publicUrl,
      fileName: originalname,
      mimetype,
    };
  }

  // ==================== PDF REFERENCE DOCUMENTS CRUD ====================

  async createDocument(
    courseId: string,
    fileName: string,
    fileUrl: string,
    status = "completed",
    title?: string,
    description?: string,
  ) {
    const document = await this.prisma.document.create({
      data: {
        courseId,
        fileName,
        fileUrl,
        status,
        title: title || null,
        description: description || null,
      },
    });
    this.documentsCache.clear();
    this.coursesCache.clear();
    return document;
  }

  async listDocuments(courseId?: string) {
    return this.documentsCache.getOrSet(
      `documents:${courseId || "all"}`,
      60000,
      () => {
        if (courseId) {
          return this.prisma.document.findMany({
            where: { courseId },
            orderBy: { fileName: "asc" },
          });
        }
        return this.prisma.document.findMany({
          orderBy: { fileName: "asc" },
        });
      },
    );
  }

  async deleteDocument(id: string) {
    const document = await this.prisma.document.findUnique({ where: { id } });
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    // Try deleting from local disk if it's a local file
    if (document.fileUrl.startsWith("/public/uploads/")) {
      try {
        const rootDir = path.resolve(__dirname, "..", "..", "..");
        const localPath = path.join(
          rootDir,
          "public",
          "uploads",
          path.basename(document.fileUrl),
        );
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
        }
      } catch (err) {
        this.logger.error(
          `Failed to delete local document file: ${err.message}`,
        );
      }
    }

    const deleted = await this.prisma.document.delete({ where: { id } });
    this.documentsCache.clear();
    this.coursesCache.clear();
    return deleted;
  }
}
