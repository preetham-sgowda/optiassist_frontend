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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Package, Plus, Search, MoreHorizontal, Edit, Trash2, Eye, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

interface Asset {
  id: string; asset_tag: string; name: string; serial_number: string;
  category: string; vendor: string; location: string; status: string;
  condition: string; assigned_to: string | null; purchase_cost: number;
}

const initialAssets: Asset[] = [
  { id: "1", asset_tag: "MAC-001", name: "MacBook Pro 16 M3 Max", serial_number: "C02X123ABCD", category: "Laptop", vendor: "Apple", location: "HQ - Floor 3", status: "assigned", condition: "excellent", assigned_to: "Aalishan N", purchase_cost: 3499 },
  { id: "2", asset_tag: "MAC-002", name: "MacBook Air M2", serial_number: "C02X456EFGH", category: "Laptop", vendor: "Apple", location: "HQ - Floor 2", status: "in_stock", condition: "good", assigned_to: null, purchase_cost: 1299 },
  { id: "3", asset_tag: "MON-042", name: "Dell UltraSharp U2723QE", serial_number: "DL9284719", category: "Monitor", vendor: "Dell", location: "HQ - Floor 3", status: "assigned", condition: "good", assigned_to: "Ben S", purchase_cost: 619 },
  { id: "4", asset_tag: "PHO-112", name: "iPhone 15 Pro Max", serial_number: "DNQX2847190", category: "Mobile", vendor: "Apple", location: "HQ - Floor 1", status: "assigned", condition: "excellent", assigned_to: "Sarah J", purchase_cost: 1199 },
  { id: "5", asset_tag: "KEY-088", name: "Logitech MX Keys S", serial_number: "LG0029384", category: "Peripheral", vendor: "Logitech", location: "HQ - Floor 2", status: "in_stock", condition: "good", assigned_to: null, purchase_cost: 109 },
  { id: "6", asset_tag: "DES-015", name: 'LG 34" Curved Monitor', serial_number: "LG3400192", category: "Monitor", vendor: "LG", location: "Remote - NYC", status: "in_repair", condition: "fair", assigned_to: null, purchase_cost: 799 },
  { id: "7", asset_tag: "LAP-033", name: "ThinkPad X1 Carbon Gen 11", serial_number: "PF3K9281", category: "Laptop", vendor: "Lenovo", location: "Remote - London", status: "retired", condition: "poor", assigned_to: null, purchase_cost: 1849 },
];

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  assigned: { label: "Assigned", variant: "default" },
  in_stock: { label: "In Stock", variant: "secondary" },
  in_repair: { label: "In Repair", variant: "outline" },
  retired: { label: "Retired", variant: "destructive" },
};

const emptyAsset: Omit<Asset, "id"> = { asset_tag: "", name: "", serial_number: "", category: "Laptop", vendor: "", location: "", status: "in_stock", condition: "good", assigned_to: null, purchase_cost: 0 };

