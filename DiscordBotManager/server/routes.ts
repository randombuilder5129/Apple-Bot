import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRuleSchema } from "@shared/schema";
import { discordService } from "./discord";
import { DiscordAuth, requireAuth } from "./auth";
import session from "express-session";
import connectPg from "connect-pg-simple";
import crypto from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  const discordAuth = new DiscordAuth();

  // Initialize Discord bot with environment token if available
  const discordToken = process.env.DISCORD_BOT_TOKEN;
  if (discordToken) {
    try {
      await discordService.connect(discordToken);
      console.log('Discord bot initialized with environment token');

      // Sync Discord servers to database
      const guilds = await discordService.getGuildsList();
      for (const guild of guilds) {
        await storage.upsertDiscordServer({
          id: guild.id,
          name: guild.name,
          memberCount: guild.memberCount,
          iconUrl: guild.iconURL,
          isActive: true,
        });
      }

      // Auto-update bot status every 10 minutes
      setInterval(async () => {
        try {
          if (discordService.getConnectionStatus()) {
            const botInfo = await discordService.getBotInfo();
            if (botInfo) {
              // Update bot status in storage
              await storage.updateBotStatus({
                status: 'online',
                statusMessage: `Connected - ${botInfo.ping}ms ping`,
                announcement: null,
                updatedBy: 'system',
              });
              console.log(`Bot status updated: ${botInfo.ping}ms ping, ${botInfo.serverCount} servers`);
            }
          } else {
            await storage.updateBotStatus({
              status: 'offline',
              statusMessage: 'Bot disconnected',
              announcement: null,
              updatedBy: 'system',
            });
            console.log('Bot status updated: offline');
          }
        } catch (error) {
          console.error('Failed to update bot status:', error);
        }
      }, 10 * 60 * 1000); // 10 minutes
    } catch (error) {
      console.error('Failed to initialize Discord bot:', error);
    }
  }

  // Session configuration
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
const sessionStore = new pgStore({
  conString: process.env.DATABASE_URL,
  createTableIfMissing: true,
  ttl: sessionTtl,
  tableName: "sessions",
});

  app.set("trust proxy", 1);
  app.use(session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: sessionTtl,
    },
  }));

  // Auth routes
  app.get("/auth/discord", (req, res) => {
    const state = crypto.randomBytes(16).toString('hex');
    req.session.oauthState = state;
    const authUrl = discordAuth.getAuthUrl(state);
    res.redirect(authUrl);
  });

  app.get("/auth/discord/callback", async (req, res) => {
    try {
      const { code, state, error } = req.query;

      if (error) {
        console.error('Discord OAuth error:', error);
        return res.redirect('/?error=access_denied');
      }

      if (!code || !state) {
        return res.redirect('/?error=invalid_request');
      }

      if (state !== req.session.oauthState) {
        return res.redirect('/?error=state_mismatch');
      }

      const accessToken = await discordAuth.exchangeCodeForToken(code as string);
      const user = await discordAuth.getUserInfo(accessToken);
      const guilds = await discordAuth.getUserGuilds(accessToken);

      // Store user in session
      req.session.user = {
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        avatar: user.avatar,
        email: user.email,
      };

      // Filter guilds where user has moderator+ permissions
      const moderatorGuilds = guilds.filter(guild => discordAuth.hasModeratorPermissions(guild));

      // Get bot's guild list to check which servers have the Apple bot
      const botGuilds = await discordService.getGuildsList();
      const botGuildIds = botGuilds.map(g => g.id);

      // Only include guilds where user is moderator+ AND bot is present
      const serversWithBot = moderatorGuilds
        .filter(guild => botGuildIds.includes(guild.id))
        .map(guild => {
          const botGuild = botGuilds.find(g => g.id === guild.id);
          return {
            id: guild.id,
            name: guild.name,
            iconUrl: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : null,
            memberCount: botGuild?.memberCount || 0,
            isActive: true,
          };
        });

      // Store servers in database
      for (const server of serversWithBot) {
        await storage.storeDiscordServer(server);
      }

      req.session.userServers = serversWithBot;
      delete req.session.oauthState;

      res.redirect('/');
    } catch (error) {
      console.error('Discord OAuth callback error:', error);
      res.redirect('/?error=auth_failed');
    }
  });

  app.get("/auth/user", (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    res.json(req.session.user);
  });

  app.post("/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  // Get user's Discord servers
  app.get("/api/servers", requireAuth, async (req, res) => {
    try {
      const servers = req.session.userServers || [];
      res.json(servers);
    } catch (error) {
      console.error('Failed to fetch servers:', error);
      res.status(500).json({ error: "Failed to fetch servers" });
    }
  });

  // Get Discord server details
  app.get("/api/servers/:id", requireAuth, async (req, res) => {
    try {
      const id = req.params.id;
      const server = await storage.getDiscordServer(id);
      if (!server) {
        return res.status(404).json({ error: "Server not found" });
      }
      res.json(server);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch server" });
    }
  });

  // Bot status routes
  app.get("/api/bot-status", async (req, res) => {
    try {
      const status = await storage.getBotStatus();
      res.json(status || { status: "online", statusMessage: null, announcement: null });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bot status" });
    }
  });

  app.post("/api/bot-status", async (req, res) => {
    try {
      // Check if user is owner (implement auth middleware later)
      const status = await storage.updateBotStatus({
        status: req.body.status,
        statusMessage: req.body.statusMessage,
        announcement: req.body.announcement,
        updatedBy: "owner", // Replace with actual user ID from session
      });
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to update bot status" });
    }
  });

  // Rule routes (now server-based)
  app.get("/api/servers/:serverId/rules", requireAuth, async (req, res) => {
    try {
      const serverId = req.params.serverId;
      const rules = await storage.getRulesByServerId(serverId);
      res.json(rules || []);
    } catch (error) {
      console.error('Error fetching rules:', error);
      res.status(500).json({ error: "Failed to fetch rules" });
    }
  });

  app.post("/api/servers/:serverId/rules", requireAuth, async (req, res) => {
    try {
      const serverId = req.params.serverId;
      const validatedData = insertRuleSchema.parse({
        ...req.body,
        serverId,
        createdBy: req.session.user.id,
      });
      const rule = await storage.createRule(validatedData);
      res.status(201).json(rule);
    } catch (error) {
      res.status(400).json({ error: "Invalid rule data" });
    }
  });

  app.patch("/api/rules/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const rule = await storage.updateRule(id, req.body);
      if (!rule) {
        return res.status(404).json({ error: "Rule not found" });
      }
      res.json(rule);
    } catch (error) {
      res.status(500).json({ error: "Failed to update rule" });
    }
  });

  app.delete("/api/rules/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteRule(id);
      if (!deleted) {
        return res.status(404).json({ error: "Rule not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete rule" });
    }
  });

  // Statistics routes (server-based)
  app.get("/api/servers/:serverId/statistics", requireAuth, async (req, res) => {
    try {
      const serverId = req.params.serverId;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const statistics = await storage.getStatisticsByServerId(serverId, limit);
      res.json(statistics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // Commands routes (server-based)
  app.get("/api/servers/:serverId/commands", requireAuth, async (req, res) => {
    try {
      const serverId = req.params.serverId;
      // Mock command usage data for now
      const commandUsage = [
        { command: "help", usage: 45, trend: 12 },
        { command: "music", usage: 32, trend: -5 },
        { command: "moderation", usage: 28, trend: 8 },
        { command: "utility", usage: 19, trend: 3 },
        { command: "fun", usage: 15, trend: -2 },
      ];
      res.json(commandUsage);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch command usage" });
    }
  });

  // Uptime routes (server-based)
  app.get("/api/servers/:serverId/uptime", requireAuth, async (req, res) => {
    try {
      const serverId = req.params.serverId;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 30;
      const uptimeRecords = await storage.getUptimeRecordsByServerId(serverId, limit);
      res.json(uptimeRecords);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch uptime records" });
    }
  });

  // Get Discord guilds/servers
  app.get("/api/discord/guilds", async (req, res) => {
    try {
      if (!discordService.getConnectionStatus()) {
        return res.status(400).json({ error: "Discord bot not connected" });
      }

      const guilds = await discordService.getGuildsList();
      res.json(guilds);
    } catch (error) {
      console.error('Error fetching Discord guilds:', error);
      res.status(500).json({ error: "Failed to fetch Discord guilds" });
    }
  });

  // Get real-time bot stats
  app.get("/api/discord/stats", async (req, res) => {
    try {
      if (!discordService.getConnectionStatus()) {
        return res.status(400).json({ error: "Discord bot not connected" });
      }

      const botInfo = await discordService.getBotInfo();
      res.json(botInfo);
    } catch (error) {
      console.error('Error fetching Discord stats:', error);
      res.status(500).json({ error: "Failed to fetch Discord stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
