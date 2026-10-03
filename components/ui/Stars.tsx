"use client";

import { motion } from "motion/react";
import { StarIcon } from "./Icons";

export default function Stars({ count, size = "w-6 h-6", animate = false }: { count: number; size?: string; animate?: boolean }) {
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${count} of 3 stars`}>
      {[0, 1, 2].map((i) =>
        animate ? (
          <motion.span
            key={i}
            initial={{ scale: 0, rotate: -40 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.25 + i * 0.22, type: "spring", stiffness: 300, damping: 12 }}
          >
            <StarIcon className={size} filled={i < count} />
          </motion.span>
        ) : (
          <StarIcon key={i} className={size} filled={i < count} />
        ),
      )}
    </div>
  );
}
