import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { PdfList } from "@/components/pdf/pdf-list";
import { AppLayout } from "@/components/layout/app-layout";

export default async function Home() {
  const user = await requireAuth();

  // If admin, redirect to admin dashboard
  if (user.role === "admin") {
    redirect("/admin");
  }

  const userData = {
    id: user.id,
    name: user.name ?? "Unknown User",
    email: user.email ?? "None",
    role: user.role,
    image: user.image ?? null,
  };

  return (
    <AppLayout user={userData}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Available Documents</h1>
        <PdfList />
      </div>
    </AppLayout>
  );
}
