"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { updateOshiOrder } from "@/app/actions";
import type { DbOshi, DbSavingGoal } from "@/lib/types";

type Props = {
  oshis: DbOshi[];
  goalsByOshiId: Record<string, DbSavingGoal>;
};

export function OshiListManager({ oshis: initialOshis, goalsByOshiId }: Props) {
  const [oshis, setOshis] = useState(initialOshis);
  const [isPending, startTransition] = useTransition();

  function move(index: number, direction: "up" | "down") {
    const newOshis = [...oshis];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newOshis[index], newOshis[swapIndex]] = [newOshis[swapIndex], newOshis[index]];
    setOshis(newOshis);
    startTransition(async () => {
      await updateOshiOrder(newOshis.map((o) => o.id));
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
          <h1 className="font-bold text-gray-800 text-base">推し一覧</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pb-24 pt-4 space-y-3">
        {oshis.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-8">
            まだ推しが登録されていません
          </p>
        )}

        {oshis.map((o, index) => {
          const goal = goalsByOshiId[o.id];
          const current = goal?.current_amount ?? 0;
          return (
            <div
              key={o.id}
              className="rounded-3xl overflow-hidden shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${o.member_color} 0%, ${o.member_color}99 100%)`,
              }}
            >
              <div className="p-5 flex items-center gap-4">
                {o.image_url ? (
                  <img
                    src={o.image_url}
                    alt={o.name}
                    className="w-14 h-14 rounded-2xl object-cover shadow"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center text-3xl">
                    🌸
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  {index === 0 && (
                    <span className="text-xs bg-white/30 text-white font-bold px-2 py-0.5 rounded-full mb-1 inline-block">
                      トップ表示
                    </span>
                  )}
                  <p className="font-bold text-white text-base leading-tight truncate">
                    {o.name}
                  </p>
                  {o.group_name && (
                    <p className="text-white/80 text-xs mt-0.5 truncate">{o.group_name}</p>
                  )}
                  <p className="text-white font-bold text-sm mt-1">
                    {current.toLocaleString()}円 貯金済み
                  </p>
                </div>

                <div className="flex flex-col gap-1 items-center flex-shrink-0">
                  {/* 並び替えボタン */}
                  {oshis.length > 1 && (
                    <div className="flex flex-col gap-1 mb-2">
                      <button
                        type="button"
                        disabled={index === 0 || isPending}
                        onClick={() => move(index, "up")}
                        className="w-7 h-7 rounded-lg bg-white/20 text-white text-xs flex items-center justify-center disabled:opacity-30 hover:bg-white/30 transition-colors"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={index === oshis.length - 1 || isPending}
                        onClick={() => move(index, "down")}
                        className="w-7 h-7 rounded-lg bg-white/20 text-white text-xs flex items-center justify-center disabled:opacity-30 hover:bg-white/30 transition-colors"
                      >
                        ↓
                      </button>
                    </div>
                  )}
                  <Link
                    href={`/settings/oshi/${o.id}`}
                    className="px-4 py-2 rounded-xl bg-white/20 text-white text-sm font-bold hover:bg-white/30 transition-colors"
                  >
                    編集
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        <Link
          href="/settings/oshi/new"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-3xl border-2 border-dashed border-gray-300 text-gray-500 font-bold text-sm hover:border-pink-300 hover:text-pink-400 transition-colors"
        >
          + 新しい推しを追加
        </Link>
      </main>
    </div>
  );
}
