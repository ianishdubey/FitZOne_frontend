import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { authAPI } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: (user: any) => void;
}

type AuthMode = 'signin' | 'signup' | 'forgot';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [apiError, setApiError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  if (!isOpen) return null;

  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {mode === 'signin' && 'Welcome Back!'}
            {mode === 'signup' && 'Account Created!'}
            {mode === 'forgot' && 'Reset Link Sent!'}
          </h2>
          <p className="text-gray-600">
            {mode === 'signin' && 'You have successfully signed in to your account.'}
            {mode === 'signup' && 'Your account has been created successfully. Welcome to FitZone!'}
            {mode === 'forgot' && 'We have sent a password reset link to your email address.'}
          </p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (apiError) {
      setApiError('');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (formData.email.includes('..') || formData.email.startsWith('.') || formData.email.endsWith('.')) {
      newErrors.email = 'Email format is invalid';
    } else if (!/^[a-zA-Z0-9]/.test(formData.email)) {
      newErrors.email = 'Email must start with a letter or number';
    }

    // Password validation
    if (mode !== 'forgot' && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (mode !== 'forgot' && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (mode === 'signup' && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    } else if (mode === 'signup' && !/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one special character';
    }

    // Confirm password validation for signup
    if (mode === 'signup') {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      // Name validation for signup
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      } else if (formData.firstName.trim().length < 2) {
        newErrors.firstName = 'First name must be at least 2 characters';
      } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName.trim())) {
        newErrors.firstName = 'First name can only contain letters';
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      } else if (formData.lastName.trim().length < 2) {
        newErrors.lastName = 'Last name must be at least 2 characters';
      } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName.trim())) {
        newErrors.lastName = 'Last name can only contain letters';
      }

      // Phone validation (optional for signup)
      if (formData.phone && !/^[+]?[91]?[0-9\s\-]{10,13}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setApiError('');
    
    try {
      if (mode === 'signup') {
        // Register new user
        const response = await authAPI.register({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          phone: formData.phone.trim() || undefined
        });

        console.log('Registration successful:', response);
        
        // Call success callback if provided
        if (onAuthSuccess) {
          onAuthSuccess(response.user);
        }
        
        setSubmitSuccess(true);
        
        // Close modal after showing success message
        setTimeout(() => {
          setSubmitSuccess(false);
          resetForm();
          onClose();
        }, 2000);

      } else if (mode === 'signin') {
        // Login existing user
        const response = await authAPI.login({
          email: formData.email.toLowerCase().trim(),
          password: formData.password
        });

        console.log('Login successful:', response);
        
        // Call success callback if provided
        if (onAuthSuccess) {
          onAuthSuccess(response.user);
        }
        
        setSubmitSuccess(true);
        
        // Close modal after showing success message
        setTimeout(() => {
          setSubmitSuccess(false);
          resetForm();
          onClose();
        }, 2000);

      } else if (mode === 'forgot') {
        // Handle forgot password (placeholder for now)
        // You can implement this later with a proper password reset flow
        setSubmitSuccess(true);
        
        setTimeout(() => {
          setSubmitSuccess(false);
          resetForm();
          onClose();
        }, 2000);
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      // Handle specific error messages
      if (error.message.includes('already exists')) {
        setApiError('An account with this email already exists. Please sign in instead.');
      } else if (error.message.includes('Invalid email or password')) {
        setApiError('Invalid email or password. Please check your credentials.');
      } else if (error.message.includes('User not found')) {
        setApiError('No account found with this email. Please sign up first.');
      } else {
        setApiError('Something went wrong. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phone: '' });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
    setApiError('');
    setIsSubmitting(false);
    setSubmitSuccess(false);
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  const getTitle = () => {
    switch (mode) {
      case 'signin': return 'Welcome Back';
      case 'signup': return 'Join FitZone';
      case 'forgot': return 'Reset Password';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'signin': return 'Sign in to your account to continue your fitness journey';
      case 'signup': return 'Create your account and start transforming your life today';
      case 'forgot': return 'Enter your email address and we\'ll send you a reset link';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            {mode === 'forgot' && (
              <button
                onClick={() => switchMode('signin')}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{getTitle()}</h2>
              <p className="text-sm text-gray-600 mt-1">{getSubtitle()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* API Error Display */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{apiError}</p>
            </div>
          )}

          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                      errors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="John"
                    required
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                      errors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Doe"
                    required
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                  errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="+91 98765 43210"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>
          )}

          {mode !== 'forgot' && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          {mode === 'signin' && (
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => switchMode('forgot')}
                className="text-sm text-orange-500 hover:text-orange-600 transition-colors"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg transition-all duration-200 font-medium flex items-center justify-center space-x-2 ${
              isSubmitting 
                ? 'bg-orange-400 cursor-not-allowed' 
                : 'bg-orange-500 hover:bg-orange-600 hover:shadow-lg transform hover:scale-105'
            } text-white`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>
                  {mode === 'signin' && 'Signing In...'}
                  {mode === 'signup' && 'Creating Account...'}
                  {mode === 'forgot' && 'Sending Reset Link...'}
                </span>
              </>
            ) : (
              <>
                {mode === 'signin' && 'Sign In'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'forgot' && 'Send Reset Link'}
              </>
            )}
          </button>

          {mode === 'signup' && (
            <div className="text-center">
              <p className="text-xs text-gray-500 leading-relaxed">
                By creating an account, you agree to our{' '}
                <a href="#" className="text-orange-500 hover:text-orange-600">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-orange-500 hover:text-orange-600">Privacy Policy</a>
              </p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
          {mode === 'signin' && (
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => switchMode('signup')}
                className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
              >
                Sign up here
              </button>
            </p>
          )}
          {mode === 'signup' && (
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => switchMode('signin')}
                className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
              >
                Sign in here
              </button>
            </p>
          )}
          {mode === 'forgot' && (
            <p className="text-center text-sm text-gray-600">
              Remember your password?{' '}
              <button
                onClick={() => switchMode('signin')}
                className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
              >
                Back to sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;