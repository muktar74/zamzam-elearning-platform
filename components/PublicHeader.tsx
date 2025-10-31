
import React from 'react';
import { BookOpenIcon } from './icons';

interface PublicHeaderProps {
  setPage: (page: 'home' | 'login' | 'register') => void;
}

const PublicHeader: React.FC<PublicHeaderProps> = ({ setPage }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setPage('home')}
          >
            <BookOpenIcon className="h-8 w-8 text-zamzam-teal-600" />
            <h1 className="text-2xl font-bold text-zamzam-teal-700">
              Zamzam Bank <span className="font-light">E-Learning</span>
            </h1>
          </div>
          <div className="flex items-center space-x-4">
             <button
              onClick={() => setPage('login')}
              className="text-sm font-semibold text-slate-700 hover:text-zamzam-teal-600 transition"
            >
              Login
            </button>
            <button
              onClick={() => setPage('register')}
              className="rounded-md bg-zamzam-teal-600 py-2 px-4 text-sm font-semibold text-white hover:bg-zamzam-teal-700 transition"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;