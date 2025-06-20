import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Statistics } from "@shared/schema";

interface ServerGrowthChartProps {
  botId: string;
}

export default function ServerGrowthChart({ botId }: ServerGrowthChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  const { data: statistics, isLoading } = useQuery<Statistics[]>({
    queryKey: ["/api/servers", botId, "statistics"],
    enabled: !!botId,
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
    const data = sortedStats.map(stat => stat.serverCount);

    chartRef.current = new window.Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Servers",
          data,
          borderColor: "#43B581",
          backgroundColor: "rgba(67, 181, 129, 0.1)",
          tension: 0.4,
          fill: true,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "#36393F" },
            ticks: { color: "#99AAB5" },
          },
          x: {
            grid: { color: "#36393F" },
            ticks: { color: "#99AAB5" },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [statistics]);

  if (isLoading) {
    return (
      <Card className="discord-medium border-gray-700">
        <CardHeader>
          <CardTitle>Server Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-discord-blurple border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="discord-medium border-gray-700">
      <CardHeader>
        <CardTitle>Server Growth</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <canvas ref={canvasRef}></canvas>
        </div>
      </CardContent>
    </Card>
  );
}