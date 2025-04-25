import type { ReactNode } from "react";
import { Sidebar } from "./sidebare";

interface AppLayoutProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    image: string | null;
  };
  children: ReactNode;
}

export function AppLayout({ user, children }: AppLayoutProps) {
  return (
    <div className="flex h-screen">
      <Sidebar user={user} />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}
