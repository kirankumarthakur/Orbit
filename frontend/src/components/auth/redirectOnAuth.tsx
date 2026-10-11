"use client";

import { useSession } from "@descope/nextjs-sdk/client";
import { useEffect } from "react";

export const RedirectOnAuth = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isSessionLoading } = useSession();

  useEffect(() => {
    if (!isSessionLoading && isAuthenticated) {
      window.location.href = "/dashboard";
    }
  }, [isAuthenticated, isSessionLoading]);

  return <>{children}</>;
};

export default RedirectOnAuth;
