import { useAuth } from '../auth/AuthProvider';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';

interface WelcomeSectionProps {
  stats: {
    totalVotes: number;
    upvotes: number;
    downvotes: number;
  } | null;
}

export function WelcomeSection({ stats }: WelcomeSectionProps) {
  const { user } = useAuth();
  
  const progressValue = stats ? Math.min((stats.totalVotes / 100) * 100, 100) : 0;
  
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-lg">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.username}! 👋
            </h1>
            <p className="text-gray-600">
              Track and analyze your Reddit vote activity with ease
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {stats?.totalVotes || 0}
            </div>
            <p className="text-sm text-gray-500">Total Votes</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Vote Progress</span>
            <span className="text-sm text-gray-500">{progressValue}%</span>
          </div>
          <Progress value={progressValue} className="h-2" />
          
          <div className="flex gap-4 mt-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {stats?.upvotes || 0} Upvotes
            </Badge>
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              {stats?.downvotes || 0} Downvotes
            </Badge>
            {!user?.redditUsername && (
              <Badge variant="outline" className="border-orange-300 text-orange-700">
                Reddit Not Linked
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
