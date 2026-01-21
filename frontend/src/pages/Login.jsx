import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const Login = () => {
  const { login } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [formData, setFormData] = useState({ email: '', password: '', tenantId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    authAPI.getTenants().then(res => setTenants(res.data.data)).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(formData.email, formData.password, formData.tenantId);
    if (!result.success) setError(result.message);
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back 👋</h2>
          <p>Sign in to your account</p>
        </div>
        
        {error && <div className="error-box">❌ {error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Organization</label>
            <select 
              value={formData.tenantId} 
              onChange={(e) => setFormData({...formData, tenantId: e.target.value})} 
              required
            >
              <option value="">Select organization...</option>
              {tenants.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              placeholder="Enter your email..."
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
              placeholder="Enter your password..."
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? '⏳ Signing in...' : '🚀 Sign In'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Register here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;