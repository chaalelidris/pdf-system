import type { DefaultSession, DefaultUser } from "next-auth";

export enum Category {
  FinancialSeries = "مصلحة مالية",
  GeneralAdministration = "إدارة عامة",
}

export enum PdfType {
  ORDER = "امر",
  OFFICIAL_DECREE = "مرسوم رئاسي",
  OFFICIAL_GAZETTE = "جريدة رسمية",
  MEMORANDUM = "مذكرة",
  DECISION = "قرار",
  PUBLICATION = "منشور",
  REGULATION = "مقرر",
  DIRECTIVE = "توجيهة",
  INSTRUCTION = "تعليمة",
  BYLAW = "لائحة",
  DISPATCH = "إرسالية",
  OTHERS = "أخرى",
}

/* export enum PdfOrigin {
  Internal = "internal",
  External = "external",
  Classified = "classified",
} */

export enum PdfOrigin {
  CENTRAL = "مركزي",
  REGIONAL = "جهوي",
  BRIGADE_COMMANDER = "قائد اللواء",
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
  fileNumber: string;
  category: Category;
  type: PdfType;
  origin: PdfOrigin;
  createdAt: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
}