export default function AssetsPage() {
  const { hasPrivilege } = useAuth();
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Dialog states
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [current, setCurrent] = useState<Asset | null>(null);
  const [form, setForm] = useState(emptyAsset);
  const [saving, setSaving] = useState(false);

  if (!hasPrivilege("view:all_assets")) {
    return <div className="flex h-[60vh] items-center justify-center"><div className="text-center"><ShieldAlert className="mx-auto h-10 w-10 text-destructive mb-4" /><h2 className="text-xl font-semibold">Access Denied</h2></div></div>;
  }

  const filtered = assets.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = !search || a.name.toLowerCase().includes(q) || a.asset_tag.toLowerCase().includes(q) || a.serial_number.toLowerCase().includes(q);
    const matchStatus = !statusFilter || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAdd = () => { setForm({ ...emptyAsset }); setShowAdd(true); };
  const handleEdit = (a: Asset) => { setCurrent(a); setForm({ ...a }); setShowEdit(true); };
  const handleView = (a: Asset) => { setCurrent(a); setShowView(true); };
  const handleDeleteClick = (a: Asset) => { setCurrent(a); setShowDelete(true); };

  const submitAdd = async () => {
    setSaving(true);
    const newId = String(Date.now());
    const newAsset: Asset = { ...form, id: newId };
    setAssets((prev) => [...prev, newAsset]);
    toast.success("Asset created", { description: `${form.name} (${form.asset_tag}) added.` });
    setShowAdd(false);
    setSaving(false);
  };

  const submitEdit = async () => {
    if (!current) return;
    setSaving(true);
    setAssets((prev) => prev.map((a) => (a.id === current.id ? { ...a, ...form } : a)));
    toast.success("Asset updated", { description: `${form.name} saved.` });
    setShowEdit(false);
    setSaving(false);
  };

  const submitDelete = async () => {
    if (!current) return;
    setSaving(true);
    setAssets((prev) => prev.filter((a) => a.id !== current.id));
    toast.success("Asset deleted", { description: `${current.name} removed.` });
    setShowDelete(false);
    setSaving(false);
  };

  const formFields = (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Asset Tag</Label><Input value={form.asset_tag} onChange={(e) => setForm({ ...form, asset_tag: e.target.value })} placeholder="MAC-001" /></div>
        <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="MacBook Pro 16" /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Serial Number</Label><Input value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} /></div>
        <div className="space-y-2"><Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v || "" })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["Laptop", "Monitor", "Mobile", "Tablet", "Peripheral", "Server"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Vendor</Label><Input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} /></div>
        <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2"><Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v || "" })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["in_stock", "assigned", "in_repair", "retired"].map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2"><Label>Condition</Label>
          <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v || "" })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["excellent", "good", "fair", "poor"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2"><Label>Cost ($)</Label><Input type="number" value={form.purchase_cost} onChange={(e) => setForm({ ...form, purchase_cost: Number(e.target.value) })} /></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-2xl font-bold tracking-tight">Asset Inventory</h2><p className="text-muted-foreground">Manage and track all company hardware assets.</p></div>
        {hasPrivilege("manage:assets") && <Button onClick={handleAdd}><Plus className="mr-2 h-4 w-4" /> Add New Asset</Button>}
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Total", count: assets.length, color: "text-foreground", filter: null },
          { label: "Assigned", count: assets.filter((a) => a.status === "assigned").length, color: "text-blue-600 dark:text-blue-400", filter: "assigned" },
          { label: "In Stock", count: assets.filter((a) => a.status === "in_stock").length, color: "text-emerald-600 dark:text-emerald-400", filter: "in_stock" },
          { label: "In Repair", count: assets.filter((a) => a.status === "in_repair").length, color: "text-amber-600 dark:text-amber-400", filter: "in_repair" },
          { label: "Retired", count: assets.filter((a) => a.status === "retired").length, color: "text-red-600 dark:text-red-400", filter: "retired" },
        ].map((s) => (
          <Card key={s.label} className={`cursor-pointer transition-shadow hover:shadow-md ${statusFilter === s.filter ? 'ring-2 ring-primary' : ''}`} onClick={() => setStatusFilter(s.filter)}>
            <CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.count}</p></CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search by name, tag, or serial..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        {statusFilter && <Button variant="ghost" size="sm" onClick={() => setStatusFilter(null)}>Clear filter ✕</Button>}
      </div>

      <Card><CardContent className="p-0"><Table>
        <TableHeader><TableRow><TableHead>Tag</TableHead><TableHead>Name</TableHead><TableHead className="hidden md:table-cell">Category</TableHead><TableHead>Status</TableHead><TableHead className="hidden lg:table-cell">Assigned To</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>
          {filtered.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground"><Package className="mx-auto h-8 w-8 mb-2 opacity-50" />No assets found.</TableCell></TableRow> : filtered.map((asset) => {
            const s = statusConfig[asset.status] || { label: asset.status, variant: "outline" as const };
            return (
              <TableRow key={asset.id} className="hover:bg-muted/50">
                <TableCell className="font-mono text-xs font-semibold">{asset.asset_tag}</TableCell>
                <TableCell className="font-medium">{asset.name}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{asset.category}</TableCell>
                <TableCell><Badge variant={s.variant}>{s.label}</Badge></TableCell>
                <TableCell className="hidden lg:table-cell">{asset.assigned_to || <span className="text-muted-foreground">—</span>}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu><DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none"><MoreHorizontal className="h-4 w-4" /></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(asset)}><Eye className="mr-2 h-4 w-4" /> View</DropdownMenuItem>
                      {hasPrivilege("manage:assets") && <DropdownMenuItem onClick={() => handleEdit(asset)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>}
                      {hasPrivilege("manage:assets") && <DropdownMenuItem onClick={() => handleDeleteClick(asset)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table></CardContent></Card>

      <p className="text-sm text-muted-foreground">Showing {filtered.length} of {assets.length} assets</p>

      {/* ADD DIALOG */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Add New Asset</DialogTitle><DialogDescription>Enter the asset details below.</DialogDescription></DialogHeader>{formFields}<DialogFooter><Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button><Button onClick={submitAdd} disabled={saving || !form.asset_tag || !form.name}>{saving ? "Saving..." : "Create Asset"}</Button></DialogFooter></DialogContent></Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Edit Asset</DialogTitle><DialogDescription>Update asset details for {current?.asset_tag}.</DialogDescription></DialogHeader>{formFields}<DialogFooter><Button variant="outline" onClick={() => setShowEdit(false)}>Cancel</Button><Button onClick={submitEdit} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button></DialogFooter></DialogContent></Dialog>

      {/* VIEW DIALOG */}
      <Dialog open={showView} onOpenChange={setShowView}><DialogContent><DialogHeader><DialogTitle>{current?.name}</DialogTitle><DialogDescription>{current?.asset_tag} — {current?.serial_number}</DialogDescription></DialogHeader>{current && <div className="grid grid-cols-2 gap-3 text-sm py-4">
        <div><p className="text-muted-foreground">Category</p><p className="font-medium">{current.category}</p></div>
        <div><p className="text-muted-foreground">Vendor</p><p className="font-medium">{current.vendor}</p></div>
        <div><p className="text-muted-foreground">Location</p><p className="font-medium">{current.location}</p></div>
        <div><p className="text-muted-foreground">Status</p><Badge variant={statusConfig[current.status]?.variant || "outline"}>{statusConfig[current.status]?.label || current.status}</Badge></div>
        <div><p className="text-muted-foreground">Condition</p><p className="font-medium capitalize">{current.condition}</p></div>
        <div><p className="text-muted-foreground">Purchase Cost</p><p className="font-medium">${current.purchase_cost.toLocaleString()}</p></div>
        <div className="col-span-2"><p className="text-muted-foreground">Assigned To</p><p className="font-medium">{current.assigned_to || "Unassigned"}</p></div>
      </div>}<DialogFooter><Button variant="outline" onClick={() => setShowView(false)}>Close</Button></DialogFooter></DialogContent></Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}><DialogContent><DialogHeader><DialogTitle>Delete Asset?</DialogTitle><DialogDescription>This will permanently remove <strong>{current?.name}</strong> ({current?.asset_tag}). This action cannot be undone.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button><Button variant="destructive" onClick={submitDelete} disabled={saving}>{saving ? "Deleting..." : "Delete"}</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
