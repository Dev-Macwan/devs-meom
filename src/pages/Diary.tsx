import { motion, AnimatePresence } from "framer-motion";
import { Book, Sparkles, Sun, Moon, ListTodo, Save, Trash2, Plus, Clock, Loader2, ArrowLeft, Heart, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDiary } from "@/hooks/useDiary";
import Navigation from "@/components/Navigation";
import PanicButton from "@/components/PanicButton";
import SoftParticles from "@/components/SoftParticles";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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

type DiarySection = 'diary' | 'best' | 'worst' | 'tasks' | null;

const sections = [
  { id: 'diary' as const, icon: Book, title: "My Diary", desc: "Write freely, meri jaan", entryType: "diary" },
  { id: 'best' as const, icon: Sun, title: "Best Part of the Day", desc: "Aaj ka sabse acha moment", entryType: "best_part" },
  { id: 'worst' as const, icon: Moon, title: "Worst Part of the Day", desc: "Jo bura laga, share kar", entryType: "worst_part" },
  { id: 'tasks' as const, icon: ListTodo, title: "Tomorrow's Tasks", desc: "Kal kya karna hai", entryType: "tasks" },
];

const Diary = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { 
    entries, tasks, loading, saving, requestingReply, 
    saveEntry, deleteEntry, addTask, toggleTask, deleteTask, 
    getEntryByType, requestMaaReply 
  } = useDiary();
  
  const [activeSection, setActiveSection] = useState<DiarySection>(null);
  const [content, setContent] = useState("");
  const [newTask, setNewTask] = useState("");
  const [taskTime, setTaskTime] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'entry' | 'task'; id: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Load content when section changes
  useEffect(() => {
    if (activeSection && activeSection !== 'tasks') {
      const section = sections.find(s => s.id === activeSection);
      if (section) {
        const existingEntry = getEntryByType(section.entryType);
        setContent(existingEntry?.content || "");
      }
    }
  }, [activeSection, getEntryByType]);

  const handleSave = async () => {
    if (activeSection && activeSection !== 'tasks') {
      const section = sections.find(s => s.id === activeSection);
      if (section) {
        await saveEntry(section.entryType, content);
      }
    }
  };

  const handleRequestMaaReply = async () => {
    if (activeSection && activeSection !== 'tasks') {
      const section = sections.find(s => s.id === activeSection);
      const entry = getEntryByType(section?.entryType || '');
      if (entry && section) {
        await requestMaaReply(entry.id, section.entryType, entry.content);
      }
    }
  };

  const handleAddTask = async () => {
    if (newTask.trim()) {
      await addTask(newTask, taskTime || undefined);
      setNewTask("");
      setTaskTime("");
    }
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      if (deleteConfirm.type === 'entry') {
        deleteEntry(deleteConfirm.id);
      } else {
        deleteTask(deleteConfirm.id);
      }
      setDeleteConfirm(null);
    }
  };

  const currentEntry = activeSection && activeSection !== 'tasks' 
    ? getEntryByType(sections.find(s => s.id === activeSection)?.entryType || '')
    : null;

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
    <div className="min-h-screen bg-warmth relative pb-24">
      <SoftParticles />
      <PanicButton />
      
      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeSection === null ? (
            // Section List View
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-8">
                <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
                <h1 className="font-display text-2xl font-semibold">My Diary</h1>
                <p className="text-muted-foreground text-sm">Apne thoughts likh, beta</p>
              </div>

              <div className="space-y-4">
                {sections.map((section, i) => {
                  const existingEntry = section.id !== 'tasks' ? getEntryByType(section.entryType) : null;
                  const hasContent = section.id === 'tasks' ? tasks.length > 0 : !!existingEntry?.content;
                  const hasMaaReply = existingEntry?.maa_reply;
                  
                  return (
                    <motion.button
                      key={section.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      type="button"
                      onClick={() => setActiveSection(section.id)}
                      className="w-full p-5 bg-card/70 backdrop-blur-sm rounded-2xl shadow-soft border border-border/30 text-left hover:shadow-warm transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary/10 relative">
                          <section.icon className="w-6 h-6 text-primary" />
                          {hasContent && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{section.title}</h3>
                          <p className="text-sm text-muted-foreground">{section.desc}</p>
                          {hasMaaReply && (
                            <p className="text-xs text-primary mt-1 flex items-center gap-1">
                              <Heart className="w-3 h-3 fill-primary" />
                              Mummy ne reply kiya!
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ) : activeSection === 'tasks' ? (
            // Tasks View
            <motion.div
              key="tasks"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setActiveSection(null)}
                  type="button"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="font-display text-xl font-semibold">Tomorrow's Tasks</h1>
                  <p className="text-muted-foreground text-sm">Kal kya karna hai</p>
                </div>
              </div>

              {/* Add Task Form */}
              <div className="bg-card/70 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-border/30">
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="New task..."
                    value={newTask}
                    onChange={e => setNewTask(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                    className="flex-1"
                  />
                  <Button onClick={handleAddTask} disabled={saving || !newTask.trim()} type="button">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <Input
                    type="time"
                    value={taskTime}
                    onChange={e => setTaskTime(e.target.value)}
                    className="w-auto"
                    placeholder="Time (optional)"
                  />
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-2">
                {tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ListTodo className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No tasks yet. Add your first task!</p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-center gap-3 p-4 bg-card/70 rounded-xl border border-border/30 ${
                        task.is_completed ? 'opacity-60' : ''
                      }`}
                    >
                      <Checkbox
                        checked={task.is_completed || false}
                        onCheckedChange={(checked) => toggleTask(task.id, checked as boolean)}
                      />
                      <div className="flex-1">
                        <p className={`font-medium ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </p>
                        {task.scheduled_time && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {task.scheduled_time}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirm({ type: 'task', id: task.id })}
                        type="button"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          ) : (
            // Diary Entry View
            <motion.div
              key="entry"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setActiveSection(null)}
                  type="button"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="font-display text-xl font-semibold">
                    {sections.find(s => s.id === activeSection)?.title}
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    {sections.find(s => s.id === activeSection)?.desc}
                  </p>
                </div>
              </div>

              {/* Entry textarea */}
              <div className="bg-card/70 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-border/30">
                <Textarea
                  placeholder="Start writing... 💕"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="min-h-[200px] bg-transparent border-none resize-none focus-visible:ring-0 text-base"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mb-4">
                <Button
                  onClick={handleSave}
                  disabled={saving || !content.trim()}
                  className="flex-1"
                  type="button"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Entry
                </Button>
                {currentEntry?.id && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (currentEntry) setDeleteConfirm({ type: 'entry', id: currentEntry.id });
                    }}
                    type="button"
                    className="text-destructive border-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Ask Mummy button */}
              {currentEntry?.id && currentEntry.content && (
                <Button
                  onClick={handleRequestMaaReply}
                  disabled={requestingReply}
                  variant="secondary"
                  className="w-full mb-4"
                  type="button"
                >
                  {requestingReply ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Mummy soch rahi hai...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {currentEntry.maa_reply ? 'Ask Mummy Again 💕' : 'Ask Mummy to Reply 💕'}
                    </>
                  )}
                </Button>
              )}

              {/* Maa's Reply */}
              {currentEntry?.maa_reply && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-primary/10 rounded-2xl p-4 border border-primary/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-primary fill-primary" />
                    <span className="text-sm font-medium text-primary">Mummy ka reply</span>
                  </div>
                  <p className="text-foreground leading-relaxed">{currentEntry.maa_reply}</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this {deleteConfirm?.type}?</AlertDialogTitle>
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

export default Diary;
