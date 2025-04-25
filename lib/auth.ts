import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { hash } from "bcryptjs";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

export async function requireAuth(): Promise<User> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return session.user as User;
}

export async function requireAdmin(): Promise<User> {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  return session.user as User;
}

export async function getSession(): Promise<{ user: User } | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  return { user: session.user as User };
}

export async function hashPassword(password: string): Promise<string> {
  const hashedPassword = await hash(password, 10);
  return hashedPassword;
}
