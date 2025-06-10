import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";

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
        // 여기서 실제 인증 로직을 구현합니다
        // 예시: 하드코딩된 사용자 정보로 인증
        if (credentials?.email === "user@example.com" && credentials?.password === "password") {
          return {
            id: "1",
            name: "테스트 사용자",
            email: "user@example.com",
            preferences: {
              categories: ["business", "technology"],
              sources: ["bbc-news"],
              authors: []
            },
            bookmarks: [],
            readHistory: []
          };
        }
        
        // 인증 실패
        return null;
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
