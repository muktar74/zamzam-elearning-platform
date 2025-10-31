import React, { useState, useEffect, useCallback } from 'react';
import { Course, User, Toast } from '../types';
import QuizView from './QuizView';
import DiscussionForum from './DiscussionForum';
import { ChevronLeftIcon, DocumentTextIcon, CheckCircleIcon, LockClosedIcon, ChatBubbleLeftRightIcon, AcademicCapIcon, StarIcon, BookOpenIcon as DownloadIcon, VideoCameraIcon } from './icons';
import ReviewsTab from './ReviewsTab';
import { supabase } from '../services/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface CourseViewProps {
  course: Course | null;
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  currentUser: User;
  userProgress?: {
    completedModules: string[];
    quizScore: number | null;
  };
  onModuleComplete: (courseId: string, moduleId: string) => void;
  onCourseComplete: (score: number) => void;
  onBack: () => void;
  addToast: (message: string, type: Toast['type']) => void;
}

type CourseTab = 'content' | 'discussion' | 'reviews';

const CourseView: React.FC<CourseViewProps> = ({ course, setCourses, currentUser, userProgress, onModuleComplete, onCourseComplete, onBack, addToast }) => {
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [activeTab, setActiveTab] = useState<CourseTab>('content');
  
  const completedModules = userProgress?.completedModules || [];

  useEffect(() => {
      if (course && course.modules && course.modules.length > 0) {
          const firstModuleId = course.modules[0].id;
          if (activeModuleId !== firstModuleId) {
            setActiveModuleId(firstModuleId);
          }
      }
  }, [course, activeModuleId]);
  
  // Real-time listener for course deletion
  useEffect(() => {
    let channel: RealtimeChannel | null = null;
    if(course) {
        channel = supabase
            .channel(`public:courses:id=eq.${course.id}`)
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'courses', filter: `id=eq.${course.id}`},
            () => {
                addToast('This course is no longer available.', 'error');
                onBack();
            })
            .subscribe();
    }
    return () => {
        if(channel) {
            supabase.removeChannel(channel);
        }
    }
  }, [course, addToast, onBack]);

  const activeModule = course?.modules.find(m => m.id === activeModuleId);
  const activeModuleIndex = course?.modules.findIndex(m => m.id === activeModuleId) ?? -1;
  const allModulesCompleted = course ? completedModules.length === course.modules.length : false;
  const hasQuiz = course && course.quiz && course.quiz.length > 0;

  useEffect(() => {
    if (activeModuleId && course && !completedModules.includes(activeModuleId)) {
      onModuleComplete(course.id, activeModuleId);
      addToast('Module complete! You earned 10 points.', 'success');
    }
  }, [activeModuleId, course, completedModules, onModuleComplete, addToast]);
  
  const handleNextModule = useCallback(() => {
    if (course && activeModuleIndex < course.modules.length - 1) {
        const nextModule = course.modules[activeModuleIndex + 1];
        setActiveModuleId(nextModule.id);
    }
  }, [course, activeModuleIndex]);

  const handlePrevModule = useCallback(() => {
    if (course && activeModuleIndex > 0) {
        const prevModule = course.modules[activeModuleIndex - 1];
        setActiveModuleId(prevModule.id);
    }
  }, [course, activeModuleIndex]);
  
  // Add keyboard navigation for modules
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'ArrowRight') {
            handleNextModule();
        } else if (event.key === 'ArrowLeft') {
            handlePrevModule();
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNextModule, handlePrevModule]);

  if (!course) {
    return (
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Course Not Found</h2>
            <p className="text-slate-600">The course you are looking for does not exist. It may have been moved, edited, or deleted.</p>
            <button onClick={onBack} className="mt-6 bg-zamzam-teal-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-zamzam-teal-700 transition">
                Return to Dashboard
            </button>
        </div>
    );
  }

  if (showQuiz) {
    return <QuizView course={course} onQuizComplete={(score) => {
        onCourseComplete(score);
        setShowQuiz(false);
    }} />;
  }
  
  const TabButton: React.FC<{tab: CourseTab, label: string, icon: React.ReactNode}> = ({tab, label, icon}) => (
    <button
        onClick={() => setActiveTab(tab)}
        className={`flex items-center space-x-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === tab
                ? 'border-zamzam-teal-600 text-zamzam-teal-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
  );
  
  const VideoPlayer = React.memo(({ src, title, type }: { src: string; title: string; type?: 'embed' | 'upload'}) => {
      if (type === 'upload') {
          return (
               <video
                    key={src} // Force re-render if src changes
                    src={src}
                    controls
                    className="w-full h-full object-contain"
                >
                    Your browser does not support the video tag.
                </video>
          );
      }
      return (
          <iframe
            src={src}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
        ></iframe>
      );
  });

  return (
    <div className="bg-white p-4 sm:p-8 rounded-xl shadow-lg">
      <button onClick={onBack} className="flex items-center text-sm font-medium text-zamzam-teal-600 hover:text-zamzam-teal-800 mb-6 transition">
        <ChevronLeftIcon className="h-5 w-5 mr-1" />
        Back to Dashboard
      </button>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Modules Sidebar */}
        <aside className="lg:w-1/3 border-r-0 lg:border-r lg:pr-8 flex-shrink-0">
          <p className="text-sm font-semibold text-zamzam-teal-600 uppercase mb-1">{course.category}</p>
          <h2 className="text-2xl font-bold mb-4">{course.title}</h2>
          <ul className="space-y-2">
            {course.modules.map((module) => {
              const isCompleted = completedModules.includes(module.id);
              const isActive = activeModuleId === module.id && activeTab === 'content';
              const Icon = module.type === 'video' ? VideoCameraIcon : DocumentTextIcon;
              return (
                <li key={module.id}>
                  <button
                    onClick={() => { setActiveModuleId(module.id); setActiveTab('content'); }}
                    className={`w-full text-left flex items-center p-3 rounded-md transition ${
                      isActive
                        ? 'bg-zamzam-teal-100 text-zamzam-teal-800 font-semibold'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    {isCompleted ? (
                       <CheckCircleIcon className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                    ) : (
                      <Icon className="h-5 w-5 mr-3 text-slate-400 flex-shrink-0" />
                    )}
                    <span className={isCompleted && !isActive ? 'text-slate-500' : ''}>{module.title}</span>
                  </button>
                </li>
              );
            })}
             {course.modules.length === 0 && (
                <li className="p-3 text-sm text-slate-500 text-center bg-slate-50 rounded-md">This course has no modules yet.</li>
            )}
          </ul>
           {course.textbookUrl && (
                <a
                    href={course.textbookUrl}
                    download={course.textbookName}
                    className="w-full mt-4 py-3 px-4 rounded-lg font-semibold text-zamzam-teal-800 bg-zamzam-teal-100 hover:bg-zamzam-teal-200 transition flex items-center justify-center space-x-2"
                >
                    <DownloadIcon className="h-5 w-5"/>
                    <span>Download Textbook</span>
                </a>
           )}
          <button
            onClick={() => setShowQuiz(true)}
            disabled={!allModulesCompleted || !hasQuiz}
            className="w-full mt-4 py-3 px-4 rounded-lg font-semibold text-white transition disabled:bg-slate-300 disabled:cursor-not-allowed bg-zamzam-teal-600 hover:bg-zamzam-teal-700 flex items-center justify-center space-x-2"
          >
            {allModulesCompleted && hasQuiz && <span>Start Final Quiz</span>}
            {!allModulesCompleted && <LockClosedIcon className="h-5 w-5" />}
            {!allModulesCompleted && <span>Complete modules to unlock</span>}
            {allModulesCompleted && !hasQuiz && <span>Quiz Not Available</span>}
          </button>
        </aside>

        {/* Content Area */}
        <main className="lg:w-2/3 min-w-0">
            <div className="border-b border-slate-200 mb-6">
                <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto">
                    <TabButton tab="content" label="Content" icon={<AcademicCapIcon className="h-5 w-5"/>} />
                    <TabButton tab="discussion" label="Discussion" icon={<ChatBubbleLeftRightIcon className="h-5 w-5"/>} />
                    <TabButton tab="reviews" label="Reviews" icon={<StarIcon className="h-5 w-5"/>} />
                </div>
            </div>

          {activeTab === 'content' && (
             activeModule ? (
                <div>
                    <h3 className="text-3xl font-bold text-slate-800 mb-4">{activeModule.title}</h3>
                    {activeModule.type === 'video' ? (
                        <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden shadow-sm">
                           <VideoPlayer src={activeModule.content} title={activeModule.title} type={activeModule.videoType}/>
                        </div>
                    ) : (
                        <div className="prose max-w-none prose-p:text-slate-700 prose-p:leading-relaxed prose-strong:text-slate-800 prose-ul:list-disc prose-ul:ml-6 prose-img:rounded-md prose-img:shadow-sm prose-a:text-zamzam-teal-600 prose-a:font-semibold hover:prose-a:text-zamzam-teal-700">
                           {/* SECURITY NOTE: Using dangerouslySetInnerHTML to render HTML from the course content.
                               This is acceptable here because the content is created by trusted administrators.
                               In a scenario where users can create content, this would need to be sanitized to prevent XSS attacks. */}
                          <div dangerouslySetInnerHTML={{ __html: activeModule.content }} />
                        </div>
                    )}
                     <div className="flex justify-between mt-8 border-t pt-4">
                        <button
                          onClick={handlePrevModule}
                          disabled={activeModuleIndex <= 0}
                          className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous Module
                        </button>
                        <button
                          onClick={handleNextModule}
                          disabled={activeModuleIndex >= course.modules.length - 1}
                          className="px-4 py-2 text-sm font-semibold text-white bg-zamzam-teal-600 rounded-md hover:bg-zamzam-teal-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
                        >
                          Next Module
                        </button>
                      </div>
                </div>
              ) : (
                <p className="text-slate-600">Select a module to begin, or check the other tabs for discussion and reviews.</p>
              )
          )}
          {activeTab === 'discussion' && (
            <DiscussionForum 
                courseId={course.id} 
                posts={course.discussion} 
                currentUser={currentUser}
                setCourses={setCourses}
                addToast={addToast}
            />
          )}
          {activeTab === 'reviews' && (
            <ReviewsTab reviews={course.reviews} />
          )}
        </main>
      </div>
    </div>
  );
};

export default CourseView;