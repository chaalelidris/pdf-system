import type React from "react"
import { requireAdmin } from "@/lib/auth"
import { AdminNavbar } from "@/components/admin/admin-navbar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAdmin()

  return (
    <div className="flex min-h-screen flex-col">
      <AdminNavbar user={user} />
      <div className="flex-1 p-6">{children}</div>
    </div>
  )
}
