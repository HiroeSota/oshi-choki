"use client";

import type { Oshi, SavingGoal } from "@/lib/types";

type Props = {
  oshi: Oshi;
  goal: SavingGoal;
  totalSaved: number;
};

export function OshiCard({ oshi, goal, totalSaved }: Props) {
  const progressPct = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);

  return (
    <div
      className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${oshi.memberColor}ee 0%, ${oshi.memberColor}88 100%)`,
      }}
    >
      {oshi.imageUrl ? (
        <img
          src={oshi.imageUrl}
          alt={oshi.name}
          className="absolute inset-y-0 right-0 h-full w-3/5 object-cover object-top"
          style={{
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.5) 100%)",
            maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.5) 100%)",
          }}
        />
      ) : (
        <>
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20" style={{ background: "white" }} />
          <div className="absolute -bottom-12 -left-6 w-32 h-32 rounded-full opacity-10" style={{ background: "white" }} />
        </>
      )}

      <div className="relative z-10">
        {/* ヘッダー */}
        <div className="mb-5">
          <p className="text-white/70 text-xs font-medium tracking-widest uppercase">
            {oshi.group}
          </p>
          <h2 className="text-2xl font-bold">{oshi.name}</h2>
        </div>

        {/* 貯金額 */}
        <div className="mb-5">
          <p className="text-white/70 text-xs mb-1">現在の推し貯金</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold tracking-tight">
              {goal.currentAmount.toLocaleString()}
            </span>
            <span className="text-white/80 text-sm font-medium">円</span>
          </div>
        </div>

        {/* 目標プログレス */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/80 text-xs">
              {goal.emoji} {goal.label}
            </span>
            <span className="text-white font-bold text-sm">{progressPct}%</span>
          </div>
          <div className="h-2.5 bg-white/30 rounded-full overflow-hidden relative">
            <div
              className="h-full rounded-full bg-white transition-all duration-700 ease-out"
              style={{ width: `${progressPct}%` }}
            />
            {[30, 50, 80].map((pct) => (
              <div
                key={pct}
                className="absolute top-0 bottom-0 w-px bg-white/40"
                style={{ left: `${pct}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-white/60 text-xs">0円</span>
            <span className="text-white/60 text-xs">
              目標 {goal.targetAmount.toLocaleString()}円
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
