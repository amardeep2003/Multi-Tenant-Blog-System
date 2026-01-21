import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const Register = () => {
  const { register } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', tenantId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    authAPI.getTenants().then(res => setTenants(res.data.data)).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    const result = await register(formData.name, formData.email, formData.password, formData.tenantId);
    if (!result.success) setError(result.message);
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account ✨</h2>
          <p>Join your organization today</p>
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
            <label>Full Name</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              placeholder="Enter your name..."
              required 
            />
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
              placeholder="Create a password..."
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Confirm Password</label>
            <input 
              type="password" 
              value={formData.confirmPassword} 
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
              placeholder="Confirm your password..."
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? '⏳ Creating...' : '🎉 Create Account'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign in here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;