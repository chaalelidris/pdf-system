import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { hash } from "bcryptjs";
import type { Session } from "next-auth";

// Get the session on the server
export async function getSession(): Promise<Session | null> {
  return await getServerSession(authOptions);
}

// Check if the user is authenticated
export async function getCurrentUser() {
  const session = await getSession();

  if (!session?.user) {
    return null;
  }

  return session.user;
}

// Require authentication
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

// Require admin role
export async function requireAdmin() {
  const user = await requireAuth();

  // TypeScript now knows that user.role exists
  if (user.role !== "admin") {
    redirect("/");
  }

  return user;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}
