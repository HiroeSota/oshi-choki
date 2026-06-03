"use client";

import { useOptimistic, useState, useTransition } from "react";
import { saveMoney } from "@/app/actions";
import { OshiCard } from "@/components/OshiCard";
import { QuickSaveButton } from "@/components/QuickSaveButton";
import { RecentActivity } from "@/components/RecentActivity";
import type { Oshi, SavingGoal, SavingRecord, SavingRule } from "@/lib/types";

type Props = {
  oshi: Oshi;
  goal: SavingGoal;
  rules: SavingRule[];
  records: SavingRecord[];
};

export function Dashboard({ oshi, goal, rules, records }: Props) {
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<number | null>(null);

  const [optimisticGoal, addOptimisticAmount] = useOptimistic(
    goal,
    (state, amount: number) => ({
      ...state,
      currentAmount: state.currentAmount + amount,
    })
  );

  function handleSave(rule: SavingRule) {
    setToast(rule.amount);
    setTimeout(() => setToast(null), 1500);

    startTransition(async () => {
      addOptimisticAmount(rule.amount);
      await saveMoney(rule, oshi.id);
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">💝</span>
            <span className="font-bold text-gray-800 tracking-tight text-lg">Oshi-Choki</span>
          </div>
          <button
            type="button"
            className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-sm hover:bg-gray-200 transition-colors"
            aria-label="設定"
          >
            ⚙️
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pb-24 space-y-4 pt-4">
        <OshiCard oshi={oshi} goal={optimisticGoal} totalSaved={optimisticGoal.currentAmount} />

        {/* トースト */}
        {toast !== null && (
          <div
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full text-white font-bold text-sm shadow-lg animate-fade-in-up"
            style={{ background: oshi.memberColor }}
          >
            +{toast.toLocaleString()}円 貯金したよ！
          </div>
        )}

        {/* ワンタップ貯金 */}
        <section className="bg-white rounded-3xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
            <span>⚡</span>
            ワンタップ推し貯金
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {rules.map((rule) => (
              <QuickSaveButton
                key={rule.id}
                rule={rule}
                memberColor={oshi.memberColor}
                onSave={handleSave}
              />
            ))}
          </div>
        </section>

        {/* 統計サマリー */}
        <section className="grid grid-cols-3 gap-3">
          {[
            {
              label: "今月",
              value: `${records
                .filter((r) => new Date(r.savedAt).getMonth() === new Date().getMonth())
                .reduce((s, r) => s + r.amount, 0)
                .toLocaleString()}円`,
              emoji: "📅",
            },
            { label: "回数", value: `${records.length}回`, emoji: "🎯" },
            {
              label: "平均",
              value: `${Math.round(goal.currentAmount / Math.max(records.length, 1)).toLocaleString()}円`,
              emoji: "📊",
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm text-center">
              <div className="text-xl mb-1">{stat.emoji}</div>
              <div className="font-bold text-gray-800 text-sm">{stat.value}</div>
              <div className="text-gray-400 text-xs mt-0.5">{stat.label}</div>
            </div>
          ))}
        </section>

        <RecentActivity records={records.slice(0, 5)} memberColor={oshi.memberColor} />
      </main>

      {/* ボトムナビ */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
          {[
            { icon: "🏠", label: "ホーム", active: true },
            { icon: "⭐", label: "推し設定", active: false },
            { icon: "📋", label: "ルール", active: false },
            { icon: "📈", label: "統計", active: false },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors"
            >
              <span className="text-xl">{item.icon}</span>
              <span
                className="text-xs font-medium"
                style={{ color: item.active ? oshi.memberColor : "#9ca3af" }}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
