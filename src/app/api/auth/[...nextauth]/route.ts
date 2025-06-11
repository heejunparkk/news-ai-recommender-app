import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import type { DefaultSession } from "next-auth";

// 사용자 기본 설정 타입 정의
type UserPreferences = {
  categories: string[];
  sources: string[];
  authors: string[];
};

// NextAuth의 타입 확장
declare module "next-auth" {
  /**
   * User 타입 확장
   */
  interface User {
    id: string;
    preferences?: UserPreferences;
    bookmarks?: string[];
    readHistory?: string[];
  }

  /**
   * Session 타입 확장
   */
  interface Session {
    user: {
      id: string;
      preferences?: UserPreferences;
      bookmarks?: string[];
      readHistory?: string[];
    } & DefaultSession["user"];
  }
}

const prisma = new PrismaClient();

// NextAuth 설정
export const authOptions: NextAuthOptions = {
  providers: [
    // Google 로그인
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    
    // 이메일/비밀번호 로그인
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" }
      },
      async authorize(credentials) {
        try {
          // 필수 필드 확인
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          // 데이터베이스에서 사용자 찾기
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          // 사용자가 없는 경우
          if (!user || !user.password) {
            return null;
          }

          // 비밀번호 검증
          const passwordMatch = await bcrypt.compare(credentials.password, user.password);

          // 비밀번호가 일치하지 않는 경우
          if (!passwordMatch) {
            return null;
          }

          // 인증 성공: 비밀번호를 제외한 사용자 정보 반환
          // JSON 데이터를 적절한 타입으로 변환
          let preferences: UserPreferences | undefined = undefined;
          let bookmarks: string[] = [];
          let readHistory: string[] = [];
          
          try {
            if (user.preferences) {
              preferences = user.preferences as unknown as UserPreferences;
            }
            if (user.bookmarks) {
              bookmarks = user.bookmarks as unknown as string[];
            }
            if (user.readHistory) {
              readHistory = user.readHistory as unknown as string[];
            }
          } catch (e) {
            console.error('사용자 데이터 변환 오류:', e);
          }
          
          // 사용자 정보 반환 - bookmarks와 readHistory가 undefined일 경우 빈 배열로 처리
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            preferences,
            bookmarks: bookmarks || [],
            readHistory: readHistory || []
          };
        } catch (error) {
          console.error('인증 오류:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  callbacks: {
    async jwt({ token, user }) {
      // 사용자 정보를 토큰에 추가
      if (user) {
        token.user = user;
      }
      return token;
    },
    async session({ session, token }) {
      // 세션에 사용자 정보 추가
      if (token.user) {
        session.user = {
          ...session.user,
          id: token.user.id,
          preferences: token.user.preferences,
          bookmarks: token.user.bookmarks,
          readHistory: token.user.readHistory
        };
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
