import type { SessionStatus } from '../types';

interface StatusBadgeProps {
  status: SessionStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (status: SessionStatus) => {
    switch (status) {
      case 'running':
        return {
          label: 'Running',
          bgColor: 'bg-green-500',
          textColor: 'text-white'
        };
      case 'waiting':
        return {
          label: 'Waiting',
          bgColor: 'bg-yellow-500',
          textColor: 'text-gray-900'
        };
      case 'completed':
        return {
          label: 'Completed',
          bgColor: 'bg-blue-500',
          textColor: 'text-white'
        };
      case 'idle':
        return {
          label: 'Idle',
          bgColor: 'bg-gray-500',
          textColor: 'text-white'
        };
      case 'permission_waiting':
        return {
          label: 'Permission Waiting',
          bgColor: 'bg-orange-500',
          textColor: 'text-white'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}
    >
      {config.label}
    </span>
  );
};
