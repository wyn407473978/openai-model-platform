import http from '@/api/http';
import type { ImageGenLog, ImageGenLogListResponse } from '@/types/imageLog';
import type { ApiResponse } from '@/types/image';

export interface ListLogsParams {
  model?: string;
  operation?: string;
  limit?: number;
  offset?: number;
}

export interface Stats {
  total_calls: number;
  today_calls: number;
  success_rate: number;
  active_models: number;
  total_tokens: number;
  today_tokens: number;
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

  // 获取去重的模型列表
  getModels: () => {
    return http.get<ApiResponse<string[]>>('/image-logs/models/list');
  },

  // 获取统计数据
  getStats: () => {
    return http.get<ApiResponse<Stats>>('/stats');
  },
};
