"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/inventory", label: "Inventory" },
  { href: "/receiving", label: "Receiving" },
  { href: "/stock-out", label: "Stock Out" },
  { href: "/expiry", label: "Expiry Alerts" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="bg-slate-900 text-white">
      <div className="mx-auto flex max-w-6xl items-center gap-1 px-4 py-3">
        <span className="mr-6 font-bold tracking-wide">WIEMS</span>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded px-3 py-1.5 text-sm ${
              pathname === l.href ? "bg-slate-700 font-semibold" : "hover:bg-slate-800"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
