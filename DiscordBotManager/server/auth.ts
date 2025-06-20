
import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  email: string;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string;
  permissions: number;
  owner: boolean;
}

export class DiscordAuth {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.DISCORD_CLIENT_ID!;
    this.clientSecret = process.env.DISCORD_CLIENT_SECRET!;
    this.redirectUri = process.env.DISCORD_REDIRECT_URI || `https://workspace.botcreator416.repl.co/auth/discord/callback`;
  }

  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'identify email guilds',
      state: state,
    });

    return `https://discord.com/api/oauth2/authorize?${params}`;
  }

  async exchangeCodeForToken(code: string): Promise<string> {
    const response = await axios.post('https://discord.com/api/oauth2/token', 
      new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectUri,
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data.access_token;
  }

  async getUserInfo(accessToken: string): Promise<DiscordUser> {
    const response = await axios.get('https://discord.com/api/v10/users/@me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    return response.data;
  }

  async getUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
    const response = await axios.get('https://discord.com/api/v10/users/@me/guilds', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    return response.data;
  }

  // Check if user has moderator+ permissions (MANAGE_GUILD, ADMINISTRATOR, or is owner)
  hasModeratorPermissions(guild: DiscordGuild): boolean {
    const MANAGE_GUILD = 0x00000020;
    const ADMINISTRATOR = 0x00000008;
    
    return guild.owner || 
           (guild.permissions & ADMINISTRATOR) === ADMINISTRATOR ||
           (guild.permissions & MANAGE_GUILD) === MANAGE_GUILD;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}
