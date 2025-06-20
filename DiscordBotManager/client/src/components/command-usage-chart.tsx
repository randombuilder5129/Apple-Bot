import { useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface Statistics {
  id: number;
  serverId: string;
  date: string;
  commandCount: number;
  userCount: number;
  serverCount: number;
  createdAt: string;
}

interface CommandUsageChartProps {
  botId: string;
}

declare global {
  interface Window {
    Chart: any;
  }
}

export default function CommandUsageChart({ botId }: CommandUsageChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  const { data: statistics, isLoading } = useQuery<Statistics[]>({
    queryKey: ["/api/servers", botId, "statistics"],
  });

  useEffect(() => {
    const loadChartJS = async () => {
      if (typeof window !== "undefined" && !window.Chart) {
        const { default: Chart } = await import("chart.js/auto");
        window.Chart = Chart;
      }
    };
    loadChartJS();
  }, []);

  useEffect(() => {
    if (!statistics || !canvasRef.current || !window.Chart) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const sortedStats = [...statistics].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const labels = sortedStats.map(stat => 
      new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );
    const data = sortedStats.map(stat => stat.commandCount || 0);

    chartRef.current = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Commands Used',
          data,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#ffffff'
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#9ca3af'
            },
            grid: {
              color: 'rgba(156, 163, 175, 0.1)'
            }
          },
          y: {
            ticks: {
              color: '#9ca3af'
            },
            grid: {
              color: 'rgba(156, 163, 175, 0.1)'
            }
          }
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [statistics]);

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Command Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle>Command Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <canvas ref={canvasRef}></canvas>
        </div>
      </CardContent>
    </Card>
  );
}