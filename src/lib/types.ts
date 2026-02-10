// Shared type definitions
export type MessageType = {
  id: number;
  text: string;
  isUser: boolean;
};

export type TaskStatus = "progress" | "pending" | "completed";

export type TaskType = {
  id: number;
  title: string;
  progress: number;
  status: TaskStatus;
  gradient: string;
};

export type MenuItem = {
  name: string;
  color: string;
  colorBg: string;
  borderColor: string;
  glowBg: string;
  shadow: string;
};
