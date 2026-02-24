import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <motion.section
      className="page-shell"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  );
}
