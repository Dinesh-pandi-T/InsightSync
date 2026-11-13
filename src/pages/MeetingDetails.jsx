import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function MeetingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const res = await axios.get(`${API_URL}/meeting/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setMeeting(res.data.meeting);
      } catch (err) {
        console.error("Fetch Meeting Error:", err);
      }
    };
    fetchMeeting();
  }, [id]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('meetingId', id);

    setLoading(true);
    try {
      await axios.post(`${API_URL}/audio/upload`, formData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Audio processed successfully!');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Failed to process audio');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCalendar = (task) => {
    if (!task.deadline) return alert("Task has no deadline");
    const d = new Date(task.deadline);
    const start = d.toISOString().replace(/-|:|\.\d\d\d/g,"");
    const end = new Date(d.getTime() + 60*60*1000).toISOString().replace(/-|:|\.\d\d\d/g,"");
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task.description)}&dates=${start}/${end}&details=Added%20from%20InsightSync`;
    window.open(url, '_blank');
  };

  if (!meeting) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Loading Meeting Details...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans p-8">
      <button onClick={() => navigate('/dashboard')} className="mb-6 px-4 py-2 font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        Back to Dashboard
      </button>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">{meeting.title}</h1>
            <p className="text-slate-500 font-medium">{new Date(meeting.date).toLocaleString()} • {meeting.status}</p>
          </div>
          {meeting.link && (
            <a href={meeting.link} target="_blank" rel="noreferrer" className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl border border-indigo-100 hover:bg-indigo-100">
              Join Meet
            </a>
          )}
        </div>

        {meeting.status === 'Scheduled' ? (
          (user && ['Manager', 'HR', 'TL'].includes(user.role)) ? (
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 rounded-[2rem] shadow-xl text-center relative overflow-hidden text-white">
              <h2 className="text-2xl font-black tracking-tight mb-4 relative z-10">Process Meeting Audio</h2>
              <p className="text-indigo-100 relative z-10 mb-8 max-w-lg mx-auto leading-relaxed font-medium">
                Upload the recording of this meeting to extract tasks, decisions, and personalized insights instantly using AI.
              </p>
              <form onSubmit={handleUpload} className="relative z-10 max-w-sm mx-auto space-y-4">
                <input 
                  type="file" 
                  accept="audio/*" 
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-sm text-indigo-100 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-white file:text-indigo-600 hover:file:bg-indigo-50 cursor-pointer"
                  required
                />
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 bg-white text-indigo-600 font-extrabold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {loading ? 'Processing through AI Pipeline (This may take a minute)...' : 'Upload & Synthesize'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-[2rem] shadow-sm border border-slate-100 text-center">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h2 className="text-xl font-bold text-slate-700 mb-2">Meeting Not Processed Yet</h2>
              <p className="text-slate-500 font-medium max-w-sm mx-auto">
                Only Managers, HR, and Team Leads can upload audio recordings to synthesize insights. Check back later once the recording has been processed!
              </p>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-xl font-extrabold flex items-center gap-3 text-slate-800">
                <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                Key Decisions
              </h3>
              {(!meeting.decisions || meeting.decisions.length === 0) ? (
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-slate-500">No decisions extracted.</div>
              ) : (
                <ul className="space-y-3">
                  {meeting.decisions.map((d, i) => (
                    <li key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm font-medium text-slate-700 flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-pink-500 mt-2 shrink-0"></div>
                      {d}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-extrabold flex items-center gap-3 text-slate-800">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
                </div>
                Action Tasks
              </h3>
              {(!meeting.tasks || meeting.tasks.length === 0) ? (
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-slate-500">No tasks extracted.</div>
              ) : (
                <div className="space-y-4">
                  {meeting.tasks.map((t, i) => (
                    <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between items-start gap-4">
                      <div>
                        <p className="font-bold text-slate-800">{t.description}</p>
                        <p className="text-sm font-semibold text-indigo-600 mt-1">Assigned to: {t.assigneeName || 'Someone'}</p>
                      </div>
                      <button 
                        onClick={() => handleAddToCalendar(t)}
                        className="px-4 py-2 bg-slate-50 text-slate-600 text-sm font-bold border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-2"
                      >
                         <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        Add to Calendar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="md:col-span-2 space-y-6">
              <h3 className="text-xl font-extrabold flex items-center gap-3 text-slate-800">
                <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7"/></svg>
                </div>
                Meeting Transcript
              </h3>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-slate-700 whitespace-pre-wrap font-medium">
                 {meeting.transcript || 'No transcript available.'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
