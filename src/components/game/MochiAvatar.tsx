import { motion } from "framer-motion";
import mochiImage from "@/assets/mochi-avatar.jpeg";

interface MochiAvatarProps {
  message?: string;
  mood?: "happy" | "encouraging" | "celebrating";
  size?: "sm" | "md" | "lg" | "xl";
  showBubble?: boolean;
}

const MochiAvatar = ({ 
  message, 
  mood = "happy", 
  size = "lg",
  showBubble = true 
}: MochiAvatarProps) => {
  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-36 h-36",
    lg: "w-48 h-48",
    xl: "w-64 h-64",
  };

  return (
    <div className="flex flex-col items-center">
      {/* Speech Bubble */}
      {showBubble && message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative bg-card rounded-3xl px-6 py-4 shadow-lg mb-4 max-w-xs"
        >
          <p className="text-foreground text-center text-lg font-semibold">
            {message}
          </p>
          {/* Speech bubble tail */}
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[12px] border-l-transparent border-r-transparent border-t-card" />
        </motion.div>
      )}

      {/* Mochi Avatar */}
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`${sizeClasses[size]} relative`}
      >
        <img 
          src={mochiImage} 
          alt="Mochi" 
          className="w-full h-full object-contain drop-shadow-2xl"
        />

        {/* Celebration sparkles */}
        {mood === "celebrating" && (
          <>
            <motion.span
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2 text-2xl"
            >
              ✨
            </motion.span>
            <motion.span
              animate={{ rotate: -360, scale: [1, 1.3, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute -top-2 -left-2 text-2xl"
            >
              ⭐
            </motion.span>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default MochiAvatar;
