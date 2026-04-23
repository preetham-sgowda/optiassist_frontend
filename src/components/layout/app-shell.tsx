"use client";

import { useAuth } from "@/context/auth-context";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "./sidebar";
import { TopNavbar } from "./top-navbar";
import { usePathname } from "next/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  // Don't wrap login page with shell
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated and not loading, we'll let middleware handle the redirect,
  // but just in case, render nothing or children (which will be a redirect page)
  if (!user) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40 md:flex-row">
        <Sidebar />
        <div className="flex flex-col w-full">
          <TopNavbar />
          <main className="flex-1 p-6 md:p-8 overflow-auto">
            <div className="mx-auto max-w-6xl w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
