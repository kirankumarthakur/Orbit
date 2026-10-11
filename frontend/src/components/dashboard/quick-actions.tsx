"use client";

import { Button } from "@/components/ui/button";
import { Calendar, AlertCircle, Clock, Sparkles } from "lucide-react";

interface QuickActionsProps {
  onSelectAction: (prompt: string) => void;
  disabled?: boolean;
}

const ACTION_PROMPTS = [
  {
    icon: Calendar,
    label: "Summarize today's schedule",
    prompt: "Summarize my schedule for today, highlight key meetings and free blocks.",
  },
  {
    icon: AlertCircle,
    label: "Detect conflicts this week",
    prompt: "Check my calendar for any overlapping events or scheduling conflicts this week.",
  },
  {
    icon: Clock,
    label: "Find 45m free slot tomorrow",
    prompt: "Find the best 45-minute focus or meeting slot on my calendar tomorrow.",
  },
  {
    icon: Sparkles,
    label: "Plan meeting prep buffer",
    prompt: "Review my upcoming meetings and propose 15-minute preparation buffers before each.",
  },
];

export function QuickActions({ onSelectAction, disabled }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {ACTION_PROMPTS.map((item) => {
        const IconComponent = item.icon;
        return (
          <Button
            key={item.label}
            variant="outline"
            size="xs"
            disabled={disabled}
            onClick={() => onSelectAction(item.prompt)}
            className="rounded-full border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.08] hover:text-white"
          >
            <IconComponent data-icon="inline-start" className="text-periwinkle" />
            <span>{item.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
