"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setMessage("確認メールを送りました！メールを確認してからログインしてください。");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("メールアドレスまたはパスワードが正しくありません");
      } else {
        router.push("/");
        router.refresh();
      }
    }

    setLoading(false);
  }

  const accentColor = "#FF6B9D";

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #fff0f6 0%, #f3e8ff 100%)" }}
    >
      <div className="w-full max-w-sm">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">💝</div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Oshi-Choki</h1>
          <p className="text-gray-500 text-sm mt-1">推し活と一緒に夢を叶えよう</p>
        </div>

        {/* カード */}
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <h2 className="font-bold text-gray-800 text-lg mb-5">
            {isSignUp ? "アカウント作成" : "ログイン"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                メールアドレス
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-300 text-sm transition-colors"
                placeholder="oshi@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                パスワード
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-300 text-sm transition-colors"
                placeholder="••••••••"
                minLength={6}
              />
              {isSignUp && (
                <p className="text-xs text-gray-400 mt-1">6文字以上で設定してください</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-xl">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-bold text-sm transition-opacity disabled:opacity-60 mt-2"
              style={{ background: `linear-gradient(135deg, ${accentColor} 0%, #c084fc 100%)` }}
            >
              {loading ? "処理中..." : isSignUp ? "アカウントを作成する" : "ログインする"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage(null);
              }}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isSignUp
                ? "すでにアカウントをお持ちの方はこちら →"
                : "アカウントをお持ちでない方はこちら →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
