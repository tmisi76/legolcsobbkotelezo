import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  FileText,
  Upload,
  Trash2,
  ExternalLink,
  Loader2,
  CreditCard,
  MapPin,
  Car,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { hu } from "date-fns/locale";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

type DocumentType = "personal_id" | "address_card" | "drivers_license";

interface PersonalDocument {
  id: string;
  user_id: string;
  document_type: DocumentType;
  file_path: string;
  file_name: string;
  gdpr_consent_at: string;
  uploaded_at: string;
}

const DOCUMENT_CONFIG: Record<DocumentType, { label: string; icon: typeof CreditCard; description: string }> = {
  personal_id: {
    label: "Személyi igazolvány",
    icon: CreditCard,
    description: "Személyi igazolvány mindkét oldala",
  },
  address_card: {
    label: "Lakcímkártya",
    icon: MapPin,
    description: "Lakcímet igazoló okmány",
  },
  drivers_license: {
    label: "Jogosítvány",
    icon: Car,
    description: "Vezetői engedély mindkét oldala",
  },
};

export default function DashboardDocuments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploadingType, setUploadingType] = useState<DocumentType | null>(null);
  const [loadingDocId, setLoadingDocId] = useState<string | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<PersonalDocument | null>(null);
  const [gdprConsent, setGdprConsent] = useState(false);
  const [pendingUpload, setPendingUpload] = useState<{
    type: DocumentType;
    file: File;
  } | null>(null);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["personal_documents", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("personal_documents")
        .select("*")
        .eq("user_id", user!.id);

      if (error) throw error;
      return data as PersonalDocument[];
    },
    enabled: !!user?.id,
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ type, file }: { type: DocumentType; file: File }) => {
      if (!user) throw new Error("No user");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${type}_${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("personal-documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Check if document already exists (for replacement)
      const existing = documents.find((d) => d.document_type === type);
      
      if (existing) {
        // Delete old file from storage
        await supabase.storage
          .from("personal-documents")
          .remove([existing.file_path]);

        // Update database record
        const { error: dbError } = await supabase
          .from("personal_documents")
          .update({
            file_path: fileName,
            file_name: file.name,
            uploaded_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (dbError) throw dbError;
      } else {
        // Insert new record
        const { error: dbError } = await supabase
          .from("personal_documents")
          .insert({
            user_id: user.id,
            document_type: type,
            file_path: fileName,
            file_name: file.name,
          });

        if (dbError) throw dbError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personal_documents", user?.id] });
      toast.success("Dokumentum feltöltve!");
      setPendingUpload(null);
      setGdprConsent(false);
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast.error("Hiba történt a feltöltés során");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (doc: PersonalDocument) => {
      // Delete from storage
      await supabase.storage
        .from("personal-documents")
        .remove([doc.file_path]);

      // Delete from database
      const { error } = await supabase
        .from("personal_documents")
        .delete()
        .eq("id", doc.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personal_documents", user?.id] });
      toast.success("Dokumentum törölve");
      setDeleteDoc(null);
    },
    onError: () => {
      toast.error("Hiba történt a törlés során");
    },
  });

  const handleFileSelect = (type: DocumentType, file: File) => {
    // Validate file
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      toast.error("Csak JPG, PNG, WebP vagy PDF fájl tölthető fel");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("A fájl mérete maximum 10MB lehet");
      return;
    }

    setPendingUpload({ type, file });
    setGdprConsent(false);
  };

  const handleConfirmUpload = () => {
    if (!pendingUpload || !gdprConsent) return;
    setUploadingType(pendingUpload.type);
    uploadMutation.mutate(pendingUpload, {
      onSettled: () => setUploadingType(null),
    });
  };

  const openDocument = async (doc: PersonalDocument) => {
    setLoadingDocId(doc.id);
    try {
      const { data, error } = await supabase.storage
        .from("personal-documents")
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

  const getDocumentForType = (type: DocumentType) =>
    documents.find((d) => d.document_type === type);

  if (isLoading) {
    return (
      <DashboardLayout title="Dokumentumaim">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dokumentumaim">
      <div className="space-y-6">
        {/* Info banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Személyes dokumentumaid biztonságban vannak
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              A feltöltött dokumentumokat kizárólag a biztosítási ügyintézés céljából kezeljük. 
              A hozzájárulásodat bármikor visszavonhatod a dokumentum törlésével.
            </p>
          </div>
        </div>

        {/* Document cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.entries(DOCUMENT_CONFIG) as [DocumentType, typeof DOCUMENT_CONFIG.personal_id][]).map(
            ([type, config]) => {
              const doc = getDocumentForType(type);
              const Icon = config.icon;

              return (
                <Card key={type}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{config.label}</CardTitle>
                        <CardDescription className="text-xs">
                          {config.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {doc ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                          <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm truncate flex-1">{doc.file_name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Feltöltve:{" "}
                          {format(new Date(doc.uploaded_at), "yyyy.MM.dd", { locale: hu })}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDocument(doc)}
                            disabled={loadingDocId === doc.id}
                            className="flex-1"
                          >
                            {loadingDocId === doc.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <ExternalLink className="w-4 h-4" />
                            )}
                            Megtekintés
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteDoc(doc)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <label className="block">
                          <input
                            type="file"
                            accept={ACCEPTED_FILE_TYPES.join(",")}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileSelect(type, file);
                            }}
                          />
                          <span className="text-xs text-primary cursor-pointer hover:underline">
                            Csere másik fájlra
                          </span>
                        </label>
                      </div>
                    ) : (
                      <label className="block">
                        <div
                          className={cn(
                            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                            "hover:border-primary hover:bg-primary/5",
                            uploadingType === type && "opacity-50 pointer-events-none"
                          )}
                        >
                          <input
                            type="file"
                            accept={ACCEPTED_FILE_TYPES.join(",")}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileSelect(type, file);
                            }}
                            disabled={uploadingType === type}
                          />
                          {uploadingType === type ? (
                            <Loader2 className="w-6 h-6 mx-auto animate-spin text-muted-foreground" />
                          ) : (
                            <Upload className="w-6 h-6 mx-auto text-muted-foreground" />
                          )}
                          <p className="text-sm text-muted-foreground mt-2">
                            Kattints a feltöltéshez
                          </p>
                        </div>
                      </label>
                    )}
                  </CardContent>
                </Card>
              );
            }
          )}
        </div>
      </div>

      {/* GDPR Consent Dialog */}
      <AlertDialog open={!!pendingUpload} onOpenChange={() => setPendingUpload(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-primary" />
              Adatkezelési hozzájárulás
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  A dokumentum feltöltéséhez kérjük, olvasd el és fogadd el az alábbi nyilatkozatot:
                </p>
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Checkbox
                    id="gdpr-consent"
                    checked={gdprConsent}
                    onCheckedChange={(checked) => setGdprConsent(checked === true)}
                  />
                  <Label htmlFor="gdpr-consent" className="text-sm leading-relaxed cursor-pointer">
                    Hozzájárulok, hogy a H-Kontakt Group Kft. a feltöltött személyes dokumentumaimat 
                    a biztosítási ügyintézés céljából kezelje. A hozzájárulást bármikor 
                    visszavonhatom a dokumentum törlésével.
                  </Label>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mégse</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmUpload}
              disabled={!gdprConsent || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Feltöltés
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDoc} onOpenChange={() => setDeleteDoc(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dokumentum törlése</AlertDialogTitle>
            <AlertDialogDescription>
              Biztosan törölni szeretnéd a "{deleteDoc?.file_name}" dokumentumot? 
              Ez a művelet nem visszavonható.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mégse</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDoc && deleteMutation.mutate(deleteDoc)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Törlés
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
