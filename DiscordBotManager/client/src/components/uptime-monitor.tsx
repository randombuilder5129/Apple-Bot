import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface UptimeRecord {
  id: number;
  serverId: string;
  timestamp: string;
  status: string;
  responseTime: number;
  createdAt: string;
}

interface UptimeMonitorProps {
  botId: string;
}

export default function UptimeMonitor({ botId }: UptimeMonitorProps) {
  const { data: uptimeRecords, isLoading } = useQuery<UptimeRecord[]>({
    queryKey: ["/api/servers", botId, "uptime"],
    enabled: !!botId,
  });

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Uptime Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const calculateUptime = () => {
    if (!uptimeRecords || uptimeRecords.length === 0) return 0;
    const onlineRecords = uptimeRecords.filter(record => record.status === 'online');
    const result = (onlineRecords.length / uptimeRecords.length) * 100;
    return isNaN(result) ? 0 : result;
  };

  const getAverageResponseTime = () => {
    if (!uptimeRecords || uptimeRecords.length === 0) return 0;
    const validResponses = uptimeRecords.filter(record => 
      record.responseTime != null && !isNaN(record.responseTime) && record.responseTime > 0
    );
    if (validResponses.length === 0) return 0;
    const total = validResponses.reduce((sum, record) => sum + record.responseTime, 0);
    const result = Math.round(total / validResponses.length);
    return isNaN(result) ? 0 : result;
  };

  const uptime = calculateUptime();
  const avgResponseTime = getAverageResponseTime();

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle>Uptime Monitor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {uptime.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-400">Uptime</p>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {avgResponseTime}ms
            </div>
            <p className="text-sm text-gray-400">Avg Response</p>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {uptimeRecords?.length || 0}
            </div>
            <p className="text-sm text-gray-400">Total Checks</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-white">Recent Status</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {uptimeRecords && uptimeRecords.length > 0 ? (
              uptimeRecords.slice(0, 10).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {record.status === 'online' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <div>
                      <Badge 
                        variant={record.status === 'online' ? 'default' : 'destructive'}
                        className={record.status === 'online' ? 'bg-green-800 text-green-200' : ''}
                      >
                        {record.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {record.responseTime && !isNaN(record.responseTime) && record.responseTime > 0
                          ? `${record.responseTime}ms` 
                          : 'N/A'
                        }
                      </span>
                    </div>
                    <span>
                      {new Date(record.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-400">
                No uptime records available
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}