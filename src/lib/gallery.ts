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

const STORAGE_KEY = "dreamt_gallery";

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

  // Evict oldest items until the payload fits within localStorage quota
  while (gallery.length > 0) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gallery));
      break;
    } catch (e) {
      if ((e as DOMException)?.name === "QuotaExceededError") {
        gallery.pop();
      } else {
        break;
      }
    }
  }

  return newItem;
}

export function removeFromGallery(id: string) {
  const gallery = getGallery().filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gallery));
  } catch {
    // gallery is smaller after removal — this shouldn't fail, but guard anyway
  }
}

export function clearGallery() {
  localStorage.removeItem(STORAGE_KEY);
}
