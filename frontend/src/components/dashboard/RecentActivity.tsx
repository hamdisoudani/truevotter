import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Vote {
  id: string;
  postId: string;
  postTitle: string;
  postUrl: string;
  subreddit: string;
  username: string;
  voteType: 'upvote' | 'downvote' | 'none';
  timestamp: string;
}

interface RecentActivityProps {
  votes: Vote[];
}

export function RecentActivity({ votes }: RecentActivityProps) {
  const getVoteColor = (voteType: string) => {
    switch (voteType) {
      case 'upvote':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'downvote':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getVoteIcon = (voteType: string) => {
    switch (voteType) {
      case 'upvote':
        return '↑';
      case 'downvote':
        return '↓';
      default:
        return '○';
    }
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Recent Activity</CardTitle>
        <CardDescription>Latest vote tracking activity</CardDescription>
      </CardHeader>
      <CardContent>
        {votes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Activity className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">No votes tracked yet</p>
            <p className="text-sm text-gray-400">
              Install the Chrome extension and start voting on Reddit to see data here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {votes.slice(0, 8).map((vote) => (
              <div key={vote.id} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {vote.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {vote.postTitle}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500">r/{vote.subreddit}</span>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-gray-500">by u/{vote.username}</span>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-gray-500">
                      {vote.timestamp && !isNaN(new Date(vote.timestamp).getTime()) 
                        ? formatDistanceToNow(new Date(vote.timestamp), { addSuffix: true })
                        : 'Unknown time'
                      }
                    </span>
                  </div>
                </div>
                
                <Badge className={`${getVoteColor(vote.voteType)} font-medium`}>
                  {getVoteIcon(vote.voteType)} {vote.voteType}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
