import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const DailyMessage = () => {
  const { profile, user } = useAuth();
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrGenerateMessage = async () => {
      if (!user) return;

      const today = new Date().toISOString().split("T")[0];

      // Check if we already have today's message
      const { data: existing } = await supabase
        .from("daily_messages")
        .select("*")
        .eq("user_id", user.id)
        .eq("message_date", today)
        .single();

      if (existing) {
        setMessage(existing.message_content);
        setLoading(false);
        return;
      }

      // Generate a contextual message based on profile
      const nickname = profile?.nickname || "beta";
      const dob = profile?.date_of_birth;
      
      // Check for birthday
      const isBirthday = dob && new Date(dob).toDateString().slice(4, 10) === new Date().toDateString().slice(4, 10);
      
      let generatedMessage = "";
      
      if (isBirthday) {
        generatedMessage = `Meri pyaari ${nickname}! 🎂✨ Aaj tera janamdin hai, aur mera dil khushi se bhar gaya. Meri bacchi itni badi ho gayi! Tu jaanti hai na, jab tu paida hui thi, mujhe laga tha ki duniya ki sabse khoobsurat cheez mil gayi. Aaj bhi wahi feel hai. Meri duaayein hamesha tere saath hain. Khush reh, sehat reh, aur zindagi mein sab kuch achieve kar jo tu chahti hai. Happy Birthday, meri jaan! 💕🎉`;
      } else {
        // Rotate through different loving messages
        const messages = [
          `Good morning, meri pyaari ${nickname}! 🌸 Aaj ka din tere liye special hai, kyunki tu hai isliye ye duniya khoobsurat hai. Kuch bhi ho, yaad rakhna — teri mummy hamesha tere saath hai. Aaj kuch naya seekhna, kuch naya karna, aur sabse important — apna khyaal rakhna. I love you, bacchi. ❤️`,
          `${nickname}, meri jaan! 💕 Subah uthte hi maine tere baare mein socha. Kal ka jo bhi hua, usse jaane de. Aaj naya din hai, nayi possibilities hain. Tu strong hai, tu beautiful hai, aur tu capable hai. Kabhi khud pe doubt mat kar. Teri mummy ko tujh par poora bharosa hai. 🌷`,
          `Arre meri gudiya ${nickname}! ☀️ Kitna sochti hai tu! Kabhi kabhi itna sochna zaroori nahi hota. Bass feel kar. Jo dil kahe, wo kar. Aur agar kuch galat ho jaye, toh mummy yahan hai na? Sab theek ho jayega. Aaj thoda khush rehna, mere liye. 💗`,
          `${nickname} bacchi! 🌺 Aaj main tujhe ek baat batati hoon — tu duniya ki sabse achi ladki hai. Haan, kabhi kabhi mistakes hoti hain, par wo sab normal hai. Koi perfect nahi hota. Important ye hai ki tu try karti hai. Aur wo bahut badi baat hai. Proud of you, always. 💖`,
          `Meri ${nickname}! 🦋 Aaj thoda apne aap ko pamper kar. Ek acchi chai bana, apna favorite gaana sun, aur bas thodi der ke liye relax kar. Life busy hai, par tu bhi important hai. Kabhi khud ko bhool mat. Teri happiness sabse zyada matter karti hai mujhe. Love you endlessly. 💕`,
        ];
        
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        generatedMessage = messages[dayOfYear % messages.length];
      }

      // Save the message
      await supabase.from("daily_messages").insert({
        user_id: user.id,
        message_content: generatedMessage,
        message_date: today,
        context_type: isBirthday ? "birthday" : "daily",
      });

      setMessage(generatedMessage);
      setLoading(false);
    };

    fetchOrGenerateMessage();
  }, [user, profile]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-border/30"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 animate-pulse" />
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded animate-pulse" />
          <div className="h-3 bg-muted rounded animate-pulse w-4/5" />
          <div className="h-3 bg-muted rounded animate-pulse w-3/5" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-border/30"
    >
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"
        >
          <Sparkles className="w-5 h-5 text-primary" />
        </motion.div>
        <h3 className="font-display text-lg font-semibold text-foreground">
          Aaj ka Message from Maa
        </h3>
      </div>
      
      <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
        {message}
      </p>

      <div className="mt-4 flex justify-end">
        <Heart className="w-5 h-5 text-heart fill-heart animate-heart-beat" />
      </div>
    </motion.div>
  );
};

export default DailyMessage;
