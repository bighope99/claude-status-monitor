import { useWebSocket } from '../hooks/useWebSocket';
import { SummaryCards } from './SummaryCards';
import { SessionList } from './SessionList';

export const Dashboard: React.FC = () => {
  const { sessions, isConnected } = useWebSocket();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Claude Code Monitor</h1>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-sm text-gray-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <SummaryCards sessions={sessions} />

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Active Sessions</h2>
          <SessionList sessions={sessions} />
        </div>
      </div>
    </div>
  );
};
