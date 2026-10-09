export interface ContentDocument {
  id: string;
  source_type: 'paste' | 'url' | 'file';
  source_url?: string;
  title?: string;
  raw_text: string;
  clean_text: string;
  word_count: number;
  character_count: number;
  metadata_json?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AnalysisRun {
  id: string;
  content_document_id: string;
  scoring_version: string;
  statistical_score: number;
  rule_score: number;
  gemini_score?: number;
  final_ai_likeness_score: number;
  content_quality_score: number;
  readability_score: number;
  repetition_score: number;
  information_density_score: number;
  result_json: Record<string, unknown>;
  model_name: string;
  prompt_version: string;
  created_at: string;
}

export interface HumanisationRun {
  id: string;
  content_document_id: string;
  analysis_run_id?: string;
  mode: 'light' | 'natural' | 'deep';
  tone: string;
  original_text: string;
  rewritten_text: string;
  validation_json: Record<string, unknown>;
  before_score: number;
  after_score: number;
  model_name: string;
  prompt_version: string;
  created_at: string;
}

export interface PromptVersion {
  id: string;
  prompt_name: string;
  version: string;
  prompt_text_or_reference: string;
  created_at: string;
}

export interface TestRun {
  id: string;
  test_name: string;
  model_name: string;
  prompt_version: string;
  input_reference: string;
  output_json: Record<string, unknown>;
  created_at: string;
}
