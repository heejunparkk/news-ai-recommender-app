import axios from 'axios';
import { News, NewsFilters, PaginationResult, RecommendationParams } from '@/types';

// 캐시 키 상수
const CACHE_KEY_LATEST_NEWS = 'cached_latest_news';
const CACHE_KEY_TIMESTAMP = 'cached_latest_news_timestamp';
const CACHE_EXPIRY_TIME = 30 * 60 * 1000; // 30분 (밀리초 단위)

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
const API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY || '15404e1f275d4805bc92e89c3229bab6';
const BASE_URL = 'https://newsapi.org/v2';

// API 키 디버깅
console.log('News API 키 확인:', { 
  fromEnv: process.env.NEXT_PUBLIC_NEWS_API_KEY,
  fallback: '15404e1f275d4805bc92e89c3229bab6',
  used: API_KEY
});

// 기본 API 클라이언트 설정
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'X-Api-Key': API_KEY,
  },
});

// 뉴스 API 서비스
export const newsService = {
  // 뉴스 데이터 캐싱
  cacheNewsData(data: PaginationResult<News>): void {
    try {
      if (typeof window !== 'undefined') {
        const cacheData = {
          data,
          timestamp: Date.now()
        };
        localStorage.setItem(CACHE_KEY_LATEST_NEWS, JSON.stringify(cacheData));
        localStorage.setItem(CACHE_KEY_TIMESTAMP, Date.now().toString());
      }
    } catch (error) {
      console.error('뉴스 데이터 캐싱 중 오류:', error);
    }
  },
  
  // 캐시된 뉴스 데이터 가져오기
  getCachedNews(): { data: PaginationResult<News>; timestamp: number } | null {
    try {
      if (typeof window !== 'undefined') {
        const cachedDataStr = localStorage.getItem(CACHE_KEY_LATEST_NEWS);
        if (!cachedDataStr) return null;
        
        const cachedData = JSON.parse(cachedDataStr);
        const timestamp = cachedData.timestamp || Number(localStorage.getItem(CACHE_KEY_TIMESTAMP)) || 0;
        
        // 캐시 만료 확인 (30분)
        if (Date.now() - timestamp > CACHE_EXPIRY_TIME) {
          console.log('캐시가 만료되었습니다.');
          return null;
        }
        
        return cachedData;
      }
    } catch (error) {
      console.error('캐시된 뉴스 데이터 가져오기 중 오류:', error);
    }
    return null;
  },
  // 최신 뉴스 가져오기
  async getLatestNews(
    page: number = 1,
    pageSize: number = 10,
    filters?: Partial<NewsFilters>
  ): Promise<PaginationResult<News>> {
    try {
      // 캐시된 데이터 확인은 오류 발생 시에만 사용
      
      // 필터 파라미터 구성
      const params: Record<string, string | number | boolean> = {
        page,
        pageSize,
      };

      // 기본적으로 everything 엔드포인트 사용 (더 많은 기사를 가져오기 위해)
      // top-headlines에서 문제가 발생하는 경우 everything으로 대체
      const endpoint = '/everything';

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
        
        // sortBy 처리 - 'all'은 정렬 파라미터를 적용하지 않음
        // top-headlines에서는 sortBy를 지원하지 않으므로 everything 엔드포인트에서만 적용
        if (filters.sortBy && filters.sortBy !== 'all' && endpoint === '/everything') {
          // 'newest'는 'publishedAt'으로 변환, 나머지는 그대로 사용
          params.sortBy = filters.sortBy === 'newest' ? 'publishedAt' : filters.sortBy;
        }
      }

      // 국가 설정은 top-headlines에서만 사용하며, 이제 everything 엔드포인트만 사용하므로 삭제
      
      // everything 엔드포인트는 q 파라미터가 필수
      if (!params.q) {
        params.q = filters?.searchQuery || '뉴스 한국'; // 기본 검색어 설정
      }
      
      // 언어 설정 (한국어 기사 우선)
      params.language = 'ko';
      
      // 정렬 기본값 설정
      if (!params.sortBy) {
        params.sortBy = 'publishedAt';
      }

      console.log('News API 요청:', { endpoint, params });
      
      const response = await apiClient.get(endpoint, { params });
      const { articles = [], totalResults = 0 } = response.data;
      
      // API 응답 데이터 콘솔 출력
      console.log('News API 응답 데이터:', { 
        endpoint, 
        params, 
        totalResults, 
        articlesCount: articles.length,
        articles: articles.slice(0, 2) // 첫 두 개 항목만 출력 (전체 출력 시 너무 많음)
      });

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
      
      // 결과 데이터 캐싱
      const result = {
        data: news,
        page,
        limit: pageSize,
        totalPages: Math.ceil(totalResults / pageSize),
        totalItems: totalResults,
      };
      
      this.cacheNewsData(result);

      return result;
    } catch (error: unknown) {
      console.error('뉴스를 가져오는 중 오류 발생:', error);
      
      // 오류 상세 정보 출력
      if (axios.isAxiosError(error)) {
        console.error('API 오류 상세:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        
        // 429 오류(Too Many Requests) 처리
        if (error.response?.status === 429) {
          console.log('API 요청 제한에 도달했습니다. 캐시된 데이터를 사용합니다.');
          
          // 캐시된 데이터 확인
          const cachedData = this.getCachedNews();
          if (cachedData) {
            console.log('캐시된 데이터를 사용합니다:', { 
              cachedAt: new Date(cachedData.timestamp).toLocaleString(),
              itemCount: cachedData.data.data.length 
            });
            
            // 캐시된 데이터에 429 오류 정보 추가
            return {
              ...cachedData.data,
              isFromCache: true,
              cacheTimestamp: cachedData.timestamp,
              error: {
                code: 429,
                message: 'API 요청 제한에 도달했습니다. 캐시된 데이터를 표시합니다.'
              }
            };
          }
        }
      }
      
      // 캐시된 데이터 확인
      const cachedData = this.getCachedNews();
      if (cachedData) {
        console.log('오류 발생으로 캐시된 데이터를 사용합니다.');
        return {
          ...cachedData.data,
          isFromCache: true,
          cacheTimestamp: cachedData.timestamp,
          error: {
            code: axios.isAxiosError(error) ? error.response?.status || 500 : 500,
            message: '뉴스를 가져오는 중 오류가 발생했습니다. 캐시된 데이터를 표시합니다.'
          }
        };
      }
      
      // 캐시된 데이터도 없는 경우 빈 결과 반환
      return {
        data: [],
        page,
        limit: pageSize,
        totalPages: 0,
        totalItems: 0,
        error: {
          code: axios.isAxiosError(error) ? error.response?.status || 500 : 500,
          message: '뉴스를 가져오는 중 오류가 발생했습니다.'
        }
      };
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
