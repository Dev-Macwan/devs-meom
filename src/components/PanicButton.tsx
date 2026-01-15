import { motion } from "framer-motion";
import { ShieldOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const PanicButton = () => {
  const { panicHide } = useAuth();

  return (
    <motion.button
      onClick={panicHide}
      className="fixed bottom-4 right-4 z-50 p-3 bg-destructive/90 hover:bg-destructive text-destructive-foreground rounded-full shadow-lg backdrop-blur-sm transition-colors"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title="Quick Exit - Panic Button"
    >
      <ShieldOff className="w-5 h-5" />
    </motion.button>
  );
};

export default PanicButton;
