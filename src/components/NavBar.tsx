"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/inicio", label: "Inicio", icon: "🏠" },
  { href: "/lista", label: "Lista", icon: "🧾" },
  { href: "/ahorro", label: "Ahorro", icon: "💰" },
  { href: "/perfil", label: "Perfil", icon: "👤" },
];

export function NavBar() {
  const path = usePathname();
  if (!TABS.some((t) => t.href === path)) return null; // no en onboarding ni formularios
  return (
    <nav className="sticky bottom-0 -mx-5 mt-4 grid grid-cols-4 border-t border-neutral-200 bg-background/95 py-2 backdrop-blur">
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`flex flex-col items-center text-xs ${path === t.href ? "font-semibold text-brand" : "text-neutral-500"}`}
        >
          <span className="text-lg">{t.icon}</span>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
