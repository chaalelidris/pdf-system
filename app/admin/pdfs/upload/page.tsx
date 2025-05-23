import { requireAdmin } from "@/lib/auth";
import { UploadPdfForm } from "@/components/admin/upload-pdf-form";
import { AppLayout } from "@/components/layout/app-layout";

export default async function UploadPdfPage() {
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
        <h1 className="text-2xl font-bold">Upload PDF Document</h1>
        <UploadPdfForm />
      </div>
    </AppLayout>
  );
}
