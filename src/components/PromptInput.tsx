"use client";

import { useEffect, useState } from "react";
import { Clock3, Wand2, Send, Trash2 } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import {
  addPromptToHistory,
  clearPromptHistory,
  getPromptHistory,
} from "@/lib/promptHistory";

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
  onEnhance: (prompt: string) => Promise<string>;
  isGenerating: boolean;
  isEnhancing: boolean;
}

export default function PromptInput({
  onGenerate,
  onEnhance,
  isGenerating,
  isEnhancing,
}: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    setHistory(getPromptHistory());
  }, []);

  const handleSubmit = () => {
    if (!prompt.trim() || isGenerating) return;
    const cleaned = prompt.trim();
    setHistory(addPromptToHistory(cleaned));
    onGenerate(cleaned);
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
