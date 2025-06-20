import { 
  users, discordServers, userServerPermissions, botStatus, rules, statistics, uptimeRecords,
  type User, type UpsertUser, type DiscordServer, type InsertDiscordServer,
  type UserServerPermission, type InsertUserServerPermission, type BotStatus, type InsertBotStatus,
  type Rule, type InsertRule, type Statistics, type InsertStatistics,
  type UptimeRecord, type InsertUptimeRecord
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  getUserByRobloxId(robloxId: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Discord server operations
  getDiscordServer(id: string): Promise<DiscordServer | undefined>;
  getAllDiscordServers(): Promise<DiscordServer[]>;
  upsertDiscordServer(server: InsertDiscordServer): Promise<DiscordServer>;
  
  // User server permissions
  getUserServerPermissions(userId: string, serverId: string): Promise<UserServerPermission | undefined>;
  getUserServers(userId: string): Promise<DiscordServer[]>;
  grantServerPermission(permission: InsertUserServerPermission): Promise<UserServerPermission>;
  
  // Bot status operations
  getBotStatus(): Promise<BotStatus | undefined>;
  updateBotStatus(status: InsertBotStatus): Promise<BotStatus>;
  
  // Rule operations
  getRule(id: number): Promise<Rule | undefined>;
  getRulesByServerId(serverId: string): Promise<Rule[]>;
  createRule(rule: InsertRule): Promise<Rule>;
  updateRule(id: number, updates: Partial<Rule>): Promise<Rule | undefined>;
  deleteRule(id: number): Promise<boolean>;
  
  // Statistics operations
  getStatisticsByServerId(serverId: string, limit?: number): Promise<Statistics[]>;
  createStatistics(stats: InsertStatistics): Promise<Statistics>;
  
  // Uptime operations
  getUptimeRecordsByServerId(serverId: string, limit?: number): Promise<UptimeRecord[]>;
  createUptimeRecord(record: InsertUptimeRecord): Promise<UptimeRecord>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.discordId, discordId));
    return user;
  }

  async getUserByRobloxId(robloxId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.robloxId, robloxId));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Discord server operations
  async getDiscordServer(id: string): Promise<DiscordServer | undefined> {
    const [server] = await db.select().from(discordServers).where(eq(discordServers.id, id));
    return server;
  }

  async getAllDiscordServers(): Promise<DiscordServer[]> {
    return await db.select().from(discordServers).where(eq(discordServers.isActive, true));
  }

  async upsertDiscordServer(serverData: InsertDiscordServer): Promise<DiscordServer> {
    const [server] = await db
      .insert(discordServers)
      .values(serverData)
      .onConflictDoUpdate({
        target: discordServers.id,
        set: {
          name: serverData.name,
          memberCount: serverData.memberCount,
          iconUrl: serverData.iconUrl,
        },
      })
      .returning();
    return server;
  }

  // User server permissions
  async getUserServerPermissions(userId: string, serverId: string): Promise<UserServerPermission | undefined> {
    const [permission] = await db
      .select()
      .from(userServerPermissions)
      .where(and(
        eq(userServerPermissions.userId, userId),
        eq(userServerPermissions.serverId, serverId)
      ));
    return permission;
  }

  async getUserServers(userId: string): Promise<DiscordServer[]> {
    const userServers = await db
      .select({
        server: discordServers
      })
      .from(userServerPermissions)
      .innerJoin(discordServers, eq(userServerPermissions.serverId, discordServers.id))
      .where(eq(userServerPermissions.userId, userId));
    
    return userServers.map(row => row.server);
  }

  async grantServerPermission(permissionData: InsertUserServerPermission): Promise<UserServerPermission> {
    const [permission] = await db
      .insert(userServerPermissions)
      .values(permissionData)
      .returning();
    return permission;
  }

  // Bot status operations
  async getBotStatus(): Promise<BotStatus | undefined> {
    const [status] = await db
      .select()
      .from(botStatus)
      .orderBy(desc(botStatus.updatedAt))
      .limit(1);
    return status;
  }

  async updateBotStatus(statusData: InsertBotStatus): Promise<BotStatus> {
    const [status] = await db
      .insert(botStatus)
      .values(statusData)
      .returning();
    return status;
  }

  // Rule operations
  async getRule(id: number): Promise<Rule | undefined> {
    const [rule] = await db.select().from(rules).where(eq(rules.id, id));
    return rule;
  }

  async getRulesByServerId(serverId: string): Promise<Rule[]> {
    return await db.select().from(rules).where(eq(rules.serverId, serverId));
  }

  async createRule(ruleData: InsertRule): Promise<Rule> {
    const [rule] = await db
      .insert(rules)
      .values({
        ...ruleData,
        usageCount: 0,
        triggerCount: 0,
        createdAt: new Date(),
      })
      .returning();
    return rule;
  }

  async updateRule(id: number, updates: Partial<Rule>): Promise<Rule | undefined> {
    const [rule] = await db
      .update(rules)
      .set(updates)
      .where(eq(rules.id, id))
      .returning();
    return rule;
  }

  async deleteRule(id: number): Promise<boolean> {
    const result = await db.delete(rules).where(eq(rules.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Statistics operations
  async getStatisticsByServerId(serverId: string, limit = 10): Promise<Statistics[]> {
    return await db
      .select()
      .from(statistics)
      .where(eq(statistics.serverId, serverId))
      .orderBy(desc(statistics.date))
      .limit(limit);
  }

  async createStatistics(statsData: InsertStatistics): Promise<Statistics> {
    const [stats] = await db
      .insert(statistics)
      .values(statsData)
      .returning();
    return stats;
  }

  // Uptime operations
  async getUptimeRecordsByServerId(serverId: string, limit = 30): Promise<UptimeRecord[]> {
    return await db
      .select()
      .from(uptimeRecords)
      .where(eq(uptimeRecords.serverId, serverId))
      .orderBy(desc(uptimeRecords.date))
      .limit(limit);
  }

  async createUptimeRecord(recordData: InsertUptimeRecord): Promise<UptimeRecord> {
    const [record] = await db
      .insert(uptimeRecords)
      .values(recordData)
      .returning();
    return record;
  }
}

export const storage = new DatabaseStorage();