// Global animation configuration
// Respects prefers-reduced-motion automatically

export const animationConfig = {
  // Durations
  duration: {
    fast: 0.15,
    normal: 0.3,
    slow: 0.5,
    slower: 0.8,
  },
  // Easings
  easing: {
    easeOut: [0.16, 1, 0.3, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    spring: { type: "spring", stiffness: 300, damping: 30 },
    bounce: { type: "spring", stiffness: 400, damping: 10 },
  },
};

// Framer Motion variants for reusable animations
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: animationConfig.easing.easeOut }
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3, ease: animationConfig.easing.easeOut }
  },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3, ease: animationConfig.easing.easeOut }
  },
};

export const slideInRight = {
  hidden: { x: "100%", opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.3, ease: animationConfig.easing.easeOut }
  },
  exit: { 
    x: "100%", 
    opacity: 0,
    transition: { duration: 0.2, ease: animationConfig.easing.easeInOut }
  },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: animationConfig.easing.easeOut }
  },
};

// Card hover animation
export const cardHover = {
  rest: { y: 0, boxShadow: "0 4px 12px -4px rgba(0, 0, 0, 0.1)" },
  hover: { 
    y: -4, 
    boxShadow: "0 12px 24px -8px rgba(0, 0, 0, 0.15)",
    transition: { duration: 0.2, ease: animationConfig.easing.easeOut }
  },
};

// Bounce animation for icons
export const bounceIn = {
  hidden: { scale: 0, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: "spring",
      stiffness: 400,
      damping: 15,
    }
  },
};

// Pulse animation for urgent items
export const pulseAnimation = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Page transition
export const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: animationConfig.easing.easeOut }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: { duration: 0.2 }
  },
};

// Shimmer effect for skeletons (CSS keyframe reference)
export const shimmer = `
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

// Check if user prefers reduced motion
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Get animation variants with reduced motion support
export const getReducedMotionVariants = (variants: Record<string, unknown>) => {
  if (prefersReducedMotion()) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.01 } },
    };
  }
  return variants;
};
