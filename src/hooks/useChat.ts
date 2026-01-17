import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  user_id: string;
  role: string;
  content: string;
  mood_detected: string | null;
  is_night_mode: boolean | null;
  created_at: string | null;
}

export function useChat() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentMood, setCurrentMood] = useState<string>('neutral');

  const fetchMessages = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
      
      // Set current mood from last message
      if (data && data.length > 0) {
        const lastMood = data[data.length - 1].mood_detected;
        if (lastMood) setCurrentMood(lastMood);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sendMessage = async (content: string) => {
    if (!user) {
      toast.error('Please login first');
      return;
    }

    if (!content.trim()) {
      return;
    }

    setSending(true);
    
    try {
      // Check if it's night time (after 9 PM or before 6 AM)
      const hour = new Date().getHours();
      const isNightMode = hour >= 21 || hour < 6;

      // Save user message
      const { data: userMsgData, error: userMsgError } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          role: 'user',
          content,
          is_night_mode: isNightMode,
        })
        .select()
        .single();

      if (userMsgError) throw userMsgError;

      // Add user message to local state
      setMessages(prev => [...prev, userMsgData]);

      // Call AI function
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('mummy-chat', {
        body: {
          message: content,
          nickname: profile?.nickname || 'beta',
          mood: currentMood,
        },
      });

      if (aiError) throw aiError;

      const reply = aiResponse.reply;
      const detectedMood = aiResponse.mood || 'neutral';
      setCurrentMood(detectedMood);

      // Save AI response
      const { data: aiMsgData, error: saveMsgError } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          role: 'assistant',
          content: reply,
          mood_detected: detectedMood,
          is_night_mode: isNightMode,
        })
        .select()
        .single();

      if (saveMsgError) throw saveMsgError;

      // Add AI message to local state
      setMessages(prev => [...prev, aiMsgData]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const clearHistory = async () => {
    if (!user) return;

    // Note: We don't have delete policy on chat_messages, 
    // so we'll just clear local state for now
    setMessages([]);
    setCurrentMood('neutral');
    toast.success('Chat cleared');
  };

  return {
    messages,
    loading,
    sending,
    currentMood,
    sendMessage,
    clearHistory,
    refreshMessages: fetchMessages,
  };
}
