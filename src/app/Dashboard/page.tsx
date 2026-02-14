import { auth } from "@/auth";
import Sidebar from '@/components/Sidebar';
import DashboardContent from '@/components/DashboardContent';

export default async function Dashboard() {
  const session = await auth();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0f111a] font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar user={session?.user} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <DashboardContent user={session?.user} />
      </main>
    </div>
  );
}
