import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "accent" | "success" | "warning";
  className?: string;
}

export default function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        {
          "bg-white/[0.08] text-white/60": variant === "default",
          "bg-purple-500/20 text-purple-300": variant === "accent",
          "bg-emerald-500/20 text-emerald-300": variant === "success",
          "bg-amber-500/20 text-amber-300": variant === "warning",
        },
        className,
      )}
    >
      {children}
    </span>
  );
}
