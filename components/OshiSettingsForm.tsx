"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { uploadOshiImage, upsertOshi } from "@/app/actions";
import type { Oshi, SavingGoal } from "@/lib/types";

const PRESET_COLORS = [
  "#FF6B9D", "#FF4B6E", "#FFD700", "#87CEEB",
  "#98FB98", "#DDA0DD", "#FF8C00", "#40E0D0",
  "#FF69B4", "#9370DB", "#F0E6FF", "#4A90D9",
];

type Props = {
  oshi: Oshi | null;
  goal: SavingGoal | null;
};

export function OshiSettingsForm({ oshi, goal }: Props) {
  const [name, setName] = useState(oshi?.name ?? "");
  const [group, setGroup] = useState(oshi?.group ?? "");
  const [color, setColor] = useState(oshi?.memberColor ?? "#FF6B9D");
  const [imageUrl, setImageUrl] = useState(oshi?.imageUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [goalLabel, setGoalLabel] = useState(goal?.label ?? "");
  const [goalTarget, setGoalTarget] = useState(goal?.targetAmount?.toString() ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isNew = !oshi;

  async function compressImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const maxSize = 1200;
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], "oshi.jpg", { type: "image/jpeg" }));
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          0.85
        );
      };
      img.src = url;
    });
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const compressed = await compressImage(file);
    const formData = new FormData();
    formData.append("file", compressed);

    const result = await uploadOshiImage(formData);

    if ("error" in result) {
      setError(`アップロードエラー: ${result.error}`);
    } else {
      setImageUrl(result.url);
    }
    setUploading(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const target = Number.parseInt(goalTarget, 10);
    if (Number.isNaN(target) || target <= 0) {
      setError("目標金額は1以上の数字を入力してください");
      return;
    }

    startTransition(async () => {
      const result = await upsertOshi({
        name,
        groupName: group,
        memberColor: color,
        emoji: "🌸",
        imageUrl: imageUrl || undefined,
        goalLabel,
        goalTarget: target,
        existingOshiId: oshi?.id,
        existingGoalId: goal?.id,
      });
      if (result && "error" in result) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-3">
          {oshi && (
            <Link href="/" className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
              ←
            </Link>
          )}
          <div>
            <h1 className="font-bold text-gray-800 text-base leading-tight">
              {isNew ? "推しを設定しよう" : "推し設定"}
            </h1>
            {isNew && (
              <p className="text-xs text-gray-400">まずは推しの情報を登録してね</p>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pb-24 pt-4 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 推しの基本情報 */}
          <section className="bg-white rounded-3xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-700 text-sm flex items-center gap-2">
              <span>⭐</span> 推しの基本情報
            </h2>

            {/* 推し画像 */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">推しの画像（任意）</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <div className="flex items-center gap-3">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="推しの画像"
                    className="w-20 h-20 rounded-2xl object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl">
                    📷
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity disabled:opacity-60"
                    style={{ background: color }}
                  >
                    {uploading ? "アップロード中..." : imageUrl ? "画像を変更" : "画像を選択"}
                  </button>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      削除
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">推しの名前</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-300 text-sm"
                placeholder="例: 桜井 莉子"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">グループ名（任意）</label>
              <input
                type="text"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-300 text-sm"
                placeholder="例: StarBloom"
              />
            </div>
          </section>

          {/* メンカラ */}
          <section className="bg-white rounded-3xl p-5 shadow-sm space-y-3">
            <h2 className="font-bold text-gray-700 text-sm flex items-center gap-2">
              <span>🎨</span> メンバーカラー
            </h2>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-10 h-10 rounded-xl transition-all"
                  style={{
                    background: c,
                    border: color === c ? "3px solid #333" : "3px solid transparent",
                    transform: color === c ? "scale(1.1)" : "scale(1)",
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-3 mt-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border-0"
              />
              <div className="flex-1">
                <span className="text-xs text-gray-500">カスタムカラー: </span>
                <span className="text-xs font-mono text-gray-700">{color}</span>
              </div>
              <div
                className="w-14 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: color }}
              >
                推し
              </div>
            </div>
          </section>

          {/* 目標設定 */}
          <section className="bg-white rounded-3xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-700 text-sm flex items-center gap-2">
              <span>🏆</span> 貯金目標
            </h2>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">目標の名前</label>
              <input
                type="text"
                required
                value={goalLabel}
                onChange={(e) => setGoalLabel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-300 text-sm"
                placeholder="例: 武道館ライブ遠征費"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">目標金額</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  required
                  min="1"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-300 text-sm"
                  placeholder="50000"
                />
                <span className="text-sm text-gray-500 font-medium">円</span>
              </div>
            </div>
          </section>

          {error && (
            <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || uploading}
            className="w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-opacity disabled:opacity-60 shadow-md"
            style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)` }}
          >
            {isPending ? "保存中..." : isNew ? "推しを登録してはじめる 💝" : "変更を保存する"}
          </button>
        </form>
      </main>

      {oshi && (
        <div className="fixed bottom-0 left-0 right-0 pb-6 flex justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-sm font-bold shadow-md border border-gray-100 hover:shadow-lg transition-all active:scale-95"
            style={{ color }}
          >
            ← ダッシュボードに戻る
          </Link>
        </div>
      )}
    </div>
  );
}
