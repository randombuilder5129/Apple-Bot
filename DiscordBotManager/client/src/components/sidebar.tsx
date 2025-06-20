import { Monitor, Settings, CheckCircle, BarChart3, Clock } from "lucide-react";
import type { DiscordServer } from "@shared/schema";

interface SidebarProps {
  currentBot?: DiscordServer;
}

export default function Sidebar({ currentBot }: SidebarProps) {
  return (
    <aside className="w-64 discord-medium border-r border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 discord-blurple rounded-lg flex items-center justify-center">
            <Monitor className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">BotDash</h1>
            <p className="discord-light text-sm">Bot Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          <a href="#" className="flex items-center space-x-3 p-3 discord-blurple rounded-lg text-white">
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </a>
          <a href="#" className="flex items-center space-x-3 p-3 discord-light hover:bg-gray-700 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Bot Settings</span>
          </a>
          <a href="#" className="flex items-center space-x-3 p-3 discord-light hover:bg-gray-700 rounded-lg transition-colors">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Rules & Commands</span>
          </a>
          <a href="#" className="flex items-center space-x-3 p-3 discord-light hover:bg-gray-700 rounded-lg transition-colors">
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Analytics</span>
          </a>
          <a href="#" className="flex items-center space-x-3 p-3 discord-light hover:bg-gray-700 rounded-lg transition-colors">
            <Clock className="w-5 h-5" />
            <span className="font-medium">Uptime Monitor</span>
          </a>
        </div>
      </nav>

      {/* Server Status */}
      <div className="p-4 border-t border-gray-700">
        <div className="discord-dark rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`w-3 h-3 rounded-full ${currentBot?.isActive ? 'bg-discord-green animate-pulse' : 'bg-gray-500'}`}></div>
            <span className="text-sm font-medium">{currentBot?.isActive ? 'Active' : 'Inactive'}</span>
          </div>
          <p className="discord-light text-xs">{currentBot?.name || 'No server selected'}</p>
        </div>
      </div>
    </aside>
  );
}
