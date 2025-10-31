
import React, { useState } from 'react';
import { User, UserRole, NotificationType, Toast } from '../../types';
import { PaperAirplaneIcon } from '../icons';

interface AdminNotificationsProps {
  users: User[];
  createNotification: (userId: string, type: NotificationType, message: string) => void;
  addToast: (message: string, type: Toast['type']) => void;
}

const AdminNotifications: React.FC<AdminNotificationsProps> = ({ users, createNotification, addToast }) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [message, setMessage] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  
  const employeeUsers = users.filter(u => u.role === UserRole.EMPLOYEE);

  const handleSendNotification = () => {
    if (!message.trim()) {
        addToast('Notification message cannot be empty.', 'error');
        return;
    }
    
    setIsSending(true);

    setTimeout(() => { // Simulate network delay for better UX
        if (selectedUserId === 'all') {
            employeeUsers.forEach(user => {
                createNotification(user.id, NotificationType.ADMIN_MESSAGE, message);
            });
            addToast('Notification sent to all employees.', 'success');
        } else {
            const user = users.find(u => u.id === selectedUserId);
            if(user) {
                createNotification(user.id, NotificationType.ADMIN_MESSAGE, message);
                addToast(`Notification sent to ${user.name}.`, 'success');
            } else {
                 addToast(`Could not find the selected user.`, 'error');
            }
        }
    
        setMessage('');
        setSelectedUserId('all');
        setIsSending(false);
    }, 500);

  };


  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-800 mb-2">Send Notification</h2>
      <p className="text-lg text-slate-600 mb-8">Communicate directly with employees by sending custom notifications.</p>

      <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
        <div className="mb-6">
            <label htmlFor="recipient" className="block text-sm font-medium text-slate-700 mb-1">
                Recipient
            </label>
            <select
                id="recipient"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zamzam-teal-500 bg-white"
            >
                <option value="all">All Employees</option>
                {employeeUsers.map(user => (
                    <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                ))}
            </select>
        </div>
        
        <div className="mb-6">
            <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
                Message
            </label>
            <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zamzam-teal-500 bg-white"
                placeholder="Write your notification message here..."
            />
        </div>

        <div className="text-right">
            <button
                onClick={handleSendNotification}
                disabled={isSending || !message.trim()}
                className="inline-flex items-center bg-zamzam-teal-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-zamzam-teal-700 transition shadow-sm disabled:bg-slate-400"
            >
                <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                {isSending ? 'Sending...' : 'Send Notification'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
