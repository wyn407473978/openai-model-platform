// Image Generation Log Types

export interface ImageGenLog {
  id: number;
  model: string;
  operation: 'generate' | 'edit' | 'variation';
  request_prompt: string;
  request_params: Record<string, unknown>;
  response_data: Record<string, unknown> | null;
  status: 'success' | 'failed';
  error_message?: string;
  created_at: string;
}

export interface ImageGenLogListResponse {
  data: ImageGenLog[];
  total: number;
}
