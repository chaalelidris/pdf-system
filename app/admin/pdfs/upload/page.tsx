import { requireAdmin } from "@/lib/auth";
import { UploadPdfForm } from "@/components/admin/upload-pdf-form";
import { AppLayout } from "@/components/layout/app-layout";

export default async function UploadPdfPage() {
  const adminUser = await requireAdmin();

  const user = {
    id: adminUser.id,
    name: adminUser.name ?? "Unknown User",
    email: adminUser.email ?? "None",
    role: adminUser.role,
    image: adminUser.image ?? null,
  };

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Upload PDF Document</h1>
        <UploadPdfForm />
      </div>
    </AppLayout>
  );
}
