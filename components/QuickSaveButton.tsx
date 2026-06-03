"use client";

import { useState } from "react";
import type { SavingRule } from "@/lib/types";

type Props = {
  rule: SavingRule;
  memberColor: string;
  onSave: (rule: SavingRule) => void;
};

export function QuickSaveButton({ rule, memberColor, onSave }: Props) {
  const [isAnimating, setIsAnimating] = useState(false);

  function handleTap() {
    if (isAnimating) return;
    setIsAnimating(true);
    onSave(rule);
    setTimeout(() => setIsAnimating(false), 600);
  }

  return (
    <button
      type="button"
      onClick={handleTap}
      className="relative flex flex-col items-center gap-2 rounded-2xl p-4 bg-white border-2 transition-all duration-150 active:scale-95 shadow-sm hover:shadow-md cursor-pointer w-full"
      style={{
        borderColor: isAnimating ? memberColor : "#f0f0f0",
      }}
    >
      {/* +金額 アニメーション */}
      {isAnimating && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 font-bold text-sm animate-bounce-up pointer-events-none"
          style={{ color: memberColor }}
        >
          +{rule.amount.toLocaleString()}円
        </span>
      )}

      <span className="text-2xl">{rule.emoji}</span>
      <span className="text-xs font-medium text-gray-600 leading-tight text-center">
        {rule.trigger}
      </span>
      <span
        className="text-sm font-bold"
        style={{ color: memberColor }}
      >
        +{rule.amount.toLocaleString()}円
      </span>
    </button>
  );
}
