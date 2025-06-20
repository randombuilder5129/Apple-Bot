import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Server } from "lucide-react";

interface Guild {
  id: string;
  name: string;
  memberCount: number;
  iconURL: string | null;
}

export default function DiscordGuilds() {
  const { data: guilds, isLoading, error } = useQuery<Guild[]>({
    queryKey: ["/api/discord/guilds"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card className="discord-medium border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="w-5 h-5 mr-2 text-discord-blurple" />
            Connected Servers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-4 border-discord-blurple border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="discord-medium border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="w-5 h-5 mr-2 text-discord-blurple" />
            Connected Servers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="discord-light">Failed to load Discord servers.</p>
            <p className="text-sm discord-light mt-2">Make sure your bot is connected.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="discord-medium border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Server className="w-5 h-5 mr-2 text-discord-blurple" />
            Connected Servers
          </div>
          <Badge variant="secondary">{guilds?.length || 0} servers</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {guilds?.map((guild) => (
            <div key={guild.id} className="discord-dark rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {guild.iconURL ? (
                  <img 
                    src={guild.iconURL} 
                    alt={guild.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 discord-blurple rounded-full flex items-center justify-center">
                    <Server className="w-4 h-4 text-white" />
                  </div>
                )}
                <div>
                  <h4 className="font-medium">{guild.name}</h4>
                  <div className="flex items-center space-x-1 text-sm discord-light">
                    <Users className="w-3 h-3" />
                    <span>{guild.memberCount} members</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {!guilds?.length && (
            <div className="text-center py-8">
              <p className="discord-light">No servers found.</p>
              <p className="text-sm discord-light mt-2">Your bot needs to be added to Discord servers.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}