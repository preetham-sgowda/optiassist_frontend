"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, Users, Activity, CheckCircle, AlertTriangle, ArrowRightLeft } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { hasPrivilege, apiFetch } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await apiFetch("/dashboard/stats");
        if (res.ok) {
          const json = await res.json();
          setStats(json);
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (!hasPrivilege("view:dashboard")) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-destructive mb-4" />
          <h2 className="text-xl font-semibold">Access Denied</h2>
          <p className="text-muted-foreground mt-2">You do not have permission to view the dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="space-y-4">
      <div className="h-8 w-64 bg-muted animate-pulse rounded"></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-xl"></div>)}
      </div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">Overview of company assets and operations.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_assets}</div>
            <p className="text-xs text-muted-foreground">+20 from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Assets</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assigned_assets}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.assigned_assets / stats.total_assets) * 100)}% utilization rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Repair</CardTitle>
            <Activity className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.in_repair_assets}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_employees}</div>
            <p className="text-xs text-muted-foreground">+5 new hires this week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Assignments</CardTitle>
            <CardDescription>Latest asset allocations across the organization.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Tag</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recent_assignments.map((assignment: any) => (
                  <TableRow key={assignment.asset_tag}>
                    <TableCell className="font-medium">{assignment.asset_tag}</TableCell>
                    <TableCell>{assignment.name}</TableCell>
                    <TableCell>{assignment.assigned_to}</TableCell>
                    <TableCell>{assignment.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
            <CardDescription>Current state of all assets.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-full flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      Assigned
                    </p>
                    <span className="text-sm text-muted-foreground">{stats.assigned_assets}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(stats.assigned_assets / stats.total_assets) * 100}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-full flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      In Stock
                    </p>
                    <span className="text-sm text-muted-foreground">{stats.in_stock_assets}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(stats.in_stock_assets / stats.total_assets) * 100}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-full flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      In Repair
                    </p>
                    <span className="text-sm text-muted-foreground">{stats.in_repair_assets}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(stats.in_repair_assets / stats.total_assets) * 100}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-full flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                      Retired/Lost
                    </p>
                    <span className="text-sm text-muted-foreground">{stats.retired_assets}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-slate-500 h-2 rounded-full" style={{ width: `${(stats.retired_assets / stats.total_assets) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
