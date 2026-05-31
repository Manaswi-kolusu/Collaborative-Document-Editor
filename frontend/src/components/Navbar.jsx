import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, FileText, Search } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isDashboard = location.pathname === '/' || location.pathname === '/dashboard';

  return (
    <nav className="bg-white border-b border-[#dadce0] px-4 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-50 select-none gap-4">
      {/* Left: Logo */}
      <Link to="/" className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity shrink-0">
        <div className="bg-blue-600 rounded-lg p-1.5 flex items-center justify-center">
          <FileText className="h-5 w-5 text-white" />
        </div>
        <span className="font-bold text-[20px] tracking-tight text-blue-600 hidden sm:block">
          CollabDoc
        </span>
      </Link>

      {/* Center: Nav Links + Search (only on dashboard) */}
      {isDashboard && (
        <div className="flex-1 flex items-center justify-center gap-1 max-w-2xl mx-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5f6368]" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f1f3f4] hover:bg-[#e8eaed] focus:bg-white border border-transparent focus:border-[#dadce0] focus:shadow-[0_1px_6px_rgba(32,33,36,0.12)] rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none transition-all placeholder:text-[#5f6368]"
            />
          </div>
        </div>
      )}

      {/* Right: User */}
      {user && (
        <div className="flex items-center gap-2 relative shrink-0" ref={profileRef}>
          <div
            onClick={() => setShowProfile(!showProfile)}
            className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:shadow-md transition-shadow select-none"
            title={user.name}
          >
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-[#dadce0] rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.12)] py-4 z-50">
              <div className="flex flex-col items-center px-4 mb-3">
                <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-2xl mb-2">
                  {user?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <span className="text-sm font-medium text-[#202124]">{user?.name}</span>
                <span className="text-xs text-[#5f6368] truncate max-w-full">{user?.email}</span>
              </div>
              <hr className="border-[#e0e0e0] my-2" />
              <div className="px-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 hover:bg-[#f1f3f4] text-[#202124] rounded-lg py-2.5 px-4 text-sm font-medium transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
