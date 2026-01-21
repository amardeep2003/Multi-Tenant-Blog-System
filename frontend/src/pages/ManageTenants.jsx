import React, { useState, useEffect } from 'react';
import { tenantsAPI } from '../services/api';
import { formatDate } from '../utils/dateFormat';
import toast from 'react-hot-toast';

const ManageTenants = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', isActive: true });

  useEffect(() => { fetchTenants(); }, []);

  const fetchTenants = async () => {
    try {
      const res = await tenantsAPI.getAll({ limit: 100 });
      setTenants(res.data.data);
    } catch (error) {
      toast.error('Error loading tenants');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (tenant = null) => {
    if (tenant) {
      setEditing(tenant);
      setFormData({ name: tenant.name, description: tenant.description || '', isActive: tenant.isActive });
    } else {
      setEditing(null);
      setFormData({ name: '', description: '', isActive: true });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await tenantsAPI.update(editing._id, formData);
        toast.success('Tenant updated successfully! ✨');
      } else {
        await tenantsAPI.create(formData);
        toast.success('Tenant created successfully! 🎉');
      }
      setShowModal(false);
      fetchTenants();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving tenant');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this tenant?')) {
      try {
        await tenantsAPI.delete(id);
        toast.success('Tenant deleted successfully! 🗑️');
        fetchTenants();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error deleting tenant');
      }
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="dashboard-header">
        <h1>Manage Tenants</h1>
        <p>Create and manage organizations 🏢</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>🏢 All Tenants ({tenants.length})</h2>
          <button onClick={() => openModal()} className="btn btn-primary">+ New Tenant</button>
        </div>
        <div className="card-body">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Users</th>
                  <th>Posts</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map(tenant => (
                  <tr key={tenant._id}>
                    <td>
                      <strong>{tenant.name}</strong>
                      {tenant.description && <><br/><small style={{color: 'var(--text-secondary)'}}>{tenant.description}</small></>}
                    </td>
                    <td>{tenant.userCount || 0}</td>
                    <td>{tenant.postCount || 0}</td>
                    <td>{formatDate(tenant.createdAt)}</td>
                    <td>
                      <span className={`badge badge-${tenant.isActive ? 'active' : 'inactive'}`}>
                        {tenant.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button onClick={() => openModal(tenant)} className="btn btn-sm btn-secondary">Edit</button>
                        <button onClick={() => handleDelete(tenant._id)} className="btn btn-sm btn-danger">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? '✏️ Edit Tenant' : '➕ New Tenant'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Name</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    placeholder="Enter tenant name..."
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    placeholder="Enter description..."
                    rows={3} 
                  />
                </div>
                {editing && (
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={formData.isActive} 
                        onChange={e => setFormData({...formData, isActive: e.target.checked})}
                        style={{ width: 'auto' }}
                      />
                      Active
                    </label>
                  </div>
                )}
                <div className="modal-footer" style={{padding: 0, border: 'none', marginTop: '1rem'}}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTenants;