import { requireAdmin } from "@/lib/auth"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminPage() {
  const user = await requireAdmin()

  return (
    <main className="min-h-screen bg-background">
      <AdminDashboard user={user} />
    </main>
  )
}
