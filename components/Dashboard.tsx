"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { saveMoney, signOut, undoSave } from "@/app/actions";
import { BottomNav } from "@/components/BottomNav";
import { OshiCard } from "@/components/OshiCard";
import { QuickSaveButton } from "@/components/QuickSaveButton";
import { RecentActivity } from "@/components/RecentActivity";
import type { Oshi, SavingGoal, SavingRecord, SavingRule } from "@/lib/types";

type Props = {
  oshi: Oshi;
  goal: SavingGoal;
  rules: SavingRule[];
  records: SavingRecord[];
  allOshis: Oshi[];
};

const MILESTONES = [
  { pct: 30, emoji: "🌱", text: "いい調子！この調子でいこう！" },
  { pct: 50, emoji: "🎯", text: "折り返し地点！あと半分！" },
  { pct: 80, emoji: "🔥", text: "あと少し！もうすぐ達成！" },
] as const;

type Milestone = typeof MILESTONES[number];

export function Dashboard({ oshi, goal, rules, records, allOshis }: Props) {
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ amount: number; recordId: string } | null>(null);
  const [showAchievement, setShowAchievement] = useState(false);
  const [milestone, setMilestone] = useState<Milestone | null>(null);

  const [optimisticGoal, addOptimisticAmount] = useOptimistic(
    goal,
    (state, amount: number) => ({
      ...state,
      currentAmount: state.currentAmount + amount,
    })
  );

  function handleSave(rule: SavingRule) {
    const wasAlreadyAchieved = optimisticGoal.currentAmount >= optimisticGoal.targetAmount;
    const prevPct = (optimisticGoal.currentAmount / optimisticGoal.targetAmount) * 100;
    const nextPct = ((optimisticGoal.currentAmount + rule.amount) / optimisticGoal.targetAmount) * 100;
    const crossedMilestone = !wasAlreadyAchieved
      ? (MILESTONES.find((m) => prevPct < m.pct && nextPct >= m.pct) ?? null)
      : null;

    startTransition(async () => {
      addOptimisticAmount(rule.amount);
      const { achieved, recordId } = await saveMoney(rule, oshi.id);
      if (achieved && !wasAlreadyAchieved) {
        setShowAchievement(true);
      } else if (crossedMilestone) {
        setMilestone(crossedMilestone);
        setTimeout(() => setMilestone(null), 4000);
      }
      setToast({ amount: rule.amount, recordId });
      setTimeout(() => setToast(null), 5000);
    });
  }

  function handleUndo() {
    if (!toast) return;
    const { amount, recordId } = toast;
    setToast(null);
    startTransition(async () => {
      addOptimisticAmount(-amount);
      await undoSave(recordId, oshi.id, amount);
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-3xl p-8 mx-6 text-center shadow-2xl animate-modal-in">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">目標達成！</h2>
            <p className="text-gray-500 mb-2">{goal.label}</p>
            <p className="text-3xl font-bold mb-4" style={{ color: oshi.memberColor }}>
              ¥{goal.targetAmount.toLocaleString()}
            </p>
            {oshi.congratulationMessage && (
              <div
                className="rounded-2xl px-4 py-3 mb-6 text-sm font-medium text-white"
                style={{ backgroundColor: oshi.memberColor }}
              >
                <span className="block text-xs opacity-80 mb-1">{oshi.name}より</span>
                「{oshi.congratulationMessage}」
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowAchievement(false)}
              className="w-full py-3 rounded-2xl font-bold text-white"
              style={{ backgroundColor: oshi.memberColor }}
            >
              とじる
            </button>
          </div>
        </div>
      )}
      {milestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-3xl p-7 mx-6 text-center shadow-2xl animate-modal-in">
            <div className="text-5xl mb-3">{milestone.emoji}</div>
            <p className="text-2xl font-bold mb-1" style={{ color: oshi.memberColor }}>
              {milestone.pct}% 達成！
            </p>
            <p className="text-gray-500 text-sm mb-5">{milestone.text}</p>
            <button
              type="button"
              onClick={() => setMilestone(null)}
              className="w-full py-3 rounded-2xl font-bold text-white"
              style={{ backgroundColor: oshi.memberColor }}
            >
              やったー！
            </button>
          </div>
        </div>
      )}

      {/* ヘッダー */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">💝</span>
            <span className="font-bold text-gray-800 tracking-tight text-lg">Oshi-Choki</span>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ログアウト
            </button>
          </form>
        </div>

        {/* 推し切り替えピル（複数推しがいる場合のみ表示） */}
        {allOshis.length > 1 && (
          <div className="max-w-md mx-auto px-4 pb-3 flex gap-3 overflow-x-auto scrollbar-hide">
            {allOshis.map((o) => {
              const isSelected = o.id === oshi.id;
              return (
                <Link
                  key={o.id}
                  href={`/?oshi_id=${o.id}`}
                  className="flex flex-col items-center gap-1 flex-shrink-0"
                >
                  {o.imageUrl ? (
                    <img
                      src={o.imageUrl}
                      alt={o.name}
                      className="w-8 h-8 rounded-full object-cover transition-all"
                      style={{
                        boxShadow: isSelected
                          ? `0 0 0 2px white, 0 0 0 4px ${o.memberColor}`
                          : "none",
                        opacity: isSelected ? 1 : 0.6,
                      }}
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full transition-all"
                      style={{
                        background: o.memberColor,
                        boxShadow: isSelected
                          ? `0 0 0 2px white, 0 0 0 4px ${o.memberColor}`
                          : "none",
                        opacity: isSelected ? 1 : 0.6,
                      }}
                    />
                  )}
                  <span
                    className="text-xs leading-tight max-w-[3rem] text-center truncate"
                    style={{ color: isSelected ? o.memberColor : "#9ca3af" }}
                  >
                    {o.name}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      <main className="max-w-md mx-auto px-4 pb-24 space-y-4 pt-4">
        <OshiCard oshi={oshi} goal={optimisticGoal} totalSaved={optimisticGoal.currentAmount} />

        {/* トースト */}
        {toast !== null && (
          <div
            className="fixed top-20 inset-x-0 mx-auto w-fit z-50 flex items-center gap-3 px-5 py-3 rounded-2xl text-white font-bold text-sm shadow-lg animate-toast-in whitespace-nowrap"
            style={{ background: oshi.memberColor }}
          >
            <span>+{toast.amount.toLocaleString()}円 貯金したよ！</span>
            <button
              type="button"
              onClick={handleUndo}
              className="text-white/80 text-xs border border-white/40 rounded-lg px-2 py-1 hover:bg-white/20 transition-colors"
            >
              取り消し
            </button>
          </div>
        )}

        {/* ワンタップ貯金 */}
        {rules.length > 0 ? (
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
        ) : (
          <section className="bg-white rounded-3xl p-5 shadow-sm text-center">
            <p className="text-gray-400 text-sm">
              ルールがまだ設定されていません
            </p>
            <p className="text-gray-400 text-xs mt-1">
              下のナビから「ルール」を設定しよう！
            </p>
          </section>
        )}

        {/* 統計サマリー */}
        <section className="grid grid-cols-3 gap-3">
          {[
            {
              label: "今月",
              value: `${records
                .filter((r) => {
                  const d = new Date(r.savedAt);
                  const now = new Date();
                  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                })
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
            <div key={stat.label} className="bg-white rounded-2xl shadow-sm text-center overflow-hidden">
              <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${oshi.memberColor}99, ${oshi.memberColor}44)` }} />
              <div className="p-4 pt-3">
                <div className="text-xl mb-1">{stat.emoji}</div>
                <div className="font-bold text-gray-800 text-sm">{stat.value}</div>
                <div className="text-gray-400 text-xs mt-0.5">{stat.label}</div>
              </div>
            </div>
          ))}
        </section>

        <RecentActivity records={records.slice(0, 5)} memberColor={oshi.memberColor} />
      </main>

      <BottomNav memberColor={oshi.memberColor} />
    </div>
  );
}
