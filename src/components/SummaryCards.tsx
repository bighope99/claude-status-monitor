import type { Session } from '../types';

interface SummaryCardsProps {
  sessions: Session[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ sessions }) => {
  const runningCount = sessions.filter(s => s.status === 'running').length;
  const waitingCount = sessions.filter(s => s.status === 'waiting').length;

  const totalCost = sessions.reduce((sum, session) => sum + session.cost, 0);
  const totalTokens = sessions.reduce((sum, session) => {
    return sum + session.inputTokens + session.outputTokens;
  }, 0);

  const cards = [
    {
      title: 'Running Sessions',
      value: runningCount,
      bgColor: 'bg-green-500/20',
      textColor: 'text-green-400',
      borderColor: 'border-green-500/50'
    },
    {
      title: 'Waiting Sessions',
      value: waitingCount,
      bgColor: 'bg-yellow-500/20',
      textColor: 'text-yellow-400',
      borderColor: 'border-yellow-500/50'
    },
    {
      title: 'Total Cost',
      value: `$${totalCost.toFixed(4)}`,
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500/50'
    },
    {
      title: 'Total Tokens',
      value: totalTokens.toLocaleString(),
      bgColor: 'bg-purple-500/20',
      textColor: 'text-purple-400',
      borderColor: 'border-purple-500/50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.bgColor} ${card.borderColor} border rounded-lg p-4`}
        >
          <h3 className="text-sm font-medium text-gray-400 mb-2">
            {card.title}
          </h3>
          <p className={`text-2xl font-bold ${card.textColor}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
};
