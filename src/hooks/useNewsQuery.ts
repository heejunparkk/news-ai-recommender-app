"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { newsService, aiRecommendationService } from '@/services/newsService';
import { NewsFilters, RecommendationParams } from '@/types';
import { useNewsStore } from '@/store/useNewsStore';
import { useUserStore } from '@/store/useUserStore';

// 최신 뉴스 가져오기 훅
export const useLatestNews = (page = 1, pageSize = 10, filters?: Partial<NewsFilters>) => {
  const setNews = useNewsStore((state) => state.setNews);
  const setIsLoading = useNewsStore((state) => state.setIsLoading);
  const setError = useNewsStore((state) => state.setError);

  const query = useQuery({
    queryKey: ['latestNews', page, pageSize, filters],
    queryFn: () => newsService.getLatestNews(page, pageSize, filters),
  });
  
  useEffect(() => {
    if (query.isSuccess && query.data) {
      setNews(query.data.data);
      setError(null);
    }
    if (query.isError && query.error instanceof Error) {
      setError(query.error.message);
    }
    setIsLoading(query.isLoading);
  }, [query.isSuccess, query.isError, query.isLoading, query.data, query.error, setNews, setError, setIsLoading]);
  
  return query;
};

// 추천 뉴스 가져오기 훅
export const useRecommendedNews = (params: RecommendationParams) => {
  const setRecommendedNews = useNewsStore((state) => state.setRecommendedNews);
  const setIsLoading = useNewsStore((state) => state.setIsLoading);
  const setError = useNewsStore((state) => state.setError);
  const user = useUserStore((state) => state.user);

  const query = useQuery({
    queryKey: ['recommendedNews', params, user?.id],
    queryFn: () => aiRecommendationService.getPersonalizedRecommendations(params.limit),
    enabled: !!user?.id, // 사용자가 로그인한 경우에만 실행
  });
  
  useEffect(() => {
    if (query.isSuccess && query.data) {
      setRecommendedNews(query.data);
      setError(null);
    }
    if (query.isError && query.error instanceof Error) {
      setError(query.error.message);
    }
    setIsLoading(query.isLoading);
  }, [query.isSuccess, query.isError, query.isLoading, query.data, query.error, setRecommendedNews, setError, setIsLoading]);
  
  return query;
};

// 유사 뉴스 가져오기 훅
export const useSimilarNews = (newsId: string, limit = 5) => {
  return useQuery({
    queryKey: ['similarNews', newsId, limit],
    queryFn: () => aiRecommendationService.getSimilarNews(newsId, limit),
    enabled: !!newsId, // 뉴스 ID가 있는 경우에만 실행
  });
};

// 북마크 추가/제거 훅
export const useBookmarkMutation = () => {
  const addBookmark = useNewsStore((state) => state.addBookmark);
  const removeBookmark = useNewsStore((state) => state.removeBookmark);
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (newsId: string) => {
      // 실제 구현에서는 API 호출
      addBookmark(newsId);
      return Promise.resolve(newsId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (newsId: string) => {
      // 실제 구현에서는 API 호출
      removeBookmark(newsId);
      return Promise.resolve(newsId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  return {
    addBookmark: addMutation.mutate,
    removeBookmark: removeMutation.mutate,
    isAddingBookmark: addMutation.isPending,
    isRemovingBookmark: removeMutation.isPending,
  };
};

// 카테고리 목록 가져오기 훅
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => newsService.getCategories(),
  });
};

// 뉴스 소스 목록 가져오기 훅
export const useSources = () => {
  return useQuery({
    queryKey: ['sources'],
    queryFn: () => newsService.getSources(),
  });
};
