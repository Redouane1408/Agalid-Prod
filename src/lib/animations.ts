import { Variants } from 'framer-motion';

export const fadeInVariants: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

export const heroVariants: Variants = {
  initial: { opacity: 0, y: 50 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 1,
      ease: "easeOut",
      staggerChildren: 0.2
    }
  }
};

export const solarPanelVariants: Variants = {
  initial: { scale: 0.8, rotate: -5, opacity: 0 },
  animate: { 
    scale: 1, 
    rotate: 0,
    opacity: 1,
    transition: {
      duration: 1.2,
      ease: "easeInOut"
    }
  }
};

export const cardHoverVariants: Variants = {
  initial: { y: 0, scale: 1 },
  hover: { 
    y: -10, 
    scale: 1.05,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

export const slideInVariants: Variants = {
  initial: { x: -100, opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

export const scaleVariants: Variants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const floatAnimation: Variants = {
  animate: {
    y: [0, -20, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const particleAnimation: Variants = {
  initial: { opacity: 0, scale: 0 },
  animate: {
    opacity: [0, 1, 0],
    scale: [0, 1, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatDelay: Math.random() * 2
    }
  }
};