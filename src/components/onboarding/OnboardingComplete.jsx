import React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function OnboardingComplete() {
  const router = useRouter();

  return (
    <div className="text-center py-8 space-y-6 flex flex-col items-center">
      {/* Premium checkmark celebration animation */}
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20"
      >
        <CheckCircle2 size={40} strokeWidth={2.5} />
      </motion.div>

      <div className="space-y-2 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tighter">
          Business Onboarding Complete!
        </h2>
        <p className="text-sm font-medium text-slate-500 leading-relaxed">
          Your profile and delivery warehouse details have been successfully configured. You now have full access to Mobiking's factory-direct inventory rates.
        </p>
      </div>

      <div className="max-w-sm w-full pt-4">
        <button
          onClick={() => router.push("/")}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary/90 active:scale-[0.98] text-white font-bold py-4 text-sm uppercase tracking-wider transition-all duration-150 cursor-pointer border-0 shadow-md shadow-slate-900/10"
        >
          <ShoppingBag size={16} />
          <span>Explore Wholesale Catalog</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
