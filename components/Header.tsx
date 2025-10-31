
import React, { useState, useRef, useEffect } from 'react';
import { User, Notification } from '../types';
import { BookOpenIcon, UserCircleIcon, LogoutIcon, BellIcon, CheckCircleIcon, TrophyIcon, BookOpenIcon as LibraryIcon } from './icons';

interface HeaderProps {
  user: User;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  onLogout: () => void;
  onNavigate: (view: 'dashboard' | 'admin' | 'leaderboard' | 'resources' | 'courses' | 'profile') => void;
}

const Header: React.FC<HeaderProps> = ({ user, notifications, setNotifications, onLogout, onNavigate }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBellClick = () => {
    setShowNotifications(prev => !prev);
    if (showUserMenu) setShowUserMenu(false);
    if (!showNotifications && unreadCount > 0) {
        // Mark all as read when opening
        setNotifications(prev => prev.map(n => n.userId === user.id ? {...n, read: true} : n));
    }
  };

  const handleUserMenuClick = () => {
    setShowUserMenu(prev => !prev);
    if (showNotifications) setShowNotifications(false);
  }

  const getRoleSpecificView = () => {
    return user.role === 'Admin' ? 'admin' : 'dashboard';
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => onNavigate(getRoleSpecificView())}
          >
            <BookOpenIcon className="h-8 w-8 text-zamzam-teal-600" />
            <h1 className="text-2xl font-bold text-zamzam-teal-700">
              Zamzam Bank <span className="font-light">E-Learning</span>
            </h1>
          </div>
          <nav className="flex items-center space-x-4">
            {user.role === 'Employee' && (
              <>
                <button onClick={() => onNavigate('dashboard')} className="text-sm font-semibold text-slate-600 hover:text-zamzam-teal-600 transition">Dashboard</button>
                <button onClick={() => onNavigate('courses')} className="text-sm font-semibold text-slate-600 hover:text-zamzam-teal-600 transition">Courses</button>
                <button onClick={() => onNavigate('leaderboard')} className="text-sm font-semibold text-slate-600 hover:text-zamzam-teal-600 transition">Leaderboard</button>
                <button onClick={() => onNavigate('resources')} className="text-sm font-semibold text-slate-600 hover:text-zamzam-teal-600 transition">Resource Library</button>
              </>
            )}

            <div className="relative" ref={notificationRef}>
                <button onClick={handleBellClick} className="relative p-2 rounded-full hover:bg-slate-100">
                    <BellIcon className="h-6 w-6 text-slate-500" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </button>
                {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
                        <div className="p-3 border-b">
                            <h3 className="font-semibold text-slate-800">Notifications</h3>
                        </div>
                        <ul className="max-h-96 overflow-y-auto">
                            {notifications.length > 0 ? notifications.map(notif => (
                                <li key={notif.id} className="border-b p-3 hover:bg-slate-50">
                                    <p className="text-sm text-slate-700">{notif.message}</p>
                                    <p className="text-xs text-slate-400 mt-1">{new Date(notif.timestamp).toLocaleString()}</p>
                                </li>
                            )) : (
                                <li className="p-4 text-center text-sm text-slate-500">No new notifications.</li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
            
            <div className="relative" ref={userMenuRef}>
                <button onClick={handleUserMenuClick} className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100">
                    {user.profileImageUrl ? (
                        <img src={user.profileImageUrl} alt="Profile" className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                        <UserCircleIcon className="h-9 w-9 text-slate-500" />
                    )}
                    <div className="text-right hidden sm:block">
                        <p className="font-semibold text-slate-700 text-sm">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.role}</p>
                    </div>
                </button>

                {showUserMenu && (
                     <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
                        <ul>
                            <li>
                                <button
                                    onClick={() => { onNavigate('profile'); setShowUserMenu(false); }}
                                    className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                    <UserCircleIcon className="h-5 w-5 text-slate-500" />
                                    <span>View Profile</span>
                                </button>
                            </li>
                             <li>
                                <button
                                    onClick={onLogout}
                                    className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                    <LogoutIcon className="h-5 w-5 text-slate-500" />
                                    <span>Logout</span>
                                </button>
                            </li>
                        </ul>
                     </div>
                )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;