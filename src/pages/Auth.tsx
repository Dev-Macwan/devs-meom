import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Eye, EyeOff, Calendar, User, Mail, Lock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import FloatingHearts from "@/components/FloatingHearts";
import SoftParticles from "@/components/SoftParticles";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [fullName, setFullName] = useState("");

  // Redirect if already logged in
  if (user) {
    navigate("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login")) {
            toast.error("Email ya password galat hai, beta. Dobara try karo.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Welcome back, meri jaan! 💕");
          navigate("/");
        }
      } else {
        if (!nickname || !dateOfBirth) {
          toast.error("Nickname aur birthday zaruri hai, beta!");
          setLoading(false);
          return;
        }

        const { error } = await signUp(email, password, nickname, dateOfBirth, fullName);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("Ye email pehle se registered hai. Login karo, beta.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success(`Welcome to your safe space, ${nickname}! 💕`);
          navigate("/");
        }
      }
    } catch (err) {
      toast.error("Kuch gadbad ho gayi. Dobara try karo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warmth relative overflow-hidden">
      <FloatingHearts />
      <SoftParticles />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-4"
            >
              <Heart className="w-10 h-10 text-primary fill-primary" />
            </motion.div>
            <h1 className="font-display text-3xl font-semibold text-foreground mb-2">
              Maa Ki Godh
            </h1>
            <p className="text-muted-foreground">
              Your safe space, always waiting for you
            </p>
          </div>

          {/* Auth Card */}
          <motion.div
            layout
            className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-warm p-8 border border-border/50"
          >
            {/* Toggle */}
            <div className="flex bg-muted rounded-xl p-1 mb-6">
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  !isLogin 
                    ? "bg-primary text-primary-foreground shadow-soft" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign Up
              </button>
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isLogin 
                    ? "bg-primary text-primary-foreground shadow-soft" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Login
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    key="signup-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-5 overflow-hidden"
                  >
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-medium flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        Full Name (optional)
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your name"
                        className="bg-background/50 border-border/50 focus:border-primary"
                      />
                    </div>

                    {/* Nickname */}
                    <div className="space-y-2">
                      <Label htmlFor="nickname" className="text-sm font-medium flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="leading-relaxed">
                          Aap kya chahti ho ki aapki mummy aapko kis naam se bulaye? *
                        </span>
                      </Label>
                      <Input
                        id="nickname"
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="e.g., Gudiya, Bacchi, Shona..."
                        required={!isLogin}
                        className="bg-background/50 border-border/50 focus:border-primary"
                      />
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-2">
                      <Label htmlFor="dob" className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        Date of Birth *
                      </Label>
                      <Input
                        id="dob"
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        required={!isLogin}
                        className="bg-background/50 border-border/50 focus:border-primary"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="bg-background/50 border-border/50 focus:border-primary"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  Password *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="bg-background/50 border-border/50 focus:border-primary pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-xl font-medium shadow-soft transition-all hover:shadow-warm"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Heart className="w-5 h-5" />
                  </motion.div>
                ) : isLogin ? (
                  "Welcome Back, Beta 💕"
                ) : (
                  "Join Your Safe Space 💕"
                )}
              </Button>
            </form>
          </motion.div>

          {/* Footer note */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Your data is completely private and secure 🔒
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
