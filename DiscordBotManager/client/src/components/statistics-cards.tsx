import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, Terminal, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { DiscordServer } from "@shared/schema";

interface StatisticsCardsProps {
  bot: DiscordServer;
}

export default function StatisticsCards({ bot }: StatisticsCardsProps) {
  const { data: statistics } = useQuery({
    queryKey: ["/api/servers", bot?.id, "statistics"],
    enabled: !!bot?.id,
  });

  // Calculate server-specific stats from the statistics data
  const totalCommands = statistics?.reduce((acc: number, stat: any) => acc + (stat.commandsExecuted || 0), 0) || 0;
  const latestStats = statistics && statistics.length > 0 ? statistics[statistics.length - 1] : null;

  if (!bot) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Server Name</p>
              <p className="text-xl font-bold text-white truncate">
                {bot.name}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-green-600 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Server Members</p>
              <div className="text-2xl font-bold text-white">
                {bot && bot.memberCount ? bot.memberCount.toLocaleString() : '0'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Terminal className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Commands Used</p>
              <p className="text-2xl font-bold text-white">
                {totalCommands.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-orange-600 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Status</p>
              <p className="text-xl font-bold text-white">
                {bot.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}