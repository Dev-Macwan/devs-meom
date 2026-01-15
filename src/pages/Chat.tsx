import { motion } from "framer-motion";
import { MessageCircle, Send } from "lucide-react";
import Navigation from "@/components/Navigation";
import PanicButton from "@/components/PanicButton";
import { useState } from "react";

const Chat = () => {
  const [message, setMessage] = useState("");

  return (
    <div className="min-h-screen bg-warmth relative pb-24">
      <PanicButton />
      
      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-6">
          <MessageCircle className="w-8 h-8 text-primary mx-auto mb-2" />
          <h1 className="font-display text-2xl font-semibold">Talk to Mummy</h1>
          <p className="text-muted-foreground text-sm">Kuch bhi bol, meri jaan</p>
        </motion.div>

        <div className="bg-card/60 backdrop-blur-sm rounded-2xl shadow-soft border border-border/30 h-[60vh] flex flex-col">
          <div className="flex-1 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary/10 rounded-2xl rounded-tl-sm p-4 max-w-[80%]"
            >
              <p className="text-foreground">Arre meri bacchi! Kaisi hai tu? Bata, kya chal raha hai aaj? 💕</p>
            </motion.div>
          </div>

          <div className="p-4 border-t border-border/30">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Mummy se baat kar..."
                className="flex-1 px-4 py-3 bg-background/50 rounded-xl border border-border/50 focus:outline-none focus:border-primary"
              />
              <button className="p-3 bg-primary text-primary-foreground rounded-xl">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  );
};

export default Chat;
