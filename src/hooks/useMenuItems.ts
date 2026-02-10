import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MenuItem {
  id: string;
  label: string;
  slug: string;
  position: string;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
}

export function useMenuItems(position?: string) {
  return useQuery({
    queryKey: ["menu_items", position],
    queryFn: async () => {
      let query = supabase.from("menu_items" as any).select("*").order("sort_order");
      if (position) query = query.eq("position", position);
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as MenuItem[];
    },
  });
}

export function useUpsertMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: Partial<MenuItem> & { label: string; slug: string }) => {
      if (item.id) {
        const { data, error } = await supabase
          .from("menu_items" as any)
          .update({ label: item.label, slug: item.slug, position: item.position, sort_order: item.sort_order, is_visible: item.is_visible } as any)
          .eq("id", item.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("menu_items" as any)
          .insert({ label: item.label, slug: item.slug, position: item.position ?? "footer", sort_order: item.sort_order ?? 0, is_visible: item.is_visible ?? true } as any)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["menu_items"] }),
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("menu_items" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["menu_items"] }),
  });
}
