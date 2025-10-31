
import React, { useState } from 'react';
import { BookOpenIcon } from './icons';

interface RegisterProps {
  onRegister: (name: string, email: string, password: string) => Promise<void>;
  setPage: (page: 'home' | 'login' | 'register') => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, setPage }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onRegister(name, email, password);
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center mb-6">
            <div className="flex items-center space-x-3 mb-4">
                <BookOpenIcon className="h-10 w-10 text-zamzam-teal-600" />
                <h1 className="text-3xl font-bold text-zamzam-teal-700">
                    Create Your Account
                </h1>
            </div>
            <p className="text-slate-500">Register to start your learning journey</p>
        </div>

      <form onSubmit={handleSubmit}>
         <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zamzam-teal-500 bg-white"
            placeholder="Aisha Ahmed"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zamzam-teal-500 bg-white"
            placeholder="aisha.ahmed@zamzambank.com"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password"className="block text-sm font-medium text-slate-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zamzam-teal-500 bg-white"
            placeholder="••••••••"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-zamzam-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-zamzam-teal-700 transition duration-300 disabled:bg-slate-400"
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
       <p className="text-center text-sm text-slate-600 mt-6">
            Already have an account?{' '}
            <button onClick={() => setPage('login')} className="font-semibold text-zamzam-teal-600 hover:text-zamzam-teal-700">
                Login here
            </button>
        </p>
    </div>
  );
};

export default Register;
