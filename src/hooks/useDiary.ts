import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface DiaryEntry {
  id: string;
  user_id: string;
  entry_type: string;
  content: string;
  entry_date: string;
  maa_reply: string | null;
  maa_reply_requested: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

interface Task {
  id: string;
  user_id: string;
  title: string;
  task_date: string;
  scheduled_time: string | null;
  is_completed: boolean | null;
  created_at: string | null;
}

export function useDiary() {
  const { user, profile } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [requestingReply, setRequestingReply] = useState(false);

  const fetchEntries = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Fetch diary entries for today
      const { data: diaryData, error: diaryError } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('entry_date', today);

      if (diaryError) throw diaryError;
      setEntries(diaryData || []);

      // Fetch tasks for today
      const { data: tasksData, error: tasksError } = await supabase
        .from('user_tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('task_date', today)
        .order('created_at', { ascending: true });

      if (tasksError) throw tasksError;
      setTasks(tasksData || []);
    } catch (error) {
      console.error('Error fetching diary entries:', error);
      toast.error('Failed to load diary');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const saveEntry = async (entryType: string, content: string) => {
    if (!user) {
      toast.error('Please login first');
      return;
    }

    if (!content.trim()) {
      toast.error('Please write something');
      return;
    }

    setSaving(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Check if entry exists for today
      const existingEntry = entries.find(e => e.entry_type === entryType);
      
      if (existingEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('diary_entries')
          .update({ content, updated_at: new Date().toISOString() })
          .eq('id', existingEntry.id)
          .eq('user_id', user.id);

        if (error) throw error;
        toast.success('Entry updated! 💕');
      } else {
        // Create new entry
        const { error } = await supabase
          .from('diary_entries')
          .insert({
            user_id: user.id,
            entry_type: entryType,
            content,
            entry_date: today,
          });

        if (error) throw error;
        toast.success('Entry saved! 💕');
      }
      
      await fetchEntries();
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error('Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const requestMaaReply = async (entryId: string, entryType: string, content: string) => {
    if (!user) {
      toast.error('Please login first');
      return;
    }

    setRequestingReply(true);
    try {
      // Call edge function for AI reply
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('maa-diary-reply', {
        body: {
          entryType,
          content,
          nickname: profile?.nickname || 'beta',
        },
      });

      if (aiError) throw aiError;

      const reply = aiResponse.reply;

      // Save reply to database
      const { error: updateError } = await supabase
        .from('diary_entries')
        .update({ 
          maa_reply: reply, 
          maa_reply_requested: true,
          updated_at: new Date().toISOString() 
        })
        .eq('id', entryId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast.success('Mummy ne reply kiya! 💕');
      await fetchEntries();
    } catch (error) {
      console.error('Error getting Maa reply:', error);
      toast.error('Mummy abhi busy hai, thoda wait karo');
    } finally {
      setRequestingReply(false);
    }
  };

  const deleteEntry = async (entryId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Entry deleted');
      await fetchEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    }
  };

  const addTask = async (title: string, scheduledTime?: string) => {
    if (!user) {
      toast.error('Please login first');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a task');
      return;
    }

    setSaving(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const { error } = await supabase
        .from('user_tasks')
        .insert({
          user_id: user.id,
          title,
          task_date: today,
          scheduled_time: scheduledTime || null,
        });

      if (error) throw error;
      toast.success('Task added!');
      await fetchEntries();
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    } finally {
      setSaving(false);
    }
  };

  const toggleTask = async (taskId: string, isCompleted: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_tasks')
        .update({ is_completed: isCompleted })
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchEntries();
    } catch (error) {
      console.error('Error toggling task:', error);
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Task deleted');
      await fetchEntries();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const getEntryByType = (entryType: string): DiaryEntry | undefined => {
    return entries.find(e => e.entry_type === entryType);
  };

  return {
    entries,
    tasks,
    loading,
    saving,
    requestingReply,
    saveEntry,
    deleteEntry,
    addTask,
    toggleTask,
    deleteTask,
    getEntryByType,
    requestMaaReply,
    refreshEntries: fetchEntries,
  };
}
