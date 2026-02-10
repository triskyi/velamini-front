// Color palette and configuration
export const colors = {
  cyan: "cyan-400",
  purple: "purple-400",
  green: "green-400",
  pink: "pink-400",
  blue: "blue-500",
  red: "red-500",
  orange: "orange-400",
  emerald: "emerald-500",
  yellow: "yellow-400",
};

export const bgGradients = {
  cyan: "from-cyan-400 to-blue-500",
  purple: "from-purple-400 to-pink-500",
  green: "from-green-400 to-emerald-500",
  warm: "from-orange-400 to-red-500",
};

export const glassEffect = "backdrop-blur-lg bg-gray-900/30 border border-gray-700/50";
export const glassEffectDarker = "bg-[#0B0F1A]/60 backdrop-blur-lg border-l border-gray-800/50";
export const border = "border border-gray-800/50";
export const borderCyan = "border-cyan-400/30";
export const borderPurple = "border-purple-400/30";

export const menuItems = [
  {
    name: "Dashboard",
    color: colors.cyan,
    colorBg: "bg-cyan-400",
    borderColor: "border-cyan-400",
    glowBg: "bg-cyan-400/20",
    shadow: "shadow-cyan-400/40",
  },
  {
    name: "Chat",
    color: colors.purple,
    colorBg: "bg-purple-500",
    borderColor: "border-purple-400",
    glowBg: "bg-purple-400/20",
    shadow: "shadow-purple-400/40",
  },
  {
    name: "Tasks",
    color: colors.green,
    colorBg: "bg-green-400",
    borderColor: "border-green-400",
    glowBg: "bg-green-400/20",
    shadow: "shadow-green-400/40",
  },
  {
    name: "Settings",
    color: colors.pink,
    colorBg: "bg-pink-400",
    borderColor: "border-pink-400",
    glowBg: "bg-pink-400/20",
    shadow: "shadow-pink-400/40",
  },
];

export const taskGradients = [
  bgGradients.cyan,
  bgGradients.purple,
  bgGradients.green,
  bgGradients.warm,
];
