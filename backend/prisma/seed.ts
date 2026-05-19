import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PhiloMind philosophy sanctuary database...');

  const userId = 'default-user-id';

  // 1. Upsert Default User
  const user = await prisma.user.upsert({
    where: { id: userId },
    update: { streak: 3 },
    create: {
      id: userId,
      email: 'student@philomind.local',
      streak: 3,
    },
  });
  console.log(`User created or verified: ${user.email}`);

  // 2. Create Existentialism Course Workspace
  const course = await prisma.course.create({
    data: {
      title: 'Existentialism & Absolute Freedom',
      description: 'Master Sartre, Camus, and absolute responsibility through modern structured roadmaps.',
      userId: user.id,
    },
  });
  console.log(`Course created: "${course.title}" (${course.id})`);

  // 3. Create Chapter 1: Core Axioms
  const chapter1 = await prisma.chapter.create({
    data: {
      title: 'Introduction to Existentialist Principles',
      orderIndex: 1,
      courseId: course.id,
    },
  });

  // 3a. Node: Absurdism
  const nodeAbsurdism = await prisma.conceptNode.create({
    data: {
      title: 'Absurdism',
      summary: "Albert Camus argued that human beings have an innate desire for meaning, order, and purpose in life. However, the universe is cold, silent, and fundamentally devoid of any objective meaning. The clash between our search for meaning and the silent universe is 'The Absurd'.",
      originalText: 'The Absurd is born of this confrontation between the human need and the unreasonable silence of the world. - Albert Camus',
      quickTake: 'The confrontation between human need and the silent universe.',
      difficulty: 'Medium',
      timeToRead: '8 min read',
      orderIndex: 1,
      chapterId: chapter1.id,
    },
  });

  // Seed Flashcard for Absurdism
  await prisma.flashcard.create({
    data: {
      nodeId: nodeAbsurdism.id,
      tag: 'Absurdism',
      question: "According to Camus, how should one respond to 'The Absurd'?",
      answer: 'Camus rejects suicide and dogmatic beliefs. He advocates for revolt: accepting absurdity while living with active defiance, passion, and freedom.',
    },
  });

  // Seed Podcast for Absurdism
  await prisma.podcast.create({
    data: {
      nodeId: nodeAbsurdism.id,
      audioUrl: 'https://mock-bucket.local/podcasts/absurdism.wav',
      transcript: [
        { speaker: 'Host', text: "Welcome back to PhiloMind Podcasts. Today, we're diving into Albert Camus' core principle." },
        { speaker: 'Host', text: 'When Camus describes the "Absurd", is it just about things being funny or silly?' },
        { speaker: 'Guest', text: 'Not at all. In philosophy, the absurd is a tragic tension. It is the clash between our desperate search for purpose and a cold, silent universe.' },
        { speaker: 'Host', text: 'So, how do we cope? Do we just give up or accept defeat?' },
        { speaker: 'Guest', text: 'Camus says no! He rejects suicide. Instead, he advocates for revolt: embracing the absurdity with passion, rebellion, and absolute freedom.' }
      ] as any,
    },
  });

  // Seed Initial Progress for Absurdism
  await prisma.progress.create({
    data: {
      userId: user.id,
      nodeId: nodeAbsurdism.id,
      status: 'available',
    },
  });

  // 3b. Node: Facticity
  const nodeFacticity = await prisma.conceptNode.create({
    data: {
      title: 'Facticity',
      summary: "In Sartre's existential ontology, facticity represents the rigid, objective facts of our past and physical limits. It includes your birth year, your height, your genetics, and choices you have already committed.",
      originalText: 'Facticity is the given context within which human freedom must operate, representing reality against absolute freedom. - Jean-Paul Sartre',
      quickTake: 'The unchangeable given context of your physical existence.',
      difficulty: 'Medium',
      timeToRead: '10 min read',
      orderIndex: 2,
      chapterId: chapter1.id,
    },
  });

  // Seed Flashcard for Facticity
  await prisma.flashcard.create({
    data: {
      nodeId: nodeFacticity.id,
      tag: 'Existentialism',
      question: "What is Sartre's 'Facticity'?",
      answer: "Facticity refers to objective facts of a person's life they cannot change (genetics, history, environment) which serve as the canvas for freedom.",
    },
  });

  // Seed Podcast for Facticity
  await prisma.podcast.create({
    data: {
      nodeId: nodeFacticity.id,
      audioUrl: 'https://mock-bucket.local/podcasts/facticity.wav',
      transcript: [
        { speaker: 'Host', text: "Today we're talking about Jean-Paul Sartre's concept of Facticity. What exactly is it?" },
        { speaker: 'Guest', text: "Facticity refers to the parameters of our lives we cannot choose: where we are born, our genetics, our history." },
        { speaker: 'Host', text: "So, if these details are set in stone, aren't we limited? How is that freedom?" },
        { speaker: 'Guest', text: "Sartre argues that facticity is not a cage, but the canvas. Freedom only makes sense if there are circumstances to react against." }
      ] as any,
    },
  });

  // Seed Progress for Facticity
  await prisma.progress.create({
    data: {
      userId: user.id,
      nodeId: nodeFacticity.id,
      status: 'locked',
    },
  });

  // 4. Create Chapter 2: The Burden of Freedom
  const chapter2 = await prisma.chapter.create({
    data: {
      title: 'The Burden of Absolute Freedom',
      orderIndex: 2,
      courseId: course.id,
    },
  });

  // 4a. Node: Radical Freedom
  const nodeFreedom = await prisma.conceptNode.create({
    data: {
      title: 'Radical Freedom',
      summary: 'Sartre argues that human beings simply exist first, and then we define ourselves through our choices and actions. There is no predetermined human nature, no divine plan, and no excuses.',
      originalText: 'Existence precedes essence. Man is condemned to be free; because once thrown into the world, he is responsible for everything he does. - Jean-Paul Sartre',
      quickTake: 'Existence precedes essence. We are condemned to be free.',
      difficulty: 'Hard',
      timeToRead: '12 min read',
      orderIndex: 1,
      chapterId: chapter2.id,
    },
  });

  // Seed Flashcard for Radical Freedom
  const flashcardFreedom = await prisma.flashcard.create({
    data: {
      nodeId: nodeFreedom.id,
      tag: 'Existentialism',
      question: "What does the phrase 'Existence precedes essence' mean?",
      answer: 'It means humans are not born with a predefined purpose (essence). We exist first and must define our meaning through our active choices.',
    },
  });

  // Seed spaced repetition item review schedule
  await prisma.flashcardReview.create({
    data: {
      flashcardId: flashcardFreedom.id,
      userId: user.id,
      ease: 3,
      interval: 1,
      nextReview: new Date(Date.now() - 3600 * 1000 * 24), // Set due 1 day ago to trigger spaced repetitions UI immediately
    },
  });

  // Seed Podcast for Radical Freedom
  await prisma.podcast.create({
    data: {
      nodeId: nodeFreedom.id,
      audioUrl: 'https://mock-bucket.local/podcasts/radical-freedom.wav',
      transcript: [
        { speaker: 'Host', text: "Let's unpack 'existence precedes essence'. That sounds heavy." },
        { speaker: 'Guest', text: "It means we aren't born with a destiny. We are a blank slate. We must build ourselves action by action." },
        { speaker: 'Host', text: "So there is absolutely no escape from choice? Even if I choose to let others decide?" },
        { speaker: 'Guest', text: "Exactly. Sartre says we are 'condemned' to be free. Even choosing passivity is a choice you remain responsible for." }
      ] as any,
    },
  });

  // Seed Progress for Radical Freedom
  await prisma.progress.create({
    data: {
      userId: user.id,
      nodeId: nodeFreedom.id,
      status: 'locked',
    },
  });

  console.log('Database seeded successfully with Existentialist learning modules!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
