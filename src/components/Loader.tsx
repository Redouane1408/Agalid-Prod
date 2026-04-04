import { motion } from 'framer-motion';

interface LoaderProps {
  fullScreen?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Loader = ({ fullScreen = true, className = '', size = 'md' }: LoaderProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-32 h-32',
  };

  const content = (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <motion.div
        className={`relative ${sizeClasses[size]}`}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 1.5,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        <img 
          src="/agalid last version-16.svg" 
          alt="Loading..." 
          className="w-full h-full object-contain drop-shadow-lg"
        />
        
        {/* Pulsing ring effect */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-primary/30"
          animate={{
            scale: [1, 1.5],
            opacity: [1, 0],
          }}
          transition={{
            duration: 1.5,
            ease: "easeOut",
            repeat: Infinity,
          }}
        />
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="text-primary font-medium text-sm tracking-wider"
      >
        CHARGEMENT...
      </motion.p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-[9999]">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;
