import React, { useState, useEffect } from 'react';
import { usersAPI, tenantsAPI } from '../services/api';
import { formatDate } from '../utils/dateFormat';
import toast from 'react-hot-toast';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'user', 
    tenantId: '', 
    isActive: true 
  });
  const [filterTenant, setFilterTenant] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [usersRes, tenantsRes] = await Promise.all([
        usersAPI.getAll({ limit: 100 }),
        tenantsAPI.getAll({ limit: 100 })
      ]);
      setUsers(usersRes.data.data);
      setTenants(tenantsRes.data.data);
    } catch (error) {
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await usersAPI.getAll({ limit: 100, tenantId: filterTenant || undefined });
      setUsers(res.data.data);
    } catch (error) {
      toast.error('Error loading users');
    }
  };

  useEffect(() => { if (!loading) fetchUsers(); }, [filterTenant]);

  const openModal = (user = null) => {
    if (user) {
      setEditing(user);
      setFormData({ 
        name: user.name, 
        email: user.email, 
        password: '', 
        role: user.role, 
        tenantId: user.tenant?._id, 
        isActive: user.isActive 
      });
    } else {
      setEditing(null);
      setFormData({ name: '', email: '', password: '', role: 'user', tenantId: '', isActive: true });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData };
      
      // Only include password if it's provided
      if (!data.password || data.password.trim() === '') {
        delete data.password;
      }
      
      if (editing) {
        await usersAPI.update(editing._id, data);
        toast.success('User updated successfully! ✨');
      } else {
        if (!data.password) {
          toast.error('Password is required for new users');
          return;
        }
        await usersAPI.create(data);
        toast.success('User created successfully! 🎉');
      }
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving user');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user and all their posts?')) {
      try {
        await usersAPI.delete(id);
        toast.success('User deleted successfully! 🗑️');
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error deleting user');
      }
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="dashboard-header">
        <h1>Manage Users</h1>
        <p>Create and manage users across tenants 👥</p>
      </div>

      <div className="filters">
        <select 
          className="filter-select" 
          value={filterTenant} 
          onChange={e => setFilterTenant(e.target.value)}
        >
          <option value="">All Tenants</option>
          {tenants.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
        </select>
        <button onClick={() => openModal()} className="btn btn-primary">+ New User</button>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>👥 All Users ({users.length})</h2>
        </div>
        <div className="card-body">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Tenant</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td><strong>{user.name}</strong></td>
                    <td>{user.email}</td>
                    <td>{user.tenant?.name}</td>
                    <td><span className={`badge badge-${user.role}`}>{user.role}</span></td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <span className={`badge badge-${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button onClick={() => openModal(user)} className="btn btn-sm btn-secondary">Edit</button>
                        <button onClick={() => handleDelete(user._id)} className="btn btn-sm btn-danger">Delete</button>
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
              <h2>{editing ? '✏️ Edit User' : '➕ New User'}</h2>
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
                    placeholder="Enter user name..."
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    placeholder="Enter email address..."
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>{editing ? 'New Password (leave blank to keep current)' : 'Password'}</label>
                  <input 
                    type="password" 
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                    placeholder={editing ? "Enter new password..." : "Enter password..."}
                    {...(!editing && { required: true })}
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select 
                    value={formData.role} 
                    onChange={e => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {!editing && (
                  <div className="form-group">
                    <label>Tenant</label>
                    <select 
                      value={formData.tenantId} 
                      onChange={e => setFormData({...formData, tenantId: e.target.value})} 
                      required
                    >
                      <option value="">Select Tenant</option>
                      {tenants.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                  </div>
                )}
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

export default ManageUsers;