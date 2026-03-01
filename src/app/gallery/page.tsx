"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ImageGrid from "@/components/ImageGrid";
import EmptyState from "@/components/EmptyState";
import Button from "@/components/ui/Button";
import { getGallery, removeFromGallery, clearGallery, type GalleryItem } from "@/lib/gallery";

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setItems(getGallery());
    fetch("/api/session")
      .then((r) => r.json())
      .then((d) => setAuthenticated(d.authenticated))
      .catch(() => {});
  }, []);

  const handleDelete = (id: string) => {
    removeFromGallery(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.success("Image removed from gallery");
  };

  const handleClear = () => {
    clearGallery();
    setItems([]);
    toast.success("Gallery cleared");
  };

  return (
    <>
      <Header authenticated={authenticated} />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="font-display text-2xl sm:text-3xl font-bold">
                Your Gallery
              </h1>
              <p className="text-white/40 text-sm">
                {items.length} image{items.length !== 1 ? "s" : ""} saved locally
              </p>
            </div>

            {items.length > 0 && (
              <Button variant="danger" size="sm" onClick={handleClear}>
                <Trash2 className="w-4 h-4" />
                Clear All
              </Button>
            )}
          </div>

          {items.length > 0 ? (
            <ImageGrid items={items} onDelete={handleDelete} />
          ) : (
            <EmptyState />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
