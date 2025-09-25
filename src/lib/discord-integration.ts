// Discord Bot Integration Service
// This service handles communication between the web app and Discord bot

export interface DiscordUser {
  discordId: string;
  username: string;
  avatar?: string;
}

export interface DiscordSubmission {
  userId: string;
  problemId: string;
  code: string;
  language: string;
}

export interface DiscordLeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  points: number;
}

// Get Discord bot command data
export async function getDiscordCommandData(command: string, userId?: string, period?: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  try {
    const url = new URL(`${baseUrl}/api/discord/commands`);
    url.searchParams.set('command', command);
    if (userId) url.searchParams.set('userId', userId);
    if (period) url.searchParams.set('period', period);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Discord command API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to get Discord command data for ${command}:`, error);
    return null;
  }
}

// Discord bot slash command handlers
export const discordCommands = {
  // /today command - Get today's problem
  async today() {
    return await getDiscordCommandData('today');
  },

  // /leaderboard command - Get leaderboard
  async leaderboard(period: string = 'weekly') {
    return await getDiscordCommandData('leaderboard', undefined, period);
  },

  // /streak command - Get user streak
  async streak(userId: string) {
    return await getDiscordCommandData('streak', userId);
  },

  // /help command - Get help information
  async help() {
    return await getDiscordCommandData('help');
  }
};

// Format Discord embeds for rich messages
export function formatDiscordEmbed(type: string, data: any) {
  switch (type) {
    case 'DAILY_PROBLEM':
      return {
        title: `🎯 Today's Challenge: ${data.title}`,
        description: data.description,
        color: 0x26baec,
        fields: [
          { name: 'Difficulty', value: data.difficulty, inline: true },
          { name: 'Topic', value: data.topic, inline: true }
        ],
        footer: { text: 'AOT CoDaily - Daily Programming Challenges' }
      };

    case 'LEADERBOARD':
      return {
        title: `🏆 ${data.period} Leaderboard`,
        description: data.rankings.map((entry: any, index: number) => 
          `${index + 1}. ${entry.username} - ${entry.score} points`
        ).join('\n'),
        color: 0x26baec,
        footer: { text: 'Updated just now' }
      };

    case 'STREAK':
      return {
        title: '🔥 Streak Status',
        description: `Current Streak: ${data.currentStreak} days\nBest Streak: ${data.longestStreak} days\nTotal Submissions: ${data.totalSubmissions}`,
        color: 0x26baec,
        footer: { text: `Last success: ${data.lastSuccess}` }
      };

    case 'HELP':
      return {
        title: '🤖 AOT CoDaily Bot Commands',
        description: 'Here are all the available commands:',
        color: 0x26baec,
        fields: data.commands.map((cmd: any) => ({
          name: cmd.name,
          value: cmd.description,
          inline: false
        })),
        footer: { text: data.footer }
      };

    default:
      return {
        title: 'AOT CoDaily',
        description: 'Daily programming challenges',
        color: 0x26baec
      };
  }
}