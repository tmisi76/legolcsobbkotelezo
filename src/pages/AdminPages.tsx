import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { usePages, useDeletePage, Page } from "@/hooks/usePages";
import { PageEditorDialog } from "@/components/admin/PageEditorDialog";
import { MenuItemsManager } from "@/components/admin/MenuItemsManager";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";

const AdminPages = () => {
  const { data: pages, isLoading } = usePages();
  const deletePage = useDeletePage();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);

  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setEditorOpen(true);
  };

  const handleNew = () => {
    setEditingPage(null);
    setEditorOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePage.mutateAsync(id);
      toast({ title: "Oldal törölve!" });
    } catch (err: any) {
      toast({ title: "Hiba", description: err.message, variant: "destructive" });
    }
  };

  return (
    <DashboardLayout title="Tartalomkezelés">
      <div className="space-y-8">
        {/* Pages Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Oldalak</h2>
            <Button onClick={handleNew}>
              <Plus className="w-4 h-4 mr-1" /> Új oldal
            </Button>
          </div>

          {isLoading ? (
            <p className="text-muted-foreground">Betöltés...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cím</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Státusz</TableHead>
                  <TableHead>Utolsó módosítás</TableHead>
                  <TableHead className="w-28">Műveletek</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages?.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">/{page.slug}</TableCell>
                    <TableCell>
                      <Badge variant={page.is_published ? "default" : "secondary"}>
                        {page.is_published ? "Publikált" : "Vázlat"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(page.updated_at).toLocaleDateString("hu-HU")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(page)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Oldal törlése</AlertDialogTitle>
                              <AlertDialogDescription>
                                Biztosan törlöd a "{page.title}" oldalt? Ez a művelet nem visszavonható.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Mégse</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(page.id)}>Törlés</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <Separator />

        {/* Menu Items Section */}
        <MenuItemsManager />
      </div>

      <PageEditorDialog open={editorOpen} onOpenChange={setEditorOpen} page={editingPage} />
    </DashboardLayout>
  );
};

export default AdminPages;
