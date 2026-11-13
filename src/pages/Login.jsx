import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function Login() {
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${API_URL}/auth/google`, {
        token: credentialResponse.credential,
      });
      // Save token
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      if (res.data.isNewUser || res.data.user.role === 'Pending') {
        navigate('/register');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Login Failed:", error);
      alert("Failed to login. Check console for details.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen relative overflow-hidden bg-slate-900">
      {/* Background blobs for premium glassmorphism effect */}
      <div className="absolute top-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-indigo-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[30rem] h-[30rem] bg-purple-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[30rem] h-[30rem] bg-pink-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob" style={{animationDelay: '4s'}}></div>

      <div className="relative z-10 w-full max-w-md p-10 backdrop-blur-2xl bg-white/10 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/20 mb-4 shadow-inner ring-1 ring-white/20">
            <svg className="w-8 h-8 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">InsightSync</h1>
          <p className="text-slate-300 font-medium tracking-wide text-sm">AI Meeting Intelligence</p>
        </div>
        
        <div className="space-y-6 flex flex-col items-center">
          <div className="w-full flex justify-center p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-white/10 shadow-inner group cursor-pointer">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => console.log('Login Failed')}
              shape="pill"
              size="large"
              text="continue_with"
            />
          </div>
          <p className="text-center text-xs text-slate-400 mt-4 px-4 leading-relaxed">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
