import type { Session } from '../types';
import { StatusBadge } from './StatusBadge';

interface SessionCardProps {
  session: Session;
}

export const SessionCard: React.FC<SessionCardProps> = ({ session }) => {
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const pendingCount = session.todos.filter(t => t.status === 'pending').length;
  const inProgressCount = session.todos.filter(t => t.status === 'in_progress').length;
  const completedCount = session.todos.filter(t => t.status === 'completed').length;
  const totalTodos = session.todos.length;

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">
            {session.projectName}
          </h3>
          <p className="text-xs text-gray-500 truncate">
            {session.projectPath}
          </p>
        </div>
        <StatusBadge status={session.status} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-gray-900/50 rounded p-2">
          <p className="text-xs text-gray-400 mb-1">Cost</p>
          <p className="text-sm font-semibold text-blue-400">
            ${session.cost.toFixed(4)}
          </p>
        </div>

        <div className="bg-gray-900/50 rounded p-2">
          <p className="text-xs text-gray-400 mb-1">Tokens</p>
          <p className="text-sm font-semibold text-purple-400">
            {(session.inputTokens + session.outputTokens).toLocaleString()}
          </p>
        </div>
      </div>

      {totalTodos > 0 && (
        <div className="bg-gray-900/50 rounded p-2 mb-3">
          <p className="text-xs text-gray-400 mb-2">Todo Progress</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">
              Pending: <span className="text-yellow-400 font-medium">{pendingCount}</span>
            </span>
            <span className="text-gray-500">
              In Progress: <span className="text-blue-400 font-medium">{inProgressCount}</span>
            </span>
            <span className="text-gray-500">
              Done: <span className="text-green-400 font-medium">{completedCount}</span>
            </span>
          </div>
          <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${(completedCount / totalTodos) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500">
        Last updated: {formatTimestamp(session.lastUpdated)}
      </div>

      {session.sessionId && (
        <div className="text-xs text-gray-600 mt-1 truncate">
          Session: {session.sessionId}
        </div>
      )}
    </div>
  );
};
