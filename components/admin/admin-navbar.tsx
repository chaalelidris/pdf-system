"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { FileText, LogOut, User, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface AdminNavbarProps {
  user: {
    name: string
    email: string
  }
}

export function AdminNavbar({ user }: AdminNavbarProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false })
      router.push("/login")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      })
    }
  }

  return (
    <header className="bg-primary text-primary-foreground">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-xl font-bold">
            Military PDF System
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/admin" className="flex items-center gap-2 hover:text-primary-foreground/80">
              <FileText className="h-4 w-4" />
              <span>PDFs</span>
            </Link>
            <Link href="/admin/users" className="flex items-center gap-2 hover:text-primary-foreground/80">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{user.name}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
