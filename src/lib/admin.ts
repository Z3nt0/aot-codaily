import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Check if the current user is an admin
 * @returns Promise<boolean> - true if user is admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.discordId) {
      return false;
    }

    // Check if user's Discord ID matches the admin Discord ID
    const adminDiscordId = process.env.ADMIN_DISCORD_ID;
    
    if (!adminDiscordId) {
      console.error("ADMIN_DISCORD_ID environment variable is not set");
      return false;
    }

    return session.user.discordId === adminDiscordId;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Get admin Discord ID from environment variables
 * @returns string | null - Admin Discord ID or null if not set
 */
export function getAdminDiscordId(): string | null {
  return process.env.ADMIN_DISCORD_ID || null;
}

/**
 * Check if a specific Discord ID is the admin
 * @param discordId - Discord ID to check
 * @returns boolean - true if Discord ID is admin, false otherwise
 */
export function isAdminDiscordId(discordId: string): boolean {
  const adminDiscordId = getAdminDiscordId();
  return adminDiscordId === discordId;
}

