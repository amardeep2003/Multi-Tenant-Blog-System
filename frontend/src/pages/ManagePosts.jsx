import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { postsAPI, tenantsAPI } from '../services/api';
import { formatDate, formatDateTime } from '../utils/dateFormat';
import toast from 'react-hot-toast';

const ManagePosts = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [posts, setPosts] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingPost, setViewingPost] = useState(null);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', status: 'published' });
  const [filterTenant, setFilterTenant] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const promises = [postsAPI.getAll({ limit: 100 })];
      if (isAdmin) promises.push(tenantsAPI.getAll({ limit: 100 }));
      
      const [postsRes, tenantsRes] = await Promise.all(promises);
      setPosts(postsRes.data.data);
      if (tenantsRes) setTenants(tenantsRes.data.data);
    } catch (error) {
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await postsAPI.getAll({ 
        limit: 100, 
        tenantId: filterTenant || undefined,
        status: filterStatus || undefined
      });
      setPosts(res.data.data);
    } catch (error) {
      toast.error('Error loading posts');
    }
  };

  useEffect(() => { if (!loading) fetchPosts(); }, [filterTenant, filterStatus]);

  // View Post
  const openViewModal = async (post) => {
    try {
      // Fetch fresh post data to get updated view count
      const res = await postsAPI.getOne(post._id);
      setViewingPost(res.data.data);
      setShowViewModal(true);
    } catch (error) {
      // If fetch fails, use existing data
      setViewingPost(post);
      setShowViewModal(true);
    }
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingPost(null);
    // Refresh posts to update view count
    fetchPosts();
  };

  // Edit Post
  const openModal = (post = null) => {
    if (post) {
      setEditing(post);
      setFormData({ title: post.title, content: post.content, status: post.status });
    } else {
      setEditing(null);
      setFormData({ title: '', content: '', status: 'published' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await postsAPI.update(editing._id, formData);
        toast.success('Post updated successfully! ✨');
      } else {
        await postsAPI.create(formData);
        toast.success('Post created successfully! 🎉');
      }
      setShowModal(false);
      fetchPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving post');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postsAPI.delete(id);
        toast.success('Post deleted successfully! 🗑️');
        fetchPosts();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error deleting post');
      }
    }
  };

  // Edit from view modal
  const handleEditFromView = () => {
    setShowViewModal(false);
    openModal(viewingPost);
  };

  // Delete from view modal
  const handleDeleteFromView = async () => {
    if (viewingPost) {
      await handleDelete(viewingPost._id);
      closeViewModal();
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="dashboard-header">
        <h1>Manage Posts</h1>
        <p>{isAdmin ? 'View and manage all posts 📝' : 'Manage your posts 📝'}</p>
      </div>

      <div className="filters">
        {isAdmin && (
          <select 
            className="filter-select" 
            value={filterTenant} 
            onChange={e => setFilterTenant(e.target.value)}
          >
            <option value="">All Tenants</option>
            {tenants.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
        )}
        <select 
          className="filter-select" 
          value={filterStatus} 
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <button onClick={() => openModal()} className="btn btn-primary">+ New Post</button>
      </div>

      <div className="posts-grid">
        {posts.length === 0 ? (
          <div className="empty-state" style={{gridColumn: '1/-1'}}>
            <div className="empty-state-icon">📝</div>
            <h3>No posts found</h3>
            <p>Create your first post to get started!</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post._id} className="post-card">
              <h3>{post.title}</h3>
              <div className="post-meta">
                <span>👤 {post.author?.name}</span>
                <span>📅 {formatDate(post.createdAt)}</span>
                {isAdmin && post.tenant && <span>🏢 {post.tenant.name}</span>}
              </div>
              <p className="post-content">{post.content.substring(0, 150)}...</p>
              <div className="post-footer">
                <div className="post-footer-left">
                  <span className={`badge badge-${post.status}`}>{post.status}</span>
                  <span className="view-count">👁 {post.views || 0}</span>
                </div>
                <div className="actions">
                  <button onClick={() => openViewModal(post)} className="btn btn-sm btn-info">View</button>
                  <button onClick={() => openModal(post)} className="btn btn-sm btn-secondary">Edit</button>
                  <button onClick={() => handleDelete(post._id)} className="btn btn-sm btn-danger">Delete</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? '✏️ Edit Post' : '➕ New Post'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Title</label>
                  <input 
                    type="text" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    placeholder="Enter post title..."
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Content</label>
                  <textarea 
                    value={formData.content} 
                    onChange={e => setFormData({...formData, content: e.target.value})} 
                    placeholder="Write your content here..."
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="modal-footer" style={{padding: 0, border: 'none', marginTop: '1rem'}}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Post Modal */}
      {showViewModal && viewingPost && (
        <div className="modal-overlay" onClick={closeViewModal}>
          <div className="modal modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📄 View Post</h2>
              <button className="modal-close" onClick={closeViewModal}>×</button>
            </div>
            <div className="modal-body view-post-modal">
              {/* Post Header */}
              <div className="view-post-header">
                <h1 className="view-post-title">{viewingPost.title}</h1>
                <span className={`badge badge-${viewingPost.status}`}>{viewingPost.status}</span>
              </div>

              {/* Post Meta Information */}
              <div className="view-post-meta">
                <div className="meta-item">
                  <span className="meta-icon">👤</span>
                  <div className="meta-content">
                    <span className="meta-label">Author</span>
                    <span className="meta-value">{viewingPost.author?.name}</span>
                  </div>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">📧</span>
                  <div className="meta-content">
                    <span className="meta-label">Email</span>
                    <span className="meta-value">{viewingPost.author?.email}</span>
                  </div>
                </div>
                {isAdmin && viewingPost.tenant && (
                  <div className="meta-item">
                    <span className="meta-icon">🏢</span>
                    <div className="meta-content">
                      <span className="meta-label">Tenant</span>
                      <span className="meta-value">{viewingPost.tenant.name}</span>
                    </div>
                  </div>
                )}
                <div className="meta-item">
                  <span className="meta-icon">📅</span>
                  <div className="meta-content">
                    <span className="meta-label">Created</span>
                    <span className="meta-value">{formatDateTime(viewingPost.createdAt)}</span>
                  </div>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">🔄</span>
                  <div className="meta-content">
                    <span className="meta-label">Updated</span>
                    <span className="meta-value">{formatDateTime(viewingPost.updatedAt)}</span>
                  </div>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">👁</span>
                  <div className="meta-content">
                    <span className="meta-label">Views</span>
                    <span className="meta-value">{viewingPost.views || 0}</span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {viewingPost.tags && viewingPost.tags.length > 0 && (
                <div className="view-post-tags">
                  <span className="tags-label">🏷️ Tags:</span>
                  <div className="tags-list">
                    {viewingPost.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="view-post-divider"></div>

              {/* Post Content */}
              <div className="view-post-content">
                <h3 className="content-label">📝 Content</h3>
                <div className="content-body">
                  {viewingPost.content.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer with Actions */}
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeViewModal}>Close</button>
              <button className="btn btn-primary" onClick={handleEditFromView}>✏️ Edit</button>
              <button className="btn btn-danger" onClick={handleDeleteFromView}>🗑️ Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePosts;