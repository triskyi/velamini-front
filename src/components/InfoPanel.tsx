const tasks = [
  { title: "Finish React UI", progress: 70 },
  { title: "Plan AI Memory Layer", progress: 30 },
];

export default function InfoPanel() {
  return (
    <div className="w-64 bg-gray-900 flex flex-col p-4 border-l border-gray-700">
      <h2 className="text-lg font-bold mb-4 neon-text">Today’s Tasks</h2>
      {tasks.map((task, idx) => (
        <div key={idx} className="mb-4">
          <div className="flex justify-between mb-1 text-textPrimary">
            <span>{task.title}</span>
            <span>{task.progress}%</span>
          </div>
          <div className="w-full bg-gray-800 h-2 rounded">
            <div
              className="h-2 rounded bg-neonGreen"
              style={{ width: `${task.progress}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}
