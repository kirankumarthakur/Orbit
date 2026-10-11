export const ORB_COLORS = {
  bg: "oklch(0.22 0.03 145)",
  c1: "oklch(0.84 0.18 132)",
  c2: "oklch(0.75 0.16 55)",
  c3: "oklch(0.72 0.1 150)",
  c4: "oklch(0.9 0.05 135)",
};

export const initialsFrom = (label: string) => {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "O";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
};
