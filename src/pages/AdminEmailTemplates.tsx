import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useEmailTemplates, useUpdateEmailTemplate } from "@/hooks/useEmailTemplates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Eye, Code, Info, Edit3 } from "lucide-react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const TEMPLATE_LABELS: Record<string, string> = {
  "reminder_60_days": "60 napos emlékeztető",
  "reminder_50_days": "50 napos emlékeztető",
  "reminder_40_days": "40 napos emlékeztető (sürgős)",
};

const PLACEHOLDERS = [
  { key: "{{nev}}", desc: "Felhasználó neve" },
  { key: "{{rendszam}}", desc: "Rendszám" },
  { key: "{{auto_becenev}}", desc: "Autó beceneve" },
  { key: "{{marka}}", desc: "Márka" },
  { key: "{{modell}}", desc: "Modell" },
  { key: "{{evjarat}}", desc: "Évjárat" },
  { key: "{{evfordulo}}", desc: "Évforduló dátuma" },
  { key: "{{hatra_nap}}", desc: "Hátralévő napok" },
  { key: "{{eves_dij}}", desc: "Jelenlegi éves díj" },
  { key: "{{megtakaritas}}", desc: "Becsült megtakarítás" },
  { key: "{{dashboard_url}}", desc: "Belépés link" },
  { key: "{{beallitasok_url}}", desc: "Beállítások link" },
  { key: "{{visszahivas_url}}", desc: "Visszahívás link" },
  { key: "{{ajanlat_url}}", desc: "Ajánlatkérés link" },
  { key: "{{tracking_pixel_url}}", desc: "Tracking pixel" },
];

export default function AdminEmailTemplates() {
  const { data: templates, isLoading } = useEmailTemplates();
  const updateTemplate = useUpdateEmailTemplate();
  const [editSubjects, setEditSubjects] = useState<Record<string, string>>({});
  const [editBodies, setEditBodies] = useState<Record<string, string>>({});
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [placeholdersOpen, setPlaceholdersOpen] = useState(false);

  const handleSave = async (id: string, templateKey: string) => {
    const subject = editSubjects[id];
    const body_html = editBodies[id];

    if (!subject && !body_html) {
      toast.info("Nincs változás.");
      return;
    }

    const template = templates?.find(t => t.id === id);
    if (!template) return;

    try {
      await updateTemplate.mutateAsync({
        id,
        subject: subject ?? template.subject,
        body_html: body_html ?? template.body_html,
      });
      toast.success(`✅ ${TEMPLATE_LABELS[templateKey] || templateKey} mentve!`);
      // Clear edit state
      setEditSubjects(prev => { const n = { ...prev }; delete n[id]; return n; });
      setEditBodies(prev => { const n = { ...prev }; delete n[id]; return n; });
    } catch {
      toast.error("Hiba történt a mentés során.");
    }
  };

  const getPreviewHtml = (id: string) => {
    const template = templates?.find(t => t.id === id);
    if (!template) return "";
    const html = editBodies[id] ?? template.body_html;
    // Replace placeholders with sample data
    return html
      .split("{{nev}}").join("Kovács János")
      .split("{{rendszam}}").join("ABC-123")
      .split("{{auto_becenev}}").join("Családi autó")
      .split("{{marka}}").join("Toyota")
      .split("{{modell}}").join("Corolla")
      .split("{{evjarat}}").join("2020")
      .split("{{evfordulo}}").join("2025. április 15.")
      .split("{{hatra_nap}}").join("60")
      .split("{{eves_dij}}").join("85 000")
      .split("{{megtakaritas}}").join("15 300")
      .split("{{dashboard_url}}").join("#")
      .split("{{beallitasok_url}}").join("#")
      .split("{{visszahivas_url}}").join("#")
      .split("{{ajanlat_url}}").join("#")
      .split("{{tracking_pixel_url}}").join("");
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Email sablonok">
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Email sablonok">
      <div className="max-w-4xl space-y-6">
        {/* Placeholder reference */}
        <Collapsible open={placeholdersOpen} onOpenChange={setPlaceholdersOpen}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="flex flex-row items-center gap-2 cursor-pointer">
                <Info className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <CardTitle className="text-base">Elérhető placeholder-ek</CardTitle>
                  <CardDescription>Kattints a megnyitáshoz</CardDescription>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PLACEHOLDERS.map(p => (
                    <div key={p.key} className="flex items-center gap-2 text-sm">
                      <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono">{p.key}</code>
                      <span className="text-muted-foreground">{p.desc}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Template editors */}
        {templates?.map(template => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle>{TEMPLATE_LABELS[template.template_key] || template.template_key}</CardTitle>
              {template.description && (
                <CardDescription>{template.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email tárgy</label>
                <Input
                  value={editSubjects[template.id] ?? template.subject}
                  onChange={e => setEditSubjects(prev => ({ ...prev, [template.id]: e.target.value }))}
                />
              </div>

              <Tabs defaultValue="editor">
                <TabsList>
                  <TabsTrigger value="editor" className="gap-1.5">
                    <Edit3 className="w-4 h-4" />
                    Szerkesztő
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="gap-1.5">
                    <Eye className="w-4 h-4" />
                    Előnézet
                  </TabsTrigger>
                  <TabsTrigger value="code" className="gap-1.5">
                    <Code className="w-4 h-4" />
                    HTML
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="editor">
                  <RichTextEditor
                    content={editBodies[template.id] ?? template.body_html}
                    onChange={(html) => setEditBodies(prev => ({ ...prev, [template.id]: html }))}
                  />
                </TabsContent>
                <TabsContent value="preview">
                  <div className="border rounded-lg overflow-hidden bg-muted/30">
                    <iframe
                      srcDoc={getPreviewHtml(template.id)}
                      className="w-full h-[500px] bg-white"
                      title="Email előnézet"
                      sandbox=""
                    />
                  </div>
                </TabsContent>
                <TabsContent value="code">
                  <Textarea
                    value={editBodies[template.id] ?? template.body_html}
                    onChange={e => setEditBodies(prev => ({ ...prev, [template.id]: e.target.value }))}
                    className="font-mono text-xs min-h-[300px]"
                  />
                </TabsContent>
              </Tabs>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleSave(template.id, template.template_key)}
                  disabled={updateTemplate.isPending}
                >
                  {updateTemplate.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Mentés
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPreviewTemplate(template.id)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Teljes előnézet
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full preview dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Email előnézet</DialogTitle>
          </DialogHeader>
          <iframe
            srcDoc={previewTemplate ? getPreviewHtml(previewTemplate) : ""}
            className="w-full h-[70vh] bg-white rounded border"
            title="Email teljes előnézet"
            sandbox=""
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
