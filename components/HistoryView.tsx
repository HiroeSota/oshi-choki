"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Oshi, SavingRecord } from "@/lib/types";

type RecordWithEmoji = SavingRecord & { emoji: string };

type DayGroup = {
  label: string;
  dateKey: string;
  total: number;
  records: RecordWithEmoji[];
};

function getLocalDateKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (getLocalDateKey(dateStr) === getLocalDateKey(today.toISOString())) return "今日";
  if (getLocalDateKey(dateStr) === getLocalDateKey(yesterday.toISOString())) return "昨日";
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function groupByDay(records: RecordWithEmoji[]): DayGroup[] {
  const map = new Map<string, DayGroup>();
  for (const record of records) {
    const key = getLocalDateKey(record.savedAt);
    if (!map.has(key)) {
      map.set(key, { label: formatDateLabel(record.savedAt), dateKey: key, total: 0, records: [] });
    }
    const group = map.get(key)!;
    group.total += record.amount;
    group.records.push(record);
  }
  return Array.from(map.values());
}

type Props = {
  records: RecordWithEmoji[];
  memberColor: string;
  allOshis: Oshi[];
  selectedOshiId: string;
  currentAmount: number;
};

export function HistoryView({ records, memberColor, allOshis, selectedOshiId, currentAmount }: Props) {
  const router = useRouter();
  const dayGroups = groupByDay(records);

  // 最新日だけ初期展開
  const [openKeys, setOpenKeys] = useState<Set<string>>(
    () => new Set(dayGroups.length > 0 ? [dayGroups[0].dateKey] : [])
  );

  function toggleGroup(dateKey: string) {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(dateKey)) {
        next.delete(dateKey);
      } else {
        next.add(dateKey);
      }
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
          >
            ←
          </Link>
          <h1 className="font-bold text-gray-800 text-base">貯金履歴</h1>
        </div>
      </header>

      {allOshis.length > 1 && (
        <div className="max-w-md mx-auto px-4 pt-3 flex gap-2 overflow-x-auto">
          {allOshis.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => router.push(`/history?oshi_id=${o.id}`)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all active:scale-95 touch-manipulation"
              style={{
                background: o.id === selectedOshiId ? o.memberColor : "#f3f4f6",
                color: o.id === selectedOshiId ? "white" : "#6a7282",
              }}
            >
              {o.imageUrl ? (
                <img src={o.imageUrl} alt={o.name} className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <span>{o.emoji}</span>
              )}
              {o.name}
            </button>
          ))}
        </div>
      )}

      <main className="max-w-md mx-auto px-4 pb-28 pt-4 space-y-4">
        {/* 累計バナー */}
        <div
          className="rounded-3xl p-5"
          style={{ background: `linear-gradient(135deg, ${memberColor}ee, ${memberColor}99)` }}
        >
          <p className="text-white/80 text-xs font-medium mb-1">現在の推し貯金</p>
          <p className="text-white text-3xl font-bold">
            {currentAmount.toLocaleString()}
            <span className="text-lg ml-1">円</span>
          </p>
          <p className="text-white/70 text-xs mt-1">全{records.length}件の記録</p>
        </div>

        {/* 履歴リスト */}
        {dayGroups.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-400 text-sm">まだ貯金記録がありません</p>
          </div>
        ) : (
          dayGroups.map((group) => {
            const isOpen = openKeys.has(group.dateKey);
            return (
              <section key={group.dateKey} className="bg-white rounded-3xl shadow-sm overflow-hidden">
                {/* 日付ヘッダー（タップで開閉） */}
                <button
                  type="button"
                  onClick={() => toggleGroup(group.dateKey)}
                  className="w-full flex items-center justify-between px-5 py-4 touch-manipulation active:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs transition-transform duration-300"
                      style={{
                        display: "inline-block",
                        transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
                        color: memberColor,
                      }}
                    >
                      ▼
                    </span>
                    <span className="text-sm font-bold text-gray-700">{group.label}</span>
                    <span className="text-xs text-gray-400">{group.records.length}件</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: memberColor }}>
                    +{group.total.toLocaleString()}円
                  </span>
                </button>

                {/* 記録リスト（アコーディオン） */}
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: isOpen ? `${group.records.length * 64}px` : "0px" }}
                >
                  <ul className="border-t border-gray-50 divide-y divide-gray-50">
                    {group.records.map((record) => (
                      <li key={record.id} className="flex items-center gap-3 px-5 py-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                          style={{ background: `${memberColor}18` }}
                        >
                          {record.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">{record.trigger}</p>
                          <p className="text-xs text-gray-400">{formatTime(record.savedAt)}</p>
                        </div>
                        <span className="text-sm font-bold flex-shrink-0" style={{ color: memberColor }}>
                          +{record.amount.toLocaleString()}円
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            );
          })
        )}
      </main>
    </div>
  );
}
