"use client";

import ImageCard from "./ImageCard";
import type { GalleryItem } from "@/lib/gallery";

interface ImageGridProps {
  items: GalleryItem[];
  onDelete?: (id: string) => void;
}

export default function ImageGrid({ items, onDelete }: ImageGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <ImageCard
          key={item.id}
          image={item.image}
          prompt={item.prompt}
          model={item.model}
          date={item.createdAt}
          onDelete={onDelete ? () => onDelete(item.id) : undefined}
          saved
        />
      ))}
    </div>
  );
}
