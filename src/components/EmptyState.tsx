"use client";

import { ImageOff } from "lucide-react";
import Button from "@/components/ui/Button";
import Link from "next/link";

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
}

export default function EmptyState({
  title = "No images yet",
  description = "Create your first AI-generated image to see it here.",
  action = { label: "Start Creating", href: "/create" },
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center">
        <ImageOff className="w-8 h-8 text-white/20" />
      </div>
      <div className="space-y-1">
        <h3 className="font-medium text-white/60">{title}</h3>
        <p className="text-sm text-white/30">{description}</p>
      </div>
      {action && (
        <Link href={action.href}>
          <Button variant="secondary">{action.label}</Button>
        </Link>
      )}
    </div>
  );
}
