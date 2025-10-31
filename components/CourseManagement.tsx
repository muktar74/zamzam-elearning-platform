import React, { useState, useMemo } from 'react';
import { Course, User, NotificationType, Toast, UserRole, Module, CourseCategory } from '../../types';
import CourseFormModal from '../CourseFormModal';
import ConfirmModal from '../ConfirmModal';
import { PlusIcon, PencilIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon, ChevronUpDownIcon, SearchIcon } from '../icons';
import { supabase } from '../../services/supabaseClient';

interface CourseManagementProps {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  users: User[];
  createNotification: (userId: string, type: NotificationType, message: string) => void;
  addToast: (message: string, type: Toast['type']) => void;
  courseCategories: CourseCategory[];
}

type SortKey = 'title' | 'modules' | 'quiz';
type SortDirection = 'ascending' | 'descending';

// Helper to map Supabase's snake_case to frontend's camelCase
const mapSupabaseCourseToCourse = (supabaseCourse: any): Course => {
    return {
        id: supabaseCourse.id,
        title: supabaseCourse.title,
        description: supabaseCourse.description,
        category: supabaseCourse.category,
        modules: supabaseCourse.modules,
        quiz: supabaseCourse.quiz,
        passingScore: supabaseCourse.passing_score,
        imageUrl: supabaseCourse.image_url,
        reviews: supabaseCourse.reviews || [],
        discussion: supabaseCourse.discussion,
        textbookUrl: supabaseCourse.textbook_url,
        textbookName: supabaseCourse.textbook_name,
        createdAt: supabaseCourse.created_at,
    };
};

