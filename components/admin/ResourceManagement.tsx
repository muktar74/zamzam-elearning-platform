import React, { useState, useMemo } from 'react';
import { ExternalResource, Toast } from '../../types';
import ResourceFormModal from '../ResourceFormModal';
import ConfirmModal from '../ConfirmModal';
import { PlusIcon, PencilIcon, TrashIcon, SearchIcon, BookOpenIcon, LinkIcon, VideoCameraIcon } from '../icons';
import { supabase } from '../../services/supabaseClient';

interface ResourceManagementProps {
  externalResources: ExternalResource[];
  setExternalResources: React.Dispatch<React.SetStateAction<ExternalResource[]>>;
  addToast: (message: string, type: Toast['type']) => void;
}

const iconMap: { [key in ExternalResource['type']]: React.ReactElement } = {
  book: <BookOpenIcon className="h-5 w-5 text-slate-500" />,
  article: <LinkIcon className="h-5 w-5 text-slate-500" />,
  video: <VideoCameraIcon className="h-5 w-5 text-slate-500" />,
};

const ResourceManagement: React.FC<ResourceManagementProps> = ({ externalResources, setExternalResources, addToast }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ExternalResource | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [confirmModalState, setConfirmModalState] = useState<{isOpen: boolean; onConfirm: () => void; message: string}>({
    isOpen: false,
    onConfirm: () => {},
    message: '',
  });

  const filteredResources = useMemo(() => {
    return externalResources.filter(resource =>
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [externalResources, searchQuery]);

  const handleOpenModal = (resource?: ExternalResource) => {
    setEditingResource(resource || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingResource(null);
  };

  const handleSaveResource = async (resource: ExternalResource) => {
    if (editingResource) {
        const { error } = await supabase.from('external_resources').update({
            title: resource.title,
            description: resource.description,
            url: resource.url,
            type: resource.type,
        }).eq('id', editingResource.id);

        if (error) { addToast(`Error updating resource: ${error.message}`, 'error'); return; }

        setExternalResources(prev => prev.map(r => r.id === editingResource.id ? {...resource, id: editingResource.id} : r));
        addToast('Resource updated successfully!', 'success');
    } else {
        const { id, ...newResourceData } = resource;
        const { data: newResource, error } = await supabase.from('external_resources').insert(newResourceData).select().single();
        
        if (error) { addToast(`Error adding resource: ${error.message}`, 'error'); return; }

        setExternalResources(prev => [newResource as ExternalResource, ...prev]);
        addToast('Resource added successfully!', 'success');
    }
    handleCloseModal();
  };

  const handleDeleteResource = (resourceId: string) => {
    setConfirmModalState({
      isOpen: true,
      onConfirm: async () => {
        const { error } = await supabase.from('external_resources').delete().eq('id', resourceId);
        if (error) {
            addToast(`Error deleting resource: ${error.message}`, 'error');
            return;
        }
        setExternalResources(prev => prev.filter(r => r.id !== resourceId));
        addToast('Resource deleted successfully.', 'success');
      },
      message: 'Are you sure you want to delete this resource? This action cannot be undone.'
    });
  };

  return (
    <div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div>
                <h2 className="text-3xl font-bold text-slate-800">Resource Management</h2>
                <p className="text-lg text-slate-600">Add, edit, and manage all external learning resources.</p>
            </div>
             <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <div className="relative w-full sm:w-auto">
                    <input
                        type="search"
                        placeholder="Search resources..."
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
                    Add Resource
                </button>
            </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Description</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {filteredResources.map(resource => (
                        <tr key={resource.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-zamzam-teal-600 hover:underline">{resource.title}</a>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 capitalize flex items-center gap-2">
                                {iconMap[resource.type]}
                                {resource.type}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500 hidden md:table-cell max-w-md truncate">{resource.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                <button onClick={() => handleOpenModal(resource)} className="text-zamzam-teal-600 hover:text-zamzam-teal-800 p-2 rounded-full hover:bg-zamzam-teal-100 transition">
                                    <PencilIcon className="h-5 w-5"/>
                                </button>
                                <button onClick={() => handleDeleteResource(resource.id!)} className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition">
                                    <TrashIcon className="h-5 w-5"/>
                                </button>
                            </td>
                        </tr>
                        ))}
                        {filteredResources.length === 0 && (
                          <tr>
                            <td colSpan={4} className="text-center py-10 px-6 text-slate-500">
                                No resources found.
                            </td>
                          </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        <ResourceFormModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveResource}
            resource={editingResource}
            addToast={addToast}
        />
        <ConfirmModal
            isOpen={confirmModalState.isOpen}
            onClose={() => setConfirmModalState({ ...confirmModalState, isOpen: false })}
            onConfirm={confirmModalState.onConfirm}
            title="Confirm Deletion"
            message={confirmModalState.message}
        />
    </div>
  );
};

export default ResourceManagement;
