export interface User {
  id: number
  username: string
  email: string
  nickname?: string
  avatar?: string
  role: string
  status: number
  created_at: string
  updated_at: string
}

export interface Model {
  id: number
  name: string
  provider: string
  model_id: string
  description?: string
  input_price: number
  output_price: number
  max_tokens: number
  enabled: boolean
  created_at: string
  updated_at: string
}

export interface PageResult<T> {
  data: T[]
  total: number
  page: number
  page_size: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
}
