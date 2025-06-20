import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Bot } from "@shared/schema";

interface BotConnectionCardProps {
  bot: Bot;
}

export default function BotConnectionCard({ bot }: BotConnectionCardProps) {
  const [token, setToken] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const connectMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await apiRequest("POST", `/api/bots/${bot.id}/connect`, { token });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
      toast({
        title: "Bot Connected",
        description: "Your bot has been successfully connected!",
      });
      setToken("");
    },
    onError: () => {
      toast({
        title: "Connection Failed",
        description: "Failed to connect your bot. Please check your token.",
        variant: "destructive",
      });
    },
  });

  const handleConnect = () => {
    if (!token.trim()) {
      toast({
        title: "Token Required",
        description: "Please enter a bot token to connect.",
        variant: "destructive",
      });
      return;
    }
    connectMutation.mutate(token);
  };

  return (
    <Card className="mb-8 discord-medium border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-semibold">
          <Link className="w-6 h-6 mr-2 text-discord-blurple" />
          Bot Connection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Bot Token</label>
            <div className="flex space-x-3">
              <Input
                type="password"
                placeholder="Enter your bot token..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="flex-1 discord-dark border-gray-600 text-white placeholder-discord-light focus:border-discord-blurple"
              />
              <Button 
                onClick={handleConnect}
                disabled={connectMutation.isPending || Boolean(bot.isConnected)}
                className="discord-blurple hover:bg-blue-600 transition-colors"
              >
                {connectMutation.isPending ? "Connecting..." : bot.isConnected ? "Connected" : "Connect"}
              </Button>
            </div>
            <p className="discord-light text-sm mt-2">
              {bot.isConnected 
                ? "Discord bot is connected and active" 
                : "Your token is encrypted and stored securely"
              }
            </p>
          </div>
          <div className="discord-dark rounded-lg p-4">
            <h4 className="font-medium mb-3">Connection Info</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="discord-light">Status:</span>
                <span className={bot.isConnected ? "text-discord-green" : "text-gray-500"}>
                  {bot.isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="discord-light">Bot Name:</span>
                <span>{bot.name || "Not connected"}</span>
              </div>
              <div className="flex justify-between">
                <span className="discord-light">Servers:</span>
                <span>{bot.serverCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="discord-light">Total Users:</span>
                <span>{bot.userCount?.toLocaleString() || "0"}</span>
              </div>
              <div className="flex justify-between">
                <span className="discord-light">Ping:</span>
                <span>{bot.ping || 0}ms</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
