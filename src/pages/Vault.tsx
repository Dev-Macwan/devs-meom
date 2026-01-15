import { motion } from "framer-motion";
import { Image, Plus, Lock } from "lucide-react";
import Navigation from "@/components/Navigation";
import PanicButton from "@/components/PanicButton";

const Vault = () => {
  return (
    <div className="min-h-screen bg-warmth relative pb-24">
      <PanicButton />
      
      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-8">
          <Lock className="w-8 h-8 text-primary mx-auto mb-2" />
          <h1 className="font-display text-2xl font-semibold">Private Vault</h1>
          <p className="text-muted-foreground text-sm">Teri private photos, safe aur secure</p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full p-8 border-2 border-dashed border-primary/30 rounded-2xl bg-card/30 hover:bg-card/50 transition-colors flex flex-col items-center gap-3"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Plus className="w-8 h-8 text-primary" />
          </div>
          <p className="font-medium text-foreground">Add Photos</p>
          <p className="text-sm text-muted-foreground">Upload from gallery</p>
        </motion.button>

        <div className="mt-8 grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="aspect-square rounded-xl bg-muted/50 flex items-center justify-center"
            >
              <Image className="w-8 h-8 text-muted-foreground/50" />
            </motion.div>
          ))}
        </div>
      </div>
      <Navigation />
    </div>
  );
};

export default Vault;
