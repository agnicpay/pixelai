"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function GenerationStatus() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-8 flex flex-col items-center justify-center gap-4"
    >
      <div className="relative">
        <div className="w-16 h-16 rounded-full shimmer-bg" />
        <Sparkles className="w-6 h-6 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="space-y-2 text-center">
        <p className="text-sm font-medium text-white/80">
          Creating your image...
        </p>
        <p className="text-xs text-white/40">
          This usually takes 5-15 seconds
        </p>
      </div>

      <div className="w-48 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 12, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}
