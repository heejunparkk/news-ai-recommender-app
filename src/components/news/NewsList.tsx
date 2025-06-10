"use client";

import { useState } from 'react';
import { News } from '@/types';
import { NewsCard } from './NewsCard';
import { NewsDetail } from '@/components/news/NewsDetail';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';

interface NewsListProps {
  news: News[];
  isLoading?: boolean;
  title?: string;
  emptyMessage?: string;
}

export function NewsList({ news, isLoading = false, title, emptyMessage = '뉴스가 없습니다.' }: NewsListProps) {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item) => (
          <NewsCard key={item.id} news={item} onViewDetails={handleViewDetails} />
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
