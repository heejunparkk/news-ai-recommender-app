import Image from 'next/image';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { News } from '@/types';
import { useNewsStore } from '@/store/useNewsStore';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Bookmark, BookmarkCheck, Share2, ExternalLink } from 'lucide-react';

interface NewsCardProps {
  news: News;
  onViewDetails?: (news: News) => void;
}

export function NewsCard({ news, onViewDetails }: NewsCardProps) {
  const bookmarkedNews = useNewsStore((state) => state.bookmarkedNews);
  const addBookmark = useNewsStore((state) => state.addBookmark);
  const removeBookmark = useNewsStore((state) => state.removeBookmark);
  const addToRecentlyViewed = useNewsStore((state) => state.addToRecentlyViewed);
  
  const isBookmarked = bookmarkedNews.some((item) => item.id === news.id);
  
  const handleBookmarkToggle = () => {
    if (isBookmarked) {
      removeBookmark(news.id);
    } else {
      addBookmark(news.id);
    }
  };
  
  const handleViewDetails = () => {
    addToRecentlyViewed(news);
    if (onViewDetails) {
      onViewDetails(news);
    }
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: news.title,
          text: news.description,
          url: news.url,
        });
      } catch (error) {
        console.error('공유하는 중 오류가 발생했습니다:', error);
      }
    } else {
      // 공유 API를 지원하지 않는 경우 클립보드에 복사
      navigator.clipboard.writeText(news.url);
      alert('링크가 클립보드에 복사되었습니다.');
    }
  };
  
  const formattedDate = formatDistanceToNow(new Date(news.publishedAt), {
    addSuffix: true,
    locale: ko,
  });
  
  return (
    <Card 
      className="h-full flex flex-col transition-all duration-200 hover:shadow-lg"
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="text-sm text-muted-foreground">
            {news.source.name} · {formattedDate}
          </div>
          <Button variant="ghost" size="icon" onClick={handleBookmarkToggle} className="h-8 w-8">
            {isBookmarked ? (
              <BookmarkCheck className="h-5 w-5 text-primary" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </Button>
        </div>
        <CardTitle className="text-lg line-clamp-2 mt-1">{news.title}</CardTitle>
      </CardHeader>
      
      {news.urlToImage && (
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={news.urlToImage}
            alt={news.title}
            fill
            className="object-cover"
            onError={(e) => {
              // 이미지 로드 실패 시 기본 이미지로 대체
              (e.target as HTMLImageElement).src = '/images/news-placeholder.jpg';
            }}
          />
        </div>
      )}
      
      <CardContent className="p-4 pt-3 flex-grow">
        <CardDescription className="line-clamp-3">
          {news.description || '내용이 제공되지 않았습니다.'}
        </CardDescription>
      </CardContent>
      
      <CardFooter className="p-4 pt-2 flex justify-between">
        <Button variant="outline" size="sm" onClick={handleViewDetails}>
          자세히 보기
        </Button>
        
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <a href={news.url} target="_blank" rel="noopener noreferrer" title="원문 보기">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
