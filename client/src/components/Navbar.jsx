import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut, FiUser } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const isOwner = user?.role === 'owner';

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="font-bold text-xl text-gray-900 hidden sm:inline">TourMate</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {user ? (
              <>
                {!isOwner && (
                  <>
                    <Link to="/dashboard" className="text-gray-700 hover:text-blue-500 transition">
                      Dashboard
                    </Link>
                    <Link to="/plan" className="text-gray-700 hover:text-blue-500 transition">
                      Plan Tour
                    </Link>
                    <Link to="/reviews" className="text-gray-700 hover:text-blue-500 transition">
                      Reviews
                    </Link>
                    <Link to="/history" className="text-gray-700 hover:text-blue-500 transition">
                      History
                    </Link>
                    <Link to="/favourites" className="text-gray-700 hover:text-blue-500 transition">
                      Favorites
                    </Link>
                  </>
                )}
                {isOwner && (
                  <>
                    <Link to="/owner/dashboard" className="text-gray-700 hover:text-blue-500 transition">
                      Dashboard
                    </Link>
                    <Link to="/owner/add-place" className="text-gray-700 hover:text-blue-500 transition">
                      Add Place
                    </Link>
                  </>
                )}
                <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                  <span className="text-sm text-gray-600">{user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                  >
                    <FiLogOut size={18} />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-500 transition">
                  Login
                </Link>
                <Link to="/signup" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 hover:text-blue-500"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200">
            {user ? (
              <>
                <div className="py-2 px-2 text-sm text-gray-600 font-semibold">
                  {user.name}
                </div>
                {!isOwner && (
                  <>
                    <Link to="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                      Dashboard
                    </Link>
                    <Link to="/plan" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                      Plan Tour
                    </Link>
                    <Link to="/reviews" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                      Reviews
                    </Link>
                    <Link to="/history" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                      History
                    </Link>
                    <Link to="/favourites" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                      Favorites
                    </Link>
                  </>
                )}
                {isOwner && (
                  <>
                    <Link to="/owner/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                      Dashboard
                    </Link>
                    <Link to="/owner/add-place" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                      Add Place
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded flex items-center gap-2"
                >
                  <FiLogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                  Login
                </Link>
                <Link to="/signup" className="block px-4 py-2 text-blue-500 hover:bg-blue-50 rounded">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
