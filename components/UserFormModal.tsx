
import React, { useState, useEffect } from 'react';
import { User, UserRole, Toast } from '../types';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User, password?: string) => Promise<void>;
  user: User | null;
  addToast: (message: string, type: Toast['type']) => void;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSave, user, addToast }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPassword(''); // Don't pre-fill password for security
    } else {
      setName('');
      setEmail('');
      setPassword('');
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || (!user && !password)) {
        addToast("Please fill out all fields.", "error");
        return;
    }
    
    const savedUser: User = {
        id: user?.id || '', // id will be set by auth/db
        name,
        email,
        role: user?.role || UserRole.EMPLOYEE,
        approved: user?.approved,
        points: user?.points || 0,
        badges: user?.badges || [],
        profileImageUrl: user?.profileImageUrl,
    };

    setIsSaving(true);
    try {
        await onSave(savedUser, password);
    } catch (error) {
        // Error is handled and toasted in the parent component
    } finally {
        setIsSaving(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">{user ? 'Edit Employee' : 'Add New Employee'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zamzam-teal-500 bg-white"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zamzam-teal-500 bg-white disabled:bg-slate-100"
              required
              disabled={!!user} // prevent changing email for existing user
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password"className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!user} // Password is required only for new users
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zamzam-teal-500 bg-white"
                placeholder={user ? "Enter new password to change" : "Create a password"}
            />
            {user && <p className="text-xs text-slate-500 mt-1">Leave blank to keep the current password.</p>}
          </div>

          <div className="flex justify-end items-center space-x-4 mt-8">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="px-6 py-2 text-sm font-semibold text-white bg-zamzam-teal-600 rounded-md hover:bg-zamzam-teal-700 transition disabled:bg-slate-400">
                {isSaving ? 'Saving...' : (user ? 'Save Changes' : 'Create User')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
