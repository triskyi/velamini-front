import { auth } from "@/auth";

export default async function TrainingPage() {
  const session = await auth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Training</h1>
      <p className="text-slate-500 mt-2">Train your virtual self.</p>
    </div>
  );
}
