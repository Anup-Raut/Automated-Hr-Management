import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  FolderIcon,
  TicketIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalTickets: number;
  openTickets: number;
  recentUpdates: any[];
  upcomingDeadlines: any[];
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    totalTickets: 0,
    openTickets: 0,
    recentUpdates: [],
    upcomingDeadlines: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [projectsRes, ticketsRes, updatesRes, deliverablesRes] = await Promise.all([
        axios.get('/api/projects'),
        axios.get('/api/tickets'),
        axios.get('/api/updates'),
        axios.get('/api/deliverables')
      ]);

      const projects = projectsRes.data.projects;
      const tickets = ticketsRes.data.tickets;
      const updates = updatesRes.data.updates;
      const deliverables = deliverablesRes.data.deliverables;

      setStats({
        totalProjects: projects.length,
        activeProjects: projects.filter((p: any) => p.status === 'ACTIVE').length,
        totalTickets: tickets.length,
        openTickets: tickets.filter((t: any) => t.status === 'OPEN').length,
        recentUpdates: updates.slice(0, 5),
        upcomingDeadlines: deliverables
          .filter((d: any) => new Date(d.dueDate) > new Date())
          .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
          .slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
        <p className="text-secondary-600">Welcome back! Here's what's happening with your projects.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <FolderIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total Projects</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Active Projects</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.activeProjects}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TicketIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total Tickets</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.totalTickets}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Open Tickets</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.openTickets}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Updates and Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Updates */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900">Recent Updates</h3>
            <Link to="/updates" className="text-primary-600 hover:text-primary-500 text-sm">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentUpdates.map((update: any) => (
              <div key={update.id} className="border-l-4 border-primary-500 pl-4">
                <p className="font-medium text-secondary-900">{update.title}</p>
                <p className="text-sm text-secondary-600 mt-1">{update.content}</p>
                <p className="text-xs text-secondary-500 mt-2">
                  by {update.author.name} • {new Date(update.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900">Upcoming Deadlines</h3>
            <Link to="/projects" className="text-primary-600 hover:text-primary-500 text-sm">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {stats.upcomingDeadlines.map((deliverable: any) => (
              <div key={deliverable.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div>
                  <p className="font-medium text-secondary-900">{deliverable.name}</p>
                  <p className="text-sm text-secondary-600">{deliverable.project?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-secondary-900">
                    {new Date(deliverable.dueDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-secondary-500">
                    {Math.ceil((new Date(deliverable.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 