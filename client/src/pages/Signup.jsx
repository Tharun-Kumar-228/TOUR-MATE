import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCheck, FiX, FiMapPin, FiUsers, FiShield, FiStar } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Signup() {
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
      'user'
    );

    if (result.success) {
      toast.success('Account created successfully!');
      navigate('/dashboard');
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
    { icon: FiMapPin, text: 'Discover hidden gems', color: 'from-blue-500 to-cyan-500' },
    { icon: FiUsers, text: 'Connect with travelers', color: 'from-purple-500 to-pink-500' },
    { icon: FiStar, text: 'Save your favorites', color: 'from-yellow-500 to-orange-500' },
    { icon: FiShield, text: 'Secure bookings', color: 'from-green-500 to-emerald-500' },
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
        {/* Left Side - Benefits & Social Proof */}
        <div className="hidden lg:flex lg:w-1/2 flex-col">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-white/20">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg mb-6 transform transition-transform hover:scale-110">
                <span className="text-white font-bold text-2xl">T</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                Start Your Adventure
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Join a community of travelers exploring the world's most amazing destinations. Create your personalized travel experience today.
              </p>
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

            {/* Testimonial */}
            <div className="relative p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
              <div className="absolute -top-3 -left-3 text-6xl text-blue-200">"</div>
              <p className="text-gray-700 italic mb-4 relative z-10">
                TourMate helped me discover places I never knew existed. The community is amazing and the platform is so easy to use!
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
                <div>
                  <div className="font-semibold text-gray-900">Sarah Johnson</div>
                  <div className="text-sm text-gray-600">Verified Traveler</div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-white"></div>
                    ))}
                  </div>
                  <span className="ml-2">15k+ Members</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★★★★★</span>
                  <span className="ml-1">4.9/5</span>
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
              <div className="lg:hidden inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg mb-4">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Create Account
              </h1>
              <p className="text-gray-600">
                Start your journey in just a few clicks
              </p>
            </div>

            {/* Form */}
            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative group">
                  <FiUser 
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                      focusedField === 'name' ? 'text-blue-500' : 'text-gray-400'
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
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  />
                  {formData.name && (
                    <FiCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={20} />
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <FiMail 
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                      focusedField === 'email' ? 'text-blue-500' : 'text-gray-400'
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
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
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
                      focusedField === 'password' ? 'text-blue-500' : 'text-gray-400'
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
                      focusedField === 'passwordConfirm' ? 'text-blue-500' : 'text-gray-400'
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
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
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
                  className="mt-0.5 w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  I agree to the{' '}
                  <a href="/terms" className="text-blue-500 hover:text-blue-600 font-semibold">
                    Terms of Service
                  </a>
                  {' '}and{' '}
                  <a href="/privacy" className="text-blue-500 hover:text-blue-600 font-semibold">
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
                } bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:hover:scale-100`}
              >
                <span className="relative z-10">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating Account...
                    </span>
                  ) : (
                    'Create Account'
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
                <Link to="/login" className="text-blue-500 hover:text-blue-600 font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
              <p className="text-gray-600">
                Are you a place owner?{' '}
                <Link to="/owner/signup" className="text-green-500 hover:text-green-600 font-semibold transition-colors">
                  Register your business
                </Link>
              </p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <FiShield size={14} />
              <span>Secure Registration</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
            <div>No Credit Card Required</div>
            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
            <div>Free Forever</div>
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