import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tenantsAPI, usersAPI, postsAPI } from '../services/api';
import { formatDate } from '../utils/dateFormat';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ tenants: 0, users: 0, posts: 0, published: 0 });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tenantsRes, usersRes, postsRes, statsRes] = await Promise.all([
        tenantsAPI.getAll({ limit: 1 }),
        usersAPI.getAll({ limit: 1 }),
        postsAPI.getAll({ limit: 5 }),
        postsAPI.getStats()
      ]);
      setStats({
        tenants: tenantsRes.data.total,
        users: usersRes.data.total,
        posts: statsRes.data.data.total,
        published: statsRes.data.data.published
      });
      setRecentPosts(postsRes.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user.name}! 👋</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">🏢</div>
          <div className="stat-content"><h3>{stats.tenants}</h3><p>Tenants</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">👥</div>
          <div className="stat-content"><h3>{stats.users}</h3><p>Users</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon info">📝</div>
          <div className="stat-content"><h3>{stats.posts}</h3><p>Total Posts</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning">✅</div>
          <div className="stat-content"><h3>{stats.published}</h3><p>Published</p></div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>📋 Recent Posts</h2>
          <Link to="/posts" className="btn btn-sm btn-primary">View All</Link>
        </div>
        <div className="card-body">
          {recentPosts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h3>No posts yet</h3>
              <p>Posts will appear here once created.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Tenant</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPosts.map(post => (
                    <tr key={post._id}>
                      <td><strong>{post.title}</strong></td>
                      <td>{post.author?.name}</td>
                      <td>{post.tenant?.name}</td>
                      <td><span className={`badge badge-${post.status}`}>{post.status}</span></td>
                      <td>{formatDate(post.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;