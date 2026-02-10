import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUpsertPage, Page } from "@/hooks/usePages";
import { toast } from "@/hooks/use-toast";

interface PageEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page?: Page | null;
}

export function PageEditorDialog({ open, onOpenChange, page }: PageEditorDialogProps) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const upsert = useUpsertPage();

  useEffect(() => {
    if (page) {
      setTitle(page.title);
      setSlug(page.slug);
      setContent(page.content);
      setIsPublished(page.is_published);
    } else {
      setTitle("");
      setSlug("");
      setContent("");
      setIsPublished(true);
    }
  }, [page, open]);

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) {
      toast({ title: "Hiba", description: "A cím és a slug kötelező!", variant: "destructive" });
      return;
    }
    try {
      await upsert.mutateAsync({ id: page?.id, title, slug, content, is_published: isPublished });
      toast({ title: "Sikeres mentés!" });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Hiba", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{page ? "Oldal szerkesztése" : "Új oldal"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cím</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Oldal címe" />
            </div>
            <div className="space-y-2">
              <Label>Slug (URL)</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="oldal-slug" disabled={!!page} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tartalom (HTML)</Label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={16} className="font-mono text-sm" placeholder="<section><h2>Cím</h2><p>Szöveg...</p></section>" />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            <Label>Publikálva</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Mégse</Button>
          <Button onClick={handleSave} disabled={upsert.isPending}>
            {upsert.isPending ? "Mentés..." : "Mentés"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
