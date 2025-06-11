# 뉴스 AI 추천 애플리케이션 (News AI Recommender App)

최신 뉴스와 AI 기반 개인화된 뉴스 추천 서비스를 제공하는 웹 애플리케이션입니다.

## 프로젝트 소개

이 프로젝트는 사용자에게 다음과 같은 기능을 제공합니다:

- 최신 뉴스 브라우징 및 필터링
- AI 기반 개인화된 뉴스 추천
- 유사 뉴스 추천
- 뉴스 북마크 기능
- 카테고리 및 소스별 필터링

## 기술 스택

### 프론트엔드
- [Next.js 15](https://nextjs.org/) - React 프레임워크
- [React 19](https://react.dev/) - UI 라이브러리
- [TanStack Query](https://tanstack.com/query) - 데이터 페칭 및 캐싱
- [Zustand](https://zustand-demo.pmnd.rs/) - 상태 관리
- [Tailwind CSS](https://tailwindcss.com/) - 스타일링
- [Radix UI](https://www.radix-ui.com/) - UI 컴포넌트

### 인증
- [NextAuth.js](https://next-auth.js.org/) - 인증 시스템

## 시작하기

### 필수 조건
- Node.js 18.0.0 이상
- npm 또는 yarn 패키지 매니저

### 설치

```bash
# 저장소 클론
git clone https://github.com/yourusername/news-ai-recommender-app.git
cd news-ai-recommender-app

# 의존성 설치
npm install
# 또는
yarn install
```

### 환경 변수 설정

`.env` 파일을 프로젝트 루트에 생성하고 다음 변수를 설정하세요:

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# 필요한 API 키 설정
NEWS_API_KEY=your-news-api-key
```

### 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

## 프로젝트 구조

```
/src
  /app             # Next.js 앱 라우터
  /components      # 재사용 가능한 UI 컴포넌트
  /hooks           # 커스텀 React 훅
  /lib             # 유틸리티 함수
  /services        # API 서비스
  /store           # Zustand 상태 관리
  /types           # TypeScript 타입 정의
```

## 주요 기능

### 뉴스 브라우징
- 최신 뉴스 목록 표시
- 카테고리, 소스, 키워드 등으로 필터링

### AI 추천 시스템
- 사용자 활동 기반 개인화된 뉴스 추천
- 현재 읽고 있는 뉴스와 유사한 뉴스 추천

### 사용자 기능
- 뉴스 북마크 및 저장
- 사용자 프로필 및 선호도 설정

## 배포

이 애플리케이션은 [Vercel](https://vercel.com)을 통해 쉽게 배포할 수 있습니다:

```bash
npm run build
# 또는
yarn build
```

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
