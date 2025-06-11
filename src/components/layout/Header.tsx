"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/layout/ModeToggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUserStore } from '@/store/useUserStore';
import { Newspaper, BookmarkIcon, History, Settings, User, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useEffect } from 'react';

export function Header() {
  const { data: session } = useSession();
  const user = useUserStore((state) => state.user);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const setUser = useUserStore((state) => state.setUser);
  const logout = useUserStore((state) => state.logout);
  
  // NextAuth 세션 정보를 Zustand 스토어와 동기화
  useEffect(() => {
    if (session?.user) {
      // NextAuth 사용자 정보를 Zustand 스토어에 저장
      setUser({
        id: session.user.id || session.user.email || '',
        name: session.user.name || '사용자',
        email: session.user.email || '',
        preferences: {
          categories: session.user.preferences?.categories || [],
          sources: session.user.preferences?.sources || [],
          authors: session.user.preferences?.authors || []
        },
        bookmarks: session.user.bookmarks || [],
        readHistory: session.user.readHistory || []
      });
    }
  }, [session, setUser]);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center mx-auto px-4">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Newspaper className="h-6 w-6" />
            <span className="font-bold text-xl">뉴스AI</span>
          </Link>
        </div>
        
        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            홈
          </Link>
          <Link
            href="/recommended"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            추천 뉴스
          </Link>
          <Link
            href="/categories"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            카테고리
          </Link>
        </nav>
        
        <div className="ml-auto flex items-center space-x-4">
          <ModeToggle />
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    {user?.image ? (
                      <AvatarImage src={user.image} alt={user?.name || '사용자'} />
                    ) : (
                      <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.name || '사용자'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/bookmarks" className="flex w-full cursor-pointer items-center">
                    <BookmarkIcon className="mr-2 h-4 w-4" />
                    <span>북마크</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/history" className="flex w-full cursor-pointer items-center">
                    <History className="mr-2 h-4 w-4" />
                    <span>열람 기록</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/preferences" className="flex w-full cursor-pointer items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>환경설정</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    signOut({ callbackUrl: '/' });
                    logout();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/login">
                <User className="mr-2 h-4 w-4" />
                로그인
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
