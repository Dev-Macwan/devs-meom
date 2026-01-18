import { motion, AnimatePresence } from "framer-motion";
import { Heart, Loader2, Trash2, Plus, ScrollText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePrayers } from "@/hooks/usePrayers";
import Navigation from "@/components/Navigation";
import PanicButton from "@/components/PanicButton";
import DiyaGlow from "@/components/DiyaGlow";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Prayer = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { prayers, loading, saving, savePrayer, deletePrayer } = usePrayers();
  
  const [prayerText, setPrayerText] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [prayerToDelete, setPrayerToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleSavePrayer = async () => {
    const success = await savePrayer(prayerText);
    if (success) {
      setPrayerText("");
    }
  };

  const confirmDelete = () => {
    if (prayerToDelete) {
      deletePrayer(prayerToDelete);
      setPrayerToDelete(null);
    }
  };

  if (authLoading || loading) {
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
      
      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <DiyaGlow size="lg" className="mx-auto mb-6" />
          <h1 className="font-display text-2xl font-semibold mb-2">Umiya Maa</h1>
          <p className="text-muted-foreground text-sm mb-6">Shanti se apni prarthana karo</p>
        </motion.div>

        {/* Toggle between write and history */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={!showHistory ? "default" : "outline"}
            onClick={() => setShowHistory(false)}
            className="flex-1"
            type="button"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Prayer
          </Button>
          <Button
            variant={showHistory ? "default" : "outline"}
            onClick={() => setShowHistory(true)}
            className="flex-1"
            type="button"
          >
            <ScrollText className="w-4 h-4 mr-2" />
            My Prayers ({prayers.length})
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {!showHistory ? (
            // Write Prayer View
            <motion.div
              key="write"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-gold/20">
                <Textarea
                  placeholder="Apni prarthana yahan likho... 🙏"
                  value={prayerText}
                  onChange={e => setPrayerText(e.target.value)}
                  className="w-full min-h-[200px] bg-transparent resize-none focus-visible:ring-0 border-none text-foreground placeholder:text-muted-foreground text-base"
                />
                <Button 
                  onClick={handleSavePrayer}
                  disabled={saving || !prayerText.trim()}
                  className="mt-4 w-full bg-gold text-white hover:bg-gold/90"
                  type="button"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Save Prayer 🙏
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ) : (
            // Prayer History View
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {prayers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ScrollText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aapne abhi tak koi prarthana nahi likhi</p>
                  <p className="text-sm mt-1">Start writing your first prayer</p>
                </div>
              ) : (
                prayers.map((prayer, i) => (
                  <motion.div
                    key={prayer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card/60 backdrop-blur-sm rounded-2xl p-4 shadow-soft border border-gold/20"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs text-muted-foreground">
                        {prayer.created_at 
                          ? format(new Date(prayer.created_at), 'dd MMM yyyy, hh:mm a')
                          : 'Unknown date'
                        }
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPrayerToDelete(prayer.id)}
                        className="text-destructive hover:text-destructive -mt-1 -mr-1"
                        type="button"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                      {prayer.prayer_content}
                    </p>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>

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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!prayerToDelete} onOpenChange={() => setPrayerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this prayer?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Navigation />
    </div>
  );
};

export default Prayer;
