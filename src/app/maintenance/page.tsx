"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, ShieldAlert, DollarSign, CheckCircle2, Clock, AlertTriangle, Edit } from "lucide-react";
import { toast } from "sonner";

interface MaintLog {
  id: string; asset_tag: string; asset_name: string; type: string;
  vendor: string; cost: number; status: string; start_date: string;
  end_date: string | null; description: string;
}

const initialLogs: MaintLog[] = [
  { id: "MNT-001", asset_tag: "DES-015", asset_name: 'LG 34" Curved Monitor', type: "Repair", vendor: "LG Service Center", cost: 220, status: "in_progress", start_date: "2026-04-18", end_date: null, description: "Dead pixels on left panel edge" },
  { id: "MNT-002", asset_tag: "LAP-033", asset_name: "ThinkPad X1 Carbon", type: "Repair", vendor: "Lenovo Authorized", cost: 450, status: "completed", start_date: "2026-04-10", end_date: "2026-04-16", description: "Battery replacement + keyboard reseat" },
  { id: "MNT-003", asset_tag: "MAC-001", asset_name: "MacBook Pro 16 M3", type: "Upgrade", vendor: "Apple Store", cost: 200, status: "completed", start_date: "2026-04-05", end_date: "2026-04-06", description: "RAM upgrade from 32GB to 64GB" },
  { id: "MNT-004", asset_tag: "PHO-112", asset_name: "iPhone 15 Pro Max", type: "Repair", vendor: "Apple Store", cost: 329, status: "scheduled", start_date: "2026-04-25", end_date: null, description: "Cracked screen replacement" },
  { id: "MNT-005", asset_tag: "MON-042", asset_name: "Dell UltraSharp 27", type: "Cleaning", vendor: "In-House IT", cost: 0, status: "completed", start_date: "2026-04-01", end_date: "2026-04-01", description: "Quarterly deep clean" },
];

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  scheduled: { label: "Scheduled", variant: "outline" },
  in_progress: { label: "In Progress", variant: "secondary" },
  completed: { label: "Completed", variant: "default" },
};

const emptyLog = { asset_tag: "", asset_name: "", type: "Repair", vendor: "", cost: 0, status: "scheduled", start_date: new Date().toISOString().split("T")[0], end_date: null as string | null, description: "" };

