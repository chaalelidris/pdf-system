import { requireAdmin } from "@/lib/auth";
import { PdfList } from "@/components/pdf/pdf-list";
import { AppLayout } from "@/components/layout/app-layout";

export default async function AdminPdfsPage() {
  const user = await requireAdmin();
  const adminUser = {
    id: user.id,
    name: user.name ?? "Unknown User",
    email: user.email ?? "None",
    role: user.role,
    image: null,
  };
  return (
    <AppLayout user={adminUser}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold"> Manage PDF Documents</h1>
        <PdfList isAdmin={true} />
      </div>
    </AppLayout>
  );
}
