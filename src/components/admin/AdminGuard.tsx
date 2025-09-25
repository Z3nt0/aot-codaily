"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Shield, Loader2 } from "lucide-react";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (status === "loading") {
        return;
      }

      if (status === "unauthenticated") {
        router.push("/login?callbackUrl=/admin");
        return;
      }

      if (session?.user?.discordId) {
        try {
          // Check if user is admin by comparing Discord ID
          const response = await fetch("/api/admin/check", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            const { isAdmin: adminStatus } = await response.json();
            setIsAdmin(adminStatus);
            
            if (!adminStatus) {
              // Not an admin, redirect to dashboard
              router.push("/dashboard?error=access_denied");
              return;
            }
          } else {
            // Error checking admin status
            router.push("/dashboard?error=access_denied");
            return;
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          router.push("/dashboard?error=access_denied");
          return;
        }
      }

      setIsChecking(false);
    };

    checkAdminStatus();
  }, [session, status, router]);

  if (status === "loading" || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <motion.div
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-8 h-8 text-primary" />
          </motion.div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">Verifying Access</h2>
            <p className="text-sm text-muted-foreground">Checking admin permissions...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <motion.div
          className="text-center max-w-md mx-auto px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Shield className="w-8 h-8 text-destructive" />
          </motion.div>
          
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don&apos;t have permission to access the admin panel. Only authorized administrators can view this page.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Return to Dashboard
            </motion.button>
            
            <motion.button
              onClick={() => router.push("/")}
              className="px-6 py-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Go Home
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}

