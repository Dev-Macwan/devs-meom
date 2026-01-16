import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Upload, Download, Trash2, File, Image, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import PanicButton from "@/components/PanicButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

interface Document {
  id: string;
  file_name: string;
  original_name: string;
  storage_path: string;
  user_note: string | null;
  file_type: string;
  file_size: number | null;
  created_at: string;
}

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const Documents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userNote, setUserNote] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletePath, setDeletePath] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Could not load documents",
        variant: "destructive"
      });
    } else {
      setDocuments(data || []);
    }
    setLoading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload PDF, DOC, DOCX, JPG, or PNG files only",
        variant: "destructive"
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);
    
    const fileExt = selectedFile.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const storagePath = `${user.id}/${fileName}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('documents_vault')
      .upload(storagePath, selectedFile);

    if (uploadError) {
      toast({
        title: "Upload failed",
        description: "Could not upload document",
        variant: "destructive"
      });
      setUploading(false);
      return;
    }

    // Save metadata
    const { error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        file_name: fileName,
        original_name: selectedFile.name,
        storage_path: storagePath,
        user_note: userNote || null,
        file_type: selectedFile.type,
        file_size: selectedFile.size
      });

    if (dbError) {
      // Rollback storage upload
      await supabase.storage.from('documents_vault').remove([storagePath]);
      toast({
        title: "Error",
        description: "Could not save document details",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Document saved",
        description: "Your document has been securely stored"
      });
      setSelectedFile(null);
      setUserNote("");
      fetchDocuments();
    }
    
    setUploading(false);
  };

  const handleDownload = async (doc: Document) => {
    const { data, error } = await supabase.storage
      .from('documents_vault')
      .download(doc.storage_path);

    if (error) {
      toast({
        title: "Download failed",
        description: "Could not download document",
        variant: "destructive"
      });
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.original_name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (!deleteId || !deletePath) return;

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('documents_vault')
      .remove([deletePath]);

    if (storageError) {
      toast({
        title: "Error",
        description: "Could not delete file",
        variant: "destructive"
      });
      setDeleteId(null);
      setDeletePath(null);
      return;
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', deleteId);

    if (dbError) {
      toast({
        title: "Error",
        description: "Could not delete record",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Document deleted",
        description: "Document has been removed"
      });
      fetchDocuments();
    }

    setDeleteId(null);
    setDeletePath(null);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="w-8 h-8 text-muted-foreground" />;
    }
    if (fileType === 'application/pdf') {
      return <FileText className="w-8 h-8 text-destructive/70" />;
    }
    return <File className="w-8 h-8 text-primary/70" />;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <PanicButton />
      
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-sm border-b border-border/30 px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-display font-semibold text-foreground">
            Document Vault
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your private documents, safely stored
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm"
        >
          <h2 className="text-lg font-medium text-foreground mb-4">
            Upload Document
          </h2>
          
          <div className="space-y-4">
            <div>
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-medium hover:file:bg-primary/20"
              />
              <p className="text-xs text-muted-foreground mt-2">
                PDF, DOC, DOCX, JPG, PNG • Max 10MB
              </p>
            </div>

            {selectedFile && (
              <>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  {getFileIcon(selectedFile.type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>

                <Textarea
                  placeholder="Add a note about this document (optional)..."
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  className="resize-none"
                  rows={2}
                />

                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Save Document
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </motion.div>

        {/* Documents List */}
        <div className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">
            Your Documents
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No documents yet</p>
              <p className="text-sm">Upload your first document above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-xl p-4 border border-border/50 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getFileIcon(doc.file_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {doc.original_name}
                      </p>
                      {doc.user_note && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {doc.user_note}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{formatDate(doc.created_at)}</span>
                        {doc.file_size && (
                          <span>{formatFileSize(doc.file_size)}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(doc)}
                        className="h-9 w-9"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeleteId(doc.id);
                          setDeletePath(doc.storage_path);
                        }}
                        className="h-9 w-9 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Navigation />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The document will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Documents;
