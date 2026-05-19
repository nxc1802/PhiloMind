import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class FlashcardsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Retrieves flashcards due for review, or returns general course cards as fallback.
   */
  async getDueFlashcards(userId: string, courseId?: string) {
    const now = new Date();
    
    // Find reviewed cards that are due
    const reviewedDue = await this.prisma.flashcard.findMany({
      where: {
        node: courseId ? { chapter: { courseId } } : undefined,
        reviews: {
          some: {
            userId,
            nextReview: { lte: now },
          },
        },
      },
    });

    if (reviewedDue.length > 0) return reviewedDue;

    // Fallback: return cards that have never been reviewed yet
    return this.prisma.flashcard.findMany({
      where: {
        node: courseId ? { chapter: { courseId } } : undefined,
        reviews: {
          none: { userId },
        },
      },
      take: 10,
    });
  }

  /**
   * Adapted SM-2 Spaced Repetition calculation algorithm
   */
  async recordReviewScore(userId: string, flashcardId: string, ease: number) {
    // ease mapping: 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
    let interval = 1; // Default next review in days
    
    if (ease === 2) interval = 2; // Hard: review in 2 days
    else if (ease === 3) interval = 5; // Good: review in 5 days
    else if (ease === 4) interval = 10; // Easy: review in 10 days

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    // Track user review history
    const createdReview = await this.prisma.flashcardReview.create({
      data: {
        flashcardId,
        userId,
        ease,
        interval,
        nextReview: nextReviewDate,
      },
    });

    // Award user study streaks on successful reviews
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { streak: user.streak + 1 },
      });
    }

    return createdReview;
  }
}
