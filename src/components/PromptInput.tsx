"use client";

import { useState } from "react";
import { Wand2, Send } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

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

  const handleSubmit = () => {
    if (!prompt.trim() || isGenerating) return;
    onGenerate(prompt.trim());
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
    </div>
  );
}
