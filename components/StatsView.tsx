"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SavingRecord } from "@/lib/types";

type Props = {
  memberColor: string;
  oshiName: string;
  oshiEmoji: string;
  records: SavingRecord[];
};

function buildMonthlyData(records: SavingRecord[]) {
  const months: { label: string; key: string; amount: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: `${d.getMonth() + 1}月`,
      amount: 0,
    });
  }
  for (const r of records) {
    const d = new Date(r.savedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const found = months.find((m) => m.key === key);
    if (found) found.amount += r.amount;
  }
  return months;
}

function buildTriggerData(records: SavingRecord[]) {
  const map: Record<string, number> = {};
  for (const r of records) {
    map[r.trigger] = (map[r.trigger] ?? 0) + r.amount;
  }
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([trigger, amount]) => ({ trigger, amount }));
}

type CustomTooltipProps = {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
};

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-2xl shadow-lg px-4 py-2.5 border border-gray-100">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="font-bold text-gray-800 text-sm">
        {payload[0].value.toLocaleString()}円
      </p>
    </div>
  );
}

export function StatsView({ memberColor, oshiName, oshiEmoji, records }: Props) {
  const totalAmount = records.reduce((s, r) => s + r.amount, 0);
  const monthlyData = buildMonthlyData(records);
  const triggerData = buildTriggerData(records);
  const maxTriggerAmount = triggerData[0]?.amount ?? 1;

  const thisMonth = new Date().getMonth();
  const thisMonthTotal = records
    .filter((r) => new Date(r.savedAt).getMonth() === thisMonth)
    .reduce((s, r) => s + r.amount, 0);

  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastMonthTotal = records
    .filter((r) => new Date(r.savedAt).getMonth() === lastMonth)
    .reduce((s, r) => s + r.amount, 0);

  const diff = thisMonthTotal - lastMonthTotal;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
          >
            ←
          </Link>
          <h1 className="font-bold text-gray-800 text-base">統計</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pb-32 pt-4 space-y-4">
        {/* サマリーカード */}
        <div
          className="rounded-3xl p-5 text-white shadow-xl relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${memberColor}ee 0%, ${memberColor}88 100%)`,
          }}
        >
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20 bg-white" />
          <div className="relative z-10">
            <p className="text-white/70 text-xs mb-1">
              {oshiEmoji} {oshiName} の推し貯金 累計
            </p>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-bold">{totalAmount.toLocaleString()}</span>
              <span className="text-white/80 text-sm">円</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "今月", value: `${thisMonthTotal.toLocaleString()}円` },
                {
                  label: "先月比",
                  value: diff >= 0 ? `+${diff.toLocaleString()}円` : `${diff.toLocaleString()}円`,
                },
                { label: "全記録", value: `${records.length}回` },
              ].map((s) => (
                <div key={s.label} className="bg-white/20 rounded-2xl p-2.5 text-center">
                  <p className="text-white font-bold text-sm">{s.value}</p>
                  <p className="text-white/70 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 月別グラフ */}
        <section className="bg-white rounded-3xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-700 text-sm mb-4 flex items-center gap-2">
            <span>📅</span> 月別推し貯金
          </h2>
          {records.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">まだデータがありません</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : `${v}`)}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: `${memberColor}11` }} />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {monthlyData.map((entry, index) => (
                    <Cell
                      key={entry.key}
                      fill={
                        index === monthlyData.length - 1
                          ? memberColor
                          : `${memberColor}55`
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>

        {/* きっかけ別内訳 */}
        <section className="bg-white rounded-3xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-700 text-sm mb-4 flex items-center gap-2">
            <span>⚡</span> きっかけ別内訳
          </h2>
          {triggerData.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">まだデータがありません</p>
          ) : (
            <ul className="space-y-3">
              {triggerData.map(({ trigger, amount }) => (
                <li key={trigger}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-700 font-medium">{trigger}</span>
                    <span className="text-sm font-bold" style={{ color: memberColor }}>
                      {amount.toLocaleString()}円
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(amount / maxTriggerAmount) * 100}%`,
                        background: memberColor,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {/* 戻るボタン */}
      <div className="fixed bottom-0 left-0 right-0 pb-6 flex justify-center">
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-sm font-bold shadow-md border border-gray-100 hover:shadow-lg transition-all active:scale-95"
          style={{ color: memberColor }}
        >
          ← ダッシュボードに戻る
        </Link>
      </div>
    </div>
  );
}
