import { motion } from "framer-motion";
import { Book, Sparkles, Sun, Moon, ListTodo } from "lucide-react";
import Navigation from "@/components/Navigation";
import PanicButton from "@/components/PanicButton";
import SoftParticles from "@/components/SoftParticles";

const Diary = () => {
  const sections = [
    { icon: Book, title: "My Diary", desc: "Write freely, meri jaan", color: "primary" },
    { icon: Sun, title: "Best Part of the Day", desc: "Aaj ka sabse acha moment", color: "gold" },
    { icon: Moon, title: "Worst Part of the Day", desc: "Jo bura laga, share kar", color: "muted" },
    { icon: ListTodo, title: "Tomorrow's Tasks", desc: "Kal kya karna hai", color: "accent" },
  ];

  return (
    <div className="min-h-screen bg-warmth relative pb-24">
      <SoftParticles />
      <PanicButton />
      
      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-8">
          <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
          <h1 className="font-display text-2xl font-semibold">My Diary</h1>
          <p className="text-muted-foreground text-sm">Apne thoughts likh, beta</p>
        </motion.div>

        <div className="space-y-4">
          {sections.map((section, i) => (
            <motion.button
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="w-full p-5 bg-card/70 backdrop-blur-sm rounded-2xl shadow-soft border border-border/30 text-left hover:shadow-warm transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <section.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{section.title}</h3>
                  <p className="text-sm text-muted-foreground">{section.desc}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
      <Navigation />
    </div>
  );
};

export default Diary;
