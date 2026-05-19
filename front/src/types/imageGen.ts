// Image Generation Types

import type { ApiResponse } from './image';

export type { ApiResponse };

export interface ImageGenerateRequest {
  model: string;
  prompt: string;
  n?: number;
  size?: string;
  quality?: string;
  output_format?: string;
  background?: string;
  moderation?: string;
  response_format?: string;
}

export interface ImageEditRequest {
  model: string;
  prompt: string;
  images: string[]; // base64 encoded
  mask?: string; // base64 encoded
  n?: number;
  size?: string;
  quality?: string;
  output_format?: string;
  background?: string;
  input_fidelity?: string;
  response_format?: string;
}

export interface ImageVariationRequest {
  model?: string;
  n?: number;
  size?: string;
  image: string; // base64 encoded
}

export interface ImageResult {
  image: string; // base64 or URL
  url?: string;
  index: number;
}

export interface ImageGenerateResponse {
  data: ImageResult[];
  created: number;
}
