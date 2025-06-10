import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  theme: 'light' | 'dark' | 'system';
  
  // 액션
  setUser: (user: User | null) => void;
  updatePreferences: (preferences: Partial<User['preferences']>) => void;
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  addSource: (source: string) => void;
  removeSource: (source: string) => void;
  addAuthor: (author: string) => void;
  removeAuthor: (author: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  logout: () => void;
}

// 초기 상태는 persist 미들웨어에서 관리합니다

export const useUserStore = create<UserState>()(
    persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      theme: 'system',
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      updatePreferences: (preferences) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                preferences: {
                  ...state.user.preferences,
                  ...preferences,
                },
              }
            : null,
        })),
        
      addCategory: (category) =>
        set((state) => {
          if (!state.user) return state;
          
          return {
            user: {
              ...state.user,
              preferences: {
                ...state.user.preferences,
                categories: [...state.user.preferences.categories, category],
              },
            },
          };
        }),
        
      removeCategory: (category) =>
        set((state) => {
          if (!state.user) return state;
          
          return {
            user: {
              ...state.user,
              preferences: {
                ...state.user.preferences,
                categories: state.user.preferences.categories.filter((c) => c !== category),
              },
            },
          };
        }),
        
      addSource: (source) =>
        set((state) => {
          if (!state.user) return state;
          
          return {
            user: {
              ...state.user,
              preferences: {
                ...state.user.preferences,
                sources: [...state.user.preferences.sources, source],
              },
            },
          };
        }),
        
      removeSource: (source) =>
        set((state) => {
          if (!state.user) return state;
          
          return {
            user: {
              ...state.user,
          preferences: {
                ...state.user.preferences,
                sources: state.user.preferences.sources.filter((s) => s !== source),
              },
            },
          };
        }),
        
      addAuthor: (author) =>
        set((state) => {
          if (!state.user) return state;
          
          return {
            user: {
              ...state.user,
              preferences: {
                ...state.user.preferences,
                authors: [...state.user.preferences.authors, author],
              },
            },
          };
        }),
        
      removeAuthor: (author) =>
        set((state) => {
          if (!state.user) return state;
          
          return {
            user: {
              ...state.user,
              preferences: {
                ...state.user.preferences,
                authors: state.user.preferences.authors.filter((a) => a !== author),
              },
            },
          };
        }),
        
      setTheme: (theme) => set({ theme }),
      
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'user-store',
    }
  )
);
