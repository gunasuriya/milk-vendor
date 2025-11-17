"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useAppContext } from "@/context/AppContext";
import { LogOut } from "lucide-react";

const navLinks = [
  { name: "Daily Entry", href: "/" },
  { name: "Buyers", href: "/buyers" },
  { name: "Reports", href: "/reports" },
  { name: "Billing", href: "/billing" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { currentUser, handleSignOut } = useAppContext();
  
  const firstName = currentUser?.displayName?.split(" ")[0] || "User";

  return (
    <>
      <header className="mb-6 pb-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-700">Milk Vendor Pro</h1>
          <button
            onClick={handleSignOut}
            className="flex items-center text-sm text-blue-600 hover:underline"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Sign Out
          </button>
        </div>
        <p className="text-sm text-gray-500">Welcome, {firstName}!</p>
      </header>

      <nav className="flex border-b-2 border-gray-200" id="app-nav">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                "flex-1 rounded-t-lg px-3 py-3 text-center font-medium text-gray-500 border-b-4 border-transparent hover:border-gray-300 transition-colors",
                {
                  "text-blue-600 border-blue-600": isActive,
                }
              )}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>
    </>
  );
}