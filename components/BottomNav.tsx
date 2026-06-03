"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  memberColor: string;
};

const NAV_ITEMS = [
  { icon: "🏠", label: "ホーム", href: "/" },
  { icon: "⭐", label: "推し設定", href: "/settings/oshi" },
  { icon: "📋", label: "ルール", href: "/settings/rules" },
  { icon: "📈", label: "統計", href: "/stats" },
];

export function BottomNav({ memberColor }: Props) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors"
            >
              <span className="text-xl">{item.icon}</span>
              <span
                className="text-xs font-medium transition-colors"
                style={{ color: isActive ? memberColor : "#9ca3af" }}
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
