
import React, { useState, useMemo } from 'react';
import { ExternalResource } from '../types';
import { ChevronLeftIcon, SearchIcon, BookOpenIcon, LinkIcon, VideoCameraIcon } from './icons';

interface ResourceLibraryProps {
  onBack: () => void;
  resources: ExternalResource[];
}

const iconMap: { [key in ExternalResource['type']]: React.ReactElement } = {
  book: <BookOpenIcon className="h-6 w-6 text-slate-500" />,
  article: <LinkIcon className="h-6 w-6 text-slate-500" />,
  video: <VideoCameraIcon className="h-6 w-6 text-slate-500" />,
};

const ResourceLibrary: React.FC<ResourceLibraryProps> = ({ onBack, resources }) => {
  const [filter, setFilter] = useState<'all' | ExternalResource['type']>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResources = useMemo(() => {
    let filtered = resources;

    if (filter !== 'all') {
      filtered = filtered.filter(r => r.type === filter);
    }
    
    if (searchQuery) {
        filtered = filtered.filter(r => 
            r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    return filtered;
  }, [filter, searchQuery, resources]);

  const FilterButton: React.FC<{ type: 'all' | ExternalResource['type']; label: string }> = ({ type, label }) => (
    <button
      onClick={() => setFilter(type)}
      className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
        filter === type
          ? 'bg-zamzam-teal-600 text-white shadow'
          : 'bg-white text-slate-700 hover:bg-zamzam-teal-50'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <button onClick={onBack} className="flex items-center text-sm font-medium text-zamzam-teal-600 hover:text-zamzam-teal-800 mb-6 transition">
        <ChevronLeftIcon className="h-5 w-5 mr-1" />
        Back to Dashboard
      </button>

      <div className="bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800">Resource Library</h2>
          <p className="text-lg text-slate-600 mt-2">Expand your knowledge with these curated external resources.</p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 p-4 bg-slate-50 rounded-xl">
          <div className="relative w-full md:w-1/3">
            <input
              type="search"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-zamzam-teal-500 bg-slate-100"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>
          <div className="flex items-center space-x-2 bg-slate-200 p-1 rounded-full self-center">
            <FilterButton type="all" label="All" />
            <FilterButton type="book" label="Books" />
            <FilterButton type="article" label="Articles" />
            <FilterButton type="video" label="Videos" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource, index) => (
            <a
              key={index}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-50 rounded-lg p-6 flex flex-col transform hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-zamzam-teal-600 transition-colors">{resource.title}</h3>
                  <div className="flex-shrink-0 bg-white p-2 rounded-full border">
                      {iconMap[resource.type]}
                  </div>
              </div>
              <p className="text-sm text-slate-600 flex-grow">{resource.description}</p>
              <span className="mt-4 text-xs font-semibold uppercase text-zamzam-teal-600 self-start">
                View {resource.type}
              </span>
            </a>
          ))}
        </div>

        {filteredResources.length === 0 && (
             <div className="text-center py-16 px-6">
                <h3 className="text-xl font-semibold text-slate-700">No Resources Found</h3>
                <p className="text-slate-500 mt-2">Your search or filter returned no results. Try adjusting your criteria.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ResourceLibrary;
