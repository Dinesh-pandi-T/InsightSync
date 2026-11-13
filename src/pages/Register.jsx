import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ company: '', role: 'Developer' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(`${API_URL}/auth/register`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (error) {
      console.error("Registration Failed:", error);
      alert("Failed to complete registration.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 w-full h-[600px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-b-[100%] skew-y-3 transform -translate-y-[300px]"></div>
      
      <div className="relative z-10 w-full max-w-md p-10 bg-white rounded-[2rem] shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Complete Profile</h2>
          <p className="text-slate-500 mt-2 font-medium">Just a few more details to get started.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide">Company Name</label>
            <input 
              type="text" 
              name="company" 
              value={formData.company} 
              onChange={handleChange} 
              required 
              className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 outline-none font-medium"
              placeholder="e.g. Acme Corp"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide">Your Role</label>
            <div className="relative group">
              <select 
                name="role" 
                value={formData.role} 
                onChange={handleChange} 
                className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 appearance-none outline-none font-medium cursor-pointer relative z-10 bg-transparent"
              >
                <option value="Manager">Manager</option>
                <option value="HR">HR</option>
                <option value="TL">Team Lead (TL)</option>
                <option value="Developer">Developer</option>
                <option value="Worker">Other Worker</option>
              </select>
              <div className="absolute inset-0 bg-slate-50 rounded-xl"></div>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-slate-400 group-hover:text-indigo-500 transition-colors z-20">
                <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full mt-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1 active:translate-y-0 tracking-wide"
          >
            Continue to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
