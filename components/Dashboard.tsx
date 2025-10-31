import React, { useState, useMemo } from 'react';
import { Course, UserProgress, User, Badge, CourseCategory } from '../types';
import CourseCard from './CourseCard';
import { SearchIcon, TrophyIcon, BookOpenIcon as LibraryIcon, ShieldCheckIcon } from './icons';
import { BADGE_DEFINITIONS } from '../constants';

type FilterStatus = 'all' | 'inProgress' | 'completed';

interface DashboardProps {
  user: User;
  courses: Course[];
  userProgress: UserProgress;
  onSelectCourse: (course: Course) => void;
  onViewLeaderboard: () => void;
  onViewResources: () => void;
  courseCategories: CourseCategory[];
  showOverview?: boolean;
}

const BadgesWidget: React.FC<{ userBadges: string[] }> = ({ userBadges }) => {
    if (userBadges.length === 0) {
        return (
             <div className="bg-slate-50 p-4 rounded-lg text-center">
                <ShieldCheckIcon className="h-6 w-6 mx-auto text-slate-400 mb-1"/>
                <p className="text-sm font-semibold text-slate-600">No Badges Yet</p>
                <p className="text-xs text-slate-500">Complete courses to earn them!</p>
            </div>
        )
    }
    
    return (
         <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-center text-slate-600 mb-2">My Badges</p>
            <div className="flex justify-center items-center space-x-3">
                {userBadges.map(badgeId => {
                    const badge = BADGE_DEFINITIONS[badgeId];
                    if (!badge) return null;
                    const Icon = badge.icon;
                    return (
                        <div key={badge.id} className="group relative">
                            <Icon className="h-8 w-8 text-zamzam-teal-600" />
                            <div className="absolute bottom-full mb-2 w-48 bg-slate-800 text-white text-xs rounded py-1 px-2 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <p className="font-bold">{badge.name}</p>

                                <p>{badge.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ user, courses, onSelectCourse, userProgress, onViewLeaderboard, onViewResources, courseCategories, showOverview = true }) => {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const completedCoursesCount = useMemo(() => {
    return Object.values(userProgress).filter((p: UserProgress[string]) => p.completionDate).length;
  }, [userProgress]);

  const recentlyViewedCourses = useMemo(() => {
    return courses
      .filter(course => userProgress[course.id]?.recentlyViewed)
      .sort((a, b) => {
        const dateA = new Date(userProgress[a.id].recentlyViewed!).getTime();
        const dateB = new Date(userProgress[b.id].recentlyViewed!).getTime();
        return dateB - dateA;
      })
      .slice(0, 3);
  }, [courses, userProgress]);

  const recommendedCourses = useMemo(() => {
    const completedOrStartedCategories = new Set(
        Object.entries(userProgress)
            // FIX: Explicitly type `progress` to resolve TypeScript's 'unknown' type inference
            // for values from Object.entries, which was causing a compile error.
            .filter(([, progress]: [string, UserProgress[string]]) => progress.completedModules.length > 0 || progress.completionDate)
            .map(([courseId]) => courses.find(c => c.id === courseId)?.category)
            .filter(Boolean)
    );

    let recommendations: Course[] = [];

    // If the user has history, recommend from related categories
    if (completedOrStartedCategories.size > 0) {
        recommendations = courses.filter(course =>
            !userProgress[course.id]?.completionDate && // not completed
            completedOrStartedCategories.has(course.category) // in a preferred category
        );
    }

    // If no recommendations yet (e.g., new user or no related courses), recommend popular courses
    if (recommendations.length < 3) {
        const popularCourses = courses
            .map(course => ({
                ...course,
                // A simple popularity metric: number of reviews
                popularity: course.reviews.length,
            }))
            .sort((a, b) => b.popularity - a.popularity);
            
        recommendations = [...recommendations, ...popularCourses].filter(
             (course, index, self) =>
                !userProgress[course.id]?.completionDate &&
                index === self.findIndex((c) => c.id === course.id)
        );
    }
    
    return recommendations.slice(0, 3);
  }, [courses, userProgress]);


  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
        // Status filter
        const progress = userProgress[course.id];
        let statusMatch = false;
        switch (filter) {
            case 'completed':
                statusMatch = !!progress?.completionDate;
                break;
            case 'inProgress':
                statusMatch = progress && progress.completedModules.length > 0 && !progress.completionDate;
                break;
            case 'all':
            default:
                statusMatch = true;
                break;
        }

        // Category filter
        const categoryMatch = categoryFilter === 'all' || course.category === categoryFilter;

        // Search query filter
        const searchMatch = !searchQuery ||
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description.toLowerCase().includes(searchQuery.toLowerCase());
            
        return statusMatch && categoryMatch && searchMatch;
    });
  }, [courses, userProgress, filter, searchQuery, categoryFilter]);

  const FilterButton: React.FC<{ status: FilterStatus; label: string }> = ({ status, label }) => (
    <button
      onClick={() => setFilter(status)}
      className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
        filter === status
          ? 'bg-zamzam-teal-600 text-white shadow'
          : 'bg-white text-slate-700 hover:bg-zamzam-teal-50'
      }`}
      aria-pressed={filter === status}
    >
      {label}
    </button>
  );

  return (
    <div>
      {showOverview && (
        <>
            <div className="mb-8 p-6 bg-white rounded-xl shadow">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome back, {user.name.split(' ')[0]}!</h2>
                <p className="text-lg text-slate-600">Let's continue your learning journey and expand your knowledge.</p>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-zamzam-teal-50 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-zamzam-teal-700">{user.points}</p>
                        <p className="text-sm font-semibold text-slate-600">Points Earned</p>
                    </div>
                    <div className="bg-zamzam-teal-50 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-zamzam-teal-700">{completedCoursesCount}</p>
                        <p className="text-sm font-semibold text-slate-600">Courses Completed</p>
                    </div>
                    <div className="md:col-span-1">
                        <BadgesWidget userBadges={user.badges} />
                    </div>
                    <button onClick={onViewLeaderboard} className="bg-amber-100 p-4 rounded-lg hover:bg-amber-200 transition group text-center">
                        <TrophyIcon className="h-6 w-6 mx-auto text-amber-600 mb-1"/>
                        <p className="text-sm font-semibold text-amber-800 group-hover:underline">Leaderboard</p>
                    </button>
                    <button onClick={onViewResources} className="bg-sky-100 p-4 rounded-lg hover:bg-sky-200 transition group text-center">
                        <LibraryIcon className="h-6 w-6 mx-auto text-sky-600 mb-1"/>
                        <p className="text-sm font-semibold text-sky-800 group-hover:underline">Resources</p>
                    </button>
                </div>
            </div>

            {recentlyViewedCourses.length > 0 && (
                <div className="mb-12">
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">Pick Up Where You Left Off</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {recentlyViewedCourses.map(course => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                progress={userProgress[course.id] || { completedModules: [], quizScore: null }}
                                onSelectCourse={() => onSelectCourse(course)}
                            />
                        ))}
                    </div>
                </div>
            )}
            
            {recommendedCourses.length > 0 && (
                <div className="mb-12">
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">Recommended For You</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {recommendedCourses.map(course => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                progress={userProgress[course.id] || { completedModules: [], quizScore: null }}
                                onSelectCourse={() => onSelectCourse(course)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </>
      )}


      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 p-4 bg-white rounded-xl shadow">
         <div>
            {showOverview ? (
                <h3 className="text-2xl font-bold text-slate-800">All Courses</h3>
            ) : (
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Course Catalog</h2>
                    <p className="text-lg text-slate-600">Browse, search, and filter all available courses.</p>
                </div>
            )}
        </div>
        <div className="flex flex-col lg:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <input
                type="search"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-zamzam-teal-500 bg-white"
                aria-label="Search courses"
              />
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>
            <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-full self-center">
              <FilterButton status="all" label="All" />
              <FilterButton status="inProgress" label="In Progress" />
              <FilterButton status="completed" label="Completed" />
            </div>
        </div>
      </div>
       <div className="mb-8 overflow-x-auto">
            <div className="flex items-center space-x-2 pb-2">
                <button
                    onClick={() => setCategoryFilter('all')}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition ${
                        categoryFilter === 'all' ? 'bg-zamzam-teal-600 text-white shadow' : 'bg-white text-slate-700 hover:bg-zamzam-teal-50'
                    }`}
                >
                    All Categories
                </button>
                {courseCategories.map(category => (
                    <button
                        key={category.id}
                        onClick={() => setCategoryFilter(category.name)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition ${
                            categoryFilter === category.name ? 'bg-zamzam-teal-600 text-white shadow' : 'bg-white text-slate-700 hover:bg-zamzam-teal-50'
                        }`}
                    >
                        {category.name}
                    </button>
                ))}
            </div>
       </div>
      
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              progress={userProgress[course.id] || { completedModules: [], quizScore: null }}
              onSelectCourse={() => onSelectCourse(course)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-slate-700">No Courses Found</h3>
            <p className="text-slate-500 mt-2">Your search or filter returned no results. Try adjusting your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;