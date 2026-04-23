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
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<Response>;
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
        // Check for real Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          await fetchUserProfile(session.access_token);
        } else {
          setUser(null);
          setRole(null);
          setPermissions([]);
          if (window.location.pathname !== '/login') {
            router.push('/login');
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

  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, role, permissions, hasPrivilege, isLoading, logout, apiFetch }}
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
