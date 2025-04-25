import type { DefaultSession, DefaultUser } from "next-auth";

export enum Category {
  FinancialSeries = "مصلحة مالية",
  GeneralAdministration = "إدارة عامة",
}

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
    id: string;
  }
}

// Extend the built-in JWT types
declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    id: string;
  }
}

export interface PdfDocument {
  id: string;
  title: string;
  filename: string;
  category: Category;
  createdAt: string;
}
