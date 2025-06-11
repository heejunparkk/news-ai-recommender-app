export interface News {
  id: string;
  title: string;
  description: string;
  content: string;
  author: string;
  publishedAt: string;
  source: {
    id: string | null;
    name: string;
  };
  url: string;
  urlToImage: string | null;
  category: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  preferences: {
    categories: string[];
    sources: string[];
    authors: string[];
  };
  bookmarks: string[];
  readHistory: string[];
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export type SortOption = 'all' | 'newest' | 'relevance' | 'popularity';

export interface NewsFilters {
  categories: string[];
  sources: string[];
  authors: string[];
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  searchQuery: string;
  sortBy: SortOption;
}

export interface RecommendationParams {
  userId: string;
  limit?: number;
  page?: number;
}

export interface PaginationResult<T> {
  data: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  isFromCache?: boolean;
  cacheTimestamp?: number;
  error?: {
    code: number;
    message: string;
  };
}
