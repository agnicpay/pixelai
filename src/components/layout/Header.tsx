"use client";

import Link from "next/link";
import { Sparkles, Images, CreditCard, LogOut } from "lucide-react";
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

export default function Header({
  authenticated,
  balance,
  onTopUp,
  onLogout,
}: HeaderProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/create", label: "Create", icon: Sparkles },
    { href: "/gallery", label: "Gallery", icon: Images },
    { href: "/pricing", label: "Pricing", icon: CreditCard },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-button flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-lg font-bold">PixelAI</span>
            </Link>

            <nav className="hidden sm:flex items-center gap-1">
              {navLinks.map((link) => {
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

          <div className="flex items-center gap-3">
            {authenticated && balance !== undefined && (
              <BalanceDisplay balance={balance} onTopUp={onTopUp} />
            )}
            {authenticated && onLogout && (
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
