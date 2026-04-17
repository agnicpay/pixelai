"use client";

import { useEffect, useState } from "react";
import { Clock3, ImagePlus, Wand2, Send, Trash2, X } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { toast } from "sonner";
import {
  addPromptToHistory,
  clearPromptHistory,
  getPromptHistory,
} from "@/lib/promptHistory";

interface PromptInputProps {
  onGenerate: (prompt: string, referenceImage?: string) => void;
  onEnhance: (prompt: string) => Promise<string>;
  isGenerating: boolean;
  isEnhancing: boolean;
  supportsReferenceImage?: boolean;
}

const MAX_REFERENCE_IMAGE_BYTES = 650 * 1024;
const MAX_REFERENCE_IMAGE_DIMENSION = 1280;

function dataUrlByteSize(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] || "";
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}

export default function PromptInput({
  onGenerate,
  onEnhance,
  isGenerating,
  isEnhancing,
  supportsReferenceImage = true,
}: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [referenceImage, setReferenceImage] = useState<string | undefined>();
  const [referenceImageName, setReferenceImageName] = useState<string | undefined>();
  const [referenceImageSizeLabel, setReferenceImageSizeLabel] = useState<string | undefined>();

  useEffect(() => {
    setHistory(getPromptHistory());
  }, []);

  const handleSubmit = () => {
    if (!prompt.trim() || isGenerating) return;
    const cleaned = prompt.trim();
    setHistory(addPromptToHistory(cleaned));
    onGenerate(cleaned, referenceImage);
  };

  const handleEnhance = async () => {
    if (!prompt.trim() || isEnhancing) return;
    const enhanced = await onEnhance(prompt.trim());
    setPrompt(enhanced);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleImageChange = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    try {
      const sourceDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Failed to read image"));
        reader.readAsDataURL(file);
      });

      const sourceImage = await loadImageFromDataUrl(sourceDataUrl);
      const scale = Math.min(
        1,
        MAX_REFERENCE_IMAGE_DIMENSION / Math.max(sourceImage.width, sourceImage.height),
      );

      let targetWidth = Math.max(1, Math.round(sourceImage.width * scale));
      let targetHeight = Math.max(1, Math.round(sourceImage.height * scale));
      let quality = 0.85;
      let compressed = sourceDataUrl;

      for (let i = 0; i < 6; i++) {
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) break;

        ctx.drawImage(sourceImage, 0, 0, targetWidth, targetHeight);
        compressed = canvas.toDataURL("image/jpeg", quality);

        if (dataUrlByteSize(compressed) <= MAX_REFERENCE_IMAGE_BYTES) {
          break;
        }

        quality = Math.max(0.55, quality - 0.1);
        targetWidth = Math.max(1, Math.round(targetWidth * 0.85));
        targetHeight = Math.max(1, Math.round(targetHeight * 0.85));
      }

      if (dataUrlByteSize(compressed) > MAX_REFERENCE_IMAGE_BYTES) {
        toast.error("Image is too large. Please upload a smaller image.");
        return;
      }

      setReferenceImage(compressed);
      setReferenceImageName(file.name);
      setReferenceImageSizeLabel(
        `${Math.round(dataUrlByteSize(compressed) / 1024)} KB`,
      );
    } catch {
      toast.error("Could not process image upload.");
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the image you want to create..."
          rows={3}
          disabled={isGenerating}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={handleSubmit}
          disabled={!prompt.trim() || isGenerating}
          size="lg"
          className="flex-1 sm:flex-none"
        >
          {isGenerating ? (
            <>
              <Spinner size="sm" />
              Generating...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Generate
            </>
          )}
        </Button>

        <Button
          variant="secondary"
          onClick={handleEnhance}
          disabled={!prompt.trim() || isEnhancing || isGenerating}
          size="lg"
        >
          {isEnhancing ? (
            <>
              <Spinner size="sm" />
              Enhancing...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              <span className="hidden sm:inline">Enhance Prompt</span>
              <span className="sm:hidden">Enhance</span>
            </>
          )}
        </Button>
      </div>

      {supportsReferenceImage && (
        <div className="space-y-2">
          <label className="text-xs text-white/45 inline-flex items-center gap-1.5">
            <ImagePlus className="h-3.5 w-3.5" />
            Reference image (optional)
          </label>

          {!referenceImage && (
            <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-3 text-sm text-white/60 hover:border-white/25 hover:bg-white/[0.05] transition-all">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  void handleImageChange(e.target.files?.[0] ?? null);
                }}
                disabled={isGenerating}
              />
              Upload sketch or reference image
            </label>
          )}

          {referenceImage && (
            <div className="relative w-fit rounded-xl border border-white/10 bg-white/[0.03] p-2">
              <img
                src={referenceImage}
                alt="Reference"
                className="h-28 w-28 rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setReferenceImage(undefined);
                  setReferenceImageName(undefined);
                  setReferenceImageSizeLabel(undefined);
                }}
                className="absolute -top-2 -right-2 rounded-full bg-black/75 p-1 text-white/80 hover:text-white"
                aria-label="Remove reference image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <p className="mt-1.5 max-w-28 truncate text-[11px] text-white/45">
                {referenceImageName || "Reference image"}
              </p>
              {referenceImageSizeLabel && (
                <p className="text-[11px] text-white/35">{referenceImageSizeLabel}</p>
              )}
            </div>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="inline-flex items-center gap-1.5 text-xs text-white/45">
              <Clock3 className="h-3.5 w-3.5" />
              Recent prompts
            </p>
            <button
              type="button"
              onClick={() => {
                clearPromptHistory();
                setHistory([]);
              }}
              className="inline-flex items-center gap-1 text-xs text-white/35 hover:text-white/65 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {history.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPrompt(item)}
                className="max-w-full rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/70 hover:border-white/20 hover:bg-white/[0.06] hover:text-white transition-all"
                title={item}
              >
                <span className="block max-w-[300px] truncate">{item}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
