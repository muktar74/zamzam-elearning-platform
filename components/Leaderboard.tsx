
import React from 'react';
import { User } from '../types';
import { ChevronLeftIcon, TrophyIcon, UsersIcon } from './icons';

interface LeaderboardProps {
  users: User[];
  onBack?: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ users, onBack }) => {
  const sortedUsers = [...users].sort((a, b) => b.points - a.points);

  const rankColors = [
    'bg-amber-400 text-amber-900', // 1st
    'bg-slate-300 text-slate-800', // 2nd
    'bg-yellow-600 text-white',      // 3rd
  ];

  return (
    <div>
        {onBack && (
            <button onClick={onBack} className="flex items-center text-sm font-medium text-zamzam-teal-600 hover:text-zamzam-teal-800 mb-6 transition">
                <ChevronLeftIcon className="h-5 w-5 mr-1" />
                Back to Dashboard
            </button>
        )}

        <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-center mb-8">
                <TrophyIcon className="h-16 w-16 mx-auto text-amber-500" />
                <h2 className="text-3xl font-bold text-slate-800 mt-4">Top Learners Leaderboard</h2>
                <p className="text-lg text-slate-600">See who's leading the way in our learning community!</p>
            </div>

            {sortedUsers.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider w-16">Rank</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employee</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Points</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {sortedUsers.map((user, index) => (
                            <tr key={user.id} className={index < 3 ? 'bg-yellow-50' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold ${index < 3 ? rankColors[index] : 'bg-slate-100 text-slate-600'}`}>
                                        {index + 1}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-slate-900">{user.name}</div>
                                    <div className="text-sm text-slate-500">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-lg font-bold text-zamzam-teal-600">{user.points}</td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-slate-50 rounded-lg">
                    <UsersIcon className="h-12 w-12 mx-auto text-slate-400" />
                    <h3 className="text-xl font-semibold text-slate-700 mt-4">Leaderboard is Empty</h3>
                    <p className="text-slate-500 mt-2">No employee data to display yet. Complete courses to start earning points!</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default Leaderboard;