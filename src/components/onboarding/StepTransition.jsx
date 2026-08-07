import React from "react";
import { motion } from "framer-motion";

export default function StepTransition({ children, stepKey }) {
  return (
    <motion.div
      key={stepKey}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
