"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardWorkspace } from "@/components/dashboard-workspace";
import { hasToken } from "@/features/auth/model";
import { useSession } from "@/stores/session-context";

export default function Home() {
  const router = useRouter();
  const { user, hydrateUser } = useSession();
  const [isClientReady, setIsClientReady] = useState(false);

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  useEffect(() => {
    if (!hasToken()) {
      router.replace("/sign_in");
      return;
    }
  }, [user, router]);

  useEffect(() => {
    if (!isClientReady) {
      return;
    }

    if (!hasToken()) {
      router.replace("/sign_in");
      return;
    }

    hydrateUser();
  }, [hydrateUser, isClientReady, router]);

  if (!isClientReady) {
    return null;
  }

  if (!hasToken()) {
    return null;
  }

  return <DashboardWorkspace />;
}
