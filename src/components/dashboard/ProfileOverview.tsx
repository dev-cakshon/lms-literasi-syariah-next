import { TrendingUp,User } from 'lucide-react';

interface ProfileOverviewProps {
  name?: string;
  level?: number;
  currentXP?: number;
  nextLevelXP?: number;
  avatar?: string;
}

export const ProfileOverview = ({
  name = 'Muhammad Farrel',
  level = 12,
  currentXP = 2450,
  nextLevelXP = 3000,
  avatar,
}: ProfileOverviewProps) => {
  const progressPercentage = (currentXP / nextLevelXP) * 100;

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      <div className="flex flex-col items-center">
        {/* Avatar */}
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-12 h-12" />
            )}
          </div>
          {/* Level Badge */}
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-lg border-4 border-white">
            {level}
          </div>
        </div>

        {/* Name */}
        <h3 className="text-xl font-bold text-gray-800 mb-1">{name}</h3>
        <p className="text-sm text-gray-500 mb-4">Level {level} - Pelajar Ekonomi Syariah</p>

        {/* XP Progress */}
        <div className="w-full mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-gray-600">Experience</span>
            <span className="text-xs font-bold text-emerald-600">
              {currentXP} / {nextLevelXP} XP
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-center gap-1 mt-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span className="text-xs text-gray-500">
              {nextLevelXP - currentXP} XP to level {level + 1}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-100">
            <p className="text-2xl font-bold text-blue-600">4</p>
            <p className="text-xs text-gray-600">Kursus</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-3 border border-emerald-100">
            <p className="text-2xl font-bold text-emerald-600">2</p>
            <p className="text-xs text-gray-600">Selesai</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100">
            <p className="text-2xl font-bold text-purple-600">28</p>
            <p className="text-xs text-gray-600">Bab</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-3 border border-orange-100">
            <p className="text-2xl font-bold text-orange-600">42j</p>
            <p className="text-xs text-gray-600">Belajar</p>
          </div>
        </div>
      </div>
    </div>
  );
};
