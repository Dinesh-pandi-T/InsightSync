import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showManageTeamModal, setShowManageTeamModal] = useState(false);

  // Forms & Selected
  const [profileForm, setProfileForm] = useState({ name: '', company: '' });
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [teamCodeInput, setTeamCodeInput] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [meetingForm, setMeetingForm] = useState({ title: '', date: '', link: '', teamId: '' });
  const [searchDate, setSearchDate] = useState('');

  // Data
  const [meetings, setMeetings] = useState([]);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  const fetchMeetings = async () => {
    try {
      const res = await axios.get(`${API_URL}/meeting/list`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMeetings(res.data.meetings);
    } catch (err) {
      console.error("Failed to fetch meetings:", err);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await axios.get(`${API_URL}/team/list`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTeams(res.data.teams);
      if (res.data.teams.length > 0) {
        setMeetingForm(prev => ({ ...prev, teamId: res.data.teams[0]._id }));
      }
    } catch (err) {
      console.error("Failed to fetch teams:", err);
    }
  };

  useEffect(() => {
    if (user && user.teamIds && user.teamIds.length > 0) {
      fetchMeetings();
      fetchTeams();
    }
  }, [user]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/team/create`, { teamName }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setGeneratedCode(res.data.teamCode);
      const updatedUser = { ...user, teamIds: [...(user.teamIds || []), res.data.team._id] };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (fetchTeams) fetchTeams();
    } catch (err) {
      alert("Error creating team.");
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/team/join`, { teamCode: teamCodeInput }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const updatedUser = { ...user, teamIds: [...(user.teamIds || []), res.data.team._id] };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert("Successfully joined team!");
      setShowJoinModal(false);
      fetchMeetings(); // Fetch meetings on join
      fetchTeams(); // Fetch new teams list
    } catch (err) {
      alert("Failed to join team. Invalid code.");
    }
  };

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/meeting/create`, meetingForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setShowScheduleModal(false);
      setMeetingForm({ title: '', date: '', link: '', teamId: teams.length > 0 ? teams[0]._id : '' });
      fetchMeetings();
    } catch (err) {
      alert("Failed to schedule meeting");
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API_URL}/user/profile`, profileForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const updatedUser = { ...user, ...res.data.user };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setShowEditProfileModal(false);
    } catch (err) {
      alert("Failed to update profile.");
    }
  };

  const handleRemoveMember = async (teamId, userIdToRemove) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await axios.post(`${API_URL}/team/remove-member`, { teamId, userIdToRemove }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Optimistically update the selectedTeam members list locally
      if (selectedTeam) {
        setSelectedTeam(prev => ({
          ...prev,
          members: prev.members.filter(m => m._id !== userIdToRemove)
        }));
      }
      fetchTeams();
    } catch (err) {
      alert("Failed to remove member.");
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Loading InsightSync...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">InsightSync</h1>
        </div>
        
        <div className="flex items-center gap-5">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-extrabold text-slate-800 flex items-center justify-end gap-2">
              {user.name}
              <button onClick={() => { setProfileForm({ name: user.name, company: user.company || '' }); setShowEditProfileModal(true); }} className="text-slate-400 hover:text-indigo-600 transition-colors" title="Edit Profile">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
            </p>
            <p className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full inline-block mt-0.5">{user.role}</p>
          </div>
          {user.picture ? (
            <img src={user.picture} alt="Profile" className="w-11 h-11 rounded-full border-2 border-white shadow-md" />
          ) : (
            <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shadow-inner border border-indigo-200">
              {user.name?.charAt(0)}
            </div>
          )}
          <div className="h-8 w-px bg-slate-200 mx-1"></div>
          <button 
            onClick={() => { localStorage.clear(); navigate('/login'); }}
            className="px-4 py-2 text-sm font-bold text-rose-600 bg-white border border-rose-100 rounded-xl hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8">
          <div>
            <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">Welcome back, {user.name.split(' ')[0]} <span className="inline-block animate-bounce ml-2">👋</span></h2>
            <p className="text-slate-500 mt-2 font-medium text-lg">Here is your meeting intelligence overview for today.</p>
          </div>
          
          <div className="flex gap-4">
            {['Manager', 'HR', 'TL'].includes(user.role) && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3.5 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2 group"
              >
                <svg className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
                Create Team
              </button>
            )}
            {user.role !== 'Manager' && (
              <button 
                onClick={() => setShowJoinModal(true)}
                className="px-6 py-3.5 bg-indigo-50 text-indigo-700 font-bold rounded-2xl shadow-sm border border-indigo-100 hover:bg-indigo-100 transition-all flex items-center gap-2"
              >
                Join Team
              </button>
            )}
            
            {(user.teamIds && user.teamIds.length > 0) && (user.role === 'Manager' || user.role === 'HR' || user.role === 'TL') &&  (
              <button 
                onClick={() => setShowScheduleModal(true)}
                className="px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:shadow-indigo-600/40 transition-all flex items-center gap-2 group"
              >
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                Schedule Meeting
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-extrabold flex items-center gap-3 text-slate-800">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </div>
                Recent & Upcoming Meetings
              </h3>
              <input 
                type="date" 
                value={searchDate} 
                onChange={e => setSearchDate(e.target.value)} 
                className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-600 text-sm shadow-sm"
              />
            </div>
            
            {meetings.length === 0 ? (
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 text-center py-12">
                <p className="text-slate-400 font-medium">No meetings found. {(user.teamIds && user.teamIds.length > 0) ? 'Schedule one!' : 'Join a team first.'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {meetings.filter(m => {
                  if (!searchDate) return true;
                  return new Date(m.date).toISOString().split('T')[0] === searchDate;
                }).map((m) => (
                  <div key={m._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-lg text-slate-800">{m.title}</h4>
                      <p className="text-slate-500 text-sm mt-1">{new Date(m.date).toLocaleString()} • {m.status}</p>
                    </div>
                    {m.status === 'Scheduled' && ['Manager', 'HR', 'TL'].includes(user.role) && (
                        <button onClick={() => navigate(`/meeting/${m._id}`)} className="px-5 py-2.5 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-colors">
                          Upload Audio
                        </button>
                    )}
                    {m.status === 'Scheduled' && !['Manager', 'HR', 'TL'].includes(user.role) && (
                        <span className="px-4 py-2 text-sm text-slate-400 font-medium">Waiting for recording...</span>
                    )}
                    {m.status === 'Processed' && (
                        <button onClick={() => navigate(`/meeting/${m._id}`)} className="px-5 py-2.5 bg-green-50 text-green-600 font-bold rounded-xl hover:bg-green-100 transition-colors">
                          View Insights
                        </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-extrabold flex items-center gap-3 text-slate-800">
                  <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
                  </div>
                  My Action Items
                </h3>
              </div>
              <div className="text-slate-400 text-sm text-center py-12 font-medium bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
                You're all caught up! 🚀
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-extrabold flex items-center gap-3 text-slate-800">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </div>
                  My Teams
                </h3>
              </div>
              {teams.length === 0 ? (
                <div className="text-slate-400 text-sm text-center py-8 font-medium bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
                  You haven't joined any teams yet.
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {teams.map(t => (
                    <div key={t._id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <h4 className="font-bold text-slate-800 text-lg">{t.teamName}</h4>
                      <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{t.members?.length || 1} Member{(t.members?.length !== 1) ? 's' : ''}</p>
                      
                      {['Manager', 'HR', 'TL'].includes(user.role) && (
                        <div className="mt-4 flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm">
                           <span className="text-xs font-bold text-slate-400 uppercase">Join Code</span>
                           <span className="text-sm font-black text-indigo-600 tracking-widest mr-auto ml-3">{t.teamCode}</span>
                           <button onClick={() => { setSelectedTeam(t); setShowManageTeamModal(true); }} className="text-xs text-indigo-600 hover:text-indigo-800 font-bold underline">Manage</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* CREATE TEAM MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           {/* ... Same as before, logic present ... */}
           <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-md scale-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Create a New Team</h3>
            <p className="text-slate-500 mb-6 font-medium">Generate a unique code to invite your members.</p>
            {!generatedCode ? (
              <form onSubmit={handleCreateTeam}>
                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Team Name</label>
                  <input type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} required className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium" placeholder="E.g. Engineering Squad" />
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="w-full py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                  <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">Create</button>
                </div>
              </form>
            ) : (
              <div className="text-center">
                <div className="mb-6 p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-indigo-200">
                  <p className="text-sm font-bold text-slate-500 mb-2">Team Join Code</p>
                  <p className="text-4xl font-black text-indigo-600 tracking-widest">{generatedCode}</p>
                </div>
                <button onClick={() => { setShowCreateModal(false); setGeneratedCode(''); }} className="w-full py-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors">Done</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* JOIN TEAM MODAL */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-md scale-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Join a Team</h3>
            <p className="text-slate-500 mb-6 font-medium">Enter the 8-character code provided by your manager.</p>
            <form onSubmit={handleJoinTeam}>
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Team Code</label>
                <input type="text" value={teamCodeInput} onChange={(e) => setTeamCodeInput(e.target.value.toUpperCase())} required maxLength={8} className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-center tracking-widest text-lg" placeholder="EXAMPL3" />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowJoinModal(false)} className="w-full py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">Join</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE MEETING MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-md scale-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Schedule Meeting</h3>
            <p className="text-slate-500 mb-6 font-medium">Plan the next discussion for your team.</p>
            <form onSubmit={handleScheduleMeeting}>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Select Team</label>
                  <select value={meetingForm.teamId} onChange={(e) => setMeetingForm({...meetingForm, teamId: e.target.value})} required className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium text-slate-700">
                    <option value="" disabled>Choose a team...</option>
                    {teams.map(t => <option key={t._id} value={t._id}>{t.teamName} ({t.teamCode})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Meeting Title</label>
                  <input type="text" value={meetingForm.title} onChange={(e) => setMeetingForm({...meetingForm, title: e.target.value})} required className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium" placeholder="Sprint Planning" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Date & Time</label>
                  <input type="datetime-local" value={meetingForm.date} onChange={(e) => setMeetingForm({...meetingForm, date: e.target.value})} required className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Meeting Link (Optional)</label>
                  <input type="url" value={meetingForm.link} onChange={(e) => setMeetingForm({...meetingForm, link: e.target.value})} className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium" placeholder="https://meet.google.com/..." />
                </div>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowScheduleModal(false)} className="w-full py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-md scale-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Edit Profile</h3>
            <p className="text-slate-500 mb-6 font-medium">Update your account information.</p>
            <form onSubmit={handleEditProfile}>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                  <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} required className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium" placeholder="Your Name" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Company</label>
                  <input type="text" value={profileForm.company} onChange={(e) => setProfileForm({...profileForm, company: e.target.value})} className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium" placeholder="Company Name" />
                </div>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowEditProfileModal(false)} className="w-full py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE TEAM MODAL */}
      {showManageTeamModal && selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-lg scale-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Manage: {selectedTeam.teamName}</h3>
            <p className="text-slate-500 mb-6 font-medium">Currently {selectedTeam.members.length} members in the team.</p>
            
            <div className="space-y-3 max-h-[350px] overflow-y-auto mb-8 pr-2">
              {selectedTeam.members.map(member => (
                <div key={member._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    {member.picture ? (
                      <img src={member.picture} alt="Profile" className="w-10 h-10 rounded-full border border-slate-200 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 font-bold flex flex-shrink-0 items-center justify-center">
                        {member.name?.charAt(0)}
                      </div>
                    )}
                    <div>
                       <p className="text-sm font-bold text-slate-800">{member.name}</p>
                       <p className="text-xs text-slate-500">{member.role} • {member.email}</p>
                    </div>
                  </div>
                  {member._id !== user.id && ['Manager', 'HR', 'TL'].includes(user.role) && (
                     <button onClick={() => handleRemoveMember(selectedTeam._id, member._id)} className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors">
                       Remove
                     </button>
                  )}
                  {member._id === user.id && (
                     <span className="px-3 py-1.5 text-xs font-bold text-slate-400 bg-slate-100 rounded-lg">You</span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button onClick={() => setShowManageTeamModal(false)} className="w-full py-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors">Done</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
