import React from 'react';
import { User, Course, AllUserProgress, UserRole } from '../../types';

interface AdminReportsProps {
  users: User[];
  courses: Course[];
  allUserProgress: AllUserProgress;
}

const AdminReports: React.FC<AdminReportsProps> = ({ users, courses, allUserProgress }) => {
  
  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        let cell = row[header] === null || row[header] === undefined ? '' : String(row[header]);
        cell = cell.replace(/"/g, '""'); // Escape double quotes
        if (cell.includes(',') || cell.includes('\n') || cell.includes('\r')) {
          cell = `"${cell}"`;
        }
        return cell;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadUserReport = () => {
    const data = users.map(user => ({
      'UserID': user.id,
      'Name': user.name,
      'Email': user.email,
      'Role': user.role,
      'Status': user.approved ? 'Approved' : 'Pending',
      'RegistrationDate': user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
      'Points': user.points,
    }));
    downloadCSV(data, 'user_registration_report.csv');
  };

  const handleDownloadCompletionReport = () => {
    const data: any[] = [];
    users.filter(u => u.role === UserRole.EMPLOYEE).forEach(user => {
      const userProgress = allUserProgress[user.id];
      if (userProgress) {
        courses.forEach(course => {
          const courseProgress = userProgress[course.id];
          if (courseProgress && courseProgress.quizScore !== null) {
            data.push({
              'EmployeeName': user.name,
              'EmployeeEmail': user.email,
              'CourseTitle': course.title,
              'QuizScore(%)': courseProgress.quizScore,
              'CompletionDate': courseProgress.completionDate ? new Date(courseProgress.completionDate).toLocaleDateString() : 'N/A',
            });
          }
        });
      }
    });
    downloadCSV(data, 'course_completion_report.csv');
  };
  
  const handleDownloadPerformanceReport = () => {
    const data = courses.map(course => {
        let enrollees = 0;
        let completions = 0;
        const courseScores: number[] = [];
        
        users.filter(u => u.role === UserRole.EMPLOYEE).forEach(user => {
            const progress = allUserProgress[user.id]?.[course.id];
            if (progress && (progress.completedModules.length > 0 || progress.quizScore !== null)) {
                enrollees++;
                if (progress.quizScore !== null) {
                    completions++;
                    courseScores.push(progress.quizScore);
                }
            }
        });
        
        const completionRate = enrollees > 0 ? ((completions / enrollees) * 100).toFixed(0) : 0;
        const avgCourseScore = courseScores.length > 0 ? (courseScores.reduce((a, b) => a + b, 0) / courseScores.length).toFixed(0) : 0;
        
        return {
            'CourseTitle': course.title,
            'Enrollees': enrollees,
            'Completions': completions,
            'CompletionRate(%)': completionRate,
            'AverageScore(%)': avgCourseScore
        };
    });
    downloadCSV(data, 'course_performance_report.csv');
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-800 mb-2">Generate Reports</h2>
      <p className="text-lg text-slate-600 mb-8">Download platform data as CSV files for analysis and record-keeping.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* User Report Card */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-bold text-slate-800 mb-2">User Registration Report</h3>
          <p className="text-sm text-slate-600 mb-4 h-16">A complete list of all registered users, their roles, points, and approval status.</p>
          <button
            onClick={handleDownloadUserReport}
            className="w-full bg-zamzam-teal-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-zamzam-teal-700 transition"
          >
            Download CSV
          </button>
        </div>

        {/* Completion Report Card */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-bold text-slate-800 mb-2">Course Completion Report</h3>
          <p className="text-sm text-slate-600 mb-4 h-16">Detailed report of which employees have completed courses, including scores and dates.</p>
          <button
            onClick={handleDownloadCompletionReport}
            className="w-full bg-zamzam-teal-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-zamzam-teal-700 transition"
          >
            Download CSV
          </button>
        </div>

        {/* Performance Report Card */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-bold text-slate-800 mb-2">Course Performance Report</h3>
          <p className="text-sm text-slate-600 mb-4 h-16">An overview of course enrollment, completion rates, and average scores.</p>
          <button
            onClick={handleDownloadPerformanceReport}
            className="w-full bg-zamzam-teal-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-zamzam-teal-700 transition"
          >
            Download CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;