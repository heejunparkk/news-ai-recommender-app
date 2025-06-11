"use client";

import { useState } from 'react';
import { News } from '@/types';
import { NewsCard } from './NewsCard';
import { NewsDetail } from '@/components/news/NewsDetail';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NewsListProps {
  news: News[];
  isLoading?: boolean;
  title?: string;
  emptyMessage?: string;
  error?: {
    code: number;
    message: string;
  };
  isFromCache?: boolean;
  cacheTimestamp?: number;
  onRefresh?: () => void;
}

export function NewsList({ 
  news, 
  isLoading = false, 
  title, 
  emptyMessage = '뉴스가 없습니다.',
  error,
  isFromCache,
  cacheTimestamp,
  onRefresh
}: NewsListProps) {
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleViewDetails = (news: News) => {
    setSelectedNews(news);
    setIsDetailOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailOpen(false);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex flex-col h-full">
            <Skeleton className="h-48 w-full mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <div className="flex justify-between mt-auto">
              <Skeleton className="h-9 w-24" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
      
      {/* 오류 메시지 표시 */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>오류 발생</AlertTitle>
          <AlertDescription>
            {error.code === 429 
              ? 'API 요청 제한에 도달했습니다. 잠시 후 다시 시도해 주세요.' 
              : error.message || '뉴스를 불러오는 중 오류가 발생했습니다.'}
          </AlertDescription>
        </Alert>
      )}
      
      {/* 캐시된 데이터 알림 */}
      {isFromCache && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-700">캐시된 데이터 사용 중</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>최신 데이터를 가져올 수 없어 저장된 데이터를 표시합니다.</p>
            {cacheTimestamp && (
              <p className="text-sm text-muted-foreground">
                캐시 시간: {new Date(cacheTimestamp).toLocaleString()}
              </p>
            )}
            {onRefresh && (
              <Button 
                variant="outline" 
                size="sm" 
                className="self-start mt-2 flex items-center gap-1"
                onClick={onRefresh}
              >
                <RefreshCw className="h-3 w-3" /> 새로고침 시도
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item, index) => (
          <NewsCard key={`${item.id}-${index}`} news={item} onViewDetails={handleViewDetails} />
        ))}
      </div>

      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>뉴스 상세</SheetTitle>
          </SheetHeader>
          {selectedNews && <NewsDetail news={selectedNews} onClose={handleCloseDetails} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}
