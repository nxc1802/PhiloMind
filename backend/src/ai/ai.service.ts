import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private openai: OpenAI;
  private defaultModel: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY || 'dummy-key';
    const baseURL = process.env.OPENAI_API_BASE_URL || 'https://openrouter.ai/api/v1';
    this.defaultModel = process.env.LLM_MODEL || 'meta-llama/llama-3-70b-instruct:free';

    this.openai = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL,
      defaultHeaders: {
        'HTTP-Referer': 'https://philomind.vercel.app',
        'X-Title': 'PhiloMind Philosophy Sanctuary',
      },
    });
  }

  /**
   * Challenge the user's philosophical claims using the Socratic method
   */
  async getSocraticDebateReply(
    conceptTitle: string,
    userQuery: string,
    chatHistory: { role: 'user' | 'assistant'; content: string }[],
  ): Promise<string> {
    try {
      if (process.env.OPENAI_API_KEY === 'dummy-key' || !process.env.OPENAI_API_KEY) {
        return this.getMockDebateResponse(userQuery);
      }

      const systemPrompt = `You are a Socratic tutor on the topic of "${conceptTitle}". 
Your goal is not to lecture the user, but to guide them to deeper insights through critical questions. 
Challenge their assumptions gently. Avoid massive text blocks. Ask exactly one focused question at the end.`;

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...chatHistory.map((h) => ({ role: h.role, content: h.content })),
        { role: 'user', content: userQuery },
      ];

      const completion = await this.openai.chat.completions.create({
        model: this.defaultModel,
        messages,
        temperature: 0.7,
        max_tokens: 400,
      });

      return completion.choices[0]?.message?.content || 'Let us reflect deeper on this matter.';
    } catch (error) {
      this.logger.error(`Socratic debate AI completion failed: ${error.message}`);
      return this.getMockDebateResponse(userQuery);
    }
  }

  /**
   * Generates a structural roadmap from educational text
   */
  async extractCourseStructure(
    courseTitle: string,
    documentContent: string,
  ): Promise<any> {
    try {
      if (process.env.OPENAI_API_KEY === 'dummy-key' || !process.env.OPENAI_API_KEY) {
        return this.getMockCourseStructure(courseTitle);
      }

      const systemPrompt = `You are an educational AI designed to parse textbook chapters and concepts. 
Analyze the provided content and extract a clean JSON object containing chapters, concept nodes, and flashcards.
Format your response exactly as a JSON object of this structure:
{
  "title": "Course Title",
  "chapters": [
    {
      "title": "Chapter Title",
      "orderIndex": 1,
      "nodes": [
        {
          "title": "Concept Name",
          "summary": "Easy-to-understand explanation (max 5 lines)",
          "originalText": "Verbatim quote or excerpt representing academic context",
          "quickTake": "A short philosophical summary or quote",
          "difficulty": "Easy" | "Medium" | "Hard",
          "timeToRead": "X min read",
          "orderIndex": 1,
          "flashcards": [
            {
              "tag": "CategoryTag",
              "question": "Concept review question?",
              "answer": "Accurate, concise explanation."
            }
          ]
        }
      ]
    }
  ]
}`;

      const completion = await this.openai.chat.completions.create({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Extract course architecture for: "${courseTitle}". Document slice:\n\n${documentContent.substring(0, 12000)}` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      });

      const text = completion.choices[0]?.message?.content || '{}';
      return JSON.parse(text);
    } catch (error) {
      this.logger.error(`Structure extraction AI failure: ${error.message}`);
      return this.getMockCourseStructure(courseTitle);
    }
  }

  /**
   * Generates dialogue scripts for the podcast TTS worker
   */
  async generatePodcastScript(
    conceptTitle: string,
    summary: string,
  ): Promise<{ host: string; guest: string }[]> {
    try {
      if (process.env.OPENAI_API_KEY === 'dummy-key' || !process.env.OPENAI_API_KEY) {
        return this.getMockPodcastScript();
      }

      const systemPrompt = `You are a scriptwriter for educational philosophy podcasts. 
Given a concept title and summary, write a highly engaging 3-turn dialogue between an enthusiastic 'Host' and an insightful philosopher 'Guest'.
Output a JSON array of conversational segments with 'speaker' ("Host" or "Guest") and 'text' keys:
[
  {"speaker": "Host", "text": "Welcome to PhiloMind..."},
  {"speaker": "Guest", "text": "Good to be here..."},
  ...
]`;

      const completion = await this.openai.chat.completions.create({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Write a conversation script on: "${conceptTitle}". Context: ${summary}` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.6,
      });

      const responseText = completion.choices[0]?.message?.content || '{"script": []}';
      const parsed = JSON.parse(responseText);
      return parsed.script || parsed.dialogue || parsed || this.getMockPodcastScript();
    } catch (error) {
      this.logger.error(`Podcast script AI generation failed: ${error.message}`);
      return this.getMockPodcastScript();
    }
  }

  private getMockDebateResponse(query: string): string {
    const lower = query.toLowerCase();
    if (lower.includes('limit') || lower.includes('genes') || lower.includes('factor')) {
      return "An excellent point! Spinoza and modern neuroscientists argue that environmental factors and genetics dictate our responses. But Sartre would claim that realizing these predispositions gives you immediate freedom of choice. How does awareness of your context alter your choice?";
    }
    return "That is a fascinating objection. Let us examine this further. If we assume external circumstances shape us entirely, do we not eliminate ethical accountability? If you blame the storm, did you not still choose to abandon the ship? What is your perspective?";
  }

  private getMockPodcastScript(): { speaker: string; text: string }[] {
    return [
      { speaker: "Host", text: "Welcome back to PhiloMind Podcasts. Today, we're diving into Sartre's most famous paradox." },
      { speaker: "Host", text: "When Sartre says we are 'condemned to be free,' it sounds rather heavy, almost like a prison sentence. What does he mean?" },
      { speaker: "Guest", text: "Indeed, it is a heavy concept. The condemnation is simply the inescapable fact of it: you cannot choose not to choose." },
      { speaker: "Guest", text: "Even if you decide to remain silent, to withdraw, or to let someone else decide for you, that itself is an active choice you made." },
      { speaker: "Host", text: "So there is absolutely no cosmic escape from responsibility? No moral safety nets?" },
      { speaker: "Guest", text: "None whatsoever. There are no external values to blame. We are entirely the authors of our own destiny." }
    ];
  }

  private getMockCourseStructure(title: string): any {
    return {
      title: title || "Existentialism Journey",
      chapters: [
        {
          title: "Introduction to Existentialist Principles",
          orderIndex: 1,
          nodes: [
            {
              title: "Absurdism",
              summary: "Albert Camus argued that human beings have an innate desire for meaning, order, and purpose in life. However, the universe is cold, silent, and fundamentally devoid of any objective meaning. The clash between our search for meaning and the silent universe is 'The Absurd'.",
              originalText: "The Absurd is born of this confrontation between the human need and the unreasonable silence of the world. - Albert Camus",
              quickTake: "The confrontation between human need and the silent universe.",
              difficulty: "Medium",
              timeToRead: "8 min read",
              orderIndex: 1,
              flashcards: [
                {
                  tag: "Absurdism",
                  question: "According to Camus, how should one respond to 'The Absurd'?",
                  answer: "Camus rejects suicide and dogmatic beliefs. He advocates for revolt: accepting absurdity while living with active defiance, passion, and freedom."
                }
              ]
            },
            {
              title: "Facticity",
              summary: "In Sartre's existential ontology, facticity represents the rigid, objective facts of our past and physical limits. It includes your birth year, your height, your genetics, and choices you have already committed.",
              originalText: "Facticity is the given context within which human freedom must operate, representing reality against absolute freedom. - Jean-Paul Sartre",
              quickTake: "The unchangeable given context of your physical existence.",
              difficulty: "Medium",
              timeToRead: "10 min read",
              orderIndex: 2,
              flashcards: [
                {
                  tag: "Existentialism",
                  question: "What is Sartre's 'Facticity'?",
                  answer: "Facticity refers to objective facts of a person's life they cannot change (genetics, history, environment) which serve as the canvas for freedom."
                }
              ]
            }
          ]
        },
        {
          title: "The Burden of Absolute Freedom",
          orderIndex: 2,
          nodes: [
            {
              title: "Radical Freedom",
              summary: "Sartre argues that human beings simply exist first, and then we define ourselves through our choices and actions. There is no predetermined human nature, no divine plan, and no excuses.",
              originalText: "Existence precedes essence. Man is condemned to be free; because once thrown into the world, he is responsible for everything he does. - Jean-Paul Sartre",
              quickTake: "Existence precedes essence. We are condemned to be free.",
              difficulty: "Hard",
              timeToRead: "12 min read",
              orderIndex: 1,
              flashcards: [
                {
                  tag: "Existentialism",
                  question: "What does the phrase 'Existence precedes essence' mean?",
                  answer: "It means humans are not born with a predefined purpose (essence). We exist first and must define our meaning through our active choices."
                }
              ]
            }
          ]
        }
      ]
    };
  }
}
