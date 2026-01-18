import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Prayer {
  id: string;
  user_id: string;
  prayer_content: string;
  created_at: string | null;
}

export function usePrayers() {
  const { user } = useAuth();
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPrayers = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('prayers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setPrayers(data || []);
    } catch (error) {
      console.error('Error fetching prayers:', error);
      toast.error('Failed to load prayers');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPrayers();
  }, [fetchPrayers]);

  const savePrayer = async (content: string) => {
    if (!user) {
      toast.error('Please login first');
      return;
    }

    if (!content.trim()) {
      toast.error('Please write your prayer');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('prayers')
        .insert({
          user_id: user.id,
          prayer_content: content,
        });

      if (error) throw error;
      toast.success('Prayer saved! Umiya Maa ki kripa aap par bani rahe 🙏');
      await fetchPrayers();
      return true;
    } catch (error) {
      console.error('Error saving prayer:', error);
      toast.error('Failed to save prayer');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deletePrayer = async (prayerId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('prayers')
        .delete()
        .eq('id', prayerId)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Prayer deleted');
      await fetchPrayers();
    } catch (error) {
      console.error('Error deleting prayer:', error);
      toast.error('Failed to delete prayer');
    }
  };

  return {
    prayers,
    loading,
    saving,
    savePrayer,
    deletePrayer,
    refreshPrayers: fetchPrayers,
  };
}
