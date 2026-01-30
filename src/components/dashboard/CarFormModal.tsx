import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { hu } from "date-fns/locale";
import { CalendarIcon, Loader2, ArrowLeft, Upload, FileText, X, Image as ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Car } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const currentYear = new Date().getFullYear();

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const carFormSchema = z.object({
  brand: z
    .string()
    .trim()
    .min(1, "Add meg a márkát")
    .max(50, "Maximum 50 karakter"),
  model: z
    .string()
    .trim()
    .min(1, "Add meg a típust")
    .max(50, "Maximum 50 karakter"),
  year: z
    .number({ invalid_type_error: "Add meg az évjáratot" })
    .min(1970, "Minimum 1970")
    .max(currentYear + 1, `Maximum ${currentYear + 1}`),
  engine_power_kw: z
    .number()
    .min(1, "Minimum 1 kW")
    .max(1000, "Maximum 1000 kW")
    .nullable()
    .optional(),
  current_annual_fee: z
    .number()
    .min(1, "Minimum 1 Ft")
    .max(1000000, "Maximum 1 000 000 Ft")
    .nullable()
    .optional(),
  anniversary_date: z.date({
    required_error: "Add meg az évforduló dátumát",
  }),
  license_plate: z
    .string()
    .trim()
    .max(10, "Maximum 10 karakter")
    .nullable()
    .optional(),
  notes: z
    .string()
    .trim()
    .max(500, "Maximum 500 karakter")
    .nullable()
    .optional(),
  // Step 2 fields
  payment_method: z.enum(["bank_transfer", "card", "check"], {
    required_error: "Válaszd ki a fizetési módot",
  }),
  has_child_under_18: z.enum(["yes", "no"], {
    required_error: "Válaszolj a kérdésre",
  }),
  accepts_email_only: z.enum(["yes", "no"], {
    required_error: "Válaszolj a kérdésre",
  }),
  payment_frequency: z.enum(["quarterly", "semi_annual", "annual"], {
    required_error: "Válaszd ki a fizetési gyakoriságot",
  }),
});

type CarFormValues = z.infer<typeof carFormSchema>;

interface UploadedFile {
  id: string;
  name: string;
  path: string;
}

interface CarFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  car?: Car | null;
  onCarCreated?: () => void;
  onCarUpdated?: () => void;
  isLoading?: boolean;
}

