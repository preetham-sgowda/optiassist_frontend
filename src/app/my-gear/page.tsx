"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Laptop, Smartphone, Monitor, ShieldAlert, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

const initialAssets = [
  { id: 1, tag: "MAC-092", name: "MacBook Pro 14 M2", category: "Laptop", condition: "Excellent", assigned_date: "2025-01-15", icon: Laptop },
  { id: 2, tag: "MON-104", name: "Dell UltraSharp 27 4K", category: "Monitor", condition: "Good", assigned_date: "2025-01-15", icon: Monitor },
  { id: 3, tag: "PHO-042", name: "iPhone 14 Pro", category: "Mobile", condition: "Good", assigned_date: "2025-06-20", icon: Smartphone },
];

export default function MyGearPage() {
  const { user, hasPrivilege } = useAuth();
  const [assets] = useState(initialAssets);
  const [showReport, setShowReport] = useState(false);
  const [reportAsset, setReportAsset] = useState<typeof initialAssets[0] | null>(null);
  const [reportForm, setReportForm] = useState({ severity: "medium", description: "" });
  const [saving, setSaving] = useState(false);

  if (!hasPrivilege("view:my_gear")) {
    return <div className="flex h-[60vh] items-center justify-center"><div className="text-center"><ShieldAlert className="mx-auto h-10 w-10 text-destructive mb-4" /><h2 className="text-xl font-semibold">Access Denied</h2></div></div>;
  }

  const openReport = (asset: typeof initialAssets[0]) => {
    setReportAsset(asset);
    setReportForm({ severity: "medium", description: "" });
    setShowReport(true);
  };

  const submitReport = () => {
    setSaving(true);
    setTimeout(() => {
      toast.success("Issue reported", { description: `Ticket created for ${reportAsset?.name}. IT will follow up shortly.` });
      setShowReport(false);
      setSaving(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Gear</h2>
        <p className="text-muted-foreground">Assets currently assigned to you, {user?.full_name}.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => {
          const Icon = asset.icon;
          return (
            <Card key={asset.id} className="overflow-hidden transition-all hover:shadow-md border-t-4 border-t-primary">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg"><Icon size={24} /></div>
                  <Badge variant="outline" className="font-mono bg-background text-xs">{asset.tag}</Badge>
                </div>
                <CardTitle className="mt-4 text-xl">{asset.name}</CardTitle>
                <CardDescription>{asset.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground flex items-center gap-1"><Clock size={14} /> Assigned</span><span className="font-medium">{asset.assigned_date}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground flex items-center gap-1"><CheckCircle2 size={14} /> Condition</span><span className="font-medium text-emerald-600 dark:text-emerald-400">{asset.condition}</span></div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 pt-4">
                <Button variant="outline" className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/20" onClick={() => openReport(asset)}>
                  <ShieldAlert className="mr-2 h-4 w-4" /> Report Issue
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* REPORT ISSUE DIALOG */}
      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Issue — {reportAsset?.name}</DialogTitle>
            <DialogDescription>Describe the problem with {reportAsset?.tag}. IT will be notified.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select value={reportForm.severity} onValueChange={(v) => setReportForm({ ...reportForm, severity: v || "" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low — Cosmetic / Minor</SelectItem>
                  <SelectItem value="medium">Medium — Partially Functional</SelectItem>
                  <SelectItem value="high">High — Not Usable</SelectItem>
                  <SelectItem value="critical">Critical — Data Loss Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={reportForm.description} onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })} placeholder="Describe the issue in detail..." rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReport(false)}>Cancel</Button>
            <Button variant="destructive" onClick={submitReport} disabled={saving || !reportForm.description}>
              {saving ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
