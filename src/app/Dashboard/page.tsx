import { auth } from "@/auth";
import { DashboardLayout } from "@/components/DashboardLayout";
import DashboardContent from "@/components/DashboardContent";

export default async function Dashboard() {
  const session = await auth();

  return (
    <DashboardLayout user={session?.user}>
      <DashboardContent user={session?.user} />
    </DashboardLayout>
  );
}
