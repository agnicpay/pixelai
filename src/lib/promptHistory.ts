"use client";

const STORAGE_KEY = "pixelai_prompt_history";
const MAX_HISTORY_ITEMS = 10;

function normalizePrompt(prompt: string): string {
  return prompt.trim().replace(/\s+/g, " ");
}

export function getPromptHistory(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

export function addPromptToHistory(prompt: string): string[] {
  if (typeof window === "undefined") return [];

  const cleaned = normalizePrompt(prompt);
  if (!cleaned) return getPromptHistory();

  const existing = getPromptHistory().filter((item) => item !== cleaned);
  const updated = [cleaned, ...existing].slice(0, MAX_HISTORY_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearPromptHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
