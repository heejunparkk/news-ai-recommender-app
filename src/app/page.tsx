"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NewsList } from "@/components/news/NewsList";
import { NewsFilters } from "@/components/news/NewsFilters";
import { useLatestNews } from "@/hooks/useNewsQuery";
import { useNewsStore } from "@/store/useNewsStore";

export default function Home() {
  // 최신 뉴스 가져오기
  const filters = useNewsStore((state) => state.filters);
  const updateFilters = useNewsStore((state) => state.updateFilters);
  const resetFilters = useNewsStore((state) => state.resetFilters);
  const { data: latestNews, isLoading } = useLatestNews(1, 10, filters);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">오늘의 뉴스</h1>
          <p className="text-muted-foreground">최신 뉴스와 개인화된 추천 뉴스를 확인하세요</p>
        </div>
        
        <div className="mb-6">
          <NewsFilters 
            filters={filters}
            onFilterChange={updateFilters}
            onReset={resetFilters}
          />
        </div>
        
        <NewsList 
          news={latestNews?.data || []} 
          isLoading={isLoading} 
          title="최신 뉴스"
          emptyMessage="뉴스가 없습니다. 다른 필터를 시도해보세요."
        />
      </main>
      
      <Footer />
    </div>
  );
}
