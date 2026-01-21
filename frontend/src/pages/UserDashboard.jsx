import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { postsAPI } from '../services/api';
import { formatDate, formatDateTime } from '../utils/dateFormat';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingPost, setViewingPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', status: 'published' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [postsRes, statsRes] = await Promise.all([
        postsAPI.getAll({ limit: 10 }),
        postsAPI.getStats()
      ]);
      setPosts(postsRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // View Post
  const openViewModal = async (post) => {
    try {
      const res = await postsAPI.getOne(post._id);
      setViewingPost(res.data.data);
      setShowViewModal(true);
    } catch (error) {
      setViewingPost(post);
      setShowViewModal(true);
    }
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingPost(null);
    fetchData();
  };

  const openModal = (post = null) => {
    if (post) {
      setEditingPost(post);
      setFormData({ title: post.title, content: post.content, status: post.status });
    } else {
      setEditingPost(null);
      setFormData({ title: '', content: '', status: 'published' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPost) {
        await postsAPI.update(editingPost._id, formData);
        toast.success('Post updated successfully! ✨');
      } else {
        await postsAPI.create(formData);
        toast.success('Post created successfully! 🎉');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving post');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postsAPI.delete(id);
        toast.success('Post deleted successfully! 🗑️');
        fetchData();
      } catch (error) {
        toast.error('Error deleting post');
      }
    }
  };

  const handleEditFromView = () => {
    setShowViewModal(false);
    openModal(viewingPost);
  };

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
        <h1>My Dashboard</h1>
        <p>Welcome, {user.name}! Manage your posts here. ✍️</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">📝</div>
          <div className="stat-content"><h3>{stats.total}</h3><p>Total Posts</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">✅</div>
          <div className="stat-content"><h3>{stats.published}</h3><p>Published</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning">📋</div>
          <div className="stat-content"><h3>{stats.draft}</h3><p>Drafts</p></div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>📄 My Posts</h2>
          <button onClick={() => openModal()} className="btn btn-primary">+ New Post</button>
        </div>
        <div className="card-body">
          {posts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h3>No posts yet</h3>
              <p>Create your first post to get started!</p>
            </div>
          ) : (
            <div className="posts-grid">
              {posts.map(post => (
                <div key={post._id} className="post-card">
                  <h3>{post.title}</h3>
                  <div className="post-meta">
                    <span>📅 {formatDate(post.createdAt)}</span>
                    <span>👁 {post.views || 0} views</span>
                  </div>
                  <p className="post-content">{post.content.substring(0, 150)}...</p>
                  <div className="post-footer">
                    <span className={`badge badge-${post.status}`}>{post.status}</span>
                    <div className="actions">
                      <button onClick={() => openViewModal(post)} className="btn btn-sm btn-info">View</button>
                      <button onClick={() => openModal(post)} className="btn btn-sm btn-secondary">Edit</button>
                      <button onClick={() => handleDelete(post._id)} className="btn btn-sm btn-danger">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPost ? '✏️ Edit Post' : '➕ New Post'}</h2>
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
                  </select>
                </div>
                <div className="modal-footer" style={{padding: 0, border: 'none', marginTop: '1rem'}}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editingPost ? 'Update' : 'Create'}</button>
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

export default UserDashboard;