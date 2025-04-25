import { requireAdmin } from "@/lib/auth";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { AppLayout } from "@/components/layout/app-layout";

export default async function AdminPage() {
  const user = await requireAdmin();

  if (!user) {
    return <div>Unauthorized</div>;
  }

  const userData = {
    id: user.id,
    name: user.name ?? "Unknown User",
    email: user.email ?? "None",
    role: user.role,
    image: null,
  };

  return (
    <AppLayout user={userData}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <AdminDashboard />
      </div>
    </AppLayout>
  );
}
