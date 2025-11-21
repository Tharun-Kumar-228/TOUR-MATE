import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCheck, FiX, FiTrendingUp, FiDollarSign, FiShield, FiBarChart2, FiBriefcase, FiAward } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function OwnerSignup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { signup, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.passwordConfirm) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    const result = await signup(
      formData.name,
      formData.email,
      formData.password,
      formData.passwordConfirm,
      'owner'
    );

    if (result.success) {
      toast.success('Account created successfully!');
      navigate('/owner/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  // Password strength checker
  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 3) return { strength, label: 'Fair', color: 'bg-yellow-500' };
    if (strength <= 4) return { strength, label: 'Good', color: 'bg-blue-500' };
    return { strength, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength();
  const passwordsMatch = formData.password && formData.passwordConfirm && formData.password === formData.passwordConfirm;

  const benefits = [
    { icon: FiTrendingUp, text: 'Increase visibility & bookings', color: 'from-green-500 to-emerald-500' },
    { icon: FiBarChart2, text: 'Advanced analytics dashboard', color: 'from-blue-500 to-cyan-500' },
    { icon: FiDollarSign, text: 'Maximize revenue potential', color: 'from-yellow-500 to-orange-500' },
    { icon: FiShield, text: 'Verified business badge', color: 'from-purple-500 to-pink-500' },
  ];

  const stats = [
    { value: '5k+', label: 'Active Listings' },
    { value: '92%', label: 'Satisfaction Rate' },
    { value: '$2.5M+', label: 'Revenue Generated' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-6xl flex gap-8 items-center relative z-10">
        {/* Left Side - Business Benefits & Stats */}
        <div className="hidden lg:flex lg:w-1/2 flex-col">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-white/20">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg mb-6 transform transition-transform hover:scale-110">
                <FiBriefcase className="text-white" size={28} />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                Grow Your Business
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Join thousands of successful property owners who trust TourMate to manage their listings and connect with travelers worldwide.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-8 p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:shadow-md transition-all duration-300 group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${benefit.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                    <benefit.icon className="text-white" size={22} />
                  </div>
                  <span className="text-gray-700 font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* Success Story */}
            <div className="relative p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                  <FiAward className="text-white" size={20} />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Success Story</div>
                  <p className="text-gray-700 text-sm italic">
                    "TourMate increased our bookings by 300% in just 6 months. The platform is intuitive and the support team is amazing!"
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 pl-13">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-500"></div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">Michael Chen</div>
                  <div className="text-xs text-gray-600">Resort Owner, Bali</div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 border-2 border-white"></div>
                    ))}
                  </div>
                  <span className="ml-2">5,000+ Owners</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★★★★★</span>
                  <span className="ml-1">4.8/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-full lg:w-1/2">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="lg:hidden inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg mb-4">
                <FiBriefcase className="text-white" size={24} />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Register Your Business
              </h1>
              <p className="text-gray-600">
                Start managing your listings today
              </p>
            </div>

            {/* Form */}
            <div className="space-y-5">
              {/* Business Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Name
                </label>
                <div className="relative group">
                  <FiUser 
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                      focusedField === 'name' ? 'text-green-500' : 'text-gray-400'
                    }`} 
                    size={20} 
                  />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Your Business Name"
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                  />
                  {formData.name && (
                    <FiCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={20} />
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Email
                </label>
                <div className="relative group">
                  <FiMail 
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                      focusedField === 'email' ? 'text-green-500' : 'text-gray-400'
                    }`} 
                    size={20} 
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="owner@business.com"
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                  />
                  {formData.email && formData.email.includes('@') && (
                    <FiCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={20} />
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <FiLock 
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                      focusedField === 'password' ? 'text-green-500' : 'text-gray-400'
                    }`} 
                    size={20} 
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600">Password strength</span>
                      <span className={`text-xs font-semibold ${
                        passwordStrength.strength <= 2 ? 'text-red-600' : 
                        passwordStrength.strength <= 3 ? 'text-yellow-600' : 
                        passwordStrength.strength <= 4 ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all ${
                            i <= passwordStrength.strength ? passwordStrength.color : 'bg-gray-200'
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">At least 8 characters</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative group">
                  <FiLock 
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                      focusedField === 'passwordConfirm' ? 'text-green-500' : 'text-gray-400'
                    }`} 
                    size={20} 
                  />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="passwordConfirm"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('passwordConfirm')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                  {formData.passwordConfirm && (
                    passwordsMatch ? (
                      <FiCheck className="absolute right-12 top-1/2 -translate-y-1/2 text-green-500" size={20} />
                    ) : (
                      <FiX className="absolute right-12 top-1/2 -translate-y-1/2 text-red-500" size={20} />
                    )
                  )}
                </div>
                {formData.passwordConfirm && !passwordsMatch && (
                  <p className="text-xs text-red-600 mt-1">Passwords don't match</p>
                )}
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer group pt-2">
                <input
                  type="checkbox"
                  className="mt-0.5 w-5 h-5 rounded border-gray-300 text-green-500 focus:ring-2 focus:ring-green-200"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  I agree to the{' '}
                  <a href="/terms" className="text-green-500 hover:text-green-600 font-semibold">
                    Terms of Service
                  </a>
                  {' '}and{' '}
                  <a href="/privacy" className="text-green-500 hover:text-green-600 font-semibold">
                    Privacy Policy
                  </a>
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={`relative w-full py-4 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 transform ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-xl'
                } bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:hover:scale-100`}
              >
                <span className="relative z-10">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating Account...
                    </span>
                  ) : (
                    'Register Business'
                  )}
                </span>
              </button>
            </div>

            {/* Divider */}
            <div className="my-8 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-gray-500 text-sm font-medium">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Links */}
            <div className="space-y-3 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/owner/login" className="text-green-500 hover:text-green-600 font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
              <p className="text-gray-600">
                Are you a tourist?{' '}
                <Link to="/signup" className="text-blue-500 hover:text-blue-600 font-semibold transition-colors">
                  Tourist signup
                </Link>
              </p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-500 flex-wrap">
            <div className="flex items-center gap-1">
              <FiShield size={14} />
              <span>Business Verified</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
            <div>Commission-Free Trial</div>
            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
            <div>24/7 Support</div>
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