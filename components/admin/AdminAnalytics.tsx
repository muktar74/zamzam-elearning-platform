import React, { useState, useMemo } from 'react';
import { Course, User, UserRole, AllUserProgress, Toast, DiscussionPost, UserProgress } from '../../types';
import { BookOpenIcon, UsersIcon, CheckCircleIcon, StarIcon, SparklesIcon } from '../icons';
import { analyzeDiscussionTopics } from '../../services/geminiService';

interface AdminAnalyticsProps {
  courses: Course[];
  users: User[];
  allUserProgress: AllUserProgress;
  addToast: (message: string, type: Toast['type']) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow flex items-start space-x-4">
        <div className="bg-zamzam-teal-100 text-zamzam-teal-600 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-3xl font-bold text-slate-800">{value}</p>
            <p className="text-sm font-medium text-slate-500">{title}</p>
        </div>
    </div>
);

const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ courses, users, allUserProgress, addToast }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analyzedTopics, setAnalyzedTopics] = useState<string[]>([]);

    const employeeUsers = useMemo(() => users.filter(u => u.role === UserRole.EMPLOYEE), [users]);

    const totalCompletions = useMemo(() => {
        return Object.values(allUserProgress).reduce((acc: number, userProgress: UserProgress) => {
            const completedCount = Object.values(userProgress).filter(p => p.quizScore !== null).length;
            return acc + completedCount;
        }, 0);
    }, [allUserProgress]);
    
    const averageRating = useMemo(() => {
        const allReviews = courses.flatMap(c => c.reviews);
        if (allReviews.length === 0) return 0;
        const totalRating = allReviews.reduce((acc: number, review) => acc + review.rating, 0);
        return (totalRating / allReviews.length);
    }, [courses]);

    const handleAnalyzeDiscussions = async () => {
        setIsAnalyzing(true);
        setAnalyzedTopics([]);
        addToast("Analyzing discussion topics with AI...", 'info');
        try {
            const allPosts: DiscussionPost[] = courses.flatMap(c => c.discussion);
            const flattenReplies = (posts: DiscussionPost[]): string[] => {
                let texts: string[] = [];
                posts.forEach(p => {
                    texts.push(`${p.authorName}: ${p.text}`);
                    if(p.replies && p.replies.length > 0) {
                        texts = texts.concat(flattenReplies(p.replies));
                    }
                });
                return texts;
            };
            const discussionText = flattenReplies(allPosts).join('\n');
            if (!discussionText.trim()) {
                addToast("There are no discussions to analyze.", 'info');
                setIsAnalyzing(false);
                return;
            }
            const topics = await analyzeDiscussionTopics(discussionText);
            setAnalyzedTopics(topics);
            addToast("Discussion analysis complete!", 'success');
        } catch (error: any) {
            addToast(error.message || "Failed to analyze topics.", 'error');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Platform Analytics</h2>
            <p className="text-lg text-slate-600 mb-8">An overview of user engagement and course performance.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Employees" value={employeeUsers.length} icon={<UsersIcon className="h-6 w-6"/>} />
                <StatCard title="Total Courses" value={courses.length} icon={<BookOpenIcon className="h-6 w-6"/>} />
                <StatCard title="Total Completions" value={totalCompletions} icon={<CheckCircleIcon className="h-6 w-6"/>} />
                <StatCard title="Average Rating" value={averageRating.toFixed(1)} icon={<StarIcon className="h-6 w-6"/>} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
                <h3 className="text-xl font-bold text-slate-800 mb-4">AI-Powered Discussion Analysis</h3>
                <p className="text-sm text-slate-600 mb-4">Use Gemini to analyze all discussion forums and identify key topics, questions, and pain points.</p>
                <button
                    onClick={handleAnalyzeDiscussions}
                    disabled={isAnalyzing}
                    className="flex items-center bg-zamzam-teal-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-zamzam-teal-700 transition disabled:bg-slate-400"
                >
                    <SparklesIcon className="h-5 w-5 mr-2" />
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Topics'}
                </button>
                { (isAnalyzing || analyzedTopics.length > 0) && (
                    <div className="mt-6">
                        <h4 className="font-semibold text-slate-700">Analysis Results:</h4>
                         {isAnalyzing && <p className="text-slate-500">Processing data, this may take a moment...</p>}
                        {analyzedTopics.length > 0 && (
                            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-600">
                                {analyzedTopics.map((topic, index) => <li key={index}>{topic}</li>)}
                            </ul>
                        )}
                         {analyzedTopics.length === 0 && !isAnalyzing && <p className="text-slate-500 mt-2">No topics found or analysis not yet run.</p>}
                    </div>
                )}
            </div>
        </div>
    );
  };
  
  export default AdminAnalytics;