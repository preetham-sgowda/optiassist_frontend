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
import { Building2, MapPin, Truck, Tag, Plus, Edit, ShieldAlert, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Tab = "departments" | "locations" | "vendors" | "categories";

// ---- DATA ----
const initDepts = [
  { id: 1, name: "Information Technology", code: "IT-100", manager: "Aalishan N", headcount: 12 },
  { id: 2, name: "Engineering", code: "ENG-200", manager: "Ben S", headcount: 45 },
  { id: 3, name: "Product", code: "PRD-300", manager: "Sarah J", headcount: 8 },
  { id: 4, name: "Human Resources", code: "HR-500", manager: "Priya P", headcount: 5 },
];
const initLocs = [
  { id: 1, name: "HQ - Main Office", city: "San Francisco", country: "USA", active: true },
  { id: 2, name: "Remote - NYC Hub", city: "New York", country: "USA", active: true },
  { id: 3, name: "Remote - London", city: "London", country: "UK", active: true },
];
const initVendors = [
  { id: 1, name: "Apple Inc.", contact: "John D", email: "enterprise@apple.com", expiry: "2027-12-31" },
  { id: 2, name: "Dell Technologies", contact: "Amy R", email: "corp@dell.com", expiry: "2026-06-30" },
  { id: 3, name: "Lenovo", contact: "Wei L", email: "business@lenovo.com", expiry: "2026-09-15" },
];
const initCats = [
  { id: 1, name: "Laptop", depreciation: 4, count: 320 },
  { id: 2, name: "Monitor", depreciation: 5, count: 280 },
  { id: 3, name: "Mobile", depreciation: 3, count: 150 },
  { id: 4, name: "Peripheral", depreciation: 3, count: 420 },
];

const tabs: { key: Tab; label: string; icon: any }[] = [
  { key: "departments", label: "Departments", icon: Building2 },
  { key: "locations", label: "Locations", icon: MapPin },
  { key: "vendors", label: "Vendors", icon: Truck },
  { key: "categories", label: "Categories", icon: Tag },
];

export default function SettingsPage() {
  const { hasPrivilege } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("departments");

  // State for each tab
  const [depts, setDepts] = useState(initDepts);
  const [locs, setLocs] = useState(initLocs);
  const [vendors, setVendors] = useState(initVendors);
  const [cats, setCats] = useState(initCats);

  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  if (!hasPrivilege("manage:settings")) {
    return <div className="flex h-[60vh] items-center justify-center"><div className="text-center"><ShieldAlert className="mx-auto h-10 w-10 text-destructive mb-4" /><h2 className="text-xl font-semibold">Access Denied</h2></div></div>;
  }

  // --- Generic handlers ---
  const openAdd = () => { setEditingId(null); setForm(getEmpty()); setShowDialog(true); };
  const openEdit = (id: number, data: any) => { setEditingId(id); setForm({ ...data }); setShowDialog(true); };
  const openDelete = (id: number, name: string) => { setDeleteTarget({ id, name }); setShowDelete(true); };

  const getEmpty = (): Record<string, any> => {
    switch (activeTab) {
      case "departments": return { name: "", code: "", manager: "", headcount: 0 };
      case "locations": return { name: "", city: "", country: "", active: true };
      case "vendors": return { name: "", contact: "", email: "", expiry: "" };
      case "categories": return { name: "", depreciation: 3, count: 0 };
    }
  };

  const submitForm = () => {
    const isEdit = editingId !== null;
    switch (activeTab) {
      case "departments":
        if (isEdit) setDepts((p) => p.map((d) => d.id === editingId ? { ...d, ...form } : d));
        else setDepts((p) => [...p, { ...form, id: Date.now() } as any]);
        break;
      case "locations":
        if (isEdit) setLocs((p) => p.map((l) => l.id === editingId ? { ...l, ...form } : l));
        else setLocs((p) => [...p, { ...form, id: Date.now(), active: true } as any]);
        break;
      case "vendors":
        if (isEdit) setVendors((p) => p.map((v) => v.id === editingId ? { ...v, ...form } : v));
        else setVendors((p) => [...p, { ...form, id: Date.now() } as any]);
        break;
      case "categories":
        if (isEdit) setCats((p) => p.map((c) => c.id === editingId ? { ...c, ...form } : c));
        else setCats((p) => [...p, { ...form, id: Date.now(), count: 0 } as any]);
        break;
    }
    toast.success(isEdit ? "Updated successfully" : "Created successfully", { description: `${form.name} ${isEdit ? "saved" : "added"}.` });
    setShowDialog(false);
  };

  const submitDelete = () => {
    if (!deleteTarget) return;
    switch (activeTab) {
      case "departments": setDepts((p) => p.filter((d) => d.id !== deleteTarget.id)); break;
      case "locations": setLocs((p) => p.filter((l) => l.id !== deleteTarget.id)); break;
      case "vendors": setVendors((p) => p.filter((v) => v.id !== deleteTarget.id)); break;
      case "categories": setCats((p) => p.filter((c) => c.id !== deleteTarget.id)); break;
    }
    toast.success("Deleted", { description: `${deleteTarget.name} removed.` });
    setShowDelete(false);
  };

  // --- Form fields per tab ---
  const renderFormFields = () => {
    switch (activeTab) {
      case "departments": return (<div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Name</Label><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div><div className="space-y-2"><Label>Code</Label><Input value={form.code || ""} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div></div>
        <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Manager</Label><Input value={form.manager || ""} onChange={(e) => setForm({ ...form, manager: e.target.value })} /></div><div className="space-y-2"><Label>Headcount</Label><Input type="number" value={form.headcount || 0} onChange={(e) => setForm({ ...form, headcount: Number(e.target.value) })} /></div></div>
      </div>);
      case "locations": return (<div className="grid gap-4 py-4">
        <div className="space-y-2"><Label>Site Name</Label><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>City</Label><Input value={form.city || ""} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div><div className="space-y-2"><Label>Country</Label><Input value={form.country || ""} onChange={(e) => setForm({ ...form, country: e.target.value })} /></div></div>
      </div>);
      case "vendors": return (<div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Vendor Name</Label><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div><div className="space-y-2"><Label>Contact Person</Label><Input value={form.contact || ""} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></div></div>
        <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div><div className="space-y-2"><Label>Contract Expiry</Label><Input type="date" value={form.expiry || ""} onChange={(e) => setForm({ ...form, expiry: e.target.value })} /></div></div>
      </div>);
      case "categories": return (<div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Category Name</Label><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div><div className="space-y-2"><Label>Depreciation (Years)</Label><Input type="number" value={form.depreciation || 3} onChange={(e) => setForm({ ...form, depreciation: Number(e.target.value) })} /></div></div>
      </div>);
    }
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold tracking-tight">System Settings</h2><p className="text-muted-foreground">Configure organizational structure, vendors, and categories.</p></div>

      <div className="flex gap-2 overflow-x-auto border-b pb-px">
        {tabs.map((tab) => { const Icon = tab.icon; const isActive = activeTab === tab.key; return (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${isActive ? "bg-background border border-b-background -mb-px text-primary" : "text-muted-foreground hover:text-foreground"}`}><Icon size={16} /> {tab.label}</button>
        ); })}
      </div>

      {/* DEPARTMENTS */}
      {activeTab === "departments" && <Card><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Departments</CardTitle><CardDescription>Manage organizational departments.</CardDescription></div><Button size="sm" onClick={openAdd}><Plus className="mr-1 h-4 w-4" /> Add</Button></CardHeader><CardContent className="p-0"><Table>
        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Code</TableHead><TableHead>Manager</TableHead><TableHead>Headcount</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>{depts.map((d) => <TableRow key={d.id}><TableCell className="font-medium">{d.name}</TableCell><TableCell className="font-mono text-xs">{d.code}</TableCell><TableCell>{d.manager}</TableCell><TableCell>{d.headcount}</TableCell><TableCell className="text-right space-x-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(d.id, d)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => openDelete(d.id, d.name)}><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>)}</TableBody>
      </Table></CardContent></Card>}

      {/* LOCATIONS */}
      {activeTab === "locations" && <Card><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Locations</CardTitle><CardDescription>Manage office sites and remote hubs.</CardDescription></div><Button size="sm" onClick={openAdd}><Plus className="mr-1 h-4 w-4" /> Add</Button></CardHeader><CardContent className="p-0"><Table>
        <TableHeader><TableRow><TableHead>Site Name</TableHead><TableHead>City</TableHead><TableHead>Country</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>{locs.map((l) => <TableRow key={l.id}><TableCell className="font-medium">{l.name}</TableCell><TableCell>{l.city}</TableCell><TableCell>{l.country}</TableCell><TableCell><Badge variant={l.active ? "default" : "destructive"}>{l.active ? "Active" : "Inactive"}</Badge></TableCell><TableCell className="text-right space-x-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(l.id, l)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => openDelete(l.id, l.name)}><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>)}</TableBody>
      </Table></CardContent></Card>}

      {/* VENDORS */}
      {activeTab === "vendors" && <Card><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Vendors</CardTitle><CardDescription>Manage hardware suppliers and contracts.</CardDescription></div><Button size="sm" onClick={openAdd}><Plus className="mr-1 h-4 w-4" /> Add</Button></CardHeader><CardContent className="p-0"><Table>
        <TableHeader><TableRow><TableHead>Vendor</TableHead><TableHead>Contact</TableHead><TableHead className="hidden md:table-cell">Email</TableHead><TableHead>Contract Expiry</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>{vendors.map((v) => <TableRow key={v.id}><TableCell className="font-medium">{v.name}</TableCell><TableCell>{v.contact}</TableCell><TableCell className="hidden md:table-cell text-muted-foreground">{v.email}</TableCell><TableCell>{v.expiry}</TableCell><TableCell className="text-right space-x-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(v.id, v)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => openDelete(v.id, v.name)}><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>)}</TableBody>
      </Table></CardContent></Card>}

      {/* CATEGORIES */}
      {activeTab === "categories" && <Card><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Asset Categories</CardTitle><CardDescription>Define asset types and depreciation policies.</CardDescription></div><Button size="sm" onClick={openAdd}><Plus className="mr-1 h-4 w-4" /> Add</Button></CardHeader><CardContent className="p-0"><Table>
        <TableHeader><TableRow><TableHead>Category</TableHead><TableHead>Depreciation</TableHead><TableHead>Asset Count</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>{cats.map((c) => <TableRow key={c.id}><TableCell className="font-medium">{c.name}</TableCell><TableCell>{c.depreciation} years</TableCell><TableCell><Badge variant="secondary">{c.count}</Badge></TableCell><TableCell className="text-right space-x-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c.id, c)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => openDelete(c.id, c.name)}><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>)}</TableBody>
      </Table></CardContent></Card>}

      {/* ADD/EDIT DIALOG */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}><DialogContent><DialogHeader><DialogTitle>{editingId ? "Edit" : "Add"} {activeTab.slice(0, -1)}</DialogTitle><DialogDescription>{editingId ? "Update the details below." : "Fill in the details to create a new entry."}</DialogDescription></DialogHeader>{renderFormFields()}<DialogFooter><Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button><Button onClick={submitForm} disabled={!form.name}>{editingId ? "Save Changes" : "Create"}</Button></DialogFooter></DialogContent></Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}><DialogContent><DialogHeader><DialogTitle>Delete {deleteTarget?.name}?</DialogTitle><DialogDescription>This action cannot be undone. Are you sure?</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button><Button variant="destructive" onClick={submitDelete}>Delete</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
