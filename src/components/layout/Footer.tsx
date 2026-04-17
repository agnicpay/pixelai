import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-cursive text-xl gradient-text opacity-60 leading-none">Dreamt Cards</span>
            <span className="text-white/20">·</span>
            <span className="text-sm text-white/40">Powered by AgnicWallet</span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/pricing"
              className="text-sm text-white/40 hover:text-white/60 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/create"
              className="text-sm text-white/40 hover:text-white/60 transition-colors"
            >
              Create
            </Link>
            <Link
              href="/gallery"
              className="text-sm text-white/40 hover:text-white/60 transition-colors"
            >
              Gallery
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
