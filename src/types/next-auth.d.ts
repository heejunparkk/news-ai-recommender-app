import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      preferences?: {
        categories: string[];
        sources: string[];
        authors: string[];
      };
      bookmarks?: string[];
      readHistory?: string[];
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    preferences?: {
      categories: string[];
      sources: string[];
      authors: string[];
    };
    bookmarks?: string[];
    readHistory?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      preferences?: {
        categories: string[];
        sources: string[];
        authors: string[];
      };
      bookmarks?: string[];
      readHistory?: string[];
    };
  }
}
