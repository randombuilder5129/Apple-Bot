import { pgTable, text, serial, integer, boolean, timestamp, real, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table for multi-user support
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  username: varchar("username").notNull(),
  discordId: varchar("discord_id").unique(),
  robloxId: varchar("roblox_id").unique(),
  profileImageUrl: varchar("profile_image_url"),
  isOwner: boolean("is_owner").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bot status and announcements (owner-only controls)
export const botStatus = pgTable("bot_status", {
  id: serial("id").primaryKey(),
  status: text("status").notNull(), // "online", "maintenance", "offline"
  statusMessage: text("status_message"),
  announcement: text("announcement"),
  updatedBy: varchar("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Discord servers/guilds
export const discordServers = pgTable("discord_servers", {
  id: varchar("id").primaryKey(), // Discord guild ID
  name: text("name").notNull(),
  memberCount: integer("member_count").default(0),
  iconUrl: text("icon_url"),
  isActive: boolean("is_active").default(true),
  addedAt: timestamp("added_at").defaultNow(),
});

// User permissions for specific Discord servers
export const userServerPermissions = pgTable("user_server_permissions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  serverId: varchar("server_id").references(() => discordServers.id),
  canManageRules: boolean("can_manage_rules").default(false),
  canViewStats: boolean("can_view_stats").default(true),
  canManageSettings: boolean("can_manage_settings").default(false),
  grantedBy: varchar("granted_by").references(() => users.id),
  grantedAt: timestamp("granted_at").defaultNow(),
});

export const bots = pgTable("bots", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  token: text("token").notNull(),
  isConnected: boolean("is_connected").default(false),
  lastConnected: timestamp("last_connected"),
  ping: integer("ping").default(0),
  serverCount: integer("server_count").default(0),
  userCount: integer("user_count").default(0),
  commandsExecuted: integer("commands_executed").default(0),
  uptime: real("uptime").default(0),
});

export const rules = pgTable("rules", {
  id: serial("id").primaryKey(),
  serverId: varchar("server_id").references(() => discordServers.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // "COMMAND" or "AUTO"
  description: text("description").notNull(),
  permission: text("permission"),
  trigger: text("trigger"),
  usageCount: integer("usage_count").default(0),
  triggerCount: integer("trigger_count").default(0),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const statistics = pgTable("statistics", {
  id: serial("id").primaryKey(),
  serverId: varchar("server_id").references(() => discordServers.id),
  date: timestamp("date").notNull(),
  serverCount: integer("server_count").default(0),
  userCount: integer("user_count").default(0),
  commandsExecuted: integer("commands_executed").default(0),
});

export const uptimeRecords = pgTable("uptime_records", {
  id: serial("id").primaryKey(),
  serverId: varchar("server_id").references(() => discordServers.id),
  date: timestamp("date").notNull(),
  uptime: real("uptime").notNull(), // percentage
  incidents: integer("incidents").default(0),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  serverPermissions: many(userServerPermissions),
  createdRules: many(rules),
}));

export const discordServersRelations = relations(discordServers, ({ many }) => ({
  userPermissions: many(userServerPermissions),
  rules: many(rules),
  statistics: many(statistics),
  uptimeRecords: many(uptimeRecords),
}));

export const userServerPermissionsRelations = relations(userServerPermissions, ({ one }) => ({
  user: one(users, {
    fields: [userServerPermissions.userId],
    references: [users.id],
  }),
  server: one(discordServers, {
    fields: [userServerPermissions.serverId],
    references: [discordServers.id],
  }),
}));

export const rulesRelations = relations(rules, ({ one }) => ({
  server: one(discordServers, {
    fields: [rules.serverId],
    references: [discordServers.id],
  }),
  creator: one(users, {
    fields: [rules.createdBy],
    references: [users.id],
  }),
}));

// Schema exports
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBotStatusSchema = createInsertSchema(botStatus).omit({
  id: true,
  updatedAt: true,
});

export const insertDiscordServerSchema = createInsertSchema(discordServers).omit({
  addedAt: true,
});

export const insertUserServerPermissionSchema = createInsertSchema(userServerPermissions).omit({
  id: true,
  grantedAt: true,
});

export const insertBotSchema = createInsertSchema(bots).omit({
  id: true,
  lastConnected: true,
  isConnected: true,
  ping: true,
  serverCount: true,
  userCount: true,
  commandsExecuted: true,
  uptime: true,
});

export const insertRuleSchema = createInsertSchema(rules).omit({
  id: true,
  usageCount: true,
  triggerCount: true,
  createdAt: true,
});

export const insertStatisticsSchema = createInsertSchema(statistics).omit({
  id: true,
});

export const insertUptimeRecordSchema = createInsertSchema(uptimeRecords).omit({
  id: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;

export type BotStatus = typeof botStatus.$inferSelect;
export type InsertBotStatus = z.infer<typeof insertBotStatusSchema>;

export type DiscordServer = typeof discordServers.$inferSelect;
export type InsertDiscordServer = z.infer<typeof insertDiscordServerSchema>;

export type UserServerPermission = typeof userServerPermissions.$inferSelect;
export type InsertUserServerPermission = z.infer<typeof insertUserServerPermissionSchema>;

export type InsertBot = z.infer<typeof insertBotSchema>;
export type Bot = typeof bots.$inferSelect;
export type InsertRule = z.infer<typeof insertRuleSchema>;
export type Rule = typeof rules.$inferSelect;
export type InsertStatistics = z.infer<typeof insertStatisticsSchema>;
export type Statistics = typeof statistics.$inferSelect;
export type InsertUptimeRecord = z.infer<typeof insertUptimeRecordSchema>;
export type UptimeRecord = typeof uptimeRecords.$inferSelect;
