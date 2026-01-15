import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const PhotoSection = () => {
  const { profile } = useAuth();
  const [motherPhoto] = useState(profile?.mother_photo_url || null);
  const [umiyaMaaPhoto] = useState(profile?.umiya_maa_photo_url || null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center gap-8 mb-8"
    >
      {/* Mother's Photo */}
      <div className="text-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-accent/30 shadow-soft border-4 border-primary/30"
        >
          {motherPhoto ? (
            <img 
              src={motherPhoto} 
              alt="Mummy" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-primary/50" />
            </div>
          )}
          <button className="absolute bottom-0 right-0 p-1.5 bg-primary/80 rounded-full text-primary-foreground">
            <Camera className="w-3 h-3" />
          </button>
        </motion.div>
        <p className="mt-2 text-sm font-medium text-foreground/80">Mummy</p>
      </div>

      {/* Umiya Maa Photo */}
      <div className="text-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-gold/20 to-amber-200/30 shadow-soft border-4 border-gold/30"
        >
          {umiyaMaaPhoto ? (
            <img 
              src={umiyaMaaPhoto} 
              alt="Umiya Maa" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100">
              <span className="text-2xl">🙏</span>
            </div>
          )}
          <button className="absolute bottom-0 right-0 p-1.5 bg-gold/80 rounded-full text-gold-foreground">
            <Camera className="w-3 h-3" />
          </button>
        </motion.div>
        <p className="mt-2 text-sm font-medium text-foreground/80">Umiya Maa</p>
      </div>
    </motion.div>
  );
};

export default PhotoSection;
