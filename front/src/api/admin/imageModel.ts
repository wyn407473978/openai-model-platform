import http from '@/api/http';
import type {
  ImageModel,
  ModelParameter,
  ParameterEnumValue,
  ApiResponse,
} from '@/types/image';

// 模型管理 API

export const imageModelApi = {
  // 获取所有模型（管理员）
  listAll: () => {
    return http.get<ApiResponse<ImageModel[]>>('/admin/image-models');
  },

  // 获取启用的模型（公开）
  listEnabled: () => {
    return http.get<ApiResponse<ImageModel[]>>('/image-models');
  },

  // 获取单个模型
  getById: (id: number) => {
    return http.get<ApiResponse<ImageModel>>(`/admin/image-models/${id}`);
  },

  // 创建模型
  create: (data: Partial<ImageModel>) => {
    return http.post<ApiResponse<ImageModel>>('/admin/image-models', data);
  },

  // 更新模型
  update: (id: number, data: Partial<ImageModel>) => {
    return http.put<ApiResponse<ImageModel>>(`/admin/image-models/${id}`, data);
  },

  // 删除模型
  delete: (id: number) => {
    return http.delete<ApiResponse<null>>(`/admin/image-models/${id}`);
  },

  // 获取模型的参数配置
  getParameters: (modelId: string) => {
    return http.get<ApiResponse<ModelParameter[]>>(`/image-models/${modelId}/parameters`);
  },

  // 创建参数配置
  createParameter: (modelId: string, data: Partial<ModelParameter>) => {
    return http.post<ApiResponse<ModelParameter>>(
      `/admin/model-params`,
      { ...data, model_id: modelId }
    );
  },

  // 更新参数配置
  updateParameter: (paramId: number, data: Partial<ModelParameter>) => {
    return http.put<ApiResponse<ModelParameter>>(
      `/admin/model-params/${paramId}`,
      data
    );
  },

  // 删除参数配置
  deleteParameter: (paramId: number) => {
    return http.delete<ApiResponse<null>>(
      `/admin/model-params/${paramId}`
    );
  },

  // 创建枚举值
  createEnumValue: (paramId: number, data: Partial<ParameterEnumValue>) => {
    return http.post<ApiResponse<ParameterEnumValue>>(
      `/admin/model-params/${paramId}/enum-values`,
      data
    );
  },

  // 更新枚举值
  updateEnumValue: (enumId: number, data: Partial<ParameterEnumValue>) => {
    return http.put<ApiResponse<ParameterEnumValue>>(
      `/admin/enum-values/${enumId}`,
      data
    );
  },

  // 删除枚举值
  deleteEnumValue: (enumId: number) => {
    return http.delete<ApiResponse<null>>(
      `/admin/enum-values/${enumId}`
    );
  },
};
