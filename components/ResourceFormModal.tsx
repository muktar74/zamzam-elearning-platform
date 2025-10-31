
import React, { useState, useEffect } from 'react';
import { ExternalResource, Toast } from '../types';

interface ResourceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resource: ExternalResource) => void;
  resource: ExternalResource | null;
  addToast: (message: string, type: Toast['type']) => void;
}

const ResourceFormModal: React.FC<ResourceFormModalProps> = ({ isOpen, onClose, onSave, resource, addToast }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<ExternalResource['type']>('article');

  useEffect(() => {
    if (resource) {
      setTitle(resource.title);
      setDescription(resource.description);
      setUrl(resource.url);
      setType(resource.type);
    } else {
      setTitle('');
      setDescription('');
      setUrl('');
      setType('article');
    }
  }, [resource, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !url) {
        addToast("Please fill out all fields.", "error");
        return;
    }
    
    onSave({ id: resource?.id, title, description, url, type });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">{resource ? 'Edit Resource' : 'Add New Resource'}</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                        <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zamzam-teal-500 bg-white"
                        required
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zamzam-teal-500 bg-white"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="url" className="block text-sm font-medium text-slate-700 mb-1">URL</label>
                        <input
                        type="url"
                        id="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zamzam-teal-500 bg-white"
                        placeholder="https://example.com/resource"
                        required
                        />
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                        <select
                            id="type"
                            value={type}
                            onChange={(e) => setType(e.target.value as ExternalResource['type'])}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zamzam-teal-500 bg-white"
                        >
                            <option value="article">Article</option>
                            <option value="book">Book</option>
                            <option value="video">Video</option>
                        </select>
                    </div>
                </div>
            </div>
          <div className="p-4 bg-slate-50 border-t flex justify-end items-center space-x-4 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300 transition">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 text-sm font-semibold text-white bg-zamzam-teal-600 rounded-md hover:bg-zamzam-teal-700 transition">
                {resource ? 'Save Changes' : 'Add Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceFormModal;
