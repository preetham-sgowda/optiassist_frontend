"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function Home() {
  const { user, hasPrivilege, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        if (hasPrivilege("view:dashboard")) {
          router.push("/dashboard");
        } else {
          router.push("/my-gear");
        }
      } else {
        // No user and no mock role? Go to login.
        router.push("/login");
      }
    }
  }, [user, hasPrivilege, isLoading, router]);

  return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
