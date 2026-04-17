"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap, Gift, Wand2 } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const USE_CASES = [
  { emoji: "🎨", label: "Comic & Manga" },
  { emoji: "📱", label: "TikTok Content" },
  { emoji: "🎮", label: "Game Characters" },
  { emoji: "📚", label: "School Projects" },
  { emoji: "🖼️", label: "YouTube Thumbnails" },
  { emoji: "💅", label: "Profile Pics" },
  { emoji: "🎬", label: "Reels Backgrounds" },
  { emoji: "🐉", label: "Fantasy Art" },
];

const EXAMPLE_PROMPTS = [
  {
    prompt: "Anime girl with silver hair and glowing blue eyes, cherry blossoms",
    tag: "Manga",
    image: "/landing-samples/sample-1.jpg",
    gradient: "from-pink-900/60 via-purple-900/40 to-indigo-900/60",
    accent: "text-pink-300",
  },
  {
    prompt: "Cyberpunk street racer, neon lights, rain-slicked Tokyo alley, cinematic",
    tag: "Aesthetic",
    image: "/landing-samples/sample-2.jpg",
    gradient: "from-cyan-900/60 via-blue-900/40 to-purple-900/60",
    accent: "text-cyan-300",
  },
  {
    prompt: "My OC: a fire-type dragon trainer, dynamic pose, comic book style",
    tag: "OC Art",
    image: "/landing-samples/sample-3.jpg",
    gradient: "from-orange-900/60 via-red-900/40 to-pink-900/60",
    accent: "text-orange-300",
  },
  {
    prompt: "Cozy lo-fi study room with glowing desk lamp, plants, rainy window",
    tag: "Lo-Fi Vibe",
    image: "/landing-samples/sample-4.jpg",
    gradient: "from-emerald-900/60 via-teal-900/40 to-cyan-900/60",
    accent: "text-emerald-300",
  },
  {
    prompt: "Epic fantasy map for my DnD campaign, aged parchment, hand-drawn style",
    tag: "School/Game",
    image: "/landing-samples/sample-5.jpg",
    gradient: "from-amber-900/60 via-yellow-900/40 to-orange-900/60",
    accent: "text-amber-300",
  },
  {
    prompt: "Futuristic athlete, holographic jersey, stadium crowd, sports poster",
    tag: "Content",
    image: "/landing-samples/sample-6.jpg",
    gradient: "from-violet-900/60 via-purple-900/40 to-fuchsia-900/60",
    accent: "text-violet-300",
  },
];

const FEATURES = [
  {
    icon: "✏️",
    title: "Describe it, get it",
    description: "Type what you imagine. Upload a sketch for reference. Done.",
  },
  {
    icon: "✨",
    title: "AI prompt boost",
    description: "Not sure how to describe it? Hit Enhance and watch the magic.",
  },
  {
    icon: "⚡",
    title: "Ready in seconds",
    description: "No queue, no wait. Your image generates in under 10 seconds.",
  },
];

