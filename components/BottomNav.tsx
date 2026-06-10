"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  memberColor: string;
};

const NAV_ITEMS = [
  { icon: "🏠", label: "ホーム", href: "/" },
  { icon: "📜", label: "履歴", href: "/history" },
  { icon: "⭐", label: "推し設定", href: "/settings/oshi" },
  { icon: "📋", label: "ルール", href: "/settings/rules" },
  { icon: "📈", label: "統計", href: "/stats" },
];

export function BottomNav({ memberColor }: Props) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 pb-2 px-4">
      <div
        className="max-w-md mx-auto rounded-3xl px-3 h-16 flex items-center justify-around shadow-xl"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(16px)",
          boxShadow: `0 8px 32px rgba(0,0,0,0.10), 0 2px 8px ${memberColor}22`,
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-2xl transition-all duration-200 active:scale-75 select-none touch-manipulation"
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${memberColor}ee, ${memberColor}99)`
                  : "transparent",
                boxShadow: isActive ? `0 4px 12px ${memberColor}55` : "none",
              }}
            >
              <span
                className="text-xl transition-all duration-200"
                style={{
                  filter: isActive ? "drop-shadow(0 2px 4px rgba(0,0,0,0.15))" : "none",
                  transform: isActive ? "scale(1.15)" : "scale(1)",
                  display: "block",
                }}
              >
                {item.icon}
              </span>
              <span
                className="text-xs font-bold transition-colors"
                style={{ color: isActive ? "white" : "#b0b0b0" }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
