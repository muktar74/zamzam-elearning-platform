import React, { useState } from 'react';
import { Course, User, NotificationType, Toast, AllUserProgress, ExternalResource, CourseCategory, UserRole } from '../types';
import UserManagement from './UserManagement';
import { BookOpenIcon, UsersIcon, ChartBarIcon, DocumentTextIcon, BellIcon, BookOpenIcon as LibraryIcon, TagIcon, TrophyIcon } from './icons';
import CourseManagement from './admin/CourseManagement';
import AdminAnalytics from './admin/AdminAnalytics';
import AdminReports from './admin/AdminReports';
import AdminNotifications from './admin/AdminNotifications';
import ResourceManagement from './admin/ResourceManagement';
import CategoryManagement from './admin/CategoryManagement';
import Leaderboard from './Leaderboard';

interface AdminDashboardProps {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  createNotification: (userId: string, type: NotificationType, message: string) => void;
  addToast: (message: string, type: Toast['type']) => void;
  allUserProgress: AllUserProgress;
  externalResources: ExternalResource[];
  setExternalResources: React.Dispatch<React.SetStateAction<ExternalResource[]>>;
  courseCategories: CourseCategory[];
  setCourseCategories: React.Dispatch<React.SetStateAction<CourseCategory[]>>;
}

type AdminTab = 'courses' | 'users' | 'analytics' | 'reports' | 'notifications' | 'resources' | 'categories' | 'leaderboard';

const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('courses');

  const TabButton: React.FC<{tab: AdminTab, label: string, icon: React.ReactNode}> = ({tab, label, icon}) => (
    <button
        onClick={() => setActiveTab(tab)}
        className={`flex-shrink-0 flex items-center space-x-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === tab
                ? 'border-zamzam-teal-600 text-zamzam-teal-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement {...props} />;
      case 'categories':
        return <CategoryManagement 
                    courseCategories={props.courseCategories} 
                    setCourseCategories={props.setCourseCategories} 
                    courses={props.courses}
                    setCourses={props.setCourses}
                    addToast={props.addToast}
                />;
      case 'analytics':
        return <AdminAnalytics {...props} />;
      case 'reports':
        return <AdminReports {...props} />;
      case 'notifications':
        return <AdminNotifications {...props} />;
      case 'resources':
        return <ResourceManagement {...props} />;
      case 'leaderboard':
        return <Leaderboard users={props.users.filter(u => u.role === UserRole.EMPLOYEE)} />;
      case 'courses':
      default:
        return <CourseManagement {...props} />;
    }
  };

  return (
    <div>
      <div className="border-b border-slate-200 mb-8 bg-white rounded-t-xl shadow">
          <nav className="-mb-px flex flex-wrap gap-y-1 gap-x-2 sm:gap-x-6 px-4 sm:px-6" aria-label="Tabs">
              <TabButton tab="courses" label="Courses" icon={<BookOpenIcon className="h-5 w-5"/>} />
              <TabButton tab="users" label="Users" icon={<UsersIcon className="h-5 w-5"/>} />
              <TabButton tab="categories" label="Categories" icon={<TagIcon className="h-5 w-5"/>} />
              <TabButton tab="resources" label="Resources" icon={<LibraryIcon className="h-5 w-5"/>} />
              <TabButton tab="leaderboard" label="Leaderboard" icon={<TrophyIcon className="h-5 w-5"/>} />
              <TabButton tab="analytics" label="Analytics" icon={<ChartBarIcon className="h-5 w-5"/>} />
              <TabButton tab="reports" label="Reports" icon={<DocumentTextIcon className="h-5 w-5"/>} />
              <TabButton tab="notifications" label="Notifications" icon={<BellIcon className="h-5 w-5"/>} />
          </nav>
      </div>
      
      <div className="p-1">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;