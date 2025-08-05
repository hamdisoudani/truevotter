import { useState, useEffect } from 'react';
import { AuthProvider } from './components/auth/AuthProvider';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { useAuth } from './components/auth/AuthProvider';
import { SidebarProvider, SidebarInset, SidebarTrigger } from './components/ui/sidebar';
import { AppSidebar } from './components/dashboard/Sidebar';
import { WelcomeSection } from './components/dashboard/WelcomeSection';
import { StatsCards } from './components/dashboard/StatsCards';
import { RecentActivity } from './components/dashboard/RecentActivity';
import { Separator } from './components/ui/separator';
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
  const { user, token } = useAuth();

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

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-screen items-center justify-center">
            <div className="text-xl">Loading...</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-screen items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={fetchData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </header>
        
        <div className="flex-1 space-y-6 p-6 overflow-auto">
          <WelcomeSection stats={stats} />
          <StatsCards stats={stats} />
          <RecentActivity votes={votes} />
        </div>
      </SidebarInset>
    </SidebarProvider>
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
