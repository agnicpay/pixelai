"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  MessageSquare,
  Wallet,
  Image as ImageIcon,
  Zap,
} from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const EXAMPLE_PROMPTS = [
  {
    prompt: "A mystical forest with bioluminescent mushrooms and fireflies at twilight",
    gradient: "from-purple-900/40 to-blue-900/40",
  },
  {
    prompt: "Cyberpunk cityscape at sunset with neon reflections on wet streets",
    gradient: "from-cyan-900/40 to-purple-900/40",
  },
  {
    prompt: "An astronaut floating among giant jellyfish in deep space",
    gradient: "from-indigo-900/40 to-cyan-900/40",
  },
  {
    prompt: "Japanese zen garden with cherry blossoms and a koi pond, watercolor style",
    gradient: "from-pink-900/40 to-purple-900/40",
  },
  {
    prompt: "Steampunk clockwork dragon perched on a Victorian rooftop",
    gradient: "from-amber-900/40 to-red-900/40",
  },
  {
    prompt: "Crystal cave with aurora borealis visible through an opening above",
    gradient: "from-emerald-900/40 to-cyan-900/40",
  },
];

const STEPS = [
  {
    icon: MessageSquare,
    title: "Describe your vision",
    description: "Type a text prompt describing the image you want to create",
  },
  {
    icon: Wallet,
    title: "Connect your wallet",
    description: "Sign in with AgnicWallet — your balance pays for generations",
  },
  {
    icon: ImageIcon,
    title: "Get your image",
    description: "AI generates your image in seconds — download and share",
  },
];

export default function LandingPage() {
  return (
    <>
      <Header authenticated={false} />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-sm text-white/60">
                <Sparkles className="w-4 h-4 text-purple-400" />
                AI Image Generation
              </div>

              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                Create stunning images{" "}
                <span className="gradient-text">with AI</span>
              </h1>

              <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto">
                Transform your ideas into beautiful images using state-of-the-art
                AI models. Pay per image, no subscriptions.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/create">
                  <Button size="lg" className="text-base px-8">
                    Get Started
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="secondary" size="lg" className="text-base px-8">
                    View Pricing
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-white/30">
                <Zap className="w-3.5 h-3.5 inline mr-1" />
                Pay per image · No subscriptions · Powered by AgnicWallet
              </p>
            </motion.div>
          </div>
        </section>

        {/* Example images */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-12">
              What you can create
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {EXAMPLE_PROMPTS.map((example, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                >
                  <Card className="overflow-hidden group">
                    <div
                      className={`aspect-square bg-gradient-to-br ${example.gradient} flex items-center justify-center p-8`}
                    >
                      <ImageIcon className="w-16 h-16 text-white/10 group-hover:text-white/20 transition-colors" />
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-white/50 leading-relaxed">
                        &ldquo;{example.prompt}&rdquo;
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* How it works */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-12">
            How it works
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.15 }}
                  className="text-center space-y-4"
                >
                  <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center mx-auto">
                    <Icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-white/30 font-medium">
                      Step {i + 1}
                    </div>
                    <h3 className="font-display font-semibold text-lg">
                      {step.title}
                    </h3>
                    <p className="text-sm text-white/40">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24">
          <Card className="p-8 sm:p-12 text-center space-y-6 gradient-border">
            <h2 className="font-display text-2xl sm:text-3xl font-bold">
              Ready to create?
            </h2>
            <p className="text-white/50 max-w-lg mx-auto">
              Start generating images in seconds. No subscriptions, no hidden fees
              — just pay for what you use.
            </p>
            <Link href="/create">
              <Button size="lg" className="text-base px-8">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </Card>
        </section>
      </main>

      <Footer />
    </>
  );
}