export default function LandingPage() {
  return (
    <>
      <Header authenticated={false} />

      <main className="flex-1">
        {/* Hero — split layout: text left, image grid right */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-cyan-900/10 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 sm:pt-24 sm:pb-16 relative">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

              {/* Left — copy */}
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55 }}
                className="flex-1 text-center lg:text-left space-y-6 max-w-xl"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/25 text-sm font-medium text-purple-300"
                >
                  <Gift className="w-4 h-4" />
                  $5 free credit · ~4,000 images · no subscription
                </motion.div>

                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                  Turn any idea into{" "}
                  <span className="gradient-text">fire visuals</span>
                </h1>

                <p className="text-lg text-white/50 leading-relaxed">
                  AI image generator built for creators. Comic panels, TikTok
                  content, school projects, OC art — in seconds.
                </p>

                <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                  {USE_CASES.map((uc) => (
                    <span
                      key={uc.label}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass text-xs text-white/60"
                    >
                      <span>{uc.emoji}</span>
                      {uc.label}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
                  <Link href="/create">
                    <Button size="lg" className="text-base px-8 min-w-[180px]">
                      Start for free
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button variant="secondary" size="lg" className="text-base px-8">
                      See pricing
                    </Button>
                  </Link>
                </div>

                <p className="text-xs text-white/25 flex items-center justify-center lg:justify-start gap-1.5">
                  <Zap className="w-3 h-3" />
                  Pay per image · No monthly fees · Cancel whenever
                </p>
              </motion.div>

              {/* Right — 2×2 image grid */}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="flex-1 w-full max-w-md lg:max-w-none"
              >
                <div className="grid grid-cols-2 gap-3">
                  {EXAMPLE_PROMPTS.slice(0, 4).map((example, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + i * 0.08 }}
                      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${example.gradient} ${i === 0 ? "row-span-1" : ""}`}
                    >
                      <div className="aspect-square">
                        <img
                          src={example.image}
                          alt={example.tag}
                          loading="eager"
                          className="h-full w-full object-cover"
                          onError={(e) => { e.currentTarget.style.opacity = "0"; }}
                        />
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${example.accent} bg-black/50 rounded-md px-1.5 py-0.5`}>
                          {example.tag}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Example prompts grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-3">
              Made with{" "}
              <span className="font-cursive text-3xl sm:text-4xl gradient-text align-middle leading-none">Dreamt Cards</span>
            </h2>
            <p className="text-center text-white/40 text-sm mb-10">
              Click any to try the prompt yourself
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {EXAMPLE_PROMPTS.map((example, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i + 0.3 }}
                >
                  <Link href={`/create?prompt=${encodeURIComponent(example.prompt)}`}>
                    <div className="group rounded-2xl border border-white/[0.08] overflow-hidden hover:border-white/20 transition-all hover:-translate-y-0.5 cursor-pointer">
                      <div className={`relative aspect-[4/3] bg-gradient-to-br ${example.gradient} overflow-hidden`}>
                        <img
                          src={example.image}
                          alt={example.prompt}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-3">
                          <span className={`text-xs font-bold uppercase tracking-widest ${example.accent}`}>
                            {example.tag}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 bg-white/[0.02]">
                        <p className="text-sm text-white/55 leading-relaxed group-hover:text-white/75 transition-colors line-clamp-2">
                          &ldquo;{example.prompt}&rdquo;
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* How it works */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-10">
            Three steps, that&apos;s it
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 * i + 0.4 }}
                className="glass rounded-2xl p-6 space-y-3 text-center"
              >
                <div className="text-3xl">{f.icon}</div>
                <h3 className="font-display font-semibold text-base">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Pricing callout */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-900/20 via-transparent to-indigo-900/20 p-8 sm:p-12 text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 text-purple-300 text-sm font-medium">
              <Wand2 className="w-4 h-4" />
              No subscription needed
            </div>

            <h2 className="font-display text-2xl sm:text-4xl font-bold">
              Start with <span className="gradient-text">$5 free</span>
            </h2>

            <div className="flex flex-col sm:flex-row justify-center gap-8 sm:gap-12">
              <div className="space-y-1">
                <p className="text-3xl font-bold text-white">~4,000</p>
                <p className="text-white/40 text-sm">images on free credit</p>
              </div>
              <div className="hidden sm:block w-px bg-white/10" />
              <div className="space-y-1">
                <p className="text-3xl font-bold text-white">¼¢ each</p>
                <p className="text-white/40 text-sm">per image after that</p>
              </div>
              <div className="hidden sm:block w-px bg-white/10" />
              <div className="space-y-1">
                <p className="text-3xl font-bold text-white">$0</p>
                <p className="text-white/40 text-sm">monthly fees, ever</p>
              </div>
            </div>

            <Link href="/create">
              <Button size="lg" className="text-base px-10 mt-2">
                Claim your free credit
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </section>
      </main>

      <Footer />
    </>
  );
}
