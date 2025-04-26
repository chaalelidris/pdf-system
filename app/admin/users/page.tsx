import { requireAdmin } from "@/lib/auth";
import { UserManagement } from "@/components/admin/user-management";
import { AppLayout } from "@/components/layout/app-layout";

export default async function UsersPage() {
  const user = await requireAdmin();

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
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <UserManagement />
      </div>
    </AppLayout>
  );
}
