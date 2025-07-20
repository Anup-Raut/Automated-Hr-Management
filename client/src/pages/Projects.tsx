import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useSocket } from '../contexts/SocketContext';
import CreateProjectModal from '../components/CreateProjectModal';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { socket } = useSocket();

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('project_update', (data) => {
        console.log('Project update received:', data);
        fetchProjects(); // Refresh projects when updates are received
      });

      return () => {
        socket.off('project_update');
      };
    }
  }, [socket]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data.projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = () => {
    fetchProjects();
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
          <h1 className="text-2xl font-bold text-secondary-900">Projects</h1>
          <p className="text-secondary-600">Manage your client projects and deliverables.</p>
        </div>
        <button 
          className="btn-primary flex items-center"
          onClick={() => setShowCreateModal(true)}
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project: any) => (
          <Link key={project.id} to={`/projects/${project.id}`}>
            <div className="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary-900">{project.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  project.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {project.status}
                </span>
              </div>
              
              {project.description && (
                <p className="text-secondary-600 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>
              )}

              <div className="space-y-2 text-sm text-secondary-500">
                <p>Client: {project.client.name}</p>
                <p>Start Date: {new Date(project.startDate).toLocaleDateString()}</p>
                {project.endDate && (
                  <p>End Date: {new Date(project.endDate).toLocaleDateString()}</p>
                )}
                {project.budget && (
                  <p>Budget: ${project.budget.toLocaleString()}</p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-secondary-200">
                <div className="flex items-center justify-between text-sm">
                  <span>Deliverables: {project.deliverables?.length || 0}</span>
                  <span>Tickets: {project.tickets?.length || 0}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
};

export default Projects; 