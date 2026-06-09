"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addRule, deleteRule, updateRule } from "@/app/actions";
import type { Oshi, SavingRule } from "@/lib/types";

const EMOJI_OPTIONS = ["📱", "🎙️", "🎤", "📖", "🎬", "🎵", "⭐", "🌸", "💝", "🎸", "📸", "🎪"];

type Props = {
  oshiId: string;
  memberColor: string;
  initialRules: SavingRule[];
  allOshis: Oshi[];
  selectedOshiId: string;
};

type EditState = {
  id: string;
  trigger: string;
  amount: string;
  emoji: string;
};

export function RulesManager({ oshiId, memberColor, initialRules, allOshis, selectedOshiId }: Props) {
  const router = useRouter();
  const [rules, setRules] = useState(initialRules);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [newTrigger, setNewTrigger] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newEmoji, setNewEmoji] = useState("📱");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number.parseInt(newAmount, 10);
    if (Number.isNaN(amount) || amount <= 0) {
      setError("金額は1以上の数字を入力してください");
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = await addRule({ oshiId, trigger: newTrigger, amount, emoji: newEmoji });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setRules((prev) => [
        ...prev,
        { id: result.id, oshiId, trigger: newTrigger, amount, emoji: newEmoji },
      ]);
      setNewTrigger("");
      setNewAmount("");
      setNewEmoji("📱");
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteRule(id);
      if (result && "error" in result) {
        setError(result.error);
        return;
      }
      setRules((prev) => prev.filter((r) => r.id !== id));
    });
  }

  function handleEditSave(id: string) {
    if (!editState) return;
    const amount = Number.parseInt(editState.amount, 10);
    if (Number.isNaN(amount) || amount <= 0) {
      setError("金額は1以上の数字を入力してください");
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = await updateRule(id, {
        trigger: editState.trigger,
        amount,
        emoji: editState.emoji,
      });
      if (result && "error" in result) {
        setError(result.error);
        return;
      }
      setRules((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, trigger: editState.trigger, amount, emoji: editState.emoji } : r
        )
      );
      setEditState(null);
    });
  }

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
          <h1 className="font-bold text-gray-800 text-base">貯金ルール設定</h1>
        </div>
      </header>

      {/* 推し選択タブ（複数推しがいる場合のみ表示） */}
      {allOshis.length > 1 && (
        <div className="max-w-md mx-auto px-4 pt-3 flex gap-2 overflow-x-auto">
          {allOshis.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => router.push(`/settings/rules?oshi_id=${o.id}`)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all"
              style={{
                background: o.id === selectedOshiId ? o.memberColor : "#f3f4f6",
                color: o.id === selectedOshiId ? "white" : "#6a7282",
              }}
            >
              {o.emoji} {o.name}
            </button>
          ))}
        </div>
      )}

      <main className="max-w-md mx-auto px-4 pb-24 pt-4 space-y-4">
        {/* ルール一覧 */}
        <section className="bg-white rounded-3xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-700 text-sm mb-4 flex items-center gap-2">
            <span>📋</span> 現在のルール（{rules.length}件）
          </h2>

          {rules.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              まだルールがありません。下のフォームから追加してね！
            </p>
          ) : (
            <ul className="space-y-2">
              {rules.map((rule) =>
                editState?.id === rule.id ? (
                  // 編集モード
                  <li
                    key={rule.id}
                    className="rounded-2xl p-3 space-y-2"
                    style={{ background: `${memberColor}11`, border: `1.5px solid ${memberColor}44` }}
                  >
                    <div className="flex gap-2">
                      <select
                        value={editState.emoji}
                        onChange={(e) => setEditState({ ...editState, emoji: e.target.value })}
                        className="w-14 text-center rounded-xl border border-gray-200 text-lg py-1"
                      >
                        {EMOJI_OPTIONS.map((e) => (
                          <option key={e} value={e}>{e}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={editState.trigger}
                        onChange={(e) => setEditState({ ...editState, trigger: e.target.value })}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
                        placeholder="きっかけ"
                      />
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={editState.amount}
                          onChange={(e) => setEditState({ ...editState, amount: e.target.value })}
                          className="w-20 px-2 py-1.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
                          placeholder="金額"
                        />
                        <span className="text-xs text-gray-500">円</span>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setEditState(null)}
                        className="text-xs text-gray-400 px-3 py-1.5 rounded-lg hover:bg-gray-100"
                      >
                        キャンセル
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleEditSave(rule.id)}
                        className="text-xs text-white px-3 py-1.5 rounded-lg font-bold disabled:opacity-60"
                        style={{ background: memberColor }}
                      >
                        保存
                      </button>
                    </div>
                  </li>
                ) : (
                  // 表示モード
                  <li
                    key={rule.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: `${memberColor}18` }}
                    >
                      {rule.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{rule.trigger}</p>
                      <p className="text-xs font-bold" style={{ color: memberColor }}>
                        +{rule.amount.toLocaleString()}円
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setEditState({
                            id: rule.id,
                            trigger: rule.trigger,
                            amount: rule.amount.toString(),
                            emoji: rule.emoji,
                          })
                        }
                        className="text-xs text-gray-400 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        編集
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleDelete(rule.id)}
                        className="text-xs text-red-400 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40"
                      >
                        削除
                      </button>
                    </div>
                  </li>
                )
              )}
            </ul>
          )}
        </section>

        {/* 新規追加フォーム */}
        <section className="bg-white rounded-3xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-700 text-sm mb-4 flex items-center gap-2">
            <span>➕</span> 新しいルールを追加
          </h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">絵文字</label>
              <div className="flex gap-1.5 flex-wrap">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setNewEmoji(e)}
                    className="w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all"
                    style={{
                      background: newEmoji === e ? `${memberColor}22` : "#f5f5f5",
                      border: newEmoji === e ? `2px solid ${memberColor}` : "2px solid transparent",
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                きっかけ
              </label>
              <input
                type="text"
                required
                value={newTrigger}
                onChange={(e) => setNewTrigger(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-300 text-sm"
                placeholder="例: TikTok投稿、生配信..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">貯金額</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  required
                  min="1"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-300 text-sm"
                  placeholder="100"
                />
                <span className="text-sm text-gray-500 font-medium">円</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 text-sm px-4 py-2.5 rounded-xl">{error}</div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 rounded-xl text-white font-bold text-sm transition-opacity disabled:opacity-60"
              style={{ background: memberColor }}
            >
              {isPending ? "追加中..." : "ルールを追加する"}
            </button>
          </form>
        </section>
      </main>

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
