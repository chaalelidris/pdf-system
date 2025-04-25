import { requireAuth } from "@/lib/auth"
import { UserPdfList } from "@/components/user/user-pdf-list"

export default async function Home() {
  const user = await requireAuth()

  return (
    <main className="min-h-screen bg-background">
      <UserPdfList user={user} />
    </main>
  )
}
