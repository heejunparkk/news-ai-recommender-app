import Link from 'next/link';
import { Newspaper } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0 mx-auto px-4">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Link href="/" className="flex items-center space-x-2">
            <Newspaper className="h-5 w-5" />
            <span className="font-bold">뉴스AI</span>
          </Link>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} 뉴스AI. 모든 권리 보유.
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/about"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            소개
          </Link>
          <Link
            href="/terms"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            이용약관
          </Link>
          <Link
            href="/privacy"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            개인정보처리방침
          </Link>
        </div>
      </div>
    </footer>
  );
}
