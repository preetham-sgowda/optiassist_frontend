"use client";

import { useState } from "react";
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

const availableAssets = [
  { tag: "MAC-002", name: "MacBook Air M2" },
  { tag: "KEY-088", name: "Logitech MX Keys S" },
  { tag: "DOC-005", name: "CalDigit TS4 Dock" },
];

const employees = [
  { code: "EMP-001", name: "Aalishan N" },
  { code: "EMP-002", name: "Ben Sullivan" },
  { code: "EMP-003", name: "Sarah Johnson" },
  { code: "EMP-004", name: "Mike Thompson" },
  { code: "EMP-005", name: "Emma Liu" },
];

const assignedAssets = [
  { tag: "MAC-001", name: "MacBook Pro 16 M3 Max", holder: "Aalishan N" },
  { tag: "MON-042", name: "Dell UltraSharp U2723QE", holder: "Ben S" },
  { tag: "PHO-112", name: "iPhone 15 Pro Max", holder: "Sarah J" },
  { tag: "TAB-009", name: "iPad Pro 12.9 M2", holder: "Mike T" },
];

interface HistoryItem { id: number; asset: string; employee: string; type: string; date: string; notes: string; }

const initialHistory: HistoryItem[] = [
  { id: 1, asset: "MAC-001 — MacBook Pro 16", employee: "Aalishan N", type: "assign", date: "2026-04-22", notes: "New hire onboarding" },
  { id: 2, asset: "MON-042 — Dell UltraSharp 27", employee: "Ben S", type: "assign", date: "2026-04-21", notes: "Workstation setup" },
  { id: 3, asset: "LAP-033 — ThinkPad X1 Carbon", employee: "David K", type: "return", date: "2026-04-20", notes: "Employee offboarding" },
  { id: 4, asset: "PHO-112 — iPhone 15 Pro", employee: "Sarah J", type: "assign", date: "2026-04-20", notes: "Device upgrade" },
  { id: 5, asset: "TAB-009 — iPad Pro 12.9", employee: "Mike T", type: "assign", date: "2026-04-18", notes: "Design team equipment" },
];

export default function AssignmentsPage() {
  const { hasPrivilege } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>(initialHistory);
  const [showAssign, setShowAssign] = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [saving, setSaving] = useState(false);

  const [assignForm, setAssignForm] = useState({ asset: "", employee: "", notes: "" });
  const [returnForm, setReturnForm] = useState({ asset: "", notes: "" });

  if (!hasPrivilege("manage:assignments")) {
    return <div className="flex h-[60vh] items-center justify-center"><div className="text-center"><ShieldAlert className="mx-auto h-10 w-10 text-destructive mb-4" /><h2 className="text-xl font-semibold">Access Denied</h2></div></div>;
  }

  const submitAssign = () => {
    setSaving(true);
    const asset = availableAssets.find((a) => a.tag === assignForm.asset);
    const emp = employees.find((e) => e.code === assignForm.employee);
    const entry: HistoryItem = {
      id: Date.now(), asset: `${asset?.tag} — ${asset?.name}`,
      employee: emp?.name || "", type: "assign",
      date: new Date().toISOString().split("T")[0], notes: assignForm.notes,
    };
    setHistory((prev) => [entry, ...prev]);
    toast.success("Asset assigned", { description: `${asset?.name} assigned to ${emp?.name}.` });
    setAssignForm({ asset: "", employee: "", notes: "" });
    setShowAssign(false); setSaving(false);
  };

  const submitReturn = () => {
    setSaving(true);
    const asset = assignedAssets.find((a) => a.tag === returnForm.asset);
    const entry: HistoryItem = {
      id: Date.now(), asset: `${asset?.tag} — ${asset?.name}`,
      employee: asset?.holder || "", type: "return",
      date: new Date().toISOString().split("T")[0], notes: returnForm.notes,
    };
    setHistory((prev) => [entry, ...prev]);
    toast.success("Asset returned", { description: `${asset?.name} returned to inventory.` });
    setReturnForm({ asset: "", notes: "" });
    setShowReturn(false); setSaving(false);
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

      <Card><CardHeader><CardTitle>Recent Assignment History</CardTitle><CardDescription>Latest asset movements.</CardDescription></CardHeader>
        <CardContent className="p-0"><Table>
          <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Asset</TableHead><TableHead>Employee</TableHead><TableHead className="hidden md:table-cell">Notes</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
          <TableBody>{history.map((item) => (
            <TableRow key={item.id}>
              <TableCell><Badge variant={item.type === "assign" ? "default" : "outline"} className={item.type === "assign" ? "bg-emerald-600" : ""}>{item.type === "assign" ? "→ Assigned" : "← Returned"}</Badge></TableCell>
              <TableCell className="font-medium">{item.asset}</TableCell>
              <TableCell>{item.employee}</TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">{item.notes}</TableCell>
              <TableCell className="text-muted-foreground">{item.date}</TableCell>
            </TableRow>
          ))}</TableBody>
        </Table></CardContent>
      </Card>

      {/* ASSIGN DIALOG */}
      <Dialog open={showAssign} onOpenChange={setShowAssign}><DialogContent><DialogHeader><DialogTitle>Assign Asset to Employee</DialogTitle><DialogDescription>Select an available asset and the target employee.</DialogDescription></DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2"><Label>Asset</Label>
            <Select value={assignForm.asset} onValueChange={(v) => setAssignForm({ ...assignForm, asset: v })}>
              <SelectTrigger><SelectValue placeholder="Select an asset..." /></SelectTrigger>
              <SelectContent>{availableAssets.map((a) => <SelectItem key={a.tag} value={a.tag}>{a.tag} — {a.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Employee</Label>
            <Select value={assignForm.employee} onValueChange={(v) => setAssignForm({ ...assignForm, employee: v })}>
              <SelectTrigger><SelectValue placeholder="Select an employee..." /></SelectTrigger>
              <SelectContent>{employees.map((e) => <SelectItem key={e.code} value={e.code}>{e.code} — {e.name}</SelectItem>)}</SelectContent>
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
            <Select value={returnForm.asset} onValueChange={(v) => setReturnForm({ ...returnForm, asset: v })}>
              <SelectTrigger><SelectValue placeholder="Select an asset..." /></SelectTrigger>
              <SelectContent>{assignedAssets.map((a) => <SelectItem key={a.tag} value={a.tag}>{a.tag} — {a.name} (held by {a.holder})</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Notes</Label><Textarea value={returnForm.notes} onChange={(e) => setReturnForm({ ...returnForm, notes: e.target.value })} placeholder="Reason for return..." /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => setShowReturn(false)}>Cancel</Button><Button onClick={submitReturn} disabled={saving || !returnForm.asset} className="border-amber-500 text-amber-600 hover:bg-amber-50">{saving ? "Processing..." : "Confirm Return"}</Button></DialogFooter>
      </DialogContent></Dialog>
    </div>
  );
}
