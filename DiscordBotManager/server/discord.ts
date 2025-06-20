import { Client, GatewayIntentBits, Collection } from 'discord.js';
import type { Bot } from "@shared/schema";

class DiscordService {
  private client: Client | null = null;
  private isConnected = false;

  async connect(token: string): Promise<void> {
    if (this.client) {
      this.client.destroy();
    }

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
      ]
    });

    return new Promise((resolve, reject) => {
      if (!this.client) return reject(new Error('Client not initialized'));

      this.client.once('ready', () => {
        this.isConnected = true;
        console.log(`Discord bot connected as ${this.client?.user?.tag}`);
        resolve();
      });

      this.client.on('error', (error) => {
        console.error('Discord client error:', error);
        this.isConnected = false;
      });

      this.client.login(token).catch(reject);
    });
  }

  async getBotInfo(): Promise<Partial<Bot> | null> {
    if (!this.client || !this.isConnected) {
      return null;
    }

    try {
      const guilds = await this.client.guilds.fetch();
      let totalUsers = 0;

      // Calculate total users across all guilds
      const guildArray = Array.from(guilds.values());
      for (const guild of guildArray) {
        const fullGuild = await guild.fetch();
        totalUsers += fullGuild.memberCount;
      }

      return {
        name: this.client.user?.tag || 'Unknown Bot',
        isConnected: true,
        lastConnected: new Date(),
        ping: this.client.ws.ping,
        serverCount: guilds.size,
        userCount: totalUsers,
        uptime: this.client.uptime ? (this.client.uptime / (1000 * 60 * 60 * 24)) : 0, // Convert to days
      };
    } catch (error) {
      console.error('Error fetching bot info:', error);
      return null;
    }
  }

  async getGuildsList() {
    if (!this.client || !this.isConnected) {
      return [];
    }

    try {
      const guilds = await this.client.guilds.fetch();
      const guildList = [];

      const guildArray = Array.from(guilds.values());
      for (const guild of guildArray) {
        const fullGuild = await guild.fetch();
        guildList.push({
          id: guild.id,
          name: fullGuild.name,
          memberCount: fullGuild.memberCount,
          iconURL: fullGuild.iconURL(),
        });
      }

      return guildList;
    } catch (error) {
      console.error('Error fetching guilds:', error);
      return [];
    }
  }

  disconnect(): void {
    if (this.client) {
      this.client.destroy();
      this.client = null;
      this.isConnected = false;
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  getPing(): number {
    return this.client?.ws.ping || 0;
  }
}

export const discordService = new DiscordService();