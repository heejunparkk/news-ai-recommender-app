import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { News } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Bookmark, BookmarkCheck, Share2, ExternalLink, X } from 'lucide-react';
import { useNewsStore } from '@/store/useNewsStore';
import { useSimilarNews } from '@/hooks/useNewsQuery';

interface NewsDetailProps {
  news: News;
  onClose: () => void;
}

export function NewsDetail({ news, onClose }: NewsDetailProps) {
  const bookmarkedNews = useNewsStore((state) => state.bookmarkedNews);
  const addBookmark = useNewsStore((state) => state.addBookmark);
  const removeBookmark = useNewsStore((state) => state.removeBookmark);
  
  const isBookmarked = bookmarkedNews.some((item) => item.id === news.id);
  
  const { data: similarNews = [] } = useSimilarNews(news.id);
  
  const handleBookmarkToggle = () => {
    if (isBookmarked) {
      removeBookmark(news.id);
    } else {
      addBookmark(news.id);
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
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          {news.source.name} · {formattedDate}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <h2 className="text-2xl font-bold mb-4">{news.title}</h2>
      
      {news.urlToImage && (
        <div className="relative w-full h-64 mb-4 overflow-hidden rounded-lg">
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
      
      <div className="flex gap-2 mb-6">
        <Button variant="outline" size="sm" onClick={handleBookmarkToggle}>
          {isBookmarked ? (
            <>
              <BookmarkCheck className="h-4 w-4 mr-2" />
              북마크 해제
            </>
          ) : (
            <>
              <Bookmark className="h-4 w-4 mr-2" />
              북마크
            </>
          )}
        </Button>
        
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-2" />
          공유
        </Button>
        
        <Button variant="outline" size="sm" asChild>
          <a href={news.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            원문 보기
          </a>
        </Button>
      </div>
      
      {news.author && (
        <div className="text-sm text-muted-foreground mb-4">
          작성자: {news.author}
        </div>
      )}
      
      <div className="prose prose-sm dark:prose-invert max-w-none mb-8">
        <p className="text-lg mb-4">{news.description}</p>
        <div className="whitespace-pre-line">
          {news.content || '본문 내용이 제공되지 않았습니다.'}
        </div>
      </div>
      
      {Array.isArray(similarNews) && similarNews.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">관련 뉴스</h3>
          <div className="space-y-4">
            {similarNews.slice(0, 3).map((item) => (
              <div key={item.id} className="p-4 border rounded-lg">
                <h4 className="font-medium mb-1">{item.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-muted-foreground">{item.source.name}</span>
                  <Button variant="link" size="sm" asChild className="p-0">
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      원문 보기
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
