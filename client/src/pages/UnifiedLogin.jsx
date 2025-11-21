import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiMapPin, FiUsers, FiTrendingUp, FiShield } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function UnifiedLogin() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState('user');
  const [isHovered, setIsHovered] = useState(false);
  const { login, loading, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'owner') {
        navigate('/owner/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    const result = await login(formData.email, formData.password);
    if (result.success) {
      toast.success('Login successful!');
      if (result.user?.role === 'owner') {
        navigate('/owner/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } else {
      toast.error(result.error);
    }
  };

  const isOwnerLogin = userType === 'owner';

  const features = isOwnerLogin
    ? [
        { icon: FiTrendingUp, text: 'Analytics Dashboard' },
        { icon: FiMapPin, text: 'Manage Listings' },
        { icon: FiShield, text: 'Verified Business' },
      ]
    : [
        { icon: FiMapPin, text: 'Discover Places' },
        { icon: FiUsers, text: 'Join Community' },
        { icon: FiShield, text: 'Secure Bookings' },
      ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-6xl flex gap-8 items-center relative z-10">
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:flex lg:w-1/2 flex-col">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-white/20">
            <div className="mb-8">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${
                isOwnerLogin ? 'from-green-500 to-emerald-600' : 'from-blue-500 to-indigo-600'
              } shadow-lg mb-6 transform transition-transform hover:scale-110`}>
                <span className="text-white font-bold text-2xl">
                  {isOwnerLogin ? 'O' : 'T'}
                </span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                {isOwnerLogin ? 'Grow Your Business' : 'Explore the World'}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                {isOwnerLogin
                  ? 'Join thousands of property owners managing their listings with ease and reaching more customers every day.'
                  : 'Discover amazing places, create unforgettable memories, and connect with a community of travelers worldwide.'}
              </p>
            </div>

            <div className="space-y-5">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:shadow-md transition-all duration-300 group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                    isOwnerLogin ? 'from-green-100 to-emerald-100' : 'from-blue-100 to-indigo-100'
                  } flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`${isOwnerLogin ? 'text-green-600' : 'text-blue-600'}`} size={22} />
                  </div>
                  <span className="text-gray-700 font-medium">{feature.text}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-white"></div>
                    ))}
                  </div>
                  <span className="ml-2">10k+ Active Users</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★★★★★</span>
                  <span className="ml-1">4.9/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="lg:hidden inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg mb-4">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {isOwnerLogin ? 'Owner Portal' : 'Welcome Back'}
              </h1>
              <p className="text-gray-600">
                {isOwnerLogin
                  ? 'Access your business dashboard'
                  : 'Continue your journey with TourMate'}
              </p>
            </div>

            {/* User Type Selector */}
            <div className="relative flex gap-2 p-1.5 bg-gray-100 rounded-xl mb-8">
              <div
                className={`absolute top-1.5 bottom-1.5 rounded-lg bg-gradient-to-r transition-all duration-300 ease-out ${
                  userType === 'user'
                    ? 'left-1.5 right-[calc(50%+2px)] from-blue-500 to-indigo-600'
                    : 'left-[calc(50%+2px)] right-1.5 from-green-500 to-emerald-600'
                }`}
              ></div>
              <button
                type="button"
                onClick={() => setUserType('user')}
                className={`flex-1 relative z-10 py-3 px-4 rounded-lg font-semibold transition-colors duration-300 ${
                  userType === 'user' ? 'text-white' : 'text-gray-700'
                }`}
              >
                Tourist
              </button>
              <button
                type="button"
                onClick={() => setUserType('owner')}
                className={`flex-1 relative z-10 py-3 px-4 rounded-lg font-semibold transition-colors duration-300 ${
                  userType === 'owner' ? 'text-white' : 'text-gray-700'
                }`}
              >
                Owner
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={isOwnerLogin ? 'owner@example.com' : 'you@example.com'}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                  <span className="text-gray-600 group-hover:text-gray-900 transition-colors">Remember me</span>
                </label>
                <a href="/forgot-password" className="text-blue-500 hover:text-blue-600 font-semibold transition-colors">
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`relative w-full py-4 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 transform ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-xl'
                } ${
                  isOwnerLogin
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                } disabled:hover:scale-100`}
              >
                <span className="relative z-10">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="my-8 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-gray-500 text-sm font-medium">or continue with</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Links */}
            <div className="text-center">
              {userType === 'user' ? (
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <a href="/signup" className="text-blue-500 hover:text-blue-600 font-semibold transition-colors">
                    Sign up for free
                  </a>
                </p>
              ) : (
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <a href="/owner/signup" className="text-green-500 hover:text-green-600 font-semibold transition-colors">
                    Register your business
                  </a>
                </p>
              )}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <FiShield size={14} />
              <span>Secure Login</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
            <div>256-bit Encryption</div>
            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
            <div>GDPR Compliant</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}