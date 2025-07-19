import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ProjectDetail: React.FC = () => {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`/api/projects/${id}`);
      setProject(response.data.project);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-secondary-900">Project not found</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">{project.name}</h1>
        <p className="text-secondary-600">{project.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Details */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Project Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-secondary-600">Status</p>
                <p className="text-secondary-900">{project.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-600">Client</p>
                <p className="text-secondary-900">{project.client.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-600">Start Date</p>
                <p className="text-secondary-900">{new Date(project.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-600">End Date</p>
                <p className="text-secondary-900">
                  {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}
                </p>
              </div>
              {project.budget && (
                <div>
                  <p className="text-sm font-medium text-secondary-600">Budget</p>
                  <p className="text-secondary-900">${project.budget.toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Deliverables */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Deliverables</h3>
            <div className="space-y-4">
              {project.deliverables?.map((deliverable: any) => (
                <div key={deliverable.id} className="border border-secondary-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-secondary-900">{deliverable.name}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      deliverable.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      deliverable.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {deliverable.status}
                    </span>
                  </div>
                  {deliverable.description && (
                    <p className="text-sm text-secondary-600 mb-2">{deliverable.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm text-secondary-500">
                    <span>Due: {new Date(deliverable.dueDate).toLocaleDateString()}</span>
                    {deliverable.assignedUser && (
                      <span>Assigned to: {deliverable.assignedUser.name}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Updates */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Recent Updates</h3>
            <div className="space-y-4">
              {project.updates?.map((update: any) => (
                <div key={update.id} className="border-l-4 border-primary-500 pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-secondary-900">{update.title}</h4>
                    <span className="text-xs text-secondary-500">
                      {new Date(update.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-secondary-600">{update.content}</p>
                  <p className="text-xs text-secondary-500 mt-2">by {update.author.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="btn-primary w-full">Add Deliverable</button>
              <button className="btn-secondary w-full">Create Ticket</button>
              <button className="btn-secondary w-full">Post Update</button>
            </div>
          </div>

          {/* Project Stats */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Project Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-secondary-600">Deliverables</span>
                <span className="font-medium">{project.deliverables?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Tickets</span>
                <span className="font-medium">{project.tickets?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Updates</span>
                <span className="font-medium">{project.updates?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail; 