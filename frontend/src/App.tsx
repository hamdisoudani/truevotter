import React, { useState, useEffect } from 'react';
import { AuthProvider } from './components/auth/AuthProvider';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { useAuth } from './components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import './App.css';

const API_BASE_URL = 'http://localhost:8000';

interface Vote {
  id: string;
  postId: string;
  postTitle: string;
  postUrl: string;
  subreddit: string;
  username: string;
  voteType: 'upvote' | 'downvote' | 'none';
  timestamp: string;
  userAgent?: string;
  ipAddress?: string;
}

interface VoteStats {
  totalVotes: number;
  upvotes: number;
  downvotes: number;
  topSubreddits: Array<{ _id: string; count: number }>;
  topUsers: Array<{ _id: string; count: number }>;
}

function Dashboard() {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [stats, setStats] = useState<VoteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, token, logout } = useAuth();

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [votesResponse, statsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/votes`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE_URL}/votes/my-stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      ]);

      if (!votesResponse.ok || !statsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const votesData = await votesResponse.json();
      const statsData = await statsResponse.json();

      setVotes(votesData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getVoteTypeColor = (voteType: string) => {
    if (voteType === 'upvote') return 'bg-green-500';
    if (voteType === 'downvote') return 'bg-red-500';
    return 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchData} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Reddit Vote Tracker
            </h1>
            <p className="text-gray-600">
              Welcome back, {user?.username}! Track and analyze your Reddit vote activity.
            </p>
            {user?.redditUsername && (
              <p className="text-sm text-gray-500">
                Linked Reddit account: u/{user.redditUsername}
              </p>
            )}
          </div>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>

        {!user?.redditUsername && (
          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">Reddit Account Not Linked</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-700 mb-4">
                To start tracking votes, please install the Chrome extension and visit Reddit. 
                The extension will automatically link your Reddit account when you first use it.
              </p>
            </CardContent>
          </Card>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalVotes}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upvotes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.upvotes}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Downvotes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.downvotes}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Recent Votes</CardTitle>
            <CardDescription>Your latest vote tracking activity</CardDescription>
          </CardHeader>
          <CardContent>
            {votes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No votes tracked yet</p>
                <p className="text-sm text-gray-400">
                  Install the Chrome extension and start voting on Reddit to see data here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {votes.slice(0, 10).map((vote) => (
                  <div key={vote.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {vote.postTitle}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>r/{vote.subreddit}</span>
                        <span>by u/{vote.username}</span>
                        <span>{formatDate(vote.timestamp)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${getVoteTypeColor(vote.voteType)} text-white`}>
                        {vote.voteType}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;
