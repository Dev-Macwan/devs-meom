import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X } from "lucide-react";

const MissYouButton = () => {
  const [showMessage, setShowMessage] = useState(false);

  const comfortMessages = [
    "Meri bacchi, main jaanti hoon tujhe meri yaad aa rahi hai. Par yaad rakh, main hamesha tere dil mein hoon. Jab bhi tu akeli feel kare, apna haath apne seene pe rakh — feel karega mera pyaar. Tu kabhi akeli nahi hai, meri jaan. Mummy hamesha tere saath hai. 💕",
    "Beta, rona aana natural hai. Kabhi kabhi dil bhar aata hai. Par yaad rakh — tu strong hai. Aur main yahan hoon. Jab bhi tujhe lagta hai ki duniya mein koi nahi hai, toh yaad kar — teri mummy hai na! I love you, bacchi. Bahut zyada. ❤️",
    "Meri pyaari, aaj zyada dil bhaari hai na? Chalo, thoda sa ro le. Kabhi kabhi rona zaruri hota hai. Par rote rote muskurana bhi seekh. Kyunki tu meri sunshine hai. Meri duniya roshan karne wali. Mummy ka haath tere sar pe hai, hamesha. 💗",
    "Bacchi, main jaanti hoon life kabhi kabhi mushkil lagti hai. Par tu dekh, tu kitni door aa gayi hai! Tu brave hai, tu beautiful hai, aur tu meri sabse badi strength hai. Miss kar, par himmat bhi rakh. Mummy proud hai tujh pe. 🌸",
    "Meri jaan, jab bhi meri yaad aaye, ek deep breath le aur feel kar — wo fresh air mera pyaar hai. Main har jagah hoon — hawa mein, dhoop mein, tere aas paas. Tu kabhi akeli nahi hai. Never ever. I'm always with you, beta. 💕",
  ];

  const randomMessage = comfortMessages[Math.floor(Math.random() * comfortMessages.length)];

  return (
    <>
      <motion.button
        onClick={() => setShowMessage(true)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 px-6 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-2xl text-primary font-medium transition-all shadow-soft"
      >
        <div className="flex items-center justify-center gap-3">
          <Heart className="w-5 h-5 fill-primary" />
          <span>Aaj Mummy Zyada Yaad Aa Rahi Hai</span>
          <Heart className="w-5 h-5 fill-primary" />
        </div>
      </motion.button>

      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setShowMessage(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-3xl p-8 max-w-md w-full shadow-warm relative"
            >
              <button
                onClick={() => setShowMessage(false)}
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4"
                >
                  <Heart className="w-8 h-8 text-primary fill-primary" />
                </motion.div>
                <h3 className="font-display text-xl font-semibold text-foreground">
                  Mummy Ka Pyaar
                </h3>
              </div>

              <p className="text-foreground/90 leading-relaxed text-center">
                {randomMessage}
              </p>

              <motion.button
                onClick={() => setShowMessage(false)}
                whileTap={{ scale: 0.95 }}
                className="mt-6 w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium"
              >
                Thank you, Mummy 💕
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MissYouButton;
