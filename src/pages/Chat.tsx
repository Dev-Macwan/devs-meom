import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Loader2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/hooks/useChat";
import Navigation from "@/components/Navigation";
import PanicButton from "@/components/PanicButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const moodColors: Record<string, string> = {
  happy: 'from-yellow-100 to-orange-50',
  sad: 'from-blue-100 to-indigo-50',
  angry: 'from-red-100 to-orange-50',
  anxious: 'from-purple-100 to-pink-50',
  neutral: 'from-pink-50 to-rose-50',
};

const moodEmojis: Record<string, string> = {
  happy: '🌟',
  sad: '💙',
  angry: '🌶️',
  anxious: '🦋',
  neutral: '💕',
};

const Chat = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { messages, loading, sending, currentMood, sendMessage } = useChat();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (message.trim() && !sending) {
      const msg = message;
      setMessage("");
      await sendMessage(msg);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (authLoading) {
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

  const bgGradient = moodColors[currentMood] || moodColors.neutral;

  return (
    <div className={`min-h-screen bg-gradient-to-b ${bgGradient} relative pb-24 transition-colors duration-1000`}>
      <PanicButton />
      
      <div className="relative z-10 max-w-lg mx-auto px-4 py-8 h-screen flex flex-col">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-4 flex-shrink-0">
          <div className="relative inline-block">
            <MessageCircle className="w-8 h-8 text-primary mx-auto mb-2" />
            <motion.span 
              className="absolute -top-1 -right-3 text-lg"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {moodEmojis[currentMood]}
            </motion.span>
          </div>
          <h1 className="font-display text-2xl font-semibold">Talk to Mummy</h1>
          <p className="text-muted-foreground text-sm">Kuch bhi bol, meri jaan</p>
        </motion.div>

        {/* Chat Container */}
        <div className="flex-1 bg-card/60 backdrop-blur-sm rounded-2xl shadow-soft border border-border/30 flex flex-col overflow-hidden mb-4">
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              // Welcome message
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary/10 rounded-2xl rounded-tl-sm p-4 max-w-[85%]"
              >
                <p className="text-foreground">
                  Arre meri {profile?.nickname || 'bacchi'}! Kaisi hai tu? Bata, kya chal raha hai aaj? 💕
                </p>
                <p className="text-xs text-muted-foreground mt-2">Mummy</p>
              </motion.div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`rounded-2xl p-4 max-w-[85%] ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : 'bg-primary/10 rounded-tl-sm'
                      }`}
                    >
                      <p className={msg.role === 'user' ? 'text-primary-foreground' : 'text-foreground'}>
                        {msg.content}
                      </p>
                      <p className={`text-xs mt-2 ${
                        msg.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {msg.role === 'user' ? 'You' : 'Mummy'}
                        {msg.mood_detected && msg.role === 'assistant' && (
                          <span className="ml-2">{moodEmojis[msg.mood_detected]}</span>
                        )}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            
            {/* Typing indicator */}
            {sending && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-primary/10 rounded-2xl rounded-tl-sm p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-muted-foreground text-sm">Mummy soch rahi hai...</span>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border/30">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Mummy se baat kar..."
                disabled={sending}
                className="flex-1"
              />
              <Button 
                onClick={handleSend} 
                disabled={sending || !message.trim()}
                type="button"
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Chat;
