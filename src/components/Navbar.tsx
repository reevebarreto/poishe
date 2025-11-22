"use client";

import { Home, PieChart, Receipt, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Dashboard" },
    { path: "/accounts", icon: Wallet, label: "Accounts" },
    { path: "/transactions", icon: Receipt, label: "Transactions" },
    { path: "/spending", icon: PieChart, label: "Spending" },
  ];

  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  return (
    <nav className="mb-8">
      <div className="grid grid-cols-4 gap-2 bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center justify-center gap-2 py-1 rounded-lg transition-all duration-200 ${
                active
                  ? "bg-blue-500 text-white shadow-md"
                  : "text-slate-700 hover:bg-slate-100"
              } `}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
