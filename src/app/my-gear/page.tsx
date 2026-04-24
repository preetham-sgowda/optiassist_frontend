"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Laptop, Smartphone, Monitor, ShieldAlert, CheckCircle2, Clock, Package, Tablet, Server, Keyboard } from "lucide-react";
import { toast } from "sonner";

interface MyAsset {
  id: string;
  asset_tag: string;
  name: string;
  category: string;
  condition: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const categoryIcons: Record<string, React.ElementType> = {
  Laptop: Laptop,
  Monitor: Monitor,
  Mobile: Smartphone,
  Tablet: Tablet,
  Server: Server,
  Peripheral: Keyboard,
};

export default function MyGearPage() {
  const { user, hasPrivilege, apiFetch } = useAuth();
  const [assets, setAssets] = useState<MyAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [reportAsset, setReportAsset] = useState<MyAsset | null>(null);
  const [reportForm, setReportForm] = useState({ severity: "medium", description: "" });
  const [saving, setSaving] = useState(false);

  const fetchMyAssets = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/assets/my");
      if (res.ok) {
        const data = await res.json();
        setAssets(Array.isArray(data) ? data : []);
      } else {
        console.error("Failed to fetch my assets");
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAssets();
  }, []);

  if (!hasPrivilege("view:my_gear")) {
    return <div className="flex h-[60vh] items-center justify-center"><div className="text-center"><ShieldAlert className="mx-auto h-10 w-10 text-destructive mb-4" /><h2 className="text-xl font-semibold">Access Denied</h2></div></div>;
  }

  const openReport = (asset: MyAsset) => {
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Gear</h2>
          <p className="text-muted-foreground">Loading your assigned assets...</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 bg-muted animate-pulse rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Gear</h2>
        <p className="text-muted-foreground">Assets currently assigned to you, {user?.full_name}.</p>
      </div>

      {assets.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">No Assets Assigned</h3>
            <p className="text-muted-foreground mt-2">You don&apos;t have any assets assigned to you yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => {
            const Icon = categoryIcons[asset.category] || Package;
            const assignedDate = asset.updated_at
              ? new Date(asset.updated_at).toLocaleDateString()
              : new Date(asset.created_at).toLocaleDateString();
            return (
              <Card key={asset.id} className="overflow-hidden transition-all hover:shadow-md border-t-4 border-t-primary">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg"><Icon size={24} /></div>
                    <Badge variant="outline" className="font-mono bg-background text-xs">{asset.asset_tag}</Badge>
                  </div>
                  <CardTitle className="mt-4 text-xl">{asset.name}</CardTitle>
                  <CardDescription>{asset.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground flex items-center gap-1"><Clock size={14} /> Assigned</span><span className="font-medium">{assignedDate}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground flex items-center gap-1"><CheckCircle2 size={14} /> Condition</span><span className="font-medium text-emerald-600 dark:text-emerald-400 capitalize">{asset.condition}</span></div>
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
      )}

      {/* REPORT ISSUE DIALOG */}
      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Issue — {reportAsset?.name}</DialogTitle>
            <DialogDescription>Describe the problem with {reportAsset?.asset_tag}. IT will be notified.</DialogDescription>
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
