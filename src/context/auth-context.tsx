"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role_id: string;
  department: string | null;
}

interface Role {
  id: string;
  name: string;
  permissions: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  role: Role | null;
  permissions: string[];
  hasPrivilege: (privilege: string) => boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 1. Check for real Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          await fetchUserProfile(session.access_token);
        } else {
          // 2. MOCK FALLBACK for preview purposes (?role=admin or ?role=employee)
          const params = new URLSearchParams(window.location.search);
          const mockRole = params.get('role');
          
          if (mockRole === 'admin') {
            setUser({ id: '1', full_name: 'Aalishan N', email: 'admin@optiasset.com', role_id: '1', department: 'IT' });
            setRole({ id: '1', name: 'admin', permissions: ['manage:assets', 'manage:employees', 'manage:assignments', 'manage:maintenance', 'manage:settings', 'view:dashboard', 'view:all_assets', 'view:all_employees', 'view:my_gear'] });
            setPermissions(['manage:assets', 'manage:employees', 'manage:assignments', 'manage:maintenance', 'manage:settings', 'view:dashboard', 'view:all_assets', 'view:all_employees', 'view:my_gear']);
          } else if (mockRole === 'employee') {
            setUser({ id: '2', full_name: 'Ben Sullivan', email: 'ben@optiasset.com', role_id: '3', department: 'Engineering' });
            setRole({ id: '3', name: 'employee', permissions: ['view:my_gear'] });
            setPermissions(['view:my_gear']);
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === "SIGNED_IN" && session) {
            setIsLoading(true);
            await fetchUserProfile(session.access_token);
            setIsLoading(false);
          } else if (event === "SIGNED_OUT") {
            setUser(null);
            setRole(null);
            setPermissions([]);
            router.push("/login");
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    };

    initializeAuth();
  }, [router]);

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setRole(data.role);
        setPermissions(data.permissions);
      } else {
        // If the backend fails, clear session
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  const hasPrivilege = (privilege: string) => {
    return permissions.includes(privilege);
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ user, role, permissions, hasPrivilege, isLoading, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
