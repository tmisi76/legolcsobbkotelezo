import { useState } from "react";
import { useMenuItems, useUpsertMenuItem, useDeleteMenuItem, MenuItem } from "@/hooks/useMenuItems";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export function MenuItemsManager() {
  const { data: items, isLoading } = useMenuItems();
  const upsert = useUpsertMenuItem();
  const deleteMutation = useDeleteMenuItem();
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);

  const handleAdd = () => {
    setEditingItem({ label: "", slug: "", position: "footer", sort_order: (items?.length ?? 0) + 1, is_visible: true });
  };

  const handleSave = async (item: Partial<MenuItem>) => {
    if (!item.label?.trim() || !item.slug?.trim()) {
      toast({ title: "Hiba", description: "A felirat és a slug kötelező!", variant: "destructive" });
      return;
    }
    try {
      await upsert.mutateAsync(item as MenuItem);
      toast({ title: "Mentve!" });
      setEditingItem(null);
    } catch (err: any) {
      toast({ title: "Hiba", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Törölve!" });
    } catch (err: any) {
      toast({ title: "Hiba", description: err.message, variant: "destructive" });
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Betöltés...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Menüpontok (Footer)</h3>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-1" /> Új menüpont
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Felirat</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Sorrend</TableHead>
            <TableHead>Látható</TableHead>
            <TableHead className="w-24">Műveletek</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items?.map((item) => (
            <MenuItemRow key={item.id} item={item} onSave={handleSave} onDelete={handleDelete} />
          ))}
          {editingItem && !editingItem.id && (
            <TableRow>
              <TableCell>
                <Input value={editingItem.label} onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })} placeholder="Felirat" />
              </TableCell>
              <TableCell>
                <Input value={editingItem.slug} onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })} placeholder="slug" />
              </TableCell>
              <TableCell>
                <Input type="number" value={editingItem.sort_order} onChange={(e) => setEditingItem({ ...editingItem, sort_order: Number(e.target.value) })} className="w-20" />
              </TableCell>
              <TableCell>
                <Switch checked={editingItem.is_visible} onCheckedChange={(v) => setEditingItem({ ...editingItem, is_visible: v })} />
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => handleSave(editingItem)}><Save className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setEditingItem(null)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function MenuItemRow({ item, onSave, onDelete }: { item: MenuItem; onSave: (i: Partial<MenuItem>) => void; onDelete: (id: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(item);

  if (!editing) {
    return (
      <TableRow className="cursor-pointer" onDoubleClick={() => setEditing(true)}>
        <TableCell>{item.label}</TableCell>
        <TableCell className="text-muted-foreground font-mono text-sm">/{item.slug}</TableCell>
        <TableCell>{item.sort_order}</TableCell>
        <TableCell>{item.is_visible ? "✓" : "✗"}</TableCell>
        <TableCell>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" onClick={() => { setLocal(item); setEditing(true); }}><Save className="w-4 h-4" /></Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="icon" variant="ghost"><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Menüpont törlése</AlertDialogTitle>
                  <AlertDialogDescription>Biztosan törlöd a "{item.label}" menüpontot?</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Mégse</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(item.id)}>Törlés</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell><Input value={local.label} onChange={(e) => setLocal({ ...local, label: e.target.value })} /></TableCell>
      <TableCell><Input value={local.slug} onChange={(e) => setLocal({ ...local, slug: e.target.value })} /></TableCell>
      <TableCell><Input type="number" value={local.sort_order} onChange={(e) => setLocal({ ...local, sort_order: Number(e.target.value) })} className="w-20" /></TableCell>
      <TableCell><Switch checked={local.is_visible} onCheckedChange={(v) => setLocal({ ...local, is_visible: v })} /></TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" onClick={() => { onSave(local); setEditing(false); }}><Save className="w-4 h-4" /></Button>
          <Button size="icon" variant="ghost" onClick={() => setEditing(false)}><Trash2 className="w-4 h-4" /></Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
