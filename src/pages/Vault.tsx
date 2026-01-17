import { motion, AnimatePresence } from "framer-motion";
import { Image, Plus, Lock, Trash2, Download, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useVaultPhotos } from "@/hooks/useVaultPhotos";
import Navigation from "@/components/Navigation";
import PanicButton from "@/components/PanicButton";
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

const Vault = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { photos, loading, uploading, uploadPhoto, deletePhoto, getSignedUrl } = useVaultPhotos();
  
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<{ id: string; url: string } | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [loadingUrls, setLoadingUrls] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Load signed URLs for all photos
  useEffect(() => {
    const loadSignedUrls = async () => {
      for (const photo of photos) {
        if (!signedUrls[photo.id] && !loadingUrls.has(photo.id)) {
          setLoadingUrls(prev => new Set(prev).add(photo.id));
          const url = await getSignedUrl(photo.photo_url);
          if (url) {
            setSignedUrls(prev => ({ ...prev, [photo.id]: url }));
          }
          setLoadingUrls(prev => {
            const newSet = new Set(prev);
            newSet.delete(photo.id);
            return newSet;
          });
        }
      }
    };
    loadSignedUrls();
  }, [photos, getSignedUrl, signedUrls, loadingUrls]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadPhoto(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = async (photoId: string, originalName: string | null) => {
    const url = signedUrls[photoId];
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = originalName || 'photo.jpg';
      link.click();
    }
  };

  const confirmDelete = () => {
    if (photoToDelete) {
      deletePhoto(photoToDelete.id, photoToDelete.url);
      setPhotoToDelete(null);
      setSelectedPhoto(null);
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

  return (
    <div className="min-h-screen bg-warmth relative pb-24">
      <PanicButton />
      
      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-8">
          <Lock className="w-8 h-8 text-primary mx-auto mb-2" />
          <h1 className="font-display text-2xl font-semibold">Private Vault</h1>
          <p className="text-muted-foreground text-sm">Teri private photos, safe aur secure</p>
        </motion.div>

        {/* Upload Button */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
        />
        
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full p-8 border-2 border-dashed border-primary/30 rounded-2xl bg-card/30 hover:bg-card/50 transition-colors flex flex-col items-center gap-3 disabled:opacity-50"
          type="button"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            {uploading ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            ) : (
              <Plus className="w-8 h-8 text-primary" />
            )}
          </div>
          <p className="font-medium text-foreground">
            {uploading ? 'Uploading...' : 'Add Photos'}
          </p>
          <p className="text-sm text-muted-foreground">
            {uploading ? 'Please wait' : 'Upload from gallery'}
          </p>
        </motion.button>

        {/* Photos Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No photos yet. Add your first photo!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {photos.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="aspect-square rounded-xl overflow-hidden bg-muted/50 relative cursor-pointer group"
                  onClick={() => setSelectedPhoto(photo.id)}
                >
                  {signedUrls[photo.id] ? (
                    <img
                      src={signedUrls[photo.id]}
                      alt={photo.original_name || 'Vault photo'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Download className="w-5 h-5 text-white" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Photo Viewer Modal */}
      <AnimatePresence>
        {selectedPhoto && signedUrls[selectedPhoto] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <div className="relative max-w-full max-h-full" onClick={e => e.stopPropagation()}>
              <img
                src={signedUrls[selectedPhoto]}
                alt="Full view"
                className="max-w-full max-h-[80vh] rounded-lg"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const photo = photos.find(p => p.id === selectedPhoto);
                    if (photo) handleDownload(photo.id, photo.original_name);
                  }}
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                >
                  <Download className="w-5 h-5 text-white" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const photo = photos.find(p => p.id === selectedPhoto);
                    if (photo) setPhotoToDelete({ id: photo.id, url: photo.photo_url });
                  }}
                  className="p-2 bg-red-500/80 rounded-full hover:bg-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-white" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(null)}
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!photoToDelete} onOpenChange={() => setPhotoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this photo?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The photo will be permanently deleted.
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

export default Vault;
