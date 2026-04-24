"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft, ShieldAlert, Package, User, CalendarDays } from "lucide-react";
import { toast } from "sonner";

interface AssignedAsset {
  id: string;
  asset_tag: string;
  name: string;
  status: string;
  updated_at: string;
  profiles?: { full_name: string } | null;
}

export default function AssignmentsPage() {
  const { hasPrivilege, apiFetch } = useAuth();
  const [realAssets, setRealAssets] = useState<any[]>([]);
  const [realUsers, setRealUsers] = useState<any[]>([]);
  const [assignedAssets, setAssignedAssets] = useState<AssignedAsset[]>([]);
  const [showAssign, setShowAssign] = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [saving, setSaving] = useState(false);

  const [assignForm, setAssignForm] = useState({ asset: "", employee: "", notes: "" });
  const [returnForm, setReturnForm] = useState({ asset: "", notes: "" });

  const fetchData = async () => {
    try {
      // Fetch available (in_stock) assets for assignment
      const assetRes = await apiFetch("/assets?status=in_stock");
      if (assetRes.ok) {
        const json = await assetRes.json();
        setRealAssets(json.data || []);
      }

      // Fetch users (profiles) for the employee dropdown
      const userRes = await apiFetch("/auth/users");
      if (userRes.ok) {
        const json = await userRes.json();
        setRealUsers(json || []);
      }

      // Fetch currently assigned assets for the history table
      const assignedRes = await apiFetch("/assets?status=assigned");
      if (assignedRes.ok) {
        const json = await assignedRes.json();
        setAssignedAssets(json.data || []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!hasPrivilege("manage:assignments")) {
    return <div className="flex h-[60vh] items-center justify-center"><div className="text-center"><ShieldAlert className="mx-auto h-10 w-10 text-destructive mb-4" /><h2 className="text-xl font-semibold">Access Denied</h2></div></div>;
  }

  const submitAssign = async () => {
    setSaving(true);
    try {
      const asset = realAssets.find((a) => a.asset_tag === assignForm.asset);
      const user = realUsers.find((u) => u.id === assignForm.employee);

      if (!asset || !user) {
        toast.error("Please select both an asset and an employee.");
        setSaving(false);
        return;
      }

      const res = await apiFetch(`/assets/${asset.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "assigned",
          assigned_to: user.id
        })
      });

      if (res.ok) {
        toast.success("Asset assigned", { description: `${asset.name} assigned to ${user.full_name}.` });
        setAssignForm({ asset: "", employee: "", notes: "" });
        fetchData();
        setShowAssign(false);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error("Failed to assign asset", { description: err.detail || err.error || res.statusText });
      }
    } catch (error) {
      toast.error("Failed to assign asset");
    } finally {
      setSaving(false);
    }
  };

  const submitReturn = async () => {
    setSaving(true);
    try {
      const asset = assignedAssets.find((a) => a.asset_tag === returnForm.asset);

      if (!asset) {
        toast.error("Please select an asset to return.");
        setSaving(false);
        return;
      }

      const res = await apiFetch(`/assets/${asset.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "in_stock",
          assigned_to: null
        })
      });

      if (res.ok) {
        toast.success("Asset returned", { description: `${asset.name} returned to inventory.` });
        setReturnForm({ asset: "", notes: "" });
        fetchData();
        setShowReturn(false);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error("Failed to return asset", { description: err.detail || err.error || res.statusText });
      }
    } catch (error) {
      toast.error("Failed to return asset");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold tracking-tight">Assignment &amp; Return Center</h2><p className="text-muted-foreground">Deploy and receive company hardware assets.</p></div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-t-4 border-t-emerald-500 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between"><div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg"><ArrowRight size={28} /></div><Badge variant="secondary" className="text-emerald-600 bg-emerald-500/10">Deploy</Badge></div>
            <CardTitle className="text-xl mt-4">Assign Asset</CardTitle>
            <CardDescription>Deploy a hardware asset to an employee.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4"><div className="flex items-center gap-1"><Package size={14} /> Select Asset</div><span>→</span><div className="flex items-center gap-1"><User size={14} /> Select Employee</div><span>→</span><div className="flex items-center gap-1"><CalendarDays size={14} /> Confirm</div></div>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setShowAssign(true)}><ArrowRight className="mr-2 h-4 w-4" /> Start Assignment</Button>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-amber-500 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between"><div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg"><ArrowLeft size={28} /></div><Badge variant="secondary" className="text-amber-600 bg-amber-500/10">Receive</Badge></div>
            <CardTitle className="text-xl mt-4">Return Asset</CardTitle>
            <CardDescription>Receive a hardware asset back into inventory.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4"><div className="flex items-center gap-1"><User size={14} /> Find Employee</div><span>→</span><div className="flex items-center gap-1"><Package size={14} /> Select Asset</div><span>→</span><div className="flex items-center gap-1"><CalendarDays size={14} /> Confirm</div></div>
            <Button variant="outline" className="w-full border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10" onClick={() => setShowReturn(true)}><ArrowLeft className="mr-2 h-4 w-4" /> Start Return</Button>
          </CardContent>
        </Card>
      </div>

      <Card><CardHeader><CardTitle>Currently Assigned Assets</CardTitle><CardDescription>All assets currently deployed to employees.</CardDescription></CardHeader>
        <CardContent className="p-0"><Table>
          <TableHeader><TableRow><TableHead>Asset</TableHead><TableHead>Name</TableHead><TableHead>Assigned To</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
          <TableBody>
            {assignedAssets.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No assets currently assigned.</TableCell></TableRow>
            ) : assignedAssets.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs font-semibold">{item.asset_tag}</TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.profiles?.full_name || "Unknown"}</TableCell>
                <TableCell className="text-muted-foreground">{new Date(item.updated_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table></CardContent>
      </Card>

      {/* ASSIGN DIALOG */}
      <Dialog open={showAssign} onOpenChange={setShowAssign}><DialogContent><DialogHeader><DialogTitle>Assign Asset to Employee</DialogTitle><DialogDescription>Select an available asset and the target employee.</DialogDescription></DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2"><Label>Asset</Label>
            <Select value={assignForm.asset} onValueChange={(v) => setAssignForm({ ...assignForm, asset: v || "" })}>
              <SelectTrigger><SelectValue placeholder="Select an asset..." /></SelectTrigger>
              <SelectContent>{realAssets.map((a) => <SelectItem key={a.asset_tag} value={a.asset_tag}>{a.asset_tag} — {a.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Employee</Label>
            <Select value={assignForm.employee} onValueChange={(v) => setAssignForm({ ...assignForm, employee: v || "" })}>
              <SelectTrigger><SelectValue placeholder="Select an employee..." /></SelectTrigger>
              <SelectContent>{realUsers.map((u) => <SelectItem key={u.id} value={u.id}>{u.full_name} ({u.email})</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Notes</Label><Textarea value={assignForm.notes} onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })} placeholder="Reason for assignment..." /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => setShowAssign(false)}>Cancel</Button><Button onClick={submitAssign} disabled={saving || !assignForm.asset || !assignForm.employee} className="bg-emerald-600 hover:bg-emerald-700">{saving ? "Assigning..." : "Confirm Assignment"}</Button></DialogFooter>
      </DialogContent></Dialog>

      {/* RETURN DIALOG */}
      <Dialog open={showReturn} onOpenChange={setShowReturn}><DialogContent><DialogHeader><DialogTitle>Return Asset to Inventory</DialogTitle><DialogDescription>Select the asset being returned.</DialogDescription></DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2"><Label>Asset</Label>
            <Select value={returnForm.asset} onValueChange={(v) => setReturnForm({ ...returnForm, asset: v || "" })}>
              <SelectTrigger><SelectValue placeholder="Select an asset..." /></SelectTrigger>
              <SelectContent>{assignedAssets.map((a) => <SelectItem key={a.asset_tag} value={a.asset_tag}>{a.asset_tag} — {a.name} (held by {a.profiles?.full_name || "Unknown"})</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Notes</Label><Textarea value={returnForm.notes} onChange={(e) => setReturnForm({ ...returnForm, notes: e.target.value })} placeholder="Reason for return..." /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => setShowReturn(false)}>Cancel</Button><Button onClick={submitReturn} disabled={saving || !returnForm.asset} variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50">{saving ? "Processing..." : "Confirm Return"}</Button></DialogFooter>
      </DialogContent></Dialog>
    </div>
  );
}
