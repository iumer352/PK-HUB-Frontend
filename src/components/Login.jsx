import axios from 'axios';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import kpmgLogo from '../assets/kpmg.png';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [appMode, setAppMode] = useState('resource-tracker'); // 'resource-tracker' or 'recruitment'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', formData);

      if (response.data.status === 'success') {
        const { user } = response.data.data;
        console.log(user.role);

        // Store the token in localStorage
        localStorage.setItem('token', response.data.token);
        // Store user info
        localStorage.setItem('user', JSON.stringify(user));

        // Check user role and navigate based on app mode
        const isAdmin = user.role === 'admin' || user.role === 'hr' || user.role === 'interviewer';

        if (isAdmin) {
          // Admin can access both apps - navigate based on selected mode
          if (appMode === 'recruitment') {
            navigate('/dashboard');
          } else {
            navigate('/employee-dashboard');
          }
        } else if (user.role === 'user') {
          // Non-admin users can only access Resource Tracker (redirect regardless of selection)
          navigate('/employee-dashboard');
        } else {
          setError('You do not have permissions to access this application');
          // Remove any existing tokens/data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        setError('You do not have permissions to access this application');
        // Remove any existing tokens/data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Incorrect Username or Password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* KPMG Logo */}
      <div className="absolute top-12 left-12">
        <img
          src={kpmgLogo}
          alt="KPMG"
          className="h-24 lg:h-28 xl:h-36 2xl:h-40 w-auto opacity-90 transform hover:scale-105 transition-transform duration-300 drop-shadow-2xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xs lg:max-w-sm xl:max-w-md 2xl:max-w-lg"
      >
        {/* Welcome Text */}
        <div className="text-center mb-6 lg:mb-7 xl:mb-8">
          <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            Welcome to KPMG Operations App
          </h1>
          <p className="text-sm lg:text-base xl:text-lg text-gray-400 mt-3">
            Sign in to your account
          </p>
        </div>

        {/* App Mode Toggle */}
        <div className="mb-4 lg:mb-5 xl:mb-6">
          <label className="block text-xs lg:text-sm mb-2 xl:text-base font-medium text-gray-300 text-center">
            Select Application
          </label>
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-1 border border-gray-700">
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setAppMode('resource-tracker')}
                className={`py-2 lg:py-2.5 xl:py-3 px-3 lg:px-4 rounded-lg text-xs lg:text-sm xl:text-base font-medium transition-all duration-200 ${appMode === 'resource-tracker'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
                  }`}
              >
                Resource Tracker
              </button>
              <button
                type="button"
                onClick={() => setAppMode('recruitment')}
                className={`py-2 lg:py-2.5 xl:py-3 px-3 lg:px-4 rounded-lg text-xs lg:text-sm xl:text-base font-medium transition-all duration-200 ${appMode === 'recruitment'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
                  }`}
              >
                Recruitment
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {appMode === 'recruitment'
              ? 'Admin access required for Recruitment App'
              : 'Access Resource Tracker'}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-4 lg:p-6 xl:p-8 space-y-4 lg:space-y-5 xl:space-y-6 min-h-[280px] shadow-xl border border-gray-700">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5 xl:space-y-6">
            <div>
              <label className="block text-xs lg:text-sm mb-1 xl:text-base font-medium text-gray-300">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 lg:px-3 py-2 lg:py-2.5 xl:py-3 text-sm lg:text-base bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-200 placeholder-gray-400"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-xs lg:text-sm mb-1 xl:text-base font-medium text-gray-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 lg:px-4 py-2 lg:py-2.5 xl:py-3 text-sm lg:text-base bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-200 placeholder-gray-400"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={18} className="lg:w-5 lg:h-5" /> : <Eye size={18} className="lg:w-5 lg:h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 lg:h-5 lg:w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white/5"
                />
                <label className="ml-2 block text-sm lg:text-base text-gray-400">
                  Remember me
                </label>
              </div>
              <div className="text-sm lg:text-base">
                <a href="#" className="font-medium text-blue-400 hover:text-blue-300">
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 lg:py-2.5 xl:py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg font-medium flex items-center justify-center space-x-2 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-70 disabled:cursor-not-allowed text-sm lg:text-base"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-4 lg:h-5 w-4 lg:w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Signing in...</span>
                </div>
              ) : (
                <>
                  <LogIn className="h-4 lg:h-5 w-4 lg:w-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login; 