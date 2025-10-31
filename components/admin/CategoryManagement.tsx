import React, { useState, useMemo } from 'react';
import { Course, CourseCategory, Toast } from '../../types';
import { supabase } from '../../services/supabaseClient';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon, SearchIcon } from '../icons';
import ConfirmModal from '../ConfirmModal';

interface CategoryManagementProps {
  courseCategories: CourseCategory[];
  setCourseCategories: React.Dispatch<React.SetStateAction<CourseCategory[]>>;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  addToast: (message: string, type: Toast['type']) => void;
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({ courseCategories, setCourseCategories, courses, setCourses, addToast }) => {
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingState, setEditingState] = useState<{ id: string, name: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, onConfirm: () => {} });
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCategories = useMemo(() => {
        return courseCategories.filter(category =>
            category.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [courseCategories, searchQuery]);

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) {
            addToast('Category name cannot be empty.', 'error');
            return;
        }
        if (courseCategories.some(c => c.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
            addToast('This category already exists.', 'error');
            return;
        }

        setIsLoading(true);
        const { data, error } = await supabase
            .from('course_categories')
            .insert({ name: newCategoryName.trim() })
            .select()
            .single();

        if (error) {
            addToast(`Error adding category: ${error.message}`, 'error');
        } else {
            setCourseCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
            setNewCategoryName('');
            addToast('Category added successfully!', 'success');
        }
        setIsLoading(false);
    };

    const handleUpdateCategory = async () => {
        if (!editingState || !editingState.name.trim()) {
             addToast('Category name cannot be empty.', 'error');
            return;
        }
        if (courseCategories.some(c => c.name.toLowerCase() === editingState.name.trim().toLowerCase() && c.id !== editingState.id)) {
            addToast('Another category with this name already exists.', 'error');
            return;
        }

        const categoryToUpdate = courseCategories.find(c => c.id === editingState.id);
        if (!categoryToUpdate) return;
        
        const oldName = categoryToUpdate.name;
        const newName = editingState.name.trim();

        if(oldName === newName) {
            setEditingState(null);
            return;
        }

        setIsLoading(true);
        const { error: categoryUpdateError } = await supabase.from('course_categories').update({ name: newName }).eq('id', editingState.id);
        const { error: coursesUpdateError } = await supabase.from('courses').update({ category: newName }).eq('category', oldName);

        if (categoryUpdateError || coursesUpdateError) {
            addToast(`Failed to update category. ${categoryUpdateError?.message || coursesUpdateError?.message}`, 'error');
        } else {
            setCourseCategories(prev => prev.map(c => c.id === editingState.id ? { ...c, name: newName } : c));
            setCourses(prev => prev.map(c => c.category === oldName ? { ...c, category: newName } : c));
            addToast('Category updated successfully.', 'success');
            setEditingState(null);
        }
        setIsLoading(false);
    };

    const handleDeleteCategory = (categoryId: string, categoryName: string) => {
        const isUsed = courses.some(c => c.category === categoryName);
        if (isUsed) {
            addToast('Cannot delete category. It is currently in use by one or more courses.', 'error');
            return;
        }

        setConfirmModal({
            isOpen: true,
            onConfirm: async () => {
                const { error } = await supabase.from('course_categories').delete().eq('id', categoryId);
                if (error) {
                    addToast(`Error deleting category: ${error.message}`, 'error');
                } else {
                    setCourseCategories(prev => prev.filter(c => c.id !== categoryId));
                    addToast('Category deleted successfully.', 'success');
                }
            }
        });
    };
    
    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Category Management</h2>
                    <p className="text-lg text-slate-600">Add, edit, and manage all course categories.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Add New Category</h3>
                        <form onSubmit={handleAddCategory}>
                            <label htmlFor="newCategory" className="block text-sm font-medium text-slate-700 mb-1">Category Name</label>
                            <input
                                id="newCategory"
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zamzam-teal-500 bg-white"
                                placeholder="e.g., Islamic Capital Markets"
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full mt-4 flex items-center justify-center bg-zamzam-teal-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-zamzam-teal-700 transition disabled:bg-slate-400"
                            >
                                <PlusIcon className="h-5 w-5 mr-2" />
                                {isLoading ? 'Adding...' : 'Add Category'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="relative mb-4">
                        <input
                            type="search"
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-zamzam-teal-500 bg-white"
                            aria-label="Search categories"
                        />
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                    </div>
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category Name</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {filteredCategories.map(category => (
                                        <tr key={category.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {editingState?.id === category.id ? (
                                                    <input
                                                        type="text"
                                                        value={editingState.name}
                                                        onChange={(e) => setEditingState({...editingState, name: e.target.value})}
                                                        className="w-full px-2 py-1 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zamzam-teal-500"
                                                        autoFocus
                                                        onKeyDown={(e) => e.key === 'Enter' && handleUpdateCategory()}
                                                    />
                                                ) : (
                                                    <span className="font-medium text-slate-900">{category.name}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                {editingState?.id === category.id ? (
                                                    <>
                                                        <button onClick={handleUpdateCategory} disabled={isLoading} className="text-green-600 p-2 rounded-full hover:bg-green-100"><CheckIcon className="h-5 w-5"/></button>
                                                        <button onClick={() => setEditingState(null)} disabled={isLoading} className="text-slate-600 p-2 rounded-full hover:bg-slate-100"><XMarkIcon className="h-5 w-5"/></button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => setEditingState({ id: category.id, name: category.name })} disabled={isLoading} className="text-zamzam-teal-600 p-2 rounded-full hover:bg-zamzam-teal-100"><PencilIcon className="h-5 w-5"/></button>
                                                        <button onClick={() => handleDeleteCategory(category.id, category.name)} disabled={isLoading} className="text-red-600 p-2 rounded-full hover:bg-red-100"><TrashIcon className="h-5 w-5"/></button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredCategories.length === 0 && (
                                        <tr>
                                            <td colSpan={2} className="text-center py-10 px-6 text-slate-500">
                                                No categories found matching your search.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, onConfirm: () => {} })}
                onConfirm={confirmModal.onConfirm}
                title="Confirm Deletion"
                message="Are you sure you want to delete this category? This action cannot be undone."
            />
        </div>
    );
};

export default CategoryManagement;