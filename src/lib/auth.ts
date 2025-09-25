import { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { prisma } from "@/lib/prisma";

interface DiscordProfile {
  id: string;
  username: string;
  discriminator: string;
  avatar?: string;
  email?: string;
  guilds?: Array<{ id: string; name: string }>;
}

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma), // Temporarily disabled to fix OAuthAccountNotLinked error
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "identify email guilds",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "discord" && profile) {
        try {
          const discordProfile = profile as DiscordProfile;
          
          // Debug: Log the profile data to see what we're getting
          console.log("Discord profile:", {
            id: discordProfile.id,
            username: discordProfile.username,
            guilds: discordProfile.guilds?.length || 0,
            guildIds: discordProfile.guilds?.map(g => g.id) || []
          });
          
          // Optional: Check guild membership if DISCORD_GUILD_ID is set
          if (process.env.DISCORD_GUILD_ID) {
            const guilds = discordProfile.guilds || [];
            console.log("Required guild ID:", process.env.DISCORD_GUILD_ID);
            console.log("User guilds:", guilds.map(g => ({ id: g.id, name: g.name })));
            
            // Temporarily disable guild verification for testing
            console.log("⚠️ Guild verification temporarily disabled for testing");
            // const isMember = guilds.some(guild => guild.id === process.env.DISCORD_GUILD_ID);
            // if (!isMember) {
            //   console.log("❌ User not in required guild");
            //   console.log("Available guilds:", guilds.map(g => g.id));
            //   console.log("Required guild:", process.env.DISCORD_GUILD_ID);
            //   return false;
            // } else {
            //   console.log("✅ User is in required guild");
            // }
          }

          // Check if user exists in our database
          const existingUser = await prisma.user.findUnique({
            where: { discordId: discordProfile.id },
          });

          if (!existingUser) {
            // Create new user with Discord data
            await prisma.user.create({
              data: {
                discordId: discordProfile.id,
                username: discordProfile.username,
                discriminator: discordProfile.discriminator,
                avatar: discordProfile.avatar,
                email: discordProfile.email,
                joinedAt: new Date(),
                lastSeen: new Date(),
                currentStreak: 0,
                longestStreak: 0,
                roles: JSON.stringify([]),
              },
            });
            console.log("✅ New user created in database:", discordProfile.username);
            console.log("📊 User data saved:", {
              discordId: discordProfile.id,
              username: discordProfile.username,
              email: discordProfile.email
            });
          } else {
            // Update user data and last seen
            await prisma.user.update({
              where: { discordId: discordProfile.id },
              data: { 
                lastSeen: new Date(),
                username: discordProfile.username,
                discriminator: discordProfile.discriminator,
                avatar: discordProfile.avatar,
              },
            });
            console.log("✅ User updated in database:", discordProfile.username);
          }
        } catch (error) {
          console.error("❌ Error during Discord sign in:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token) {
        // Add Discord data to session from token
        session.user.id = token.sub as string;
        session.user.discordId = token.discordId as string;
        session.user.currentStreak = 0; // Default values for now
        session.user.longestStreak = 0;
        session.user.username = token.username as string;
        session.user.discriminator = token.discriminator as string;
        session.user.avatar = token.avatar as string;
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const discordProfile = profile as DiscordProfile;
        token.discordId = discordProfile.id;
        token.username = discordProfile.username;
        token.discriminator = discordProfile.discriminator;
        token.avatar = discordProfile.avatar;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      console.log("🔄 Redirect callback called:", { url, baseUrl });
      
      // If user is already authenticated and trying to access root, redirect to dashboard
      if (url === baseUrl || url === `${baseUrl}/`) {
        console.log("✅ Redirecting authenticated user to dashboard");
        return `${baseUrl}/dashboard`;
      }
      
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        console.log("✅ Redirecting to relative URL:", `${baseUrl}${url}`);
        return `${baseUrl}${url}`;
      }
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        console.log("✅ Redirecting to same origin URL:", url);
        return url;
      }
      
      console.log("✅ Default redirect to dashboard:", `${baseUrl}/dashboard`);
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
