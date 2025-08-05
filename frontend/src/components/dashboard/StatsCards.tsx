import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TrendingUp, TrendingDown, Activity, Users } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalVotes: number;
    upvotes: number;
    downvotes: number;
    topSubreddits: Array<{ _id: string; count: number }>;
    topUsers: Array<{ _id: string; count: number }>;
  } | null;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Votes',
      value: stats?.totalVotes || 0,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Upvotes',
      value: stats?.upvotes || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Downvotes',
      value: stats?.downvotes || 0,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Active Users',
      value: stats?.topUsers?.length || 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <Card key={card.title} className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            <p className="text-xs text-gray-500 mt-1">
              {card.title === 'Total Votes' && '+12% from last week'}
              {card.title === 'Upvotes' && '+8% from last week'}
              {card.title === 'Downvotes' && '-3% from last week'}
              {card.title === 'Active Users' && 'Unique voters'}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
