import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, Heart, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PhotoSection = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [motherPhotoUrl, setMotherPhotoUrl] = useState<string | null>(null);
  const [umiyaMaaPhotoUrl, setUmiyaMaaPhotoUrl] = useState<string | null>(null);
  const [uploadingMother, setUploadingMother] = useState(false);
  const [uploadingUmiya, setUploadingUmiya] = useState(false);
  
  const motherInputRef = useRef<HTMLInputElement>(null);
  const umiyaInputRef = useRef<HTMLInputElement>(null);

  // Load signed URLs for existing photos
  useEffect(() => {
    const loadPhotoUrls = async () => {
      if (profile?.mother_photo_url) {
        const { data } = await supabase.storage
          .from('profile_photos')
          .createSignedUrl(profile.mother_photo_url, 3600);
        if (data) setMotherPhotoUrl(data.signedUrl);
      }
      
      if (profile?.umiya_maa_photo_url) {
        const { data } = await supabase.storage
          .from('profile_photos')
          .createSignedUrl(profile.umiya_maa_photo_url, 3600);
        if (data) setUmiyaMaaPhotoUrl(data.signedUrl);
      }
    };
    
    if (profile) {
      loadPhotoUrls();
    }
  }, [profile]);

  const uploadPhoto = async (file: File, type: 'mother' | 'umiya') => {
    if (!user || !profile) {
      toast.error('Please login first');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, GIF, and WebP images are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const setUploading = type === 'mother' ? setUploadingMother : setUploadingUmiya;
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Delete old photo if exists
      const oldPath = type === 'mother' ? profile.mother_photo_url : profile.umiya_maa_photo_url;
      if (oldPath) {
        await supabase.storage.from('profile_photos').remove([oldPath]);
      }

      // Upload new photo
      const { error: uploadError } = await supabase.storage
        .from('profile_photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Update profile
      const updateData = type === 'mother' 
        ? { mother_photo_url: filePath }
        : { umiya_maa_photo_url: filePath };

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Get signed URL for display
      const { data: signedData } = await supabase.storage
        .from('profile_photos')
        .createSignedUrl(filePath, 3600);

      if (signedData) {
        if (type === 'mother') {
          setMotherPhotoUrl(signedData.signedUrl);
        } else {
          setUmiyaMaaPhotoUrl(signedData.signedUrl);
        }
      }

      // Refresh profile context
      await refreshProfile();
      
      toast.success(type === 'mother' ? 'Mummy ki photo save ho gayi! 💕' : 'Umiya Maa ki photo save ho gayi! 🙏');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Photo upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleMotherFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadPhoto(file, 'mother');
    if (motherInputRef.current) motherInputRef.current.value = '';
  };

  const handleUmiyaFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadPhoto(file, 'umiya');
    if (umiyaInputRef.current) umiyaInputRef.current.value = '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center gap-8 mb-8"
    >
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={motherInputRef}
        onChange={handleMotherFileSelect}
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
      />
      <input
        type="file"
        ref={umiyaInputRef}
        onChange={handleUmiyaFileSelect}
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
      />

      {/* Mother's Photo */}
      <div className="text-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-accent/30 shadow-soft border-4 border-primary/30"
        >
          {motherPhotoUrl ? (
            <img 
              src={motherPhotoUrl} 
              alt="Mummy" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-primary/50" />
            </div>
          )}
          <button 
            type="button"
            onClick={() => motherInputRef.current?.click()}
            disabled={uploadingMother}
            className="absolute bottom-0 right-0 p-1.5 bg-primary/80 rounded-full text-primary-foreground hover:bg-primary transition-colors disabled:opacity-50"
          >
            {uploadingMother ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Camera className="w-3 h-3" />
            )}
          </button>
        </motion.div>
        <p className="mt-2 text-sm font-medium text-foreground/80">Mummy</p>
      </div>

      {/* Umiya Maa Photo */}
      <div className="text-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-gold/20 to-amber-200/30 shadow-soft border-4 border-gold/30"
        >
          {umiyaMaaPhotoUrl ? (
            <img 
              src={umiyaMaaPhotoUrl} 
              alt="Umiya Maa" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100">
              <span className="text-2xl">🙏</span>
            </div>
          )}
          <button 
            type="button"
            onClick={() => umiyaInputRef.current?.click()}
            disabled={uploadingUmiya}
            className="absolute bottom-0 right-0 p-1.5 bg-gold/80 rounded-full text-white hover:bg-gold transition-colors disabled:opacity-50"
          >
            {uploadingUmiya ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Camera className="w-3 h-3" />
            )}
          </button>
        </motion.div>
        <p className="mt-2 text-sm font-medium text-foreground/80">Umiya Maa</p>
      </div>
    </motion.div>
  );
};

export default PhotoSection;
