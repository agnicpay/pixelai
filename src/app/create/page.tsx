"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PromptInput from "@/components/PromptInput";
import ModelSelector from "@/components/ModelSelector";
import StyleSelector from "@/components/StyleSelector";
import ImageCard from "@/components/ImageCard";
import GenerationStatus from "@/components/GenerationStatus";
import LoginGate from "@/components/LoginGate";
import Spinner from "@/components/ui/Spinner";
import { AlertTriangle, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { DEFAULT_MODEL, MODELS } from "@/lib/constants";
import { addToGallery } from "@/lib/gallery";

interface GeneratedImage {
  image: string;
  prompt: string;
  model: string;
  style: string;
}

export default function CreatePage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [balance, setBalance] = useState<number | undefined>();
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL.id);
  const [selectedStyle, setSelectedStyle] = useState<string>("none");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [imageSaved, setImageSaved] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/session");
      const data = await res.json();
      setAuthenticated(data.authenticated);
      if (data.authenticated) {
        fetchBalance();
      }
    } catch {
      setAuthenticated(false);
    }
  }, []);

  const fetchBalance = async () => {
    try {
      const res = await fetch("/api/balance");
      if (res.status === 401) {
        setAuthenticated(false);
        toast.error("Session expired. Please sign in again.");
        return;
      }
      const data = await res.json();
      if (data.balance !== undefined) {
        setBalance(data.balance);
        if (data.balance < 0.01) {
          setShowTopUp(true);
        }
      }
    } catch {
      // non-critical
    }
  };

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Listen for the Agnic top-up popup reporting completion. When it closes,
  // refresh the balance so the new credit shows up without a page reload.
  useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
      if (!ev.data || typeof ev.data !== "object") return;
      if (ev.data.type === "agnic:topup_complete") {
        fetchBalance();
        toast.success("Top-up successful — your balance is updated.");
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Also handle the redirect-mode return (mobile / popup-blocked): when the
  // Checkout page redirects back with ?topup=success, refresh the balance.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("topup") === "success") {
      fetchBalance();
      toast.success("Top-up successful — your balance is updated.");
      params.delete("topup");
      params.delete("session_id");
      const qs = params.toString();
      window.history.replaceState({}, "", window.location.pathname + (qs ? `?${qs}` : ""));
    }
  }, []);

  const handleLogin = () => {
    window.location.href = "/api/auth/login";
  };

  const handleAuthSuccess = useCallback(() => {
    checkSession();
  }, [checkSession]);

  const handleTopUp = () => {
    const returnUrl = `${window.location.origin}/create`;
    const base = process.env.NEXT_PUBLIC_AGNIC_TOPUP_URL || "https://pay.agnic.ai/topup";
    const url = `${base}?client_id=pixelai&return_url=${encodeURIComponent(returnUrl)}`;

    // Popup on desktop, full redirect on mobile (narrow viewport).
    const isNarrow = typeof window !== "undefined" && window.innerWidth < 640;
    if (isNarrow) {
      window.location.href = url;
      return;
    }

    const width = 480;
    const height = 720;
    const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2));
    const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2));
    window.open(url, "agnic-topup", `width=${width},height=${height},left=${left},top=${top},popup=yes`);
  };

  const handleGenerate = async (prompt: string, referenceImage?: string) => {
    setIsGenerating(true);
    setGeneratedImage(null);
    setImageSaved(false);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          referenceImage,
          model: selectedModel,
          style: selectedStyle,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        setAuthenticated(false);
        toast.error("Session expired. Please sign in again.");
        return;
      }

      if (!res.ok) {
        if (data.code === "insufficient_balance") {
          setShowTopUp(true);
          toast.error("Your balance is empty. Add funds to continue.");
          return;
        }
        throw new Error(data.error || "Failed to generate image");
      }

      if (!data.image) {
        throw new Error("No image returned from the model");
      }

      setShowTopUp(false);

      setGeneratedImage({
        image: data.image,
        prompt,
        model: data.model || selectedModel,
        style: selectedStyle,
      });

      if (data.balance !== undefined) {
        setBalance(data.balance);
      }

      toast.success("Image generated!");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Generation failed";
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnhance = async (prompt: string): Promise<string> => {
    setIsEnhancing(true);
    try {
      const res = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (res.status === 401) {
        setAuthenticated(false);
        toast.error("Session expired. Please sign in again.");
        return prompt;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to enhance prompt");
      }

      if (data.balance !== undefined) {
        setBalance(data.balance);
      }

      toast.success("Prompt enhanced!");
      return data.enhancedPrompt || prompt;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Enhancement failed";
      toast.error(msg);
      return prompt;
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSave = () => {
    if (!generatedImage) return;
    addToGallery({
      image: generatedImage.image,
      prompt: generatedImage.prompt,
      model: generatedImage.model,
      style: generatedImage.style,
    });
    setImageSaved(true);
    toast.success("Saved to gallery!");
  };

  const handleLogout = async () => {
    await fetch("/api/session", { method: "DELETE" });
    setAuthenticated(false);
    setBalance(undefined);
    setGeneratedImage(null);
    toast.success("Logged out");
  };

  // Loading state
  if (authenticated === null) {
    return (
      <>
        <Header authenticated={false} />
        <main className="flex-1 flex items-center justify-center">
          <Spinner size="lg" />
        </main>
      </>
    );
  }

  // Not authenticated — show login gate
  if (!authenticated) {
    return (
      <>
        <Header authenticated={false} />
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <LoginGate onLogin={handleLogin} onAuthSuccess={handleAuthSuccess} />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Authenticated — full creation UI
  const selectedModelConfig = MODELS.find((m) => m.id === selectedModel);

  return (
    <>
      <Header
        authenticated
        balance={balance}
        onTopUp={handleTopUp}
        onLogout={handleLogout}
      />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="space-y-1">
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              Create an image
            </h1>
            <p className="text-white/40 text-sm">
              Describe what you want to see and let AI bring it to life.
            </p>
          </div>

          <div className="space-y-6">
            <PromptInput
              onGenerate={handleGenerate}
              onEnhance={handleEnhance}
              isGenerating={isGenerating}
              isEnhancing={isEnhancing}
              supportsReferenceImage={selectedModelConfig?.supportsReferenceImage ?? false}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ModelSelector
                selectedModel={selectedModel}
                onSelect={setSelectedModel}
              />
              <StyleSelector
                selectedStyle={selectedStyle}
                onSelect={setSelectedStyle}
              />
            </div>
          </div>

          {/* Top-up banner */}
          {showTopUp && !isGenerating && (
            <div className="relative rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-5">
              <button
                type="button"
                onClick={() => setShowTopUp(false)}
                className="absolute top-3 right-3 text-white/40 hover:text-white/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-white">Balance Empty</h3>
                    <p className="text-sm text-white/50 mt-1">
                      Your balance is used up. Add funds to keep creating.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button size="sm" onClick={handleTopUp}>
                      Add Funds
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTopUp(false)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Generation result */}
          <div className="mt-8">
            {isGenerating && <GenerationStatus />}

            {generatedImage && !isGenerating && (
              <div className="max-w-lg mx-auto">
                <ImageCard
                  image={generatedImage.image}
                  prompt={generatedImage.prompt}
                  model={generatedImage.model}
                  onSave={handleSave}
                  saved={imageSaved}
                />
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
