export { DEFAULT_MODEL_ID } from "./models";

export const STYLES = [
  { id: "none", label: "No Style", suffix: "" },
  { id: "photorealistic", label: "Photorealistic", suffix: ", photorealistic, 8k, ultra detailed photography" },
  { id: "digital-art", label: "Digital Art", suffix: ", digital art, vibrant colors, detailed illustration" },
  { id: "anime", label: "Anime", suffix: ", anime style, cel shaded, studio ghibli inspired" },
  { id: "oil-painting", label: "Oil Painting", suffix: ", oil painting style, impressionist, textured brush strokes" },
  { id: "watercolor", label: "Watercolor", suffix: ", watercolor painting, soft edges, flowing colors" },
  { id: "3d-render", label: "3D Render", suffix: ", 3d render, octane render, cinema 4d, volumetric lighting" },
  { id: "pixel-art", label: "Pixel Art", suffix: ", pixel art style, retro, 16-bit" },
  { id: "comic", label: "Comic Book", suffix: ", comic book style, bold lines, halftone dots, dynamic" },
] as const;

export const AGNIC_API_BASE = process.env.AGNIC_API_BASE || "https://api.agnic.ai";
export const AGNIC_AUTH_URL = process.env.NEXT_PUBLIC_AGNIC_AUTH_URL || "https://app.agnic.ai";
