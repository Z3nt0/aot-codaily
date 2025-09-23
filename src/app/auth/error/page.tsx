"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const errorMessages = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "Access denied. You do not have permission to sign in.",
  Verification: "The verification token has expired or has already been used.",
  Default: "An error occurred during authentication."
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") as keyof typeof errorMessages;

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-background text-foreground"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div
            className="text-6xl mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            ❌
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Authentication Error
          </h1>
          <p className="text-muted-foreground">
            {errorMessages[error] || errorMessages.Default}
          </p>
        </motion.div>

        <motion.div
          className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-card-foreground mb-2">
                What happened?
              </h2>
              <p className="text-sm text-muted-foreground">
                {error === "AccessDenied" && "You may not be a member of the required Discord server."}
                {error === "Configuration" && "The Discord OAuth configuration is incorrect."}
                {error === "Verification" && "Your authentication session has expired."}
                {!error && "An unexpected error occurred during sign-in."}
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/login"
                className="w-full flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                Try Again
              </Link>
              
              <Link
                href="/"
                className="w-full flex items-center justify-center px-6 py-3 border border-border text-foreground rounded-xl font-medium hover:bg-card/50 transition-colors"
              >
                Go Home
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-primary/10 backdrop-blur-sm rounded-xl border border-primary/20 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold text-primary mb-3">
            Need Help?
          </h3>
          <ul className="space-y-2 text-sm text-primary/80">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></span>
              Make sure you're signed in to Discord
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></span>
              Check your internet connection
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></span>
              Try refreshing the page
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></span>
              Contact support if the problem persists
            </li>
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
}