export default function MaintenancePage() {
  const { hasPrivilege } = useAuth();
  const [logs, setLogs] = useState<MaintLog[]>(initialLogs);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [current, setCurrent] = useState<MaintLog | null>(null);
  const [form, setForm] = useState(emptyLog);
  const [saving, setSaving] = useState(false);

  if (!hasPrivilege("manage:maintenance")) {
    return <div className="flex h-[60vh] items-center justify-center"><div className="text-center"><ShieldAlert className="mx-auto h-10 w-10 text-destructive mb-4" /><h2 className="text-xl font-semibold">Access Denied</h2></div></div>;
  }

  const totalCost = logs.reduce((sum, l) => sum + l.cost, 0);
  const filtered = logs.filter((l) => !search || l.asset_name.toLowerCase().includes(search.toLowerCase()) || l.asset_tag.toLowerCase().includes(search.toLowerCase()) || l.id.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = () => { setForm({ ...emptyLog, start_date: new Date().toISOString().split("T")[0] }); setShowAdd(true); };
  const handleEdit = (l: MaintLog) => { setCurrent(l); setForm({ ...l }); setShowEdit(true); };

  const submitAdd = () => {
    setSaving(true);
    const newLog: MaintLog = { ...form, id: `MNT-${String(logs.length + 1).padStart(3, "0")}` };
    setLogs((prev) => [newLog, ...prev]);
    toast.success("Maintenance logged", { description: `${form.type} for ${form.asset_tag} created.` });
    setShowAdd(false); setSaving(false);
  };

  const submitEdit = () => {
    if (!current) return;
    setSaving(true);
    setLogs((prev) => prev.map((l) => (l.id === current.id ? { ...l, ...form } : l)));
    toast.success("Log updated", { description: `${current.id} saved.` });
    setShowEdit(false); setSaving(false);
  };

  const markComplete = (l: MaintLog) => {
    setLogs((prev) => prev.map((x) => x.id === l.id ? { ...x, status: "completed", end_date: new Date().toISOString().split("T")[0] } : x));
    toast.success("Marked complete", { description: `${l.id} closed.` });
  };

  const formFields = (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Asset Tag</Label><Input value={form.asset_tag} onChange={(e) => setForm({ ...form, asset_tag: e.target.value })} placeholder="DES-015" /></div>
        <div className="space-y-2"><Label>Asset Name</Label><Input value={form.asset_name} onChange={(e) => setForm({ ...form, asset_name: e.target.value })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Type</Label>
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Repair", "Upgrade", "Cleaning", "Inspection"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
        </div>
        <div className="space-y-2"><Label>Vendor</Label><Input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Estimated Cost ($)</Label><Input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} /></div>
        <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
      </div>
      <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue or work..." /></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-2xl font-bold tracking-tight">Maintenance Center</h2><p className="text-muted-foreground">Track repairs, upgrades, and servicing.</p></div>
        <Button onClick={handleAdd}><Plus className="mr-2 h-4 w-4" /> Log New Maintenance</Button>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground uppercase">Total Tickets</p><p className="text-2xl font-bold mt-1">{logs.length}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground uppercase">In Progress</p><p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">{logs.filter((l) => l.status === "in_progress").length}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground uppercase">Scheduled</p><p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{logs.filter((l) => l.status === "scheduled").length}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground uppercase">Total Cost</p><p className="text-2xl font-bold mt-1 flex items-center justify-center gap-1"><DollarSign size={18} />{totalCost.toLocaleString()}</p></CardContent></Card>
      </div>

      <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search by ticket ID, asset tag, or name..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} /></div>

      <Card><CardContent className="p-0"><Table>
        <TableHeader><TableRow><TableHead>Ticket</TableHead><TableHead>Asset</TableHead><TableHead className="hidden md:table-cell">Type</TableHead><TableHead className="hidden md:table-cell">Cost</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>{filtered.map((log) => {
          const s = statusMap[log.status] || { label: log.status, variant: "outline" as const };
          return (
            <TableRow key={log.id} className="hover:bg-muted/50">
              <TableCell className="font-mono text-xs font-semibold">{log.id}</TableCell>
              <TableCell><div><p className="font-medium">{log.asset_name}</p><p className="text-xs text-muted-foreground">{log.asset_tag}</p></div></TableCell>
              <TableCell className="hidden md:table-cell"><Badge variant="secondary">{log.type}</Badge></TableCell>
              <TableCell className="hidden md:table-cell font-medium">{log.cost > 0 ? `$${log.cost}` : "Free"}</TableCell>
              <TableCell><Badge variant={s.variant}>{s.label}</Badge></TableCell>
              <TableCell className="text-right space-x-1">
                {log.status !== "completed" && <Button variant="ghost" size="sm" onClick={() => markComplete(log)} className="text-emerald-600"><CheckCircle2 className="h-4 w-4" /></Button>}
                <Button variant="ghost" size="sm" onClick={() => handleEdit(log)}><Edit className="h-4 w-4" /></Button>
              </TableCell>
            </TableRow>
          );
        })}</TableBody>
      </Table></CardContent></Card>

      {/* ADD */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Log New Maintenance</DialogTitle><DialogDescription>Create a new repair or service ticket.</DialogDescription></DialogHeader>{formFields}<DialogFooter><Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button><Button onClick={submitAdd} disabled={saving || !form.asset_tag || !form.description}>{saving ? "Saving..." : "Create Ticket"}</Button></DialogFooter></DialogContent></Dialog>

      {/* EDIT */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Edit Ticket {current?.id}</DialogTitle><DialogDescription>Update maintenance details.</DialogDescription></DialogHeader>{formFields}<DialogFooter><Button variant="outline" onClick={() => setShowEdit(false)}>Cancel</Button><Button onClick={submitEdit} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
