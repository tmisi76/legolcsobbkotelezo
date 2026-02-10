import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export function usePages() {
  return useQuery({
    queryKey: ["pages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages" as any)
        .select("*")
        .order("title");
      if (error) throw error;
      return data as unknown as Page[];
    },
  });
}

export function usePageBySlug(slug: string) {
  return useQuery({
    queryKey: ["pages", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages" as any)
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as Page | null;
    },
    enabled: !!slug,
  });
}

export function useUpsertPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (page: Partial<Page> & { slug: string; title: string }) => {
      if (page.id) {
        const { data, error } = await supabase
          .from("pages" as any)
          .update({ title: page.title, content: page.content, is_published: page.is_published } as any)
          .eq("id", page.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("pages" as any)
          .insert({ slug: page.slug, title: page.title, content: page.content ?? "", is_published: page.is_published ?? true } as any)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pages"] }),
  });
}

export function useDeletePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pages" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pages"] }),
  });
}
