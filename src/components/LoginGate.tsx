"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Gift, Zap, Wallet, Shield } from "lucide-react";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { useIsMobile } from "@/hooks/useIsMobile";

type AuthState = "idle" | "connecting" | "waiting" | "error";

interface LoginGateProps {
  onLogin: () => void;
  onAuthSuccess?: () => void;
}

export default function LoginGate({ onLogin, onAuthSuccess }: LoginGateProps) {
  const [authState, setAuthState] = useState<AuthState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const popupRef = useRef<Window | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMobile = useIsMobile();

  // Clean up popup poll on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // Listen for postMessage from popup callback
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      // Only accept messages from our own origin
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "agnic-oauth-result") return;

      // Clean up
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      window.removeEventListener("message", handleMessage);

      if (event.data.success) {
        setAuthState("idle");
        onAuthSuccess?.();
      } else {
        setAuthState("error");
        setErrorMsg(
          event.data.error === "access_denied"
            ? "Authorization was cancelled."
            : "Authorization failed. Please try again.",
        );
      }
    },
    [onAuthSuccess],
  );

  const startPopupAuth = useCallback(() => {
    setAuthState("connecting");
    setErrorMsg(null);

    // Listen for result before opening popup
    window.addEventListener("message", handleMessage);

    const width = 500;
    const height = 700;
    const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2));
    const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2));

    const popup = window.open(
      "/api/auth/login-popup",
      "agnic-oauth",
      `width=${width},height=${height},left=${left},top=${top},popup=yes,noopener=no`,
    );

    if (!popup || popup.closed) {
      // Popup blocked — fall back to redirect
      window.removeEventListener("message", handleMessage);
      setAuthState("idle");
      onLogin();
      return;
    }

    popupRef.current = popup;
    setAuthState("waiting");

    // Poll for popup manually closed
    pollRef.current = setInterval(() => {
      if (popup.closed) {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = null;
        window.removeEventListener("message", handleMessage);
        // Only reset if still waiting (not already handled by postMessage)
        setAuthState((prev) => (prev === "waiting" ? "idle" : prev));
      }
    }, 500);
  }, [handleMessage, onLogin]);

  const handleClick = () => {
    if (isMobile) {
      setAuthState("connecting");
      onLogin();
    } else {
      startPopupAuth();
    }
  };

  const handleRetry = () => {
    setErrorMsg(null);
    handleClick();
  };

  const buttonLabel = (() => {
    switch (authState) {
      case "connecting":
        return (
          <>
            <Spinner size="sm" />
            Connecting...
          </>
        );
      case "waiting":
        return (
          <>
            <Spinner size="sm" />
            Waiting for authorization...
          </>
        );
      default:
        return (
          <>
            <Wallet className="w-4 h-4" />
            Connect Payment Wallet
          </>
        );
    }
  })();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[60vh] flex items-center justify-center px-4"
    >
      <div className="max-w-md w-full glass rounded-2xl p-6 sm:p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl gradient-button flex items-center justify-center mx-auto">
          <Wallet className="w-8 h-8 text-white" />
        </div>

        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold">
            Connect Payment Wallet
          </h2>
          <p className="text-white/50 text-sm">
            Link your AgnicPay wallet to start generating images
          </p>
        </div>

        <div className="space-y-3 text-left">
          <div className="flex items-center gap-3 text-sm text-white/60">
            <Gift className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span>$1.00 free credit to start</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/60">
            <Zap className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span>~4,000 images for $5.00</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/60">
            <Wallet className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span>Pay only for what you use</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/60">
            <Shield className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span>Revoke access anytime</span>
          </div>
        </div>

        {/* Error state */}
        {authState === "error" && errorMsg && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {errorMsg}
          </div>
        )}

        {authState === "error" ? (
          <Button size="lg" className="w-full min-h-[48px]" onClick={handleRetry}>
            <Wallet className="w-4 h-4" />
            Try Again
          </Button>
        ) : (
          <Button
            size="lg"
            className="w-full min-h-[48px]"
            onClick={handleClick}
            disabled={authState === "connecting" || authState === "waiting"}
          >
            {buttonLabel}
          </Button>
        )}

        <p className="text-xs text-white/30">Secured by AgnicPay</p>
      </div>
    </motion.div>
  );
}
