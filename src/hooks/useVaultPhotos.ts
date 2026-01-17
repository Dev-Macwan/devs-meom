import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface VaultPhoto {
  id: string;
  photo_url: string;
  original_name: string | null;
  created_at: string | null;
}

export function useVaultPhotos() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<VaultPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchPhotos = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('private_vault')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching vault photos:', error);
      toast.error('Failed to load photos');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const uploadPhoto = async (file: File) => {
    if (!user) {
      toast.error('Please login first');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, GIF, and WebP images are allowed');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('private_vault')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('private_vault')
        .insert({
          user_id: user.id,
          photo_url: filePath,
          original_name: file.name,
        });

      if (dbError) throw dbError;

      toast.success('Photo saved to vault! 💕');
      await fetchPhotos();
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (photoId: string, photoUrl: string) => {
    if (!user) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('private_vault')
        .remove([photoUrl]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('private_vault')
        .delete()
        .eq('id', photoId)
        .eq('user_id', user.id);

      if (dbError) throw dbError;

      toast.success('Photo deleted');
      await fetchPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Failed to delete photo');
    }
  };

  const getSignedUrl = async (photoUrl: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.storage
        .from('private_vault')
        .createSignedUrl(photoUrl, 3600); // 1 hour expiry

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      return null;
    }
  };

  return {
    photos,
    loading,
    uploading,
    uploadPhoto,
    deletePhoto,
    getSignedUrl,
    refreshPhotos: fetchPhotos,
  };
}
