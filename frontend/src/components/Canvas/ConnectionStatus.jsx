import React from 'react';
import { Badge } from '../ui/badge';
import { WifiOff, Wifi, Loader2, AlertCircle } from 'lucide-react';

export default function ConnectionStatus({ status }) {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: Wifi,
          label: 'Connected',
          className: 'bg-[var(--success)] text-white',
        };
      case 'connecting':
      case 'reconnecting':
        return {
          icon: Loader2,
          label: status === 'connecting' ? 'Connecting...' : 'Reconnecting...',
          className: 'bg-[var(--warning)] text-white',
          animate: true,
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          label: 'Disconnected',
          className: 'bg-[var(--slate-500)] text-white',
        };
      case 'error':
        return {
          icon: AlertCircle,
          label: 'Error',
          className: 'bg-[var(--error)] text-white',
        };
      default:
        return {
          icon: Wifi,
          label: 'Unknown',
          className: 'bg-[var(--slate-500)] text-white',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div 
      data-testid="connection-status"
      className="fixed top-4 right-4 z-50"
    >
      <Badge 
        data-testid={`connection-status-${status}`}
        className={`${config.className} px-3 py-1.5 text-xs font-medium flex items-center gap-2 shadow-md`}
      >
        <Icon 
          className={`w-3.5 h-3.5 ${config.animate ? 'animate-spin' : ''}`}
          strokeWidth={2}
        />
        {config.label}
      </Badge>
    </div>
  );
}