export function CarFormModal({
  open,
  onOpenChange,
  car,
  onCarCreated,
  onCarUpdated,
  isLoading: externalLoading,
}: CarFormModalProps) {
  const { user } = useAuth();
  const isEditing = !!car;
  const [step, setStep] = useState(1);
  const [savedCarId, setSavedCarId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLoading = externalLoading || isSaving;

  const form = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      brand: "",
      model: "",
      year: currentYear,
      engine_power_kw: null,
      current_annual_fee: null,
      anniversary_date: new Date(),
      license_plate: null,
      notes: null,
      payment_method: undefined,
      has_child_under_18: undefined,
      accepts_email_only: undefined,
      payment_frequency: undefined,
    },
  });

  useEffect(() => {
    if (car) {
      form.reset({
        brand: car.brand,
        model: car.model,
        year: car.year,
        engine_power_kw: car.engine_power_kw,
        current_annual_fee: car.current_annual_fee,
        anniversary_date: new Date(car.anniversary_date),
        license_plate: car.license_plate,
        notes: car.notes,
        payment_method: (car.payment_method as "bank_transfer" | "card" | "check") || "bank_transfer",
        has_child_under_18: car.has_child_under_18 ? "yes" : "no",
        accepts_email_only: car.accepts_email_only ? "yes" : "no",
        payment_frequency: (car.payment_frequency as "quarterly" | "semi_annual" | "annual") || "annual",
      });
      setSavedCarId(car.id);
    } else {
      form.reset({
        brand: "",
        model: "",
        year: currentYear,
        engine_power_kw: null,
        current_annual_fee: null,
        anniversary_date: new Date(),
        license_plate: null,
        notes: null,
        payment_method: undefined,
        has_child_under_18: undefined,
        accepts_email_only: undefined,
        payment_frequency: undefined,
      });
      setSavedCarId(null);
    }
    setStep(1);
    setUploadedFiles([]);
  }, [car, form, open]);

  const saveCarData = async (): Promise<string | null> => {
    if (!user) return null;
    
    const data = form.getValues();
    const formattedData = {
      nickname: `${data.brand} ${data.model}`,
      brand: data.brand,
      model: data.model,
      year: data.year,
      engine_power_kw: data.engine_power_kw ?? null,
      current_annual_fee: data.current_annual_fee ?? null,
      anniversary_date: format(data.anniversary_date, "yyyy-MM-dd"),
      license_plate: data.license_plate ?? null,
      notes: data.notes ?? null,
      payment_method: data.payment_method ?? null,
      has_child_under_18: data.has_child_under_18 === "yes",
      accepts_email_only: data.accepts_email_only === "yes",
      payment_frequency: data.payment_frequency ?? null,
    };

    setIsSaving(true);
    try {
      if (isEditing && car) {
        const { error } = await supabase
          .from('cars')
          .update(formattedData)
          .eq('id', car.id);
        
        if (error) throw error;
        return car.id;
      } else {
        const { data: newCar, error } = await supabase
          .from('cars')
          .insert({ ...formattedData, user_id: user.id })
          .select()
          .single();
        
        if (error) throw error;
        return newCar.id;
      }
    } catch (error) {
      console.error('Error saving car:', error);
      toast.error("Hiba történt a mentés során");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      const step1Fields = ["brand", "model", "year", "anniversary_date"] as const;
      const isValid = await form.trigger(step1Fields);
      if (isValid) {
        setStep(2);
      }
    } else if (step === 2) {
      const step2Fields = ["payment_method", "has_child_under_18", "accepts_email_only", "payment_frequency"] as const;
      const isValid = await form.trigger(step2Fields);
      if (isValid) {
        // Save car data at the end of step 2
        const carId = await saveCarData();
        if (carId) {
          setSavedCarId(carId);
          setStep(3);
          if (!isEditing) {
            toast.success("✅ Autó adatok mentve!");
          }
        }
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      return "Csak JPG, PNG, WebP vagy PDF fájl tölthető fel";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "A fájl mérete maximum 10MB lehet";
    }
    return null;
  };

  const handleFilesSelect = async (files: FileList) => {
    if (!savedCarId || !user) {
      toast.error("Hiba: az autó nincs mentve");
      return;
    }
    
    setIsFileUploading(true);
    
    for (const file of Array.from(files)) {
      const error = validateFile(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
        continue;
      }
      
      try {
        // Upload to storage
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${savedCarId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('insurance-documents')
          .upload(filePath, file);
        
        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error(`${file.name}: Feltöltési hiba`);
          continue;
        }
        
        // Save to car_documents table
        const { data: docData, error: dbError } = await supabase
          .from('car_documents')
          .insert({
            car_id: savedCarId,
            file_path: filePath,
            file_name: file.name,
            file_type: file.type,
          })
          .select()
          .single();
        
        if (dbError) {
          console.error('DB error:', dbError);
          toast.error(`${file.name}: Adatbázis hiba`);
          // Try to clean up the uploaded file
          await supabase.storage.from('insurance-documents').remove([filePath]);
          continue;
        }
        
        setUploadedFiles(prev => [...prev, { id: docData.id, name: file.name, path: filePath }]);
        toast.success(`${file.name} feltöltve`);
      } catch (err) {
        console.error('File upload error:', err);
        toast.error(`${file.name}: Ismeretlen hiba`);
      }
    }
    
    setIsFileUploading(false);
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFilesSelect(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFilesSelect(files);
    }
  };

  const handleRemoveUploadedFile = async (file: UploadedFile) => {
    try {
      // Delete from storage
      await supabase.storage.from('insurance-documents').remove([file.path]);
      
      // Delete from database
      await supabase.from('car_documents').delete().eq('id', file.id);
      
      setUploadedFiles(prev => prev.filter(f => f.id !== file.id));
      toast.success("Dokumentum törölve");
    } catch (error) {
      console.error('Error removing file:', error);
      toast.error("Hiba történt a törlés során");
    }
  };

  const handleFinish = () => {
    if (isEditing) {
      toast.success("✅ Módosítások mentve!");
      onCarUpdated?.();
    } else {
      toast.success("✅ Autó sikeresen hozzáadva!");
      onCarCreated?.();
    }
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setStep(1);
      setUploadedFiles([]);
      setSavedCarId(null);
    }
    onOpenChange(newOpen);
  };

  // For editing mode - save directly from step 1
  const handleEditSubmit = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      const carId = await saveCarData();
      if (carId) {
        toast.success("✅ Módosítások mentve!");
        onCarUpdated?.();
        onOpenChange(false);
      }
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === "application/pdf") {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    return <ImageIcon className="w-5 h-5 text-blue-500" />;
  };

  const getStepTitle = () => {
    if (isEditing) return "Autó szerkesztése";
    switch (step) {
      case 1:
        return "Új autó hozzáadása";
      case 2:
        return "Biztosítási preferenciák";
      case 3:
        return "Dokumentum feltöltése";
      default:
        return "Új autó hozzáadása";
    }
  };

  const getStepDescription = () => {
    if (isEditing) return "Módosítsd az autó adatait";
    switch (step) {
      case 1:
        return "Add meg az autód adatait, hogy emlékeztethessünk a biztosítás lejártáról";
      case 2:
        return "Segíts nekünk megtalálni a legjobb ajánlatot";
      case 3:
        return "Töltsd fel a jelenlegi biztosítód díjértesítő levelét vagy a kötvény fotóját!";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getStepTitle()}</DialogTitle>
          <DialogDescription>{getStepDescription()}</DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        {!isEditing && (
          <div className="flex items-center gap-2 mb-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
              step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              1
            </div>
            <div className={cn("flex-1 h-1 rounded transition-colors", step >= 2 ? "bg-primary" : "bg-muted")} />
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
              step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              2
            </div>
            <div className={cn("flex-1 h-1 rounded transition-colors", step >= 3 ? "bg-primary" : "bg-muted")} />
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
              step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              3
            </div>
          </div>
        )}

        <Form {...form}>
          <form className="space-y-4">
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Márka *</FormLabel>
                        <FormControl>
                          <Input placeholder="pl. Opel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Típus *</FormLabel>
                        <FormControl>
                          <Input placeholder="pl. Astra" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => {
                      const yearOptions = Array.from({ length: 71 }, (_, i) => currentYear - i);
                      return (
                        <FormItem>
                          <FormLabel>Évjárat *</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Válaszd ki az évjáratot" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {yearOptions.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="engine_power_kw"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motor teljesítmény (kW)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="pl. 74"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? parseInt(e.target.value) : null
                              )
                            }
                          />
                        </FormControl>
                        <FormDescription>Megtalálod a forgalmiban</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="anniversary_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Évforduló dátuma *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "yyyy. MMMM d.", { locale: hu })
                              ) : (
                                <span>Válaszd ki a dátumot</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>A biztosítás lejáratának napja</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="current_annual_fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jelenlegi éves díj (Ft)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="pl. 72000"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseInt(e.target.value) : null
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>A megtakarítás becsléséhez</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="license_plate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rendszám</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="pl. ABC-123"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Megjegyzés</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Egyéb megjegyzések..."
                          className="resize-none"
                          rows={3}
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {step === 2 && (
              <>
                <FormField
                  control={form.control}
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Hogyan fizetnél az új biztosításért? *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="bank_transfer" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              Banki átutalással
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="card" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              Bankkártyával
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="check" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              Csekken
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="has_child_under_18"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Van 18 év alatti gyermeked? *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="yes" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Igen</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="no" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Nem</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accepts_email_only"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Elfogadod, hogy a biztosító emailben értesítsen (ne küldjön postai levelet)? *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="yes" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Igen, elfogadom</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="no" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Nem, postai levelet kérek</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payment_frequency"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Milyen gyakoriságú fizetést szeretnél? *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="quarterly" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Negyedéves</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="semi_annual" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Féléves</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="annual" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Éves</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {step === 3 && (
              <div className="space-y-4">
                {/* File upload area */}
                <div
                  onClick={() => !isFileUploading && fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
                    isFileUploading && "opacity-50 cursor-wait"
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={handleFileInputChange}
                    className="hidden"
                    multiple
                    disabled={isFileUploading}
                  />
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-center">
                      {isFileUploading ? (
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                      ) : (
                        <Upload className="w-10 h-10 text-muted-foreground" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">
                        {isFileUploading ? "Feltöltés folyamatban..." : "Húzd ide a fájlokat vagy kattints"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        JPG, PNG, WebP vagy PDF - max 10MB/fájl
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Több fájl is kiválasztható egyszerre
                      </p>
                    </div>
                  </div>
                </div>

                {/* Uploaded files list */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Feltöltött dokumentumok ({uploadedFiles.length})
                    </p>
                    {uploadedFiles.map((file) => (
                      <div 
                        key={file.id} 
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {getFileIcon(file.path.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg')}
                          <span className="text-sm truncate">{file.name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={() => handleRemoveUploadedFile(file)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tip */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Tipp:</strong> A díjértesítőt megtalálod a postaládádban vagy az emailjeid között. 
                    A kötvényt is elfogadjuk, ha az tartalmazza a jelenlegi díjat.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              {step === 1 ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleOpenChange(false)}
                    disabled={isLoading}
                  >
                    Mégse
                  </Button>
                  {isEditing ? (
                    <Button type="button" className="flex-1" disabled={isLoading} onClick={handleEditSubmit}>
                      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Mentés
                    </Button>
                  ) : (
                    <Button type="button" className="flex-1" onClick={handleNext}>
                      Tovább
                    </Button>
                  )}
                </>
              ) : step === 2 ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleBack}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Vissza
                  </Button>
                  <Button 
                    type="button" 
                    className="flex-1" 
                    onClick={handleNext}
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Tovább
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={isFileUploading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Vissza
                  </Button>
                  <Button 
                    type="button" 
                    className="flex-1" 
                    onClick={handleFinish}
                    disabled={isFileUploading}
                  >
                    {isFileUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Tovább
                  </Button>
                </>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Keep the old export interface for backward compatibility
export interface CarFormSubmitData {
  brand: string;
  model: string;
  year: number;
  engine_power_kw?: number | null;
  current_annual_fee?: number | null;
  anniversary_date: Date;
  license_plate?: string | null;
  notes?: string | null;
  payment_method?: string;
  has_child_under_18?: string;
  accepts_email_only?: string;
  payment_frequency?: string;
  documentFile?: File | null;
}
