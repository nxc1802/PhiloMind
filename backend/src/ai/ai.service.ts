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

      const systemPrompt = `Bạn là một người hướng dẫn phản biện theo phương pháp Socratic về chủ đề "${conceptTitle}".
Mục tiêu của bạn không phải là thuyết giảng cho người dùng, mà là dẫn dắt họ đạt được những hiểu biết sâu sắc hơn thông qua các câu hỏi phản biện sắc bén và sâu sắc.
Hãy nhẹ nhàng thử thách các giả định của họ, sử dụng danh xưng "đồng chí" hoặc "bạn" một cách lịch sự, tri thức và mang tính học thuật. Tránh viết các khối văn bản quá lớn. Hãy luôn tranh luận bằng Tiếng Việt (Vietnamese) và đưa ra đúng một câu hỏi tập trung ở cuối phản hồi.`;

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

      return completion.choices[0]?.message?.content || 'Chúng ta hãy suy ngẫm sâu sắc hơn về vấn đề này.';
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
  ): Promise<{ speaker: string; text: string }[]> {
    try {
      if (process.env.OPENAI_API_KEY === 'dummy-key' || !process.env.OPENAI_API_KEY) {
        return this.getMockPodcastScript();
      }

      const systemPrompt = `You are a scriptwriter for educational philosophy podcasts. 
Given a concept title and summary, write a highly engaging 3-turn dialogue between an enthusiastic 'Host' and an insightful philosopher 'Guest'.
You MUST write the script dialogue in Vietnamese (Tiếng Việt) with high academic and educational quality.
Output a JSON array of conversational segments with 'speaker' ("Host" or "Guest") and 'text' keys:
[
  {"speaker": "Host", "text": "Chào mừng các bạn đến với PhiloMind..."},
  {"speaker": "Guest", "text": "Rất vui được thảo luận cùng đồng chí..."},
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
    if (lower.includes('limit') || lower.includes('genes') || lower.includes('factor') || lower.includes('giới hạn') || lower.includes('gen') || lower.includes('yếu tố')) {
      return "Một quan điểm xuất sắc! Spinoza và các nhà khoa học thần kinh hiện đại lập luận rằng các yếu tố môi trường và di truyền quyết định phản ứng của chúng ta. Nhưng Sartre sẽ cho rằng việc nhận thức được những khuynh hướng này mang lại cho đồng chí sự tự do lựa chọn ngay lập tức. Việc nhận thức được hoàn cảnh có thay đổi quyết định của đồng chí không?";
    }
    return "Đó là một phản biện rất thú vị. Chúng ta hãy xem xét điều này sâu hơn. Nếu giả định rằng các yếu tố bên ngoài định hình chúng ta hoàn toàn, liệu chúng ta có đang phủ nhận trách nhiệm đạo đức cá nhân không? Nếu đồng chí đổ lỗi cho cơn bão, chẳng phải chính đồng chí vẫn chọn từ bỏ con tàu đó sao? Quan điểm của đồng chí về vấn đề này thế nào?";
  }

  private getMockPodcastScript(): { speaker: string; text: string }[] {
    return [
      { speaker: "Host", text: "Chào mừng các đồng chí quay trở lại với PhiloMind Podcasts. Hôm nay, chúng ta sẽ đi sâu vào nghịch lý nổi tiếng nhất của triết gia Jean-Paul Sartre." },
      { speaker: "Host", text: "Khi Sartre nói con người 'bị kết án phải tự do', nghe có vẻ thật nặng nề, tựa như một bản án tù. Ý của ông ấy là gì thưa đồng chí khách mời?" },
      { speaker: "Guest", text: "Quả thực là một khái niệm rất sâu sắc. Sự kết án ở đây chính là sự thật không thể trốn chạy: đồng chí không thể lựa chọn việc không lựa chọn." },
      { speaker: "Guest", text: "Ngay cả khi đồng chí chọn im lặng, chọn rút lui hay để người khác quyết định thay mình, thì đó cũng chính là một lựa chọn chủ động mà đồng chí đã đưa ra." },
      { speaker: "Host", text: "Như vậy là hoàn toàn không có sự giải thoát nào khỏi trách nhiệm của bản thân sao? Không có tấm lưới an toàn đạo đức nào ư?" },
      { speaker: "Guest", text: "Hoàn toàn không có. Không có giá trị ngoại cảnh nào để đổ lỗi cả. Chúng ta chính là những tác giả duy nhất viết nên số phận của cuộc đời mình." }
    ];
  }

  private getMockCourseStructure(title: string): any {
    return {
      title: title || "Hành trình Hiện sinh",
      chapters: [
        {
          title: "Giới thiệu Nguyên lý Hiện sinh",
          orderIndex: 1,
          nodes: [
            {
              title: "Thuyết Phi lý (Absurdism)",
              summary: "Albert Camus lập luận rằng con người luôn có khao khát nội tại tìm kiếm ý nghĩa, trật tự và mục đích trong cuộc sống. Tuy nhiên, vũ trụ lại lạnh lẽo, im lặng và vốn dĩ không có bất kỳ ý nghĩa khách quan nào. Sự xung đột giữa khát vọng ý nghĩa của con người và sự im lặng của vũ trụ chính là 'Sự phi lý'.",
              originalText: "Sự phi lý được sinh ra từ sự đối đầu giữa nhu cầu của con người và sự im lặng vô lý của thế giới. - Albert Camus",
              quickTake: "Sự đối đầu trực diện giữa khát vọng ý nghĩa của con người và sự im lặng vô tận của vũ trụ.",
              difficulty: "Medium",
              timeToRead: "8 phút đọc",
              orderIndex: 1,
              flashcards: [
                {
                  tag: "Thuyết Phi lý",
                  question: "Theo Camus, con người nên đối phó với 'Sự phi lý' như thế nào?",
                  answer: "Camus từ chối tự sát vật lý và tự sát triết học (tin vào giáo điều). Ông đề xuất sự nổi loạn: chấp nhận sự phi lý và sống một cách đầy kiêu hãnh, tự do và đam mê."
                }
              ]
            },
            {
              title: "Tính Thực tại (Facticity)",
              summary: "Trong hữu thể học hiện sinh của Sartre, tính thực tại đại diện cho những sự thật khách quan, cứng nhắc về quá khứ và giới hạn thể chất của chúng ta. Nó bao gồm năm sinh, chiều cao, gen di truyền và những lựa chọn chúng ta đã cam kết thực hiện trong quá khứ.",
              originalText: "Tính thực tại là bối cảnh định sẵn mà trong đó tự do của con người phải vận hành, đại diện cho thực tế chống lại tự do tuyệt đối. - Jean-Paul Sartre",
              quickTake: "Bối cảnh thực tại không thể thay đổi của sự tồn tại vật chất của đồng chí.",
              difficulty: "Medium",
              timeToRead: "10 phút đọc",
              orderIndex: 2,
              flashcards: [
                {
                  tag: "Thuyết Hiện sinh",
                  question: "Tính thực tại của Sartre là gì?",
                  answer: "Tính thực tại là các sự thật khách quan trong cuộc đời một con người mà họ không thể thay đổi (như nguồn gốc, lịch sử, môi trường), đóng vai trò là chất liệu để tự do vận hành."
                }
              ]
            }
          ]
        },
        {
          title: "Gánh nặng của Tự do Tuyệt đối",
          orderIndex: 2,
          nodes: [
            {
              title: "Tự do Triệt để (Radical Freedom)",
              summary: "Sartre lập luận rằng con người tồn tại trước, sau đó chúng ta mới định nghĩa bản thân thông qua các lựa chọn và hành động của mình. Không có bản tính con người định sẵn, không có kế hoạch thần thánh nào cả, và không có lý do để bào chữa.",
              originalText: "Sự tồn tại đi trước bản chất. Con người bị kết án phải tự do; bởi vì một khi đã bị ném vào thế giới, anh ta phải chịu trách nhiệm về mọi hành động của mình. - Jean-Paul Sartre",
              quickTake: "Sự tồn tại đi trước bản chất. Chúng ta bị kết án phải tự do.",
              difficulty: "Hard",
              timeToRead: "12 phút đọc",
              orderIndex: 1,
              flashcards: [
                {
                  tag: "Thuyết Hiện sinh",
                  question: "Cụm từ 'Sự tồn tại đi trước bản chất' nghĩa là gì?",
                  answer: "Nó có nghĩa là con người không sinh ra với một mục đích định sẵn (bản chất). Chúng ta tồn tại trước, và phải tự định nghĩa ý nghĩa cuộc đời mình thông qua hành động và lựa chọn chủ động."
                }
              ]
            }
          ]
        }
      ]
    };
  }
}
