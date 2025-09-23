import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      discordId: string;
      currentStreak: number;
      longestStreak: number;
      username: string;
      discriminator: string;
      avatar: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    discordId: string;
    currentStreak: number;
    longestStreak: number;
    username: string;
    discriminator: string;
    avatar: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    discordId: string;
  }
}

