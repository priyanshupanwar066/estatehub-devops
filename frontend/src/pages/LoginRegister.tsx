import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, AlertCircle, Home, Mail, Lock, User as UserIcon, Shield } from 'lucide-react';

const LoginRegister: React.FC = () => {
  const { user, login, register, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Mode state: 'login' | 'register'
  const [isRegister, setIsRegister] = useState<boolean>(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'buyer' | 'agent'>('buyer');
  
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const mode = searchParams.get('mode');
    setIsRegister(mode === 'register');
    clearError();
    setValidationError(null);
  }, [searchParams]);

  // If already logged in, redirect to home page
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    // Basic Validation
    if (!email.trim() || !password) {
      setValidationError('Please enter email and password.');
      return;
    }

    if (isRegister && !name.trim()) {
      setValidationError('Please enter your name.');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        await register(name, email, password, role);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err) {
      // Errors are handled in AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    setValidationError(null);
    clearError();
    setIsRegister(!isRegister);
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white border border-slate-200 p-8 sm:p-10 rounded-2xl shadow-xs">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex p-3 bg-blue-50 rounded-2xl text-blue-600 mb-4">
            <Home className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {isRegister ? 'Create an account' : 'Sign in to EstateHub'}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <button
              id="btn-toggle-auth-mode"
              onClick={toggleMode}
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer focus:outline-hidden"
            >
              {isRegister ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        {/* Errors display */}
        {(validationError || error) && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{validationError || error}</span>
          </div>
        )}

        <form id="auth-form" onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field (Only on Register) */}
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition-all"
                  required={isRegister}
                />
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition-all"
                required
              />
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition-all"
                required
              />
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Role Selection (Only on Register) */}
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Register As
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  id="btn-role-buyer"
                  type="button"
                  onClick={() => setRole('buyer')}
                  class={`py-2 px-3 border rounded-lg text-sm font-semibold cursor-pointer transition-all ${
                    role === 'buyer'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-slate-200 text-slate-600 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  Buyer
                </button>
                <button
                  id="btn-role-agent"
                  type="button"
                  onClick={() => setRole('agent')}
                  class={`py-2 px-3 border rounded-lg text-sm font-semibold cursor-pointer transition-all ${
                    role === 'agent'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-slate-200 text-slate-600 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  Real Estate Agent
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                * Buyers can save properties and contact agents. Agents can list, update, and manage properties.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            id="btn-submit-auth"
            type="submit"
            disabled={submitting}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center space-x-2 shadow-xs cursor-pointer transition-colors"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{submitting ? 'Please wait...' : isRegister ? 'Register' : 'Sign In'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginRegister;
