import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import http from 'http';

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

  private callTTSWorker(text: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.workerUrl}/api/tts/synthesize`);
      const postData = JSON.stringify({ text, voice: 'af_bella' });

      const options = {
        hostname: url.hostname,
        port: url.port || 80,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      };

      const req = http.request(options, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`TTS Worker responded with status code ${res.statusCode}`));
          return;
        }

        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      });

      req.on('error', (err) => reject(err));
      
      // Set reasonable timeout
      req.setTimeout(30000, () => {
        req.destroy(new Error('TTS Worker request timed out after 30 seconds.'));
      });

      req.write(postData);
      req.end();
    });
  }
}
