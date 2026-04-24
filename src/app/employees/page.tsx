"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Users, Plus, Search, MoreHorizontal, Edit, Eye, ShieldAlert, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Employee {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  job_title: string;
  department: string;
  location: string;
  status: string;
}

const statusMap: Record<string, { label: string; variant: "default" | "outline" | "destructive" }> = {
  active: { label: "Active", variant: "default" },
  on_leave: { label: "On Leave", variant: "outline" },
  inactive: { label: "Inactive", variant: "destructive" },
};

const emptyForm = {
  employee_code: "", first_name: "", last_name: "", email: "",
  job_title: "", department: "Engineering", location: "", status: "active",
};

export default function EmployeesPage() {
  const { hasPrivilege, apiFetch } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [current, setCurrent] = useState<Employee | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/employees");
      if (res.ok) {
        const json = await res.json();
        setEmployees(json.data || []);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error("Failed to load employees", { description: err.error || res.statusText });
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  if (!hasPrivilege("view:all_employees")) {
    return <div className="flex h-[60vh] items-center justify-center"><div className="text-center"><ShieldAlert className="mx-auto h-10 w-10 text-destructive mb-4" /><h2 className="text-xl font-semibold">Access Denied</h2></div></div>;
  }

  const filtered = employees.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const fullName = `${e.first_name} ${e.last_name}`.toLowerCase();
    return fullName.includes(q) || e.email.toLowerCase().includes(q) || (e.employee_code && e.employee_code.toLowerCase().includes(q));
  });

  const handleAdd = () => { setForm({ ...emptyForm }); setShowAdd(true); };
  const handleEdit = (e: Employee) => {
    setCurrent(e);
    setForm({
      employee_code: e.employee_code || "",
      first_name: e.first_name || "",
      last_name: e.last_name || "",
      email: e.email || "",
      job_title: e.job_title || "",
      department: e.department || "Engineering",
      location: e.location || "",
      status: e.status || "active",
    });
    setShowEdit(true);
  };
  const handleView = (e: Employee) => { setCurrent(e); setShowView(true); };
  const handleDeactivate = (e: Employee) => { setCurrent(e); setShowDeactivate(true); };

  const submitAdd = async () => {
    setSaving(true);
    try {
      const res = await apiFetch("/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        toast.success("Employee registered", { description: `${form.first_name} ${form.last_name} added successfully.` });
        fetchEmployees();
        setShowAdd(false);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error("Failed to register employee", { description: err.detail || err.error || res.statusText });
      }
    } catch (error) {
      toast.error("Failed to register employee");
    } finally {
      setSaving(false);
    }
  };

  const submitEdit = async () => {
    if (!current) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/employees/${current.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        toast.success("Employee updated", { description: `${form.first_name} ${form.last_name} saved.` });
        fetchEmployees();
        setShowEdit(false);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error("Failed to update employee", { description: err.detail || err.error || res.statusText });
      }
    } catch (error) {
      toast.error("Failed to update employee");
    } finally {
      setSaving(false);
    }
  };

  const submitDeactivate = async () => {
    if (!current) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/employees/${current.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "inactive" })
      });
      if (res.ok) {
        toast.success("Employee deactivated", { description: `${current.first_name} ${current.last_name} has been deactivated.` });
        fetchEmployees();
        setShowDeactivate(false);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error("Failed to deactivate employee", { description: err.detail || err.error || res.statusText });
      }
    } catch (error) {
      toast.error("Failed to deactivate employee");
    } finally {
      setSaving(false);
    }
  };

  const formFields = (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Employee Code</Label><Input value={form.employee_code} onChange={(e) => setForm({ ...form, employee_code: e.target.value })} placeholder="EMP-009" /></div>
        <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@optiasset.com" /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>First Name</Label><Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} placeholder="John" /></div>
        <div className="space-y-2"><Label>Last Name</Label><Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} placeholder="Doe" /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Job Title</Label><Input value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} placeholder="Software Engineer" /></div>
        <div className="space-y-2"><Label>Department</Label>
          <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v || "" })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["IT", "Engineering", "Product", "Design", "HR", "Finance", "Analytics", "Marketing"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="HQ - Floor 2" /></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-2xl font-bold tracking-tight">Employee Directory</h2><p className="text-muted-foreground">Browse and manage all employees.</p></div>
        {hasPrivilege("manage:employees") && <Button onClick={handleAdd}><Plus className="mr-2 h-4 w-4" /> Register Employee</Button>}
      </div>

      <div className="grid gap-4 grid-cols-3">
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground uppercase">Total</p><p className="text-2xl font-bold mt-1">{employees.length}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground uppercase">Active</p><p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{employees.filter((e) => e.status === "active").length}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground uppercase">Departments</p><p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{new Set(employees.map((e) => e.department)).size}</p></CardContent></Card>
      </div>

      <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search by name, email, or code..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} /></div>

      <Card><CardContent className="p-0"><Table>
        <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead className="hidden md:table-cell">Code</TableHead><TableHead>Department</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>
          {filtered.map((emp) => {
            const s = statusMap[emp.status] || { label: emp.status, variant: "outline" as const };
            const fullName = `${emp.first_name} ${emp.last_name}`;
            const initials = `${(emp.first_name || "")[0] || ""}${(emp.last_name || "")[0] || ""}`;
            return (
              <TableRow key={emp.id} className="hover:bg-muted/50">
                <TableCell><div className="flex items-center gap-3"><Avatar className="h-9 w-9"><AvatarFallback className="bg-primary/10 text-primary text-xs">{initials}</AvatarFallback></Avatar><div><p className="font-medium">{fullName}</p><p className="text-xs text-muted-foreground">{emp.email}</p></div></div></TableCell>
                <TableCell className="hidden md:table-cell font-mono text-xs">{emp.employee_code}</TableCell>
                <TableCell><Badge variant="secondary">{emp.department}</Badge></TableCell>
                <TableCell><Badge variant={s.variant}>{s.label}</Badge></TableCell>
                <TableCell className="text-right">
                  <DropdownMenu><DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none"><MoreHorizontal className="h-4 w-4" /></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(emp)}><Eye className="mr-2 h-4 w-4" /> View</DropdownMenuItem>
                      {hasPrivilege("manage:employees") && <DropdownMenuItem onClick={() => handleEdit(emp)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>}
                      {hasPrivilege("manage:employees") && emp.status !== "inactive" && <DropdownMenuItem onClick={() => handleDeactivate(emp)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Deactivate</DropdownMenuItem>}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table></CardContent></Card>

      {/* ADD */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Register Employee</DialogTitle><DialogDescription>Add a new employee to the organization.</DialogDescription></DialogHeader>{formFields}<DialogFooter><Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button><Button onClick={submitAdd} disabled={saving || !form.first_name || !form.last_name || !form.email || !form.employee_code}>{saving ? "Saving..." : "Register"}</Button></DialogFooter></DialogContent></Dialog>

      {/* EDIT */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Edit Employee</DialogTitle><DialogDescription>Update details for {current?.first_name} {current?.last_name}.</DialogDescription></DialogHeader>{formFields}<DialogFooter><Button variant="outline" onClick={() => setShowEdit(false)}>Cancel</Button><Button onClick={submitEdit} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button></DialogFooter></DialogContent></Dialog>

      {/* VIEW */}
      <Dialog open={showView} onOpenChange={setShowView}><DialogContent><DialogHeader><DialogTitle>{current?.first_name} {current?.last_name}</DialogTitle><DialogDescription>{current?.employee_code} — {current?.email}</DialogDescription></DialogHeader>{current && <div className="grid grid-cols-2 gap-3 text-sm py-4">
        <div><p className="text-muted-foreground">Job Title</p><p className="font-medium">{current.job_title}</p></div>
        <div><p className="text-muted-foreground">Department</p><p className="font-medium">{current.department}</p></div>
        <div><p className="text-muted-foreground">Location</p><p className="font-medium">{current.location}</p></div>
        <div><p className="text-muted-foreground">Status</p><Badge variant={statusMap[current.status]?.variant}>{statusMap[current.status]?.label}</Badge></div>
      </div>}<DialogFooter><Button variant="outline" onClick={() => setShowView(false)}>Close</Button></DialogFooter></DialogContent></Dialog>

      {/* DEACTIVATE */}
      <Dialog open={showDeactivate} onOpenChange={setShowDeactivate}><DialogContent><DialogHeader><DialogTitle>Deactivate Employee?</DialogTitle><DialogDescription>This will mark <strong>{current?.first_name} {current?.last_name}</strong> as inactive. Their assigned assets should be returned first.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setShowDeactivate(false)}>Cancel</Button><Button variant="destructive" onClick={submitDeactivate} disabled={saving}>{saving ? "Processing..." : "Deactivate"}</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
