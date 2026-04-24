"use client";

import { useState } from "react";
import { useTheme } from "@/components/layout/theme-provider";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Moon, Sun, User, LogOut } from "lucide-react";
import { toast } from "sonner";

export function TopNavbar() {
  const { setTheme, theme } = useTheme();
  const { user, role, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  if (!user) return null;

  const initials = (user.full_name || "?")
    .split(" ")
    .filter(Boolean)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2) || "?";

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out", { description: "You have been signed out." });
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-6 justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="-ml-2" />
          <h1 className="font-semibold text-lg hidden sm:block">
            {role?.name === "admin" ? "Admin Control Center" : "OptiAsset Portal"}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <Badge variant={role?.name === "admin" ? "default" : "secondary"} className="hidden sm:inline-flex capitalize">
            {role?.name || "User"}
          </Badge>

          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="text-muted-foreground">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger className="relative h-9 w-9 rounded-full focus:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground">
                <Avatar className="h-9 w-9 border"><AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback></Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.full_name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowProfile(true)}>
                <User className="mr-2 h-4 w-4" /><span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" /><span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* PROFILE DIALOG */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>My Profile</DialogTitle>
            <DialogDescription>Your account information.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-4 py-4">
            <Avatar className="h-16 w-16 border-2">
              <AvatarFallback className="bg-primary/10 text-primary text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{user.full_name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge className="mt-1 capitalize">{role?.name}</Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm border-t pt-4">
            <div><p className="text-muted-foreground">Department</p><p className="font-medium">{user.department || "N/A"}</p></div>
            <div><p className="text-muted-foreground">Role</p><p className="font-medium capitalize">{role?.name || "None"}</p></div>
            <div className="col-span-2"><p className="text-muted-foreground">Permissions</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {(role?.permissions || []).slice(0, 6).map((p: string) => <Badge key={p} variant="outline" className="text-xs">{p}</Badge>)}
                {((role?.permissions || []).length) > 6 && <Badge variant="outline" className="text-xs">+{(role?.permissions?.length || 0) - 6} more</Badge>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProfile(false)}>Close</Button>
            <Button variant="destructive" onClick={() => { setShowProfile(false); handleLogout(); }}>
              <LogOut className="mr-2 h-4 w-4" /> Log out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
