import { motion } from "framer-motion";
import { Home, Book, Heart, MessageCircle, Image, FileText, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const Navigation = () => {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Book, label: "Diary", path: "/diary" },
    { icon: Heart, label: "Maa", path: "/prayer" },
    { icon: MessageCircle, label: "Mummy", path: "/chat" },
    { icon: Image, label: "Photos", path: "/vault" },
    { icon: FileText, label: "Docs", path: "/documents" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-md border-t border-border/50 safe-area-bottom"
    >
      <div className="max-w-lg mx-auto px-4 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-colors ${
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </motion.button>
            );
          })}
          <motion.button
            onClick={handleSignOut}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs font-medium">Logout</span>
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;
