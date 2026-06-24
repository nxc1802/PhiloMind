import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private supabase: SupabaseClient | null = null;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (url && url !== 'https://your-supabase-project.supabase.co' && key) {
      try {
        this.supabase = createClient(url, key, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        });
        this.logger.log('Supabase client initialized successfully!');
      } catch (err) {
        this.logger.error(`Supabase client initialization failed: ${err.message}`);
      }
    } else {
      this.logger.warn('Supabase URL/Key missing or default. Running in Local Mock Storage Mode.');
    }
  }

  getClient() {
    return this.supabase;
  }

  /**
   * Uploads file to Supabase storage bucket, falls back to local virtual storage URL.
   */
  async uploadFile(bucket: string, path: string, fileBuffer: Buffer, mimeType: string): Promise<string> {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase.storage
          .from(bucket)
          .upload(path, fileBuffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (error) throw error;
        
        const { data: urlData } = this.supabase.storage
          .from(bucket)
          .getPublicUrl(path);

        return urlData.publicUrl;
      } catch (error) {
        this.logger.error(`Supabase upload failed: ${error.message}. Returning mock URL.`);
      }
    }
    
    // Fallback URL for mock environment
    return `https://philomind-mock-storage.local/${bucket}/${path}`;
  }

  /**
   * Performs semantic vector search on concept nodes if pgvector matches.
   */
  async vectorSearch(embedding: number[], limit: number = 3): Promise<any[]> {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase.rpc('match_concepts', {
          query_embedding: embedding,
          match_threshold: 0.7,
          match_count: limit,
        });

        if (error) throw error;
        return data || [];
      } catch (error) {
        this.logger.error(`Supabase RPC vector search failed: ${error.message}`);
      }
    }
    return [];
  }
}
