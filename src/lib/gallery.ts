"use client";

export interface GalleryItem {
  id: string;
  image: string; // base64 data URL
  prompt: string;
  model: string;
  style: string;
  cost?: number;
  createdAt: string;
}

const STORAGE_KEY = "pixelai_gallery";

export function getGallery(): GalleryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToGallery(item: Omit<GalleryItem, "id" | "createdAt">) {
  const gallery = getGallery();
  const newItem: GalleryItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  gallery.unshift(newItem);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gallery));
  return newItem;
}

export function removeFromGallery(id: string) {
  const gallery = getGallery().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gallery));
}

export function clearGallery() {
  localStorage.removeItem(STORAGE_KEY);
}
