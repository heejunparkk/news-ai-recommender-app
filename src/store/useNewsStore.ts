import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { News, NewsFilters } from '@/types';

interface NewsState {
  news: News[];
  recommendedNews: News[];
  bookmarkedNews: News[];
  recentlyViewedNews: News[];
  currentNews: News | null;
  isLoading: boolean;
  error: string | null;
  filters: NewsFilters;
  
  // 액션
  setNews: (news: News[]) => void;
  setRecommendedNews: (news: News[]) => void;
  addBookmark: (newsId: string) => void;
  removeBookmark: (newsId: string) => void;
  addToRecentlyViewed: (news: News) => void;
  setCurrentNews: (news: News | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  updateFilters: (filters: Partial<NewsFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: NewsFilters = {
  categories: [],
  sources: [],
  authors: [],
  dateRange: {
    from: null,
    to: null,
  },
  searchQuery: '',
  sortBy: 'newest',
};

export const useNewsStore = create<NewsState>()(
  persist(
    (set) => ({
      news: [],
      recommendedNews: [],
      bookmarkedNews: [],
      recentlyViewedNews: [],
      currentNews: null,
      isLoading: false,
      error: null,
      filters: defaultFilters,
      
      setNews: (news) => set({ news }),
      setRecommendedNews: (news) => set({ recommendedNews: news }),
      
      addBookmark: (newsId) =>
        set((state) => {
          if (state.bookmarkedNews.some((news) => news.id === newsId)) {
            return state;
          }
          
          const newsToBookmark = state.news.find((news) => news.id === newsId) || 
                                state.recommendedNews.find((news) => news.id === newsId);
          
          if (!newsToBookmark) return state;
          
          return {
            bookmarkedNews: [...state.bookmarkedNews, newsToBookmark],
          };
        }),
        
      removeBookmark: (newsId) =>
        set((state) => ({
          bookmarkedNews: state.bookmarkedNews.filter((news) => news.id !== newsId),
        })),
        
      addToRecentlyViewed: (news) =>
        set((state) => {
          const isAlreadyViewed = state.recentlyViewedNews.some((item) => item.id === news.id);
          
          if (isAlreadyViewed) {
            return {
              recentlyViewedNews: [
                news,
                ...state.recentlyViewedNews.filter((item) => item.id !== news.id),
              ],
            };
          }
          
          return {
            recentlyViewedNews: [news, ...state.recentlyViewedNews].slice(0, 20), // 최근 20개만 유지
          };
        }),
        
      setCurrentNews: (news) => set({ currentNews: news }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      updateFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),
        
      resetFilters: () => set({ filters: defaultFilters }),
    }),
    {
      name: 'news-store',
      partialize: (state) => ({
        bookmarkedNews: state.bookmarkedNews,
        recentlyViewedNews: state.recentlyViewedNews,
      }),
    }
  )
);
