import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Image as ImageIcon, 
  Trash2, 
  ExternalLink, 
  Loader2,
  Upload,
  X
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { hu } from "date-fns/locale";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

interface CarDocument {
  id: string;
  car_id: string;
  file_path: string;
  file_name: string;
  file_type: string;
  uploaded_at: string;
}

interface CarDocumentListProps {
  carId: string;
  isAdmin?: boolean;
}

export function CarDocumentList({ carId, isAdmin = false }: CarDocumentListProps) {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [loadingDocId, setLoadingDocId] = useState<string | null>(null);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["car_documents", carId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("car_documents")
        .select("*")
        .eq("car_id", carId)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      return data as CarDocument[];
    },
    enabled: !!carId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (doc: CarDocument) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("insurance-documents")
        .remove([doc.file_path]);

      if (storageError) {
        console.error("Storage delete error:", storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("car_documents")
        .delete()
        .eq("id", doc.id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["car_documents", carId] });
      toast.success("Dokumentum törölve");
    },
    onError: () => {
      toast.error("Hiba történt a törlés során");
    },
  });

  const handleUpload = async (files: FileList) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Be kell jelentkezned a feltöltéshez");
      return;
    }

    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        // Validate file
        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
          toast.error(`${file.name}: Csak JPG, PNG, WebP vagy PDF fájl tölthető fel`);
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name}: Maximum 10MB lehet`);
          continue;
        }

        // Upload to storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${carId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("insurance-documents")
          .upload(fileName, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          toast.error(`${file.name}: Feltöltési hiba`);
          continue;
        }

        // Save to database
        const { error: dbError } = await supabase
          .from("car_documents")
          .insert({
            car_id: carId,
            file_path: fileName,
            file_name: file.name,
            file_type: file.type,
          });

        if (dbError) {
          console.error("DB error:", dbError);
          toast.error(`${file.name}: Adatbázis hiba`);
          continue;
        }
      }

      queryClient.invalidateQueries({ queryKey: ["car_documents", carId] });
      toast.success("Dokumentum(ok) feltöltve!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Hiba történt a feltöltés során");
    } finally {
      setIsUploading(false);
    }
  };

  const openDocument = async (doc: CarDocument) => {
    setLoadingDocId(doc.id);
    try {
      const { data, error } = await supabase.storage
        .from("insurance-documents")
        .createSignedUrl(doc.file_path, 3600);

      if (error) {
        toast.error("Nem sikerült megnyitni a dokumentumot");
        return;
      }

      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank");
      }
    } catch (error) {
      toast.error("Hiba történt");
    } finally {
      setLoadingDocId(null);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === "application/pdf") {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    return <ImageIcon className="w-5 h-5 text-blue-500" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Upload area */}
      {!isAdmin && (
        <label className="block">
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
              "hover:border-primary hover:bg-primary/5",
              isUploading && "opacity-50 pointer-events-none"
            )}
          >
            <input
              type="file"
              multiple
              accept={ACCEPTED_FILE_TYPES.join(",")}
              className="hidden"
              onChange={(e) => e.target.files && handleUpload(e.target.files)}
              disabled={isUploading}
            />
            {isUploading ? (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Feltöltés...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Upload className="w-5 h-5" />
                <span>Kattints vagy húzz ide fájlokat</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG, WebP vagy PDF (max. 10MB)
            </p>
          </div>
        </label>
      )}

      {/* Document list */}
      {documents.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-2">
          Nincs feltöltött dokumentum
        </p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3 min-w-0">
                {getFileIcon(doc.file_type)}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{doc.file_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(doc.uploaded_at), "yyyy.MM.dd HH:mm", { locale: hu })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openDocument(doc)}
                  disabled={loadingDocId === doc.id}
                >
                  {loadingDocId === doc.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4" />
                  )}
                </Button>
                {!isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(doc)}
                    disabled={deleteMutation.isPending}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
