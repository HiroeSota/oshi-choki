"use client";

import type { SavingRecord } from "@/lib/types";

type Props = {
  records: SavingRecord[];
  memberColor: string;
};

function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "たった今";
  if (diffMin < 60) return `${diffMin}分前`;
  if (diffHour < 24) return `${diffHour}時間前`;
  return `${diffDay}日前`;
}

const triggerEmojis: Record<string, string> = {
  SNS更新: "📱",
  生配信: "🎙️",
  ライブ参戦: "🎤",
  雑誌掲載: "📖",
};

export function RecentActivity({ records, memberColor }: Props) {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm">
      <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
        <span>📋</span>
        最近の推し貯金
      </h3>
      <ul className="space-y-3">
        {records.map((record) => (
          <li key={record.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                style={{ background: `${memberColor}18` }}
              >
                {triggerEmojis[record.trigger] ?? "✨"}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{record.trigger}</p>
                <p className="text-xs text-gray-400">{formatRelativeTime(record.savedAt)}</p>
              </div>
            </div>
            <span className="text-sm font-bold" style={{ color: memberColor }}>
              +{record.amount.toLocaleString()}円
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
