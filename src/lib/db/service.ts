import { createSupabaseServerClient } from './supabase';
import { ContentDocument, AnalysisRun } from '@/types/database';

export interface SaveAnalysisInput {
  sourceType: 'paste' | 'url' | 'file';
  sourceUrl?: string;
  title?: string;
  rawText: string;
  cleanText: string;
  wordCount: number;
  characterCount: number;
  metadata?: Record<string, unknown>;
}

export interface SaveAnalysisResultInput {
  contentDocumentId: string;
  scoringVersion: string;
  statisticalScore: number;
  ruleScore: number;
  geminiScore?: number;
  finalAiLikenessScore: number;
  contentQualityScore?: number;
  readabilityScore?: number;
  repetitionScore?: number;
  informationDensityScore?: number;
  resultJson: Record<string, unknown>;
  modelName: string;
  promptVersion: string;
}

export class DatabaseService {
  async saveContentDocument(input: SaveAnalysisInput): Promise<string> {
    try {
      const supabase = await createSupabaseServerClient();

      const { data, error } = await supabase
        .from('content_documents')
        .insert([
          {
            source_type: input.sourceType,
            source_url: input.sourceUrl,
            title: input.title,
            raw_text: input.rawText,
            clean_text: input.cleanText,
            word_count: input.wordCount,
            character_count: input.characterCount,
            metadata_json: input.metadata,
          },
        ])
        .select('id')
        .single();

      if (error) {
        throw new Error(`Failed to save content: ${error.message}`);
      }

      if (!data?.id) {
        throw new Error('No ID returned from insert');
      }

      console.log(`✓ Saved content_document: ${data.id}`);
      return data.id;
    } catch (error) {
      console.error('Error saving content document:', error);
      throw error;
    }
  }

  async saveAnalysisResult(input: SaveAnalysisResultInput): Promise<string> {
    try {
      const supabase = await createSupabaseServerClient();

      const { data, error } = await supabase
        .from('analysis_runs')
        .insert([
          {
            content_document_id: input.contentDocumentId,
            scoring_version: input.scoringVersion,
            statistical_score: input.statisticalScore,
            rule_score: input.ruleScore,
            gemini_score: input.geminiScore || null,
            final_ai_likeness_score: input.finalAiLikenessScore,
            content_quality_score: input.contentQualityScore || null,
            readability_score: input.readabilityScore || null,
            repetition_score: input.repetitionScore || null,
            information_density_score: input.informationDensityScore || null,
            result_json: input.resultJson,
            model_name: input.modelName,
            prompt_version: input.promptVersion,
          },
        ])
        .select('id')
        .single();

      if (error) {
        throw new Error(`Failed to save analysis: ${error.message}`);
      }

      if (!data?.id) {
        throw new Error('No ID returned from insert');
      }

      console.log(`✓ Saved analysis_run: ${data.id}`);
      return data.id;
    } catch (error) {
      console.error('Error saving analysis result:', error);
      throw error;
    }
  }

  async getContentDocument(id: string): Promise<ContentDocument | null> {
    try {
      const supabase = await createSupabaseServerClient();

      const { data, error } = await supabase
        .from('content_documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching content document:', error);
      throw error;
    }
  }

  async getAnalysisResult(id: string): Promise<AnalysisRun | null> {
    try {
      const supabase = await createSupabaseServerClient();

      const { data, error } = await supabase
        .from('analysis_runs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching analysis result:', error);
      throw error;
    }
  }

  async getRecentDocuments(limit: number = 10): Promise<ContentDocument[]> {
    try {
      const supabase = await createSupabaseServerClient();

      const { data, error } = await supabase
        .from('content_documents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching recent documents:', error);
      throw error;
    }
  }

  async getDocumentWithAnalysis(id: string) {
    try {
      const supabase = await createSupabaseServerClient();

      const { data: document, error: docError } = await supabase
        .from('content_documents')
        .select('*')
        .eq('id', id)
        .single();

      if (docError) throw docError;

      const { data: analyses, error: analysisError } = await supabase
        .from('analysis_runs')
        .select('*')
        .eq('content_document_id', id)
        .order('created_at', { ascending: false });

      if (analysisError) throw analysisError;

      return {
        document,
        analyses: analyses || [],
      };
    } catch (error) {
      console.error('Error fetching document with analysis:', error);
      throw error;
    }
  }
}

// Singleton instance
let dbService: DatabaseService;

export function getDatabaseService(): DatabaseService {
  if (!dbService) {
    dbService = new DatabaseService();
  }
  return dbService;
}
