import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { LoginForm } from "@/components/auth/login-form"

export default async function LoginPage() {
  const session = await getSession()

  // If already logged in, redirect based on role
  if (session?.user) {
    if (session.user.role === "admin") {
      redirect("/admin")
    } else {
      redirect("/")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <LoginForm />
    </div>
  )
}