const CourseManagement: React.FC<CourseManagementProps> = ({ courses, setCourses, users, createNotification, addToast, courseCategories }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'title', direction: 'ascending' });
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [confirmModalState, setConfirmModalState] = useState<{isOpen: boolean; onConfirm: () => void}>({
    isOpen: false,
    onConfirm: () => {},
  });
  
  const filteredAndSortedCourses = useMemo(() => {
    let filteredCourses = [...courses];
    
    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        filteredCourses = filteredCourses.filter(course =>
            course.title.toLowerCase().includes(lowercasedQuery) ||
            course.description.toLowerCase().includes(lowercasedQuery)
        );
    }

    if (categoryFilter !== 'all') {
        filteredCourses = filteredCourses.filter(course => course.category === categoryFilter);
    }
    
    filteredCourses.sort((a, b) => {
      let aValue: string | number, bValue: string | number;

      switch(sortConfig.key) {
        case 'modules':
          aValue = a.modules.length;
          bValue = b.modules.length;
          break;
        case 'quiz':
          aValue = a.quiz.length;
          bValue = b.quiz.length;
          break;
        case 'title':
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    return filteredCourses;
  }, [courses, sortConfig, searchQuery, categoryFilter]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleOpenModal = (course?: Course) => {
    setEditingCourse(course || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const handleSaveCourse = async (course: Course) => {
    const isNewCourse = !editingCourse;
    
    // Map frontend camelCase to Supabase snake_case for the database operation
    const courseData = {
        title: course.title,
        description: course.description,
        modules: course.modules,
        quiz: course.quiz,
        image_url: course.imageUrl,
        discussion: course.discussion,
        category: course.category,
        passing_score: course.passingScore,
        textbook_url: course.textbookUrl,
        textbook_name: course.textbookName,
    };

    if (isNewCourse) {
        const { data: newCourse, error } = await supabase.from('courses').insert(courseData).select('*, reviews(*)').single();
        if (error) {
            addToast(`Error creating course: ${error.message}`, 'error');
            throw error;
        }
        setCourses(prev => [mapSupabaseCourseToCourse(newCourse), ...prev]);
        users.forEach(u => {
            if(u.role === UserRole.EMPLOYEE) {
                createNotification(u.id, NotificationType.NEW_COURSE, `A new course has been added: "${course.title}"`);
            }
        });
        addToast('Course created successfully!', 'success');
    } else {
        const { data: updatedCourse, error } = await supabase.from('courses').update(courseData).eq('id', editingCourse!.id).select('*, reviews(*)').single();
        if (error) {
            addToast(`Error updating course: ${error.message}`, 'error');
            throw error;
        }
        setCourses(prev => prev.map(c => c.id === editingCourse!.id ? mapSupabaseCourseToCourse(updatedCourse) : c));
        addToast('Course updated successfully.', 'success');
    }
  };
  
  const handleDeleteCourse = (courseId: string) => {
    setConfirmModalState({
        isOpen: true,
        onConfirm: async () => {
            const courseToDelete = courses.find(c => c.id === courseId);
            if (courseToDelete) {
                const videoPaths: string[] = courseToDelete.modules
                    .filter((module: Module) => module.type === 'video' && module.videoType === 'upload' && module.content)
                    .map((module: Module) => {
                        try {
                            const url = new URL(module.content);
                            const pathName = url.pathname;
                            const bucketName = 'assets';
                            const searchString = `/storage/v1/object/public/${bucketName}/`;
                            if (pathName.includes(searchString)) {
                                return decodeURIComponent(pathName.substring(pathName.indexOf(searchString) + searchString.length));
                            }
                             console.warn("URL does not seem to be a Supabase storage URL:", module.content);
                            return null;
                        } catch (e) {
                             console.error("Could not parse URL for deletion:", module.content, e);
                            return null;
                        }
                    })
                    .filter((path): path is string => path !== null);

                if (videoPaths.length > 0) {
                    addToast("Deleting associated video files...", "info");
                    const { error: storageError } = await supabase.storage.from('assets').remove(videoPaths);
                    if (storageError) {
                        addToast(`Could not delete some video files: ${storageError.message}. Please check storage manually.`, 'error');
                    }
                }
            }
            
            const { error } = await supabase.from('courses').delete().eq('id', courseId);
            if(error) {
                 addToast(`Error deleting course: ${error.message}`, 'error');
                 return;
            }

            setCourses(prev => prev.filter(c => c.id !== courseId));
            addToast('Course deleted successfully.', 'success');
        }
    });
  };
  
  const SortableHeader: React.FC<{ sortKey: SortKey, label: string, className?: string }> = ({ sortKey, label, className = ''}) => {
    const icon = sortConfig.key === sortKey
        ? (sortConfig.direction === 'ascending' ? <ChevronUpIcon className="h-4 w-4 ml-1"/> : <ChevronDownIcon className="h-4 w-4 ml-1"/>)
        : <ChevronUpDownIcon className="h-4 w-4 ml-1 text-slate-300"/>;
    return (
         <th scope="col" className={`px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider ${className}`}>
            <button className="flex items-center" onClick={() => requestSort(sortKey)}>
                {label}
                {icon}
            </button>
        </th>
    );
  }

  return (
    <div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div>
                <h2 className="text-3xl font-bold text-slate-800">Course Management</h2>
                <p className="text-lg text-slate-600">Create, edit, and manage all e-learning courses.</p>
            </div>
             <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full sm:w-48 px-3 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-zamzam-teal-500 bg-white"
                    aria-label="Filter by category"
                >
                    <option value="all">All Categories</option>
                    {courseCategories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                </select>
                <div className="relative w-full sm:w-auto">
                    <input
                        type="search"
                        placeholder="Search title or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-64 pl-10 pr-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-zamzam-teal-500 bg-white"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex-shrink-0 w-full sm:w-auto flex items-center justify-center bg-zamzam-teal-600 text-white font-bold py-3 px-5 rounded-lg hover:bg-zamzam-teal-700 transition shadow-md"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create Course
                </button>
            </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <SortableHeader sortKey="title" label="Course Title" />
                            <SortableHeader sortKey="modules" label="Modules" className="hidden sm:table-cell" />
                            <SortableHeader sortKey="quiz" label="Quiz Questions" className="hidden md:table-cell" />
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {filteredAndSortedCourses.map(course => (
                        <tr key={course.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-slate-900">{course.title}</div>
                                <div className="text-xs text-slate-500">{course.category}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-center hidden sm:table-cell">{course.modules.length}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-center hidden md:table-cell">{course.quiz.length}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button onClick={() => handleOpenModal(course)} className="text-zamzam-teal-600 hover:text-zamzam-teal-800 p-2 rounded-full hover:bg-zamzam-teal-100 transition">
                                <PencilIcon className="h-5 w-5"/>
                            </button>
                            <button onClick={() => handleDeleteCourse(course.id)} className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition">
                                <TrashIcon className="h-5 w-5"/>
                            </button>
                            </td>
                        </tr>
                        ))}
                        {filteredAndSortedCourses.length === 0 && (
                          <tr>
                            <td colSpan={4} className="text-center py-10 px-6 text-slate-500">
                                No courses found matching your criteria.
                            </td>
                          </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        <CourseFormModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveCourse}
            course={editingCourse}
            addToast={addToast}
            courseCategories={courseCategories}
        />
        <ConfirmModal
            isOpen={confirmModalState.isOpen}
            onClose={() => setConfirmModalState({ isOpen: false, onConfirm: () => {} })}
            onConfirm={confirmModalState.onConfirm}
            title="Confirm Deletion"
            message="Are you sure you want to delete this course? All associated progress and data will be lost."
        />
    </div>
  );
};

export default CourseManagement;