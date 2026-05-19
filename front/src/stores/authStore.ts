import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  user: UserInfo | null
  isAuthenticated: boolean
  login: (token: string, user: UserInfo) => void
  logout: () => void
}

interface UserInfo {
  id: number
  username: string
  email: string
  nickname?: string
  avatar?: string
  role: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (token, user) =>
        set({ token, user, isAuthenticated: true }),
      logout: () =>
        set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
)
