"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  Bot,
  CalendarClock,
  CheckCircle2,
  Clock3,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Users,
  WandSparkles,
} from "lucide-react";

interface DashboardContentProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const engagementData = [
  { name: "Mon", chats: 34, sessions: 20 },
  { name: "Tue", chats: 47, sessions: 26 },
  { name: "Wed", chats: 39, sessions: 24 },
  { name: "Thu", chats: 60, sessions: 35 },
  { name: "Fri", chats: 71, sessions: 41 },
  { name: "Sat", chats: 58, sessions: 32 },
  { name: "Sun", chats: 66, sessions: 38 },
];

const accuracyData = [
  { name: "Week 1", score: 67 },
  { name: "Week 2", score: 72 },
  { name: "Week 3", score: 81 },
  { name: "Week 4", score: 88 },
];

const channelData = [
  { name: "Website", value: 58, color: "#0ea5e9" },
  { name: "WhatsApp", value: 27, color: "#14b8a6" },
  { name: "Other", value: 15, color: "#94a3b8" },
];

const activities = [
  {
    title: "Knowledge profile updated",
    description: "3 new project entries were added to your virtual self profile.",
    time: "10 min ago",
  },
  {
    title: "Feedback score improved",
    description: "Average rating moved from 4.3 to 4.6 this week.",
    time: "46 min ago",
  },
  {
    title: "WhatsApp assistant active",
    description: "Your assistant replied to 19 incoming messages today.",
    time: "2 hrs ago",
  },
];

const kpis = [
  {
    label: "Total Conversations",
    value: "3,248",
    change: "+18.2%",
    icon: MessageSquare,
  },
  {
    label: "Training Accuracy",
    value: "88%",
    change: "+6.1%",
    icon: WandSparkles,
  },
  {
    label: "Active Users",
    value: "1,420",
    change: "+12.4%",
    icon: Users,
  },
  {
    label: "Automation Success",
    value: "97.1%",
    change: "+2.8%",
    icon: CheckCircle2,
  },
];

export default function DashboardContent({ user }: DashboardContentProps) {
  return (
    <div className="min-h-screen bg-[#f3f6fa] text-slate-800">
      <div className="mx-auto max-w-[1400px] p-6 md:p-8 space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                <Sparkles className="h-3.5 w-3.5" />
                Virtual Self Workspace
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                Welcome back, {user?.name || "Creator"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500 md:text-base">
                Manage your AI persona, monitor engagement, and improve response quality with real-time insights.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-3 lg:w-auto">
              <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                <Bot className="h-4 w-4" />
                Train Assistant
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                <CalendarClock className="h-4 w-4" />
                Schedule Session
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                <ArrowUpRight className="h-4 w-4" />
                Export Report
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">{item.label}</p>
                  <span className="rounded-lg bg-slate-100 p-2 text-slate-600">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <h2 className="text-3xl font-semibold text-slate-900">{item.value}</h2>
                  <p className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {item.change}
                  </p>
                </div>
              </article>
            );
          })}
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <article className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Engagement Trend</h3>
                <p className="text-sm text-slate-500">Conversations and active sessions over the last 7 days</p>
              </div>
              <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Last 7 days</p>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={engagementData}>
                  <defs>
                    <linearGradient id="chatGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="chats"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    fill="url(#chatGradient)"
                  />
                  <Line type="monotone" dataKey="sessions" stroke="#0f172a" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Channel Mix</h3>
            <p className="mb-3 text-sm text-slate-500">Where your assistant conversations happen</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={channelData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={76} paddingAngle={3} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {channelData.map((row) => (
                <div key={row.name} className="flex items-center justify-between text-sm">
                  <p className="inline-flex items-center gap-2 text-slate-600">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                    {row.name}
                  </p>
                  <span className="font-semibold text-slate-900">{row.value}%</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Training Accuracy Progress</h3>
                <p className="text-sm text-slate-500">Weekly quality trend from user feedback and edits</p>
              </div>
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">Quality</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={accuracyData}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis domain={[50, 100]} stroke="#64748b" />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#0f766e" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
            <p className="mb-4 text-sm text-slate-500">Latest updates from your workspace</p>
            <div className="space-y-3">
              {activities.map((item) => (
                <div key={item.title} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.description}</p>
                  <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                    <Clock3 className="h-3.5 w-3.5" />
                    {item.time}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
