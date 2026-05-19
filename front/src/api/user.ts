import http from './http'
import type { User, Model } from '@/types'

export const userApi = {
  list: (params: { page?: number; page_size?: number }) => {
    return http.get<{ data: User[]; total: number }>('/users', { params })
  },

  getById: (id: number) => {
    return http.get<User>(`/users/${id}`)
  },

  create: (data: Partial<User>) => {
    return http.post<User>('/users', data)
  },

  update: (id: number, data: Partial<User>) => {
    return http.put<User>(`/users/${id}`, data)
  },

  delete: (id: number) => {
    return http.delete(`/users/${id}`)
  },
}

export const modelApi = {
  list: (params?: { enabled_only?: boolean }) => {
    return http.get<{ data: Model[] }>('/models', { params })
  },

  getById: (id: number) => {
    return http.get<Model>(`/models/${id}`)
  },

  create: (data: Partial<Model>) => {
    return http.post<Model>('/models', data)
  },

  update: (id: number, data: Partial<Model>) => {
    return http.put<Model>(`/models/${id}`, data)
  },

  delete: (id: number) => {
    return http.delete(`/models/${id}`)
  },
}
