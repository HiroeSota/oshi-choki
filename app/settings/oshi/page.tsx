import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { DbOshi, DbSavingGoal } from "@/lib/types";

export default async function OshiListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: oshisData } = await supabase
    .from("oshis")
    .select("*")
    .eq("user_id", user.id)
    .returns<DbOshi[]>();

  const oshis = oshisData ?? [];

  // 各推しの貯金額を取得
  const goalsRes = await Promise.all(
    oshis.map((o) =>
      supabase
        .from("saving_goals")
        .select("*")
        .eq("oshi_id", o.id)
        .returns<DbSavingGoal[]>()
        .maybeSingle()
    )
  );

  const goalsByOshiId: Record<string, DbSavingGoal> = {};
  for (let i = 0; i < oshis.length; i++) {
    const g = goalsRes[i].data;
    if (g) goalsByOshiId[oshis[i].id] = g;
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
          <div>
            <h1 className="font-bold text-gray-800 text-base leading-tight">
              推し一覧
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pb-24 pt-4 space-y-3">
        {oshis.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-8">
            まだ推しが登録されていません
          </p>
        )}

        {oshis.map((o) => {
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
                {/* アバター */}
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

                {/* 情報 */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-base leading-tight truncate">
                    {o.name}
                  </p>
                  {o.group_name && (
                    <p className="text-white/80 text-xs mt-0.5 truncate">
                      {o.group_name}
                    </p>
                  )}
                  <p className="text-white font-bold text-sm mt-1">
                    {current.toLocaleString()}円 貯金済み
                  </p>
                </div>

                {/* 編集ボタン */}
                <Link
                  href={`/settings/oshi/${o.id}`}
                  className="flex-shrink-0 px-4 py-2 rounded-xl bg-white/20 text-white text-sm font-bold hover:bg-white/30 transition-colors"
                >
                  編集
                </Link>
              </div>
            </div>
          );
        })}

        {/* 新しい推しを追加 */}
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
