"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp } from "lucide-react";

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  isGenerating?: boolean;
  placeholder?: string;
}

export function ChatInput({
  input,
  onInputChange,
  onSubmit,
  isGenerating,
  placeholder = "Type a message...",
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isGenerating) {
        onSubmit();
      }
    }
  };

  return (
    <div className="relative flex items-center rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 transition-colors focus-within:border-periwinkle/50 focus-within:bg-white/[0.06]">
      <Input
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isGenerating}
        className="h-10 flex-1 border-0 bg-transparent px-3 text-sm text-white placeholder:text-white/40 focus-visible:ring-0 md:text-sm"
      />
      <Button
        size="icon-sm"
        variant="default"
        onClick={onSubmit}
        disabled={!input.trim() || isGenerating}
        className="rounded-xl bg-periwinkle text-black hover:bg-periwinkle/90 disabled:opacity-30"
      >
        <ArrowUp className="size-4" />
      </Button>
    </div>
  );
}

export default ChatInput;
