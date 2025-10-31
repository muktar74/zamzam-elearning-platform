
import React, { useEffect, useState } from 'react';
import { Toast as ToastType } from '../types';
import { CheckCircleIcon, XMarkIcon, BookOpenIcon } from './icons';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => onRemove(toast.id), 300); // Wait for fade out animation
    }, 5000); // 5 seconds duration

    return () => {
      clearTimeout(timer);
    };
  }, [toast.id, onRemove]);

  const handleRemove = () => {
      setIsFadingOut(true);
      setTimeout(() => onRemove(toast.id), 300);
  };
  
  const animationClasses = isFadingOut ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0';
  
  const typeStyles: {[key in ToastType['type']]: { icon: React.ReactNode, progressBg: string }} = {
      success: {
          icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
          progressBg: 'bg-green-500/50'
      },
      error: {
          icon: <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center"><XMarkIcon className="w-4 h-4 text-red-600" /></div>,
          progressBg: 'bg-red-500/50'
      },
      info: {
          icon: <BookOpenIcon className="w-6 h-6 text-blue-500" />,
          progressBg: 'bg-blue-500/50'
      },
  };

  return (
    <div className={`relative overflow-hidden w-full max-w-xs bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 transition-all duration-300 ${animationClasses}`}>
        <div className="flex items-start p-4 space-x-3">
            <div className="flex-shrink-0 pt-0.5">
                {typeStyles[toast.type].icon}
            </div>
            <div className="text-sm font-medium flex-grow text-slate-800">{toast.message}</div>
            <button onClick={handleRemove} className="p-1 -m-1 rounded-full hover:bg-slate-100 flex-shrink-0">
                 <XMarkIcon className="w-5 h-5 text-slate-400 hover:text-slate-600"/>
            </button>
        </div>
         <div className={`absolute bottom-0 left-0 h-1 ${typeStyles[toast.type].progressBg} animate-progress-bar`}></div>
    </div>
  );
};

export default Toast;