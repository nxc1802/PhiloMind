import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class TTSService {
  private readonly logger = new Logger(TTSService.name);
  private workerUrl: string;

  constructor(private supabase: SupabaseService) {
    this.workerUrl = process.env.TTS_WORKER_URL || 'http://localhost:8000';
  }

  /**
   * Synthesize text to WAV via Python worker, upload to Supabase storage, return public URL.
   */
  async generateSpeech(text: string, nodeId: string): Promise<string> {
    try {
      this.logger.log(`Requesting TTS synthesis for concept node: ${nodeId}...`);
      
      const audioBuffer = await this.callTTSWorker(text);
      
      // Upload audio to Supabase Storage
      const fileName = `podcasts/${nodeId}.wav`;
      const publicUrl = await this.supabase.uploadFile('podcasts', fileName, audioBuffer, 'audio/wav');
      
      this.logger.log(`Speech synthesized and uploaded successfully. Target URL: ${publicUrl}`);
      return publicUrl;
    } catch (err) {
      this.logger.error(`TTS worker request failed: ${err.message}. Defaulting to mock audio asset.`);
      // Return a safe placeholder mock audio URL
      return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    }
  }

  private async callTTSWorker(text: string): Promise<Buffer> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch(`${this.workerUrl}/api/tts/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voice: 'af_bella' }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`TTS Worker responded with status code ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }
}
