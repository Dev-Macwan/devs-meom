import { motion } from "framer-motion";

interface DiyaGlowProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const DiyaGlow = ({ size = "md", className = "" }: DiyaGlowProps) => {
  const sizes = {
    sm: { diya: 40, flame: 12 },
    md: { diya: 60, flame: 18 },
    lg: { diya: 80, flame: 24 },
  };

  const { diya, flame } = sizes[size];

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Glow effect */}
      <motion.div
        className="absolute rounded-full bg-diya/30"
        style={{
          width: diya * 2,
          height: diya * 2,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Diya base */}
      <div
        className="relative bg-gradient-to-b from-amber-600 to-amber-800 rounded-b-full"
        style={{
          width: diya,
          height: diya * 0.4,
          borderTopLeftRadius: "30%",
          borderTopRightRadius: "30%",
        }}
      >
        {/* Flame */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 -top-4"
          animate={{
            scaleY: [1, 1.2, 0.9, 1.1, 1],
            scaleX: [1, 0.9, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div
            className="bg-gradient-to-t from-orange-500 via-yellow-400 to-yellow-200 rounded-full"
            style={{
              width: flame,
              height: flame * 1.8,
              clipPath: "ellipse(50% 70% at 50% 100%)",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default DiyaGlow;
