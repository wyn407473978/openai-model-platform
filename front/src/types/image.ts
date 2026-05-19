// Image Model Types

export interface ImageModel {
  id: number;
  model_id: string;
  name: string;
  description?: string;
  enabled: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  parameters?: ModelParameter[];
}

export interface ModelParameter {
  id: number;
  model_id: string;
  param_key: string;
  param_label: string;
  param_type: 'enum' | 'number' | 'string' | 'boolean';
  is_required: boolean;
  default_value?: string;
  param_order: number;
  created_at: string;
  updated_at: string;
  enum_values?: ParameterEnumValue[];
}

export interface ParameterEnumValue {
  id: number;
  parameter_id: number;
  enum_value: string;
  enum_label: string;
  is_default: boolean;
  enum_order: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PageResult<T> {
  data: T[];
  total: number;
}
