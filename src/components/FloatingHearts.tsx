import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useMemo } from "react";

const FloatingHearts = () => {
  const hearts = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 6,
      size: 12 + Math.random() * 20,
      opacity: 0.15 + Math.random() * 0.25,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute"
          style={{
            left: `${heart.x}%`,
            bottom: "-50px",
          }}
          initial={{ y: 0, opacity: 0 }}
          animate={{
            y: [0, -window.innerHeight - 100],
            opacity: [0, heart.opacity, heart.opacity, 0],
            x: [0, Math.sin(heart.id) * 30, Math.cos(heart.id) * -20, 0],
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Heart
            size={heart.size}
            className="text-heart fill-heart"
            style={{ opacity: heart.opacity }}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingHearts;
