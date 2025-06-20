import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import StatisticsCards from "@/components/statistics-cards";
import CommandUsageChart from "@/components/command-usage-chart";
import ServerGrowthChart from "@/components/server-growth-chart";
import RulesManagement from "@/components/rules-management";
import UptimeMonitor from "@/components/uptime-monitor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Server, Users, Settings, BarChart3, Clock, CheckCircle, LogOut, User } from "lucide-react";
import type { DiscordServer } from "@shared/schema";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [selectedServer, setSelectedServer] = useState<DiscordServer | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  const { data: servers = [], isLoading, error } = useQuery<DiscordServer[]>({
    queryKey: ["/api/servers"],
  });

  const { data: botStatus } = useQuery<{ status: string; statusMessage?: string; announcement?: string }>({
    queryKey: ["/api/bot-status"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading servers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <Alert className="max-w-md border-red-800 bg-red-900/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load servers. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="flex-1 p-6">
          {!selectedServer ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Apple Bot Dashboard</h1>
                  <p className="text-gray-400 mt-2">
                    Manage Discord servers, track statistics, and monitor performance
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{user?.username}#{user?.discriminator}</span>
                  </div>
                  <Button
                    onClick={logout}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>

              {botStatus && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Bot Status</CardTitle>
                    <CardDescription>
                      Current status: <span className={`font-semibold ${
                        botStatus.status === 'online' ? 'text-green-400' : 
                        botStatus.status === 'idle' ? 'text-yellow-400' : 
                        'text-red-400'
                      }`}>
                        {botStatus.status}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  {botStatus.statusMessage && (
                    <CardContent>
                      <p className="text-gray-300">{botStatus.statusMessage}</p>
                    </CardContent>
                  )}
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {servers.map((server: DiscordServer) => (
                  <Card 
                    key={server.id} 
                    className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer"
                    onClick={() => setSelectedServer(server)}
                  >
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        {server.iconUrl ? (
                          <img 
                            src={server.iconUrl} 
                            alt={server.name} 
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                            <Server className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-white text-lg">{server.name}</CardTitle>
                          <CardDescription className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{(server.memberCount || 0).toLocaleString()} members</span>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          server.isActive ? 'bg-green-800 text-green-200' : 'bg-gray-700 text-gray-300'
                        }`}>
                          {server.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <Settings className="w-4 h-4 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">{selectedServer.name}</h1>
                  <p className="text-gray-400 mt-2">
                    Server ID: {selectedServer.id} • {(selectedServer.memberCount || 0).toLocaleString()} members
                  </p>
                </div>
                <button
                  onClick={() => setSelectedServer(null)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Back to Overview
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="border-b border-gray-700">
                <nav className="flex space-x-8">
                  <button 
                    onClick={() => setActiveTab("dashboard")}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                      activeTab === "dashboard" 
                        ? "border-blue-400 text-blue-400" 
                        : "border-transparent text-gray-400 hover:text-white"
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Dashboard</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab("settings")}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                      activeTab === "settings" 
                        ? "border-blue-400 text-blue-400" 
                        : "border-transparent text-gray-400 hover:text-white"
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Bot Settings</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab("rules")}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                      activeTab === "rules" 
                        ? "border-blue-400 text-blue-400" 
                        : "border-transparent text-gray-400 hover:text-white"
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Rules & Commands</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab("analytics")}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                      activeTab === "analytics" 
                        ? "border-blue-400 text-blue-400" 
                        : "border-transparent text-gray-400 hover:text-white"
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Analytics</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab("uptime")}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                      activeTab === "uptime" 
                        ? "border-blue-400 text-blue-400" 
                        : "border-transparent text-gray-400 hover:text-white"
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>Uptime Monitor</span>
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              {activeTab === "dashboard" && (
                <div className="space-y-6">
                  <StatisticsCards bot={selectedServer} />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <CommandUsageChart botId={selectedServer.id} />
                    <ServerGrowthChart botId={selectedServer.id} />
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="space-y-6">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Bot Settings for {selectedServer.name}</CardTitle>
                      <CardDescription>Configure bot behavior and permissions for this server</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Bot Prefix</label>
                          <input 
                            type="text" 
                            defaultValue="!" 
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Auto-moderation</label>
                          <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                            <option value="enabled">Enabled</option>
                            <option value="disabled">Disabled</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
                          Save Settings
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "rules" && (
                <div className="space-y-6">
                  <RulesManagement botId={selectedServer.id} />
                </div>
              )}

              {activeTab === "analytics" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">Analytics for {selectedServer.name}</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <CommandUsageChart botId={selectedServer.id} />
                    <ServerGrowthChart botId={selectedServer.id} />
                  </div>
                  <StatisticsCards bot={selectedServer} />
                </div>
              )}

              {activeTab === "uptime" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">Uptime Monitor for {selectedServer.name}</h2>
                  <UptimeMonitor botId={selectedServer.id} />
                </div>
              )}
            </div>
          )}
        </main>
    </div>
  );
}