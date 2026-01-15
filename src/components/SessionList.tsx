import type { Session } from '../types';
import { SessionCard } from './SessionCard';

interface SessionListProps {
  sessions: Session[];
}

export const SessionList: React.FC<SessionListProps> = ({ sessions }) => {
  if (sessions.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
        <p className="text-gray-400">No active sessions</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sessions.map((session) => (
        <SessionCard key={session.projectPath} session={session} />
      ))}
    </div>
  );
};
