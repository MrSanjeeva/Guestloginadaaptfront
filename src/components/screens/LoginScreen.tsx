// src/components/screens/AuthScreen.js

import React, { useState } from 'react';
// Note: Ensure the path and component name for your logo are correct.
import { AdaaptLogo } from '../AdaabtLogo';

// ✅ UPDATED: Accept onGuestLogin as a prop
export default function AuthScreen({ onLogin, onGuestLogin, inviteToken }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

  const handleLoginSuccess = () => {
    // This function is for successful credential logins, no changes needed
    const event = new CustomEvent('show-toast', { 
      detail: { type: 'success', message: 'Login successful! Verifying account...' } 
    });
    window.dispatchEvent(event);

    if (onLogin) {
      onLogin();
    }
  };

  const handleSignupSuccess = () => {
    setAuthMode('login');
    const event = new CustomEvent('show-toast', { 
      detail: { type: 'success', message: 'Account created successfully! Please sign in.' } 
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-family-['PT_Serif']
      bg-gradient-to-br from-blue-300 via-blue-200 to-blue-50 relative overflow-hidden">

      {/* Decorative animated blobs */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* Auth Card */}
      <div className="w-full max-w-md flex flex-col items-center relative z-10">
        
        <div className="mt-6 mb-8">
          <AdaaptLogo className="h-12 text-gray-800" />
        </div>

        <div className="relative w-full bg-white/90 backdrop-blur-lg p-8 border border-blue-200 shadow-xl rounded-none overflow-hidden">
            <div className="relative h-full">
                {/* Login Form */}
                <div 
                    className={`transition-all duration-500 ease-in-out ${authMode === 'login' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'}`}
                    style={{ position: authMode === 'signup' ? 'absolute' : 'static', width: '100%' }}
                >
                    {/* ✅ UPDATED: Pass onGuestLogin down to the LoginView */}
                    <LoginView 
                      onLoginSuccess={handleLoginSuccess} 
                      onGuestLogin={onGuestLogin}
                      onSwitchToSignup={() => setAuthMode('signup')} 
                    />
                </div>

                {/* Signup Form */}
                <div 
                    className={`transition-all duration-500 ease-in-out ${authMode === 'signup' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}
                    style={{ position: authMode === 'login' ? 'absolute' : 'static', width: '100%' }}
                >
                     <SignupView onSignupSuccess={handleSignupSuccess} onSwitchToLogin={() => setAuthMode('login')} />
                </div>
            </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-500">
            <a href="#" className="hover:underline hover:text-blue-600 transition-colors">
              Terms of Service
            </a>
            <span>•</span>
            <a href="#" className="hover:underline hover:text-blue-600 transition-colors">
              Privacy Policy
            </a>
        </div>
      </div>
    </div>
  );
}

// ✅ UPDATED: De-structure onGuestLogin from props
function LoginView({ onLoginSuccess, onGuestLogin, onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isFormValid = email.trim() && password.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;

    setIsLoading(true);
    setError('');

    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('username', email);
    formData.append('password', password);
    formData.append('scope', '');
    formData.append('client_id', '');
    formData.append('client_secret', '');

    try {
      const response = await fetch('http://65.2.61.187:8000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        const expiresInMilliseconds = data.expires_in * 1000;
        const expiryTime = new Date().getTime() + expiresInMilliseconds;
        localStorage.setItem('tokenExpiry', expiryTime.toString());
        
        onLoginSuccess(); 
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      console.error('Login request failed:', err);
      setError('A network error occurred. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to adaapt</h1>
        <p className="text-gray-600">Enter your credentials to access your dashboard</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email-login" className="block text-sm font-medium text-gray-800 mb-2">Email address</label>
          <input id="email-login" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500" required autoComplete="email" />
        </div>
        <div>
          <label htmlFor="password-login" className="block text-sm font-medium text-gray-800 mb-2">Password</label>
          <div className="relative">
            <input id="password-login" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500" required autoComplete="current-password" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {showPassword ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                )}
              </svg>
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center cursor-pointer">
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <span className="ml-2 text-gray-600">Remember me</span>
          </label>
          <a href="#" className="font-medium text-blue-600 hover:text-blue-700 hover:underline">Forgot password?</a>
        </div>
        <div className="space-y-4 pt-2">
            <button type="submit" disabled={!isFormValid || isLoading} className="w-full h-12 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300 transition-colors">
              {isLoading ? 'Please wait...' : 'Sign In'}
            </button>

            <div className="relative flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-xs text-gray-500">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>
            
            {/* ✅ This button now correctly calls the dedicated guest login function */}
            <button
                type="button"
                onClick={onGuestLogin}
                className="w-full h-12 bg-white text-blue-600 font-medium rounded-lg border border-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Continue as Guest
            </button>
        </div>
         <p className="text-center text-sm text-gray-600 pt-2">
            Don't have an account?{' '}
            <button
                type="button"
                onClick={onSwitchToSignup}
                className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
                Sign up
            </button>
        </p>
      </form>
    </>
  );
}

// No changes needed for SignupView component
function SignupView({ onSignupSuccess, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    organization: '',
    department: '',
    role: '',
    password: '',
    allowed_domains: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const payload = {
        ...formData,
        allowed_domains: formData.allowed_domains.split(',').map(d => d.trim()).filter(d => d),
        is_active: true,
        is_verified: false,
        is_superuser: false,
    };
    
    try {
        const response = await fetch('http://65.2.61.187:8000/api/v1/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            onSignupSuccess();
        } else {
            const errorData = await response.json();
            setError(errorData.detail || 'Sign-up failed. Please check your input.');
        }
    } catch (err) {
        console.error('Signup request failed:', err);
        setError('A network error occurred. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create an account</h1>
        <p className="text-gray-600">Join the platform by filling out the form below</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Full Name" required className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
            <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email Address" required className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
            <input name="organization" value={formData.organization} onChange={handleChange} placeholder="Organization" required className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
            <input name="department" value={formData.department} onChange={handleChange} placeholder="Department" required className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
            <input name="role" value={formData.role} onChange={handleChange} placeholder="Role" required className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
            <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" required className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <div>
            <input name="allowed_domains" value={formData.allowed_domains} onChange={handleChange} placeholder="Allowed Domains (comma-separated)" className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>

        <button type="submit" disabled={isLoading} className="w-full h-12 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300 transition-colors">
          {isLoading ? 'Creating account...' : 'Sign Up'}
        </button>

        <p className="text-center text-sm text-gray-600 pt-2">
            Already have an account?{' '}
            <button
                type="button"
                onClick={onSwitchToLogin}
                className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
                Sign in instead
            </button>
        </p>
      </form>
    </>
  );
}