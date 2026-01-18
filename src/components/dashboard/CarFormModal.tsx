import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { hu } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { Car } from "@/types/database";

const currentYear = new Date().getFullYear();

const carFormSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(1, "Add meg az autó becenevét")
    .max(50, "Maximum 50 karakter"),
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
});

type CarFormValues = z.infer<typeof carFormSchema>;

interface CarFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  car?: Car | null;
  onSubmit: (data: CarFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function CarFormModal({
  open,
  onOpenChange,
  car,
  onSubmit,
  isLoading,
}: CarFormModalProps) {
  const isEditing = !!car;

  const form = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      nickname: "",
      brand: "",
      model: "",
      year: currentYear,
      engine_power_kw: null,
      current_annual_fee: null,
      anniversary_date: new Date(),
      license_plate: null,
      notes: null,
    },
  });

  useEffect(() => {
    if (car) {
      form.reset({
        nickname: car.nickname,
        brand: car.brand,
        model: car.model,
        year: car.year,
        engine_power_kw: car.engine_power_kw,
        current_annual_fee: car.current_annual_fee,
        anniversary_date: new Date(car.anniversary_date),
        license_plate: car.license_plate,
        notes: car.notes,
      });
    } else {
      form.reset({
        nickname: "",
        brand: "",
        model: "",
        year: currentYear,
        engine_power_kw: null,
        current_annual_fee: null,
        anniversary_date: new Date(),
        license_plate: null,
        notes: null,
      });
    }
  }, [car, form]);

  const handleSubmit = async (data: CarFormValues) => {
    await onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Autó szerkesztése" : "Új autó hozzáadása"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Módosítsd az autó adatait"
              : "Add meg az autód adatait, hogy emlékeztethessünk a biztosítás lejártáról"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Becenév *</FormLabel>
                  <FormControl>
                    <Input placeholder="pl. Családi autó, Munkás autó" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Évjárat *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1970}
                        max={currentYear + 1}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
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

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Mégse
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEditing ? "Mentés" : "Hozzáadás"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
