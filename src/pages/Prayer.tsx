import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import PanicButton from "@/components/PanicButton";
import DiyaGlow from "@/components/DiyaGlow";

const Prayer = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-warmth flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-primary text-xl font-display"
        >
          Loading... 💕
        </motion.div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-spiritual relative pb-24">
      <PanicButton />
      
      <div className="relative z-10 max-w-lg mx-auto px-4 py-8 text-center">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <DiyaGlow size="lg" className="mx-auto mb-6" />
          <h1 className="font-display text-2xl font-semibold mb-2">Umiya Maa</h1>
          <p className="text-muted-foreground text-sm mb-8">Shanti se apni prarthana karo</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-gold/20"
        >
          <textarea
            placeholder="Apni prarthana yahan likho... 🙏"
            className="w-full h-40 bg-transparent resize-none focus:outline-none text-foreground placeholder:text-muted-foreground"
          />
          <button type="button" className="mt-4 px-6 py-3 bg-gold text-gold-foreground rounded-xl font-medium shadow-glow">
            Save Prayer 🙏
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-muted-foreground text-sm flex items-center justify-center gap-2"
        >
          <Heart className="w-4 h-4 text-heart fill-heart" />
          Maa ki kripa hamesha tere saath hai
        </motion.p>
      </div>
      <Navigation />
    </div>
  );
};

export default Prayer;