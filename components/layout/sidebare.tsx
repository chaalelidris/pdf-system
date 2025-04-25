"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { FileText, Users, LogOut, Menu, Home, BarChart2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of the system",
      });
      window.location.href = "/login";
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  const isAdmin = user.role === "admin";

  const routes = [
    {
      label: "Dashboard",
      icon: isAdmin ? BarChart2 : Home,
      href: isAdmin ? "/admin" : "/",
      active: pathname === (isAdmin ? "/admin" : "/"),
    },
    {
      label: "PDF Documents",
      icon: FileText,
      href: isAdmin ? "/admin/pdfs" : "/pdfs",
      active: pathname.includes("/pdfs"),
    },
    ...(isAdmin
      ? [
          {
            label: "User Management",
            icon: Users,
            href: "/admin/users",
            active: pathname === "/admin/users",
          },
        ]
      : []),
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="px-3 py-4">
        <h2 className="mb-2 px-4 text-lg font-semibold">Military PDF System</h2>
        <div className="mb-4 px-4 text-sm text-muted-foreground">
          <div className="font-medium">{user.name}</div>
          <div>{user.email}</div>
          <div className="mt-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium">
            {user.role === "admin" ? "Administrator" : "Standard User"}
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="space-y-1 px-2">
            {routes.map((route) => (
              <Button
                key={route.label}
                variant="ghost"
                asChild
                className={cn(
                  "w-full justify-start",
                  route.active && "bg-accent text-accent-foreground"
                )}
              >
                <Link href={route.href}>
                  <route.icon className="mr-2 h-4 w-4" />
                  {route.label}
                </Link>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
      <div className="mt-auto p-4">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-background md:block md:w-64">
        {sidebarContent}
      </div>
    </>
  );
}
