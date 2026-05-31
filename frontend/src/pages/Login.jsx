import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Loader2, FileText } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-sans items-center justify-center p-4">

      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-blue-600 rounded-lg p-1.5">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-2xl text-blue-600">CollabDoc</span>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#dadce0] rounded-2xl p-8 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <h1 className="text-2xl font-normal text-[#202124] mb-1 text-center">Sign in</h1>
          <p className="text-sm text-[#5f6368] mb-6 text-center">to continue to CollabDoc</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-[#5f6368] mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-2.5 bg-white border border-[#dadce0] rounded-lg text-[#202124] placeholder-[#9aa0a6] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-[#5f6368] mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-2.5 bg-white border border-[#dadce0] rounded-lg text-[#202124] placeholder-[#9aa0a6] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                placeholder="••••••••••••"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Link to="/signup" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                Create account
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-full text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
};

export default Login;
