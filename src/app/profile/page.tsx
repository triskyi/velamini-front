import { auth } from "@/auth";

export default async function ProfilePage() {
  const session = await auth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="text-slate-500 mt-2">View and manage your profile.</p>
    </div>
  );
}
