"use client";

import { Metadata } from "next";
import Link from "next/link";
import { motion } from "framer-motion";
import { DiscordLoginButton } from "@/components/auth/DiscordLoginButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

export default function LoginPage() {
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
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome to{" "}
            <span className="text-primary">AOT CoDaily</span>
          </h1>
          <p className="text-muted-foreground mb-8">
            Sign in with Discord to start your daily programming challenges
          </p>
        </motion.div>

        <motion.div
          className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-card-foreground mb-2">
                Sign In
              </h2>
              <p className="text-muted-foreground">
                Continue with Discord to access your account
              </p>
            </div>

            <DiscordLoginButton />

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                New to AOT CoDaily?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Learn more about joining
                </Link>
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-primary/10 backdrop-blur-sm rounded-xl border border-primary/20 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-primary mb-3">
            What you'll get:
          </h3>
          <ul className="space-y-2 text-sm text-primary/80">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
              Daily programming challenges
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
              Track your coding streak
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
              Compete on leaderboards
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
              Discord community access
            </li>
          </ul>
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-xs text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:text-primary/80">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:text-primary/80">
              Privacy Policy
            </Link>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
