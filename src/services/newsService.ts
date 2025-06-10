import axios from 'axios';
import { News, NewsFilters, PaginationResult, RecommendationParams } from '@/types';

interface NewsApiArticle {
  url: string;
  title: string;
  description: string;
  content: string;
  author: string;
  publishedAt: string;
  urlToImage: string;
  category?: string;
  source: {
    id: string | null;
    name: string;
  };
}

// 실제 API 키는 환경 변수로 관리해야 합니다
const API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY || '';
const BASE_URL = 'https://newsapi.org/v2';

// 기본 API 클라이언트 설정
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'X-Api-Key': API_KEY,
  },
});

// 뉴스 API 서비스
export const newsService = {
  // 최신 뉴스 가져오기
  async getLatestNews(
    page: number = 1,
    pageSize: number = 10,
    filters?: Partial<NewsFilters>
  ): Promise<PaginationResult<News>> {
    try {
      // 필터 파라미터 구성
      const params: Record<string, string | number | boolean> = {
        page,
        pageSize,
      };

      // 검색어가 있으면 everything 엔드포인트 사용, 없으면 top-headlines 사용
      const endpoint = filters?.searchQuery ? '/everything' : '/top-headlines';

      // 필터 적용
      if (filters) {
        if (filters.searchQuery) {
          params.q = filters.searchQuery;
        }
        if (filters.categories && filters.categories.length > 0) {
          params.category = filters.categories.join(',');
        }
        if (filters.sources && filters.sources.length > 0) {
          params.sources = filters.sources.join(',');
        }
        if (filters.dateRange?.from) {
          params.from = filters.dateRange.from.toISOString().split('T')[0];
        }
        if (filters.dateRange?.to) {
          params.to = filters.dateRange.to.toISOString().split('T')[0];
        }
        if (filters.sortBy) {
          params.sortBy = filters.sortBy === 'newest' ? 'publishedAt' : filters.sortBy;
        }
      }

      // 국가 설정 (기본값)
      if (!params.sources) {
        params.country = 'kr';
      }

      const response = await apiClient.get(endpoint, { params });
      const { articles, totalResults } = response.data;

      // API 응답을 우리의 News 타입으로 변환
      const news: News[] = articles.map((article: NewsApiArticle, index: number) => ({
        id: article.url || `news-${index}`,
        title: article.title || '',
        description: article.description || '',
        content: article.content || '',
        author: article.author || '익명',
        publishedAt: article.publishedAt || new Date().toISOString(),
        source: {
          id: article.source?.id || null,
          name: article.source?.name || '알 수 없는 출처',
        },
        url: article.url || '',
        urlToImage: article.urlToImage || null,
        category: article.category || '일반',
      }));

      return {
        data: news,
        page,
        limit: pageSize,
        totalPages: Math.ceil(totalResults / pageSize),
        totalItems: totalResults,
      };
    } catch (error) {
      console.error('뉴스를 가져오는 중 오류 발생:', error);
      throw error;
    }
  },

  // 추천 뉴스 가져오기 (AI 기반)
  async getRecommendedNews({
    limit = 10,
    page = 1,
  }: Omit<RecommendationParams, 'userId'>): Promise<News[]> {
    try {
      // 실제 구현에서는 AI 추천 API를 호출하거나 백엔드에서 처리
      // 여기서는 임시로 최신 뉴스를 가져오는 방식으로 구현
      const response = await this.getLatestNews(page, limit);
      return response.data;
    } catch (error) {
      console.error('추천 뉴스를 가져오는 중 오류 발생:', error);
      throw error;
    }
  },

  // 뉴스 카테고리 목록 가져오기
  async getCategories(): Promise<string[]> {
    // NewsAPI에서 제공하는 카테고리 목록
    return [
      '비즈니스',
      '엔터테인먼트',
      '일반',
      '건강',
      '과학',
      '스포츠',
      '기술',
    ];
  },

  // 뉴스 소스 목록 가져오기
  async getSources(): Promise<{ id: string; name: string }[]> {
    try {
      const response = await apiClient.get('/sources', {
        params: { language: 'ko' },
      });
      return response.data.sources;
    } catch (error) {
      console.error('뉴스 소스를 가져오는 중 오류 발생:', error);
      throw error;
    }
  },
};

// AI 추천 서비스 (실제 구현에서는 별도의 AI 서비스와 연동)
export const aiRecommendationService = {
  // 사용자 선호도 기반 뉴스 추천
  async getPersonalizedRecommendations(limit: number = 10): Promise<News[]> {
    try {
      // 실제 구현에서는 AI 추천 API를 호출
      // 여기서는 임시로 최신 뉴스를 가져오는 방식으로 구현
      const response = await newsService.getLatestNews(1, limit);
      return response.data;
    } catch (error) {
      console.error('개인화된 추천을 가져오는 중 오류 발생:', error);
      throw error;
    }
  },

  // 콘텐츠 기반 유사 뉴스 추천
  async getSimilarNews(newsId: string, limit: number = 5): Promise<News[]> {
    try {
      // 실제 구현에서는 AI 유사도 API를 호출
      // 여기서는 임시로 최신 뉴스를 가져오는 방식으로 구현
      const response = await newsService.getLatestNews(1, limit);
      return response.data;
    } catch (error) {
      console.error('유사 뉴스를 가져오는 중 오류 발생:', error);
      throw error;
    }
  },
};
