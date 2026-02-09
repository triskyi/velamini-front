const tasks = [
  { title: "Finish React UI", progress: 70 },
  { title: "Plan AI Memory Layer", progress: 30 },
];

export default function InfoPanel() {
  return (
    <aside className="w-64 p-4 rounded-l-lg border-l border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-bg">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-gray-900 dark:neon-text dark:text-textPrimary">Today’s Tasks</h2>
        <span className="text-sm text-gray-600 dark:text-gray-400">3</span>
      </div>

      <div className="space-y-4">
        {tasks.map((task, idx) => (
          <div key={idx} className="mb-2">
            <div className="flex justify-between mb-1 text-gray-900 dark:text-textPrimary">
              <span>{task.title}</span>
              <span>{task.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-800 h-2 rounded overflow-hidden">
              <div className="h-2 rounded bg-green-500 dark:bg-neonGreen" style={{ width: `${task.progress}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3">
        <div className="p-3 rounded-lg bg-white/60 dark:bg-[rgba(11,15,26,0.45)] border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm text-gray-900 dark:text-textPrimary mb-2">Review Notes</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-xs text-gray-700 dark:text-gray-300">Icon</div>
            <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-xs text-gray-700 dark:text-gray-300">Remind</div>
            <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-xs text-gray-700 dark:text-gray-300">Analyze</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
