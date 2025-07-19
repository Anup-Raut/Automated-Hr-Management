import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusIcon } from '@heroicons/react/24/outline';

const Updates: React.FC = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      const response = await axios.get('/api/updates');
      setUpdates(response.data.updates);
    } catch (error) {
      console.error('Error fetching updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ANNOUNCEMENT': return 'bg-red-100 text-red-800';
      case 'MILESTONE': return 'bg-green-100 text-green-800';
      case 'PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'GENERAL': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Project Updates</h1>
          <p className="text-secondary-600">Stay informed about project progress and announcements.</p>
        </div>
        <button className="btn-primary flex items-center">
          <PlusIcon className="w-5 h-5 mr-2" />
          New Update
        </button>
      </div>

      <div className="space-y-6">
        {updates.map((update: any) => (
          <div key={update.id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(update.type)}`}>
                  {update.type}
                </span>
                {update.project && (
                  <span className="text-sm text-secondary-500">
                    Project: {update.project.name}
                  </span>
                )}
              </div>
              <span className="text-sm text-secondary-500">
                {new Date(update.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              {update.title}
            </h3>
            
            <p className="text-secondary-600 mb-4">
              {update.content}
            </p>
            
            <div className="flex items-center justify-between text-sm text-secondary-500">
              <span>Posted by {update.author.name}</span>
              <span>{new Date(update.createdAt).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Updates; 