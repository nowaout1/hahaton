"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardWorkspace } from "@/components/dashboard-workspace";
import { hasToken } from "@/features/auth/model";
import { useSession } from "@/stores/session-context";

export default function Home() {
  const router = useRouter();
  const { user, hydrateUser } = useSession();

  useEffect(() => {
    if (!hasToken()) {
      router.replace("/sign_in");
      return;
    }
  }, [router, user]);

  useEffect(() => {
    if (!hasToken()) {
      router.replace("/sign_in");
      return;
    }
    hydrateUser();
  }, [hydrateUser, router]);

  if (!hasToken()) {
    return null;
  }

  return <DashboardWorkspace />;
}
