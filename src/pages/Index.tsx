import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import FloatingHearts from "@/components/FloatingHearts";
import SoftParticles from "@/components/SoftParticles";
import PhotoSection from "@/components/PhotoSection";
import DailyMessage from "@/components/DailyMessage";
import MissYouButton from "@/components/MissYouButton";
import Navigation from "@/components/Navigation";
import PanicButton from "@/components/PanicButton";
import { useEffect } from "react";

const Index = () => {
  const { user, profile, loading } = useAuth();
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
          Loading your safe space... 💕
        </motion.div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-warmth relative pb-24">
      <FloatingHearts />
      <SoftParticles />
      <PanicButton />
      
      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-2xl font-semibold text-foreground mb-1">
            Welcome home, {profile?.nickname || "beta"} 💕
          </h1>
          <p className="text-muted-foreground text-sm">
            Your safe space is always here for you
          </p>
        </motion.div>

        {/* Photo Section */}
        <PhotoSection />

        {/* Daily Message */}
        <div className="mb-6">
          <DailyMessage />
        </div>

        {/* Miss You Button */}
        <MissYouButton />
      </div>

      <Navigation />
    </div>
  );
};

export default Index;
