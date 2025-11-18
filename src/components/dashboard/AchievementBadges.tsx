import { Award, BookOpen, CheckCircle,Flame, Star, Target, Trophy, Zap } from 'lucide-react';

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    unlocked: boolean;
    color: string;
    bgColor: string;
}

interface AchievementBadgesProps {
    badges?: Badge[];
}

export const AchievementBadges = ({ badges }: AchievementBadgesProps) => {
    // Dummy data for demonstration
    const defaultBadges: Badge[] = [
        {
            id: '1',
            name: 'Pemula Muamalah',
            description: 'Selesaikan kursus pertama Anda',
            icon: <BookOpen className="w-6 h-6" />,
            unlocked: true,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            id: '2',
            name: 'Pelajar Cepat',
            description: 'Selesaikan 5 bab dalam sehari',
            icon: <Zap className="w-6 h-6" />,
            unlocked: true,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100',
        },
        {
            id: '3',
            name: 'Istiqomah',
            description: 'Belajar 7 hari berturut-turut',
            icon: <Flame className="w-6 h-6" />,
            unlocked: true,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
        },
        {
            id: '4',
            name: 'Nilai Sempurna',
            description: 'Raih skor 100% pada kuis',
            icon: <Star className="w-6 h-6" />,
            unlocked: true,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
        },
        {
            id: '5',
            name: 'Pencapai Target',
            description: 'Selesaikan 10 kursus syariah',
            icon: <Target className="w-6 h-6" />,
            unlocked: true,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-100',
        },
        {
            id: '6',
            name: 'Juara',
            description: 'Masuk 10 besar papan peringkat',
            icon: <Trophy className="w-6 h-6" />,
            unlocked: false,
            color: 'text-gray-400',
            bgColor: 'bg-gray-100',
        },
        {
            id: '7',
            name: 'Master Ekonomi Syariah',
            description: 'Selesaikan 50 kursus',
            icon: <Award className="w-6 h-6" />,
            unlocked: false,
            color: 'text-gray-400',
            bgColor: 'bg-gray-100',
        },
        {
            id: '8',
            name: 'Perfeksionis',
            description: 'Raih 100% di 5 kursus',
            icon: <CheckCircle className="w-6 h-6" />,
            unlocked: false,
            color: 'text-gray-400',
            bgColor: 'bg-gray-100',
        },
    ];

    const badgeData = badges || defaultBadges;
    const unlockedCount = badgeData.filter((b) => b.unlocked).length;

    return (
        <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-800">Achievements</h3>
                    <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                        {unlockedCount}/{badgeData.length}
                    </span>
                </div>
                <p className="text-sm text-gray-500">Unlock badges by completing challenges</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {badgeData.map((badge) => (
                    <div
                        key={badge.id}
                        className={`relative rounded-lg p-4 border-2 transition-all ${badge.unlocked
                                ? 'border-emerald-200 bg-gradient-to-br from-white to-emerald-50 hover:shadow-md'
                                : 'border-gray-200 bg-gray-50 opacity-60'
                            }`}
                    >
                        {badge.unlocked && (
                            <div className="absolute top-2 right-2">
                                <CheckCircle className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                            </div>
                        )}
                        <div
                            className={`w-12 h-12 rounded-full ${badge.bgColor} ${badge.color} flex items-center justify-center mb-3 ${!badge.unlocked && 'grayscale'
                                }`}
                        >
                            {badge.icon}
                        </div>
                        <h4 className={`font-bold text-sm mb-1 ${badge.unlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                            {badge.name}
                        </h4>
                        <p className={`text-xs ${badge.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>{badge.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
