import { auth } from "@/auth";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-slate-500 mt-2">Manage your workspace settings.</p>
    </div>
  );
}
