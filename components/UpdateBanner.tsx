"use client";

import { useEffect, useState } from "react";

export function UpdateBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const currentVersion = process.env.NEXT_PUBLIC_BUILD_TIME;

    const check = async () => {
      try {
        const res = await fetch("/api/version");
        const { version } = await res.json();
        if (version !== currentVersion) setShow(true);
      } catch {
        // オフライン時は無視
      }
    };

    window.addEventListener("focus", check);
    const interval = setInterval(check, 5 * 60 * 1000);

    return () => {
      window.removeEventListener("focus", check);
      clearInterval(interval);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-pink-500 text-white text-sm font-bold shadow-lg">
      <span>✨ 新しいバージョンがあります</span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="bg-white text-pink-500 px-3 py-1 rounded-full text-xs font-bold"
      >
        更新する
      </button>
    </div>
  );
}
