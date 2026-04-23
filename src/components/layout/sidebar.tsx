"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Package,
  Users,
  ArrowLeftRight,
  Wrench,
  Settings,
  Laptop,
} from "lucide-react";

// The full list of potential navigation items
const navItems = [
  {
    title: "Admin Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    privilege: "view:dashboard",
    group: "Overview",
  },
  {
    title: "My Gear",
    url: "/my-gear",
    icon: Laptop,
    privilege: "view:my_gear",
    group: "Personal",
  },
  {
    title: "Assets Inventory",
    url: "/assets",
    icon: Package,
    privilege: "view:all_assets",
    group: "Management",
  },
  {
    title: "Employees",
    url: "/employees",
    icon: Users,
    privilege: "view:all_employees",
    group: "Management",
  },
  {
    title: "Assignments",
    url: "/assignments",
    icon: ArrowLeftRight,
    privilege: "manage:assignments",
    group: "Operations",
  },
  {
    title: "Maintenance",
    url: "/maintenance",
    icon: Wrench,
    privilege: "manage:maintenance",
    group: "Operations",
  },
  {
    title: "System Settings",
    url: "/settings",
    icon: Settings,
    privilege: "manage:settings",
    group: "Configuration",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { hasPrivilege } = useAuth();

  // FRONTEND RBAC: Filter navigation items based on user privileges
  // If a user doesn't have the required privilege, the item is completely removed from the DOM
  const authorizedNavItems = navItems.filter((item) => hasPrivilege(item.privilege));

  // Group the authorized items
  const groupedItems = authorizedNavItems.reduce((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = [];
    }
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof authorizedNavItems>);

  return (
    <ShadcnSidebar>
      <SidebarHeader className="p-4 flex flex-row items-center gap-2 border-b">
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
          OA
        </div>
        <div className="flex flex-col gap-0.5 leading-none">
          <span className="font-semibold text-base">OptiAsset</span>
          <span className="text-xs text-muted-foreground">Enterprise EAM</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {Object.entries(groupedItems).map(([group, items]) => (
          <SidebarGroup key={group}>
            <SidebarGroupLabel>{group}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Link href={item.url} className="w-full">
                      <SidebarMenuButton isActive={pathname.startsWith(item.url)}>
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t text-xs text-muted-foreground text-center">
        OptiAsset v1.0
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
