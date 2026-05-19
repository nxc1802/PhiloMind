import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AIService } from '../ai/ai.service';
import { TTSService } from '../tts/tts.service';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(
    private prisma: PrismaService,
    private ai: AIService,
    private tts: TTSService,
  ) {}

  async createCourse(userId: string, title: string, description?: string) {
    return this.prisma.course.create({
      data: {
        title,
        description,
        userId,
      },
    });
  }

  async getCourses(userId: string) {
    return this.prisma.course.findMany({
      where: { userId },
      include: {
        documents: true,
        _count: {
          select: { chapters: true },
        },
      },
    });
  }

  /**
   * PDF Document Parser: extracts chapters, concept nodes, and triggers background podcast audio generation.
   */
  async processDocumentUpload(courseId: string, fileName: string, fileContent: string) {
    this.logger.log(`Parsing uploaded document: ${fileName} for course: ${courseId}...`);
    
    // Create document record
    const document = await this.prisma.document.create({
      data: {
        fileName,
        fileUrl: `https://mock-bucket.local/${courseId}/${fileName}`,
        courseId,
        status: 'parsing',
      },
    });

    // Run AI structured parse asynchronously to avoid blocking main thread
    this.extractStructureInBackground(courseId, document.id, fileContent);

    return document;
  }

  private async extractStructureInBackground(courseId: string, docId: string, content: string) {
    try {
      const parsedData = await this.ai.extractCourseStructure(courseId, content);
      
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
                difficulty: node.difficulty || 'Medium',
                timeToRead: node.timeToRead || '10 min read',
                orderIndex: node.orderIndex,
                chapterId: createdChapter.id,
              },
            });

            // Create Node Flashcards
            if (node.flashcards && node.flashcards.length > 0) {
              await tx.flashcard.createMany({
                data: node.flashcards.map((f) => ({
                  nodeId: createdNode.id,
                  tag: f.tag || 'General',
                  question: f.question,
                  answer: f.answer,
                })),
              });
            }

            // Create initial user progress
            const course = await tx.course.findUnique({ where: { id: courseId } });
            if (course) {
              await tx.progress.create({
                data: {
                  userId: course.userId,
                  nodeId: createdNode.id,
                  status: createdNode.orderIndex === 1 && chap.orderIndex === 1 ? 'available' : 'locked',
                },
              });
            }
          }
        }
      });

      // Update document to completed
      await this.prisma.document.update({
        where: { id: docId },
        data: { status: 'completed' },
      });

      this.logger.log(`Document processing completed successfully for: ${docId}`);

      // Kicks off podcast audio synthesis in the background for each concept node
      this.generatePodcastsForCourseNodes(courseId);

    } catch (err) {
      this.logger.error(`Document processing failed for document: ${docId}. Error: ${err.message}`);
      await this.prisma.document.update({
        where: { id: docId },
        data: { status: 'failed' },
      });
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
        const script = await this.ai.generatePodcastScript(node.title, node.summary);
        
        // Merge segments for speech input
        const mergedText = script.map((s) => s.text).join(' ');
        
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
      this.logger.error(`Background course node podcast generation failed: ${err.message}`);
    }
  }

  async getCourseJourney(courseId: string, userId: string) {
    const chapters = await this.prisma.chapter.findMany({
      where: { courseId },
      orderBy: { orderIndex: 'asc' },
      include: {
        nodes: {
          orderBy: { orderIndex: 'asc' },
          include: {
            progress: { where: { userId } },
            _count: { select: { flashcards: true } },
          },
        },
      },
    });

    if (!chapters) throw new NotFoundException('Course journey not found');
    return chapters;
  }

  async getNodeDetails(nodeId: string, userId: string) {
    const node = await this.prisma.conceptNode.findUnique({
      where: { id: nodeId },
      include: {
        podcast: true,
        flashcards: true,
        progress: { where: { userId } },
        chapter: { include: { course: true } },
      },
    });

    if (!node) throw new NotFoundException('Concept node not found');
    return node;
  }

  async updateNodeProgress(userId: string, nodeId: string, status: string) {
    const existing = await this.prisma.progress.findFirst({
      where: { userId, nodeId },
    });

    if (existing) {
      return this.prisma.progress.update({
        where: { id: existing.id },
        data: { status },
      });
    }

    return this.prisma.progress.create({
      data: {
        userId,
        nodeId,
        status,
      },
    });
  }
}
