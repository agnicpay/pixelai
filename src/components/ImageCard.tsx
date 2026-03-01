"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Save, Maximize2, X, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { truncate, formatCost } from "@/lib/utils";

interface ImageCardProps {
  image: string;
  prompt: string;
  model?: string;
  cost?: number;
  date?: string;
  onSave?: () => void;
  onDelete?: () => void;
  saved?: boolean;
}

export default function ImageCard({
  image,
  prompt,
  model,
  cost,
  date,
  onSave,
  onDelete,
  saved,
}: ImageCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = image;
    link.download = `pixelai-${Date.now()}.png`;
    link.click();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl overflow-hidden group"
      >
        <div
          className="relative aspect-square cursor-pointer"
          onClick={() => setExpanded(true)}
        >
          <img
            src={image}
            alt={prompt}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
            <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-sm text-white/70 leading-relaxed">
            {truncate(prompt, 120)}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {model && (
                <Badge>
                  {model.split("/").pop()?.replace(/-/g, " ")}
                </Badge>
              )}
              {cost !== undefined && (
                <Badge variant="accent">{formatCost(cost)}</Badge>
              )}
              {date && (
                <span className="text-xs text-white/30">
                  {new Date(date).toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4" />
              </Button>
              {onSave && !saved && (
                <Button variant="ghost" size="sm" onClick={onSave}>
                  <Save className="w-4 h-4" />
                </Button>
              )}
              {onDelete && (
                <Button variant="ghost" size="sm" onClick={onDelete}>
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Expanded view */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setExpanded(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(false)}
              className="absolute -top-12 right-0 text-white/60"
            >
              <X className="w-5 h-5" />
            </Button>
            <img
              src={image}
              alt={prompt}
              className="w-full h-full object-contain rounded-xl"
            />
            <div className="mt-3 glass rounded-xl p-4">
              <p className="text-sm text-white/70">{prompt}</p>
              <div className="flex items-center gap-2 mt-2">
                {model && (
                  <Badge>
                    {model.split("/").pop()?.replace(/-/g, " ")}
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={handleDownload}>
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
