"use client";

import { useState } from "react";
import { useCoinSound } from "@/hooks/useCoinSound";
import type { SavingRule } from "@/lib/types";

type Props = {
  rule: SavingRule;
  memberColor: string;
  onSave: (rule: SavingRule) => void;
};

export function QuickSaveButton({ rule, memberColor, onSave }: Props) {
  const [isAnimating, setIsAnimating] = useState(false);
  const { play } = useCoinSound();

  function handleTap() {
    if (isAnimating) return;
    setIsAnimating(true);
    play();
    onSave(rule);
    setTimeout(() => setIsAnimating(false), 600);
  }

  return (
    <button
      type="button"
      onClick={handleTap}
      className="relative flex flex-col items-center gap-2 rounded-2xl p-4 border-2 transition-all duration-150 active:scale-95 cursor-pointer w-full"
      style={{
        background: isAnimating ? `${memberColor}22` : `${memberColor}0d`,
        borderColor: isAnimating ? memberColor : `${memberColor}44`,
        boxShadow: isAnimating ? `0 4px 16px ${memberColor}33` : `0 2px 8px ${memberColor}15`,
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
