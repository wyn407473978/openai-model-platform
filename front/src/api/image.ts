import http from '@/api/http';
import type {
  ImageGenerateRequest,
  ImageEditRequest,
  ImageVariationRequest,
  ImageGenerateResponse,
} from '@/types/imageGen';

// 图片生成 API (用户端)

export const imageApi = {
  // 文本生成图片
  generate: (data: ImageGenerateRequest) => {
    return http.post<ImageGenerateResponse>('/images/generate', data);
  },

  // 图片编辑
  edit: (data: ImageEditRequest) => {
    return http.post<ImageGenerateResponse>('/images/edit', data);
  },

  // 图片变体
  variation: (data: ImageVariationRequest) => {
    return http.post<ImageGenerateResponse>('/images/variation', data);
  },
};
