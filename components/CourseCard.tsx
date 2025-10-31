
import React from 'react';
import { Course } from '../types';
import { CheckCircleIcon, StarIcon } from './icons';

interface CourseCardProps {
  course: Course;
  progress: {
      completedModules: string[];
      quizScore: number | null;
  };
  onSelectCourse: (course: Course) => void;
}

const StarRating: React.FC<{ rating: number, totalRatings: number }> = ({ rating, totalRatings }) => {
    const fullStars = Math.round(rating);
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <StarIcon 
                    key={i} 
                    className={`w-5 h-5 ${i < fullStars ? 'text-amber-400' : 'text-slate-300'}`}
                />
            ))}
            {totalRatings > 0 && <span className="ml-2 text-sm text-slate-500">({totalRatings})</span>}
        </div>
    );
};

const CourseCard: React.FC<CourseCardProps> = ({ course, progress, onSelectCourse }) => {
    const totalModules = course.modules.length;
    const completedModules = progress.completedModules.length;
    const progressPercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
    const isCompleted = progress.quizScore !== null;
    
    const averageRating = course.reviews.length > 0 
        ? course.reviews.reduce((acc, review) => acc + review.rating, 0) / course.reviews.length
        : 0;

  return (
    <div 
      className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col group"
      onClick={() => onSelectCourse(course)}
      role="button"
      tabIndex={0}
      aria-label={`Select course: ${course.title}`}
    >
      <div className="relative">
        <img className="w-full h-48 object-cover" src={course.imageUrl} alt={course.title} />
        {isCompleted && (
            <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                <CheckCircleIcon className="w-4 h-4" />
                <span>Completed</span>
            </div>
        )}
      </div>
      <div className="p-6 flex-grow flex flex-col">
        <p className="text-xs font-semibold text-zamzam-teal-600 uppercase mb-1">{course.category || 'General'}</p>
        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-zamzam-teal-600 transition-colors">{course.title}</h3>
        <p className="text-slate-600 text-sm flex-grow">{course.description}</p>
        
        <div className="mt-4">
            <StarRating rating={averageRating} totalRatings={course.reviews.length} />
        </div>

        <div className="mt-4">
            <div className="flex justify-between items-center mb-1 text-sm">
                <span className="font-medium text-slate-700">Progress</span>
                <span className="font-semibold text-zamzam-teal-600">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div 
                    className="bg-zamzam-teal-500 h-2.5 rounded-full transition-all duration-500" 
                    style={{width: `${progressPercentage}%`}}
                ></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
