import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Loader2, FileText, Mail, Lock, User, ArrowRight } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signup, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    const success = await signup(name, email, password);
    if (success) navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen bg-white font-sans">
      
      {/* Left: Blue gradient panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-indigo-600 via-blue-700 to-blue-800 relative overflow-hidden items-center justify-center p-12">
        {/* Decorative shapes */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-indigo-500/15 -translate-y-1/3 -translate-x-1/4" />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-blue-400/15 translate-y-1/4 translate-x-1/4" />
        <div className="absolute top-1/3 right-1/3 w-32 h-32 rounded-full bg-white/5" />
        
        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">CollabDoc</span>
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Start building<br />together, today.
          </h2>
          <p className="text-blue-100/80 text-base leading-relaxed">
            Create an account and start collaborating with your team in minutes. No setup required — just sign up and start writing.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-10">
            {[
              { num: '10K+', label: 'Users' },
              { num: '50K+', label: 'Documents' },
              { num: '99.9%', label: 'Uptime' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-xl font-bold text-white">{s.num}</p>
                <p className="text-xs text-blue-200/60 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Signup Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[400px]">
          
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div className="bg-blue-600 rounded-xl p-2">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-gray-900">CollabDoc</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
            <p className="text-sm text-gray-500">Start collaborating in seconds</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all text-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer active:scale-[0.98]"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Create account
            </button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-sm text-gray-500">Already have an account?</span>{' '}
            <Link to="/login" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
