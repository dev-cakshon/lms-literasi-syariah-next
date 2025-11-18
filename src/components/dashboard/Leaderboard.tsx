import { Award,Medal, Trophy } from 'lucide-react';

interface LeaderboardUser {
  id: string;
  name: string;
  points: number;
  avatar?: string;
  rank: number;
}

interface LeaderboardProps {
  users?: LeaderboardUser[];
}

export const Leaderboard = ({ users }: LeaderboardProps) => {
  // Dummy data for demonstration
  const defaultUsers: LeaderboardUser[] = [
    { id: '1', name: 'Ahmad Rizki', points: 2850, rank: 1 },
    { id: '2', name: 'Fatimah Zahra', points: 2720, rank: 2 },
    { id: '3', name: 'Umar Hassan', points: 2690, rank: 3 },
    { id: '4', name: 'Aisyah Nur', points: 2450, rank: 4 },
    { id: '5', name: 'Khalid Ibrahim', points: 2380, rank: 5 },
    { id: '6', name: 'Zainab Ali', points: 2210, rank: 6 },
    { id: '7', name: 'Yusuf Malik', points: 2180, rank: 7 },
    { id: '8', name: 'Maryam Saleh', points: 2050, rank: 8 },
  ];

  const leaderboardData = users || defaultUsers;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 2:
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 3:
        return 'bg-amber-100 text-amber-700 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Award className="w-6 h-6 text-emerald-600" />
        <h2 className="text-2xl font-bold text-gray-800">Leaderboard</h2>
      </div>

      <div className="space-y-3">
        {leaderboardData.map((user) => (
          <div
            key={user.id}
            className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-md ${
              user.rank <= 3 ? 'bg-gradient-to-r from-slate-50 to-white' : 'bg-white'
            }`}
          >
            <div className="flex items-center gap-4 flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold ${getRankBadgeColor(user.rank)}`}
              >
                {user.rank <= 3 ? getRankIcon(user.rank) : `#${user.rank}`}
              </div>

              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-semibold">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{user.name}</p>
                  <p className="text-sm text-gray-500">Rank #{user.rank}</p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-lg font-bold text-emerald-600">{user.points.toLocaleString()}</p>
              <p className="text-xs text-gray-500">points</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
