import { auth } from "@/auth";
import { DashboardLayout } from "@/components/DashboardLayout";

export default async function ProfilePage() {
  const session = await auth();

  return (
    <DashboardLayout user={session?.user}>
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Profile</h1>
          <p className="mt-1 text-sm text-slate-500">View and edit your profile information.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
