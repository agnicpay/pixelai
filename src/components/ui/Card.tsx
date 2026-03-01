import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export default function Card({ className, hover, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "glass rounded-xl",
        hover && "glass-hover cursor-pointer",
        className,
      )}
      {...props}
    />
  );
}
