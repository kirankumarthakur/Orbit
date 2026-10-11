"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Descope } from "@descope/nextjs-sdk";
import { useSession, useUser } from "@descope/nextjs-sdk/client";
import { Loader2, Radio } from "lucide-react";
import { motion } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface LoginComponentProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

const hasAuthCodeInUrl = (): boolean => {
  if (typeof window === "undefined") return false;
  return (
    window.location.search.includes("code=") ||
    window.location.search.includes("descope-login-flow=")
  );
};

const LoginComponent = ({
  open,
  onOpenChange,
  onSuccess,
}: LoginComponentProps) => {
  const router = useRouter();
  const { isAuthenticated, isSessionLoading } = useSession();
  const { isUserLoading } = useUser();
  const [hasCode, setHasCode] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const isLoading = isSessionLoading || isUserLoading;

  useEffect(() => {
    if (hasAuthCodeInUrl()) {
      setHasCode(true);
      console.log("[Orbit Auth] Exchanging OAuth callback code from URL:", window.location.search);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log("[Orbit Auth] Authenticated session confirmed, redirecting to /dashboard");
      if (typeof window !== "undefined") {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      setIsRedirecting(true);
      onSuccess?.();
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, onSuccess, router]);

  const handleSuccess = (e: unknown) => {
    console.log("[Orbit Auth] Descope exchange succeeded:", e);
    if (typeof window !== "undefined") {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    setIsRedirecting(true);
    onSuccess?.();
    router.replace("/dashboard");
  };

  const handleError = (error: unknown) => {
    console.error("[Orbit Auth] Descope exchange error:", error);
  };

  const renderLoading = () => {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-3 py-10">
        <Loader2 className="size-8 animate-spin text-periwinkle" />
        <span className="text-xs text-white/50">
          Loading authentication...
        </span>
      </div>
    );
  };

  const renderFlow = () => {
    return (
      <Descope
        flowId="sign-up-or-in-social"
        theme="dark"
        redirectAfterSuccess="/dashboard"
        onSuccess={handleSuccess}
        onError={handleError}
      />
    );
  };

  const renderTransitionScreen = (subtitle: string) => {
    return (
      <div className="fixed inset-0 z-50 flex h-screen w-screen flex-col items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-periwinkle/40 bg-periwinkle/15 text-periwinkle shadow-xl shadow-periwinkle/15">
            <Radio className="size-7 animate-pulse" />
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <Loader2 className="size-6 animate-spin text-periwinkle" />
            <span className="text-sm font-semibold tracking-wide text-white">
              Entering Orbit...
            </span>
            <span className="text-xs text-white/50">
              {subtitle}
            </span>
          </div>
        </div>
        <div className="opacity-0 pointer-events-none absolute inset-0 size-0 overflow-hidden">
          {renderFlow()}
        </div>
      </div>
    );
  };

  const renderModalHeader = () => {
    return (
      <DialogHeader className="flex flex-col items-center text-center gap-2 pb-2">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="flex size-12 items-center justify-center rounded-2xl border border-periwinkle/40 bg-periwinkle/15 text-periwinkle shadow-md"
        >
          <Radio className="size-6" />
        </motion.div>
        <DialogTitle className="text-xl font-bold text-white tracking-normal normal-case">
          Sign in to Orbit
        </DialogTitle>
        <DialogDescription className="text-xs text-white/70">
          Access your intelligent calendar assistant.
        </DialogDescription>
      </DialogHeader>
    );
  };

  const renderModalContent = () => {
    return (
      <DialogContent className="rounded-3xl border border-white/20 bg-zinc-950 p-8 text-white sm:max-w-md shadow-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="flex w-full flex-col"
        >
          {renderModalHeader()}
          <div className="w-full pt-2">
            {isLoading || isAuthenticated ? renderLoading() : (
              <div className="relative w-full min-h-[260px]">
                {renderFlow()}
              </div>
            )}
          </div>
        </motion.div>
      </DialogContent>
    );
  };

  if (hasCode) {
    return renderTransitionScreen("Completing authentication...");
  }

  if (isRedirecting) {
    return renderTransitionScreen("Loading your dashboard...");
  }

  if (open !== undefined) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {renderModalContent()}
      </Dialog>
    );
  }

  return (
    <div className="relative w-full min-h-[260px]">
      {renderFlow()}
    </div>
  );
};

export default LoginComponent;
