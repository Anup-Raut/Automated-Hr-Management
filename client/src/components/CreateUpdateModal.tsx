import React, { useState } from 'react';
import axios from 'axios';
import Modal from './Modal';
import Notification from './Notification';

interface CreateUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateCreated: () => void;
}

const CreateUpdateModal: React.FC<CreateUpdateModalProps> = ({ isOpen, onClose, onUpdateCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'GENERAL'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/updates', formData);
      
      setFormData({
        title: '',
        content: '',
        type: 'GENERAL'
      });
      onUpdateCreated();
      onClose();
      setShowNotification(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Create New Update">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-secondary-700">
              Update Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="input-field mt-1"
              placeholder="Enter update title"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-secondary-700">
              Update Type *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="input-field mt-1"
            >
              <option value="PROGRESS">Progress</option>
              <option value="MILESTONE">Milestone</option>
              <option value="GENERAL">General</option>
              <option value="ANNOUNCEMENT">Announcement</option>
            </select>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-secondary-700">
              Content *
            </label>
            <textarea
              id="content"
              name="content"
              rows={5}
              required
              value={formData.content}
              onChange={handleChange}
              className="input-field mt-1"
              placeholder="Enter update content"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Update'}
            </button>
          </div>
        </form>
      </Modal>

      <Notification
        type="success"
        message="Update created successfully!"
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </>
  );
};

export default CreateUpdateModal; 