
import React, { useState, useRef } from 'react';
import { User, Toast } from '../types';
import { ChevronLeftIcon, UserCircleIcon, PencilIcon, CameraIcon } from './icons';
import { BADGE_DEFINITIONS } from '../constants';
import { supabase } from '../services/supabaseClient';

interface UserProfileProps {
  user: User;
  onUpdateUser: (updatedUser: User) => Promise<void>;
  onBack: () => void;
  addToast: (message: string, type: Toast['type']) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdateUser, onBack, addToast }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [photo, setPhoto] = useState(user.profileImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      addToast("Image file is too large. Please use a file smaller than 2MB.", 'error');
      return;
    }

    try {
      const fileName = `${user.id}-${Date.now()}`;
      const { data, error } = await supabase.storage
        .from('assets')
        .upload(`public/${fileName}`, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(data.path);

      setPhoto(publicUrl);
      addToast("Profile picture updated.", 'success');
    } catch (error: any) {
      addToast(`Error uploading image: ${error.message}`, 'error');
    }
  };

  const handleSaveChanges = async () => {
    if (name.trim() === '' || email.trim() === '') {
      addToast("Name and email cannot be empty.", 'error');
      return;
    }
    setIsSaving(true);
    await onUpdateUser({ ...user, name, email, profileImageUrl: photo });
    setIsEditing(false);
    setIsSaving(false);
  };

  const handleCancelEdit = () => {
    setName(user.name);
    setEmail(user.email);
    setPhoto(user.profileImageUrl);
    setIsEditing(false);
  }

  return (
    <div>
        <button onClick={onBack} className="flex items-center text-sm font-medium text-zamzam-teal-600 hover:text-zamzam-teal-800 mb-6 transition">
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            Back to Dashboard
        </button>
        
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8">
                <div className="relative mb-6 md:mb-0">
                    {photo ? (
                        <img src={photo} alt="Profile" className="h-32 w-32 rounded-full object-cover ring-4 ring-zamzam-teal-200" />
                    ) : (
                        <UserCircleIcon className="h-32 w-32 text-slate-300" />
                    )}
                    {isEditing && (
                        <>
                            <input
                                type="file"
                                accept="image/png, image/jpeg"
                                ref={fileInputRef}
                                onChange={handlePhotoUpload}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-1 right-1 bg-white text-slate-700 h-8 w-8 rounded-full shadow-md flex items-center justify-center hover:bg-slate-100 transition"
                                aria-label="Change profile picture"
                            >
                                <CameraIcon className="h-5 w-5" />
                            </button>
                        </>
                    )}
                </div>

                <div className="flex-grow text-center md:text-left">
                    {isEditing ? (
                        <div className="space-y-4">
                             <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full max-w-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zamzam-teal-500 bg-white"
                                />
                            </div>
                             <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled // Email is tied to auth, shouldn't be changed here
                                className="w-full max-w-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zamzam-teal-500 bg-slate-100 disabled:bg-slate-200"
                                />
                            </div>
                        </div>
                    ) : (
                         <>
                            <h2 className="text-3xl font-bold text-slate-800">{user.name}</h2>
                            <p className="text-lg text-slate-500">{user.email}</p>
                            <span className="mt-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-800 px-2 py-1">
                                {user.role}
                            </span>
                        </>
                    )}
                </div>

                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center self-start bg-slate-100 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-200 transition mt-4 md:mt-0"
                    >
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Edit Profile
                    </button>
                )}
            </div>
            
            {isEditing && (
                <div className="flex justify-end items-center space-x-3 mt-6">
                    <button onClick={handleCancelEdit} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition">Cancel</button>
                    <button onClick={handleSaveChanges} disabled={isSaving} className="px-4 py-2 text-sm font-semibold text-white bg-zamzam-teal-600 rounded-md hover:bg-zamzam-teal-700 transition disabled:bg-slate-400">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            )}
            
            <div className="border-t mt-8 pt-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-4">My Stats</h3>
                        <div className="bg-zamzam-teal-50 p-6 rounded-lg text-center">
                            <p className="text-5xl font-bold text-zamzam-teal-700">{user.points}</p>
                            <p className="text-lg font-semibold text-slate-600">Total Points</p>
                        </div>
                    </div>
                     <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-4">My Badges</h3>
                        <div className="bg-slate-50 p-6 rounded-lg">
                            {user.badges.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {user.badges.map(badgeId => {
                                        const badge = BADGE_DEFINITIONS[badgeId];
                                        if (!badge) return null;
                                        const Icon = badge.icon;
                                        return (
                                            <div key={badge.id} className="text-center">
                                                <Icon className="h-12 w-12 mx-auto text-zamzam-teal-600" />
                                                <p className="text-sm font-semibold mt-2">{badge.name}</p>
                                                <p className="text-xs text-slate-500">{badge.description}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-center text-slate-500">You haven't earned any badges yet. Keep learning!</p>
                            )}
                        </div>
                    </div>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default UserProfile;
