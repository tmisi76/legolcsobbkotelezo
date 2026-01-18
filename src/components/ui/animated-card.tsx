import * as React from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const cardHoverVariants: Variants = {
  rest: { y: 0, boxShadow: "0 4px 12px -4px rgba(0, 0, 0, 0.1)" },
  hover: { 
    y: -4, 
    boxShadow: "0 12px 24px -8px rgba(0, 0, 0, 0.15)",
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
  },
};

const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  },
};

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  disableHover?: boolean;
}

const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, children, delay = 0, disableHover = false }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={staggerItemVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        whileHover={disableHover ? undefined : "hover"}
        className={cn(
          "bg-card rounded-xl border border-border transition-colors",
          className
        )}
        style={{
          transitionDelay: `${delay * 100}ms`,
        }}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";

// Card with hover lift effect
const HoverCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, children }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial="rest"
        whileHover="hover"
        animate="rest"
        variants={cardHoverVariants}
        className={cn(
          "bg-card rounded-xl border border-border",
          "hover:border-primary/30",
          className
        )}
      >
        {children}
      </motion.div>
    );
  }
);

HoverCard.displayName = "HoverCard";

export { AnimatedCard, HoverCard };
