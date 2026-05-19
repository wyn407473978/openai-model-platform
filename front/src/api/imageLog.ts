import http from '@/api/http';
import type { ImageGenLog, ImageGenLogListResponse } from '@/types/imageLog';
import type { ApiResponse } from '@/types/image';

export interface ListLogsParams {
  model?: string;
  operation?: string;
  limit?: number;
  offset?: number;
}

export const imageLogApi = {
  // 获取日志列表
  list: (params: ListLogsParams) => {
    return http.get<ApiResponse<ImageGenLogListResponse>>('/image-logs', { params });
  },

  // 获取单条日志
  getById: (id: number) => {
    return http.get<ApiResponse<ImageGenLog>>(`/image-logs/${id}`);
  },
};
