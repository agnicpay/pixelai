"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Images, CreditCard, LogOut, Menu, X } from "lucide-react";
import Button from "@/components/ui/Button";
import BalanceDisplay from "@/components/BalanceDisplay";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface HeaderProps {
  authenticated: boolean;
  balance?: number;
  onTopUp?: () => void;
  onLogout?: () => void;
}

const NAV_LINKS = [
  { href: "/create", label: "Create", icon: Sparkles },
  { href: "/gallery", label: "Gallery", icon: Images },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
];

export default function Header({
  authenticated,
  balance,
  onTopUp,
  onLogout,
}: HeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-1.5" onClick={() => setMobileOpen(false)}>
              <span className="font-cursive text-[1.65rem] leading-none gradient-text select-none">Dreamt Cards</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden sm:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-white/[0.08] text-white"
                        : "text-white/50 hover:text-white hover:bg-white/[0.04]",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {authenticated && balance !== undefined && (
              <BalanceDisplay balance={balance} onTopUp={onTopUp} />
            )}
            {authenticated && onLogout && (
              <Button variant="ghost" size="sm" onClick={onLogout} className="hidden sm:flex">
                <LogOut className="w-4 h-4" />
              </Button>
            )}

            {/* Mobile hamburger */}
            <button
              type="button"
              className="sm:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-white/[0.06] bg-[#0d0d14]/95 backdrop-blur-xl">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-colors",
                    isActive
                      ? "bg-white/[0.08] text-white"
                      : "text-white/60 hover:text-white hover:bg-white/[0.04]",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}

            {authenticated && onLogout && (
              <button
                type="button"
                onClick={() => { onLogout(); setMobileOpen(false); }}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
