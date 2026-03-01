"use client";

import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { MODELS } from "@/lib/constants";
import { formatCost } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function PricingPage() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    fetch("/api/session")
      .then((r) => r.json())
      .then((d) => setAuthenticated(d.authenticated))
      .catch(() => {});
  }, []);

  return (
    <>
      <Header authenticated={authenticated} />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
          {/* Hero */}
          <div className="text-center space-y-4">
            <h1 className="font-display text-3xl sm:text-4xl font-bold">
              Simple, transparent pricing
            </h1>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Pay per image. No subscriptions, no hidden fees. Generate from
              your AgnicWallet balance.
            </p>
          </div>

          {/* Pricing card */}
          <Card className="p-8 gradient-border max-w-md mx-auto text-center space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-white/50">Pay as you go</p>
              <p className="font-display text-3xl font-bold gradient-text">
                Per-image pricing
              </p>
              <p className="text-sm text-white/40">from your AgnicWallet balance</p>
            </div>

            <div className="space-y-3 text-left">
              {[
                "~4,000 images with default model for $5",
                "Pay only for what you use",
                "Auto-recharge in your wallet",
                "No subscriptions or commitments",
                "Fund your wallet with USDC or card",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-white/60">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            <Link href="/create">
              <Button size="lg" className="w-full">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Card>

          {/* Model pricing table */}
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold text-center">
              Per-image pricing by model
            </h2>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left px-6 py-4 text-sm font-medium text-white/50">
                        Model
                      </th>
                      <th className="text-right px-6 py-4 text-sm font-medium text-white/50">
                        Cost/Image
                      </th>
                      <th className="text-right px-6 py-4 text-sm font-medium text-white/50">
                        Images per $5
                      </th>
                      <th className="text-right px-6 py-4 text-sm font-medium text-white/50">
                        Tag
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {MODELS.map((model) => (
                      <tr
                        key={model.id}
                        className="border-b border-white/[0.03] hover:bg-white/[0.02]"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {model.name}
                            </span>
                            {model.default && (
                              <Badge variant="accent">Default</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-white/70">
                          {formatCost(model.cost)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-white/70">
                          ~{Math.floor(5 / model.cost).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {model.tag && (
                            <Badge
                              variant={
                                model.tag === "Best Value"
                                  ? "success"
                                  : model.tag === "Cheapest"
                                    ? "accent"
                                    : model.tag === "High Quality"
                                      ? "warning"
                                      : "default"
                              }
                            >
                              {model.tag}
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* How billing works */}
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold text-center">
              How billing works
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  title: "1. Connect",
                  description:
                    "Sign in with AgnicWallet. Your wallet balance is used for all generations.",
                },
                {
                  title: "2. Generate",
                  description:
                    "Each image deducts a tiny amount from your balance based on the model used.",
                },
                {
                  title: "3. Fund",
                  description:
                    "Top up anytime via the AgnicWallet dashboard with USDC or card.",
                },
              ].map((step, i) => (
                <Card key={i} className="p-6 space-y-2">
                  <h3 className="font-display font-semibold text-lg">
                    {step.title}
                  </h3>
                  <p className="text-sm text-white/40">{step.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
