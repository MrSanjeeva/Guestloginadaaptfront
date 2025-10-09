import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
// Note: Ensure the path and component name for your logo are correct.
// If you don't have this component, you can replace it with a simple <img> or text.
import { AdaaptLogo } from "../AdaabtLogo";

// A placeholder for your logo if the import is not available.


export default function AuthScreen({ onLogin, onGuestLogin, inviteToken }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

  const handleLoginSuccess = () => {
    const event = new CustomEvent("show-toast", {
      detail: {
        type: "success",
        message: "Login successful! Verifying account...",
      },
    });
    window.dispatchEvent(event);

    if (onLogin) {
      onLogin();
    }
  };

  const handleSignupSuccess = () => {
    setAuthMode("login");
    const event = new CustomEvent("show-toast", {
      detail: {
        type: "success",
        message: "Account created successfully! Please sign in.",
      },
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="h-screen bg-gradient-to-b from-white via-[#EBF4FA] to-[#F6FAFD] flex items-center justify-center p-4 lg:p-8 font-figtree">
      <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Form Content */}
        <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
            <div className="mb-8">
                <AdaaptLogo className="h-8 px-40" />
            </div>

          {/* Render only the active form - no overlays */}
          <div className="animate-fadeIn">
            {authMode === "login" ? (
              <LoginView
                onLoginSuccess={handleLoginSuccess}
                onGuestLogin={onGuestLogin}
                onSwitchToSignup={() => setAuthMode("signup")}
              />
            ) : (
              <SignupView
                onSignupSuccess={handleSignupSuccess}
                onSwitchToLogin={() => setAuthMode("login")}
              />
            )}
          </div>
        </div>
        
        {/* Right Side: Image and Wavy Divider */}
        <div className="hidden md:flex md:w-1/2 relative">
             {/* Wavy SVG Divider */}
            <svg
                className="absolute top-0 left-0 h-full w-24 text-white"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
                style={{ transform: 'translateX(-99%)' }} 
            >
                <path
                d="M 100 0 C 50 20, 50 80, 100 100 L 100 0 Z"
                fill="currentColor"
                />
            </svg>
            
            <div 
                className="w-full h-full bg-cover bg-center" 
                style={{backgroundImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80')"}}
            >
                <div className="w-full h-full bg-black bg-opacity-10"></div>
            </div>
        </div>
      </div>
    </div>
  );
}


function LoginView({ onLoginSuccess, onGuestLogin, onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      const response = await fetch('https://api.getadaapt.com/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h1>
        <p className="text-gray-600 text-sm">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="font-semibold text-blue-600 hover:underline"
          >
            Create one now
          </button>
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div>
          <label
            htmlFor="email-login"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email address
          </label>
          <input
            id="email-login"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            required
            autoComplete="email"
          />
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="password-login"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <div className="relative overflow-visible">
            <input
              id="password-login"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="block w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 inset-y-0 my-auto h-fit text-gray-400 hover:text-gray-600 focus:outline-none transition-colors z-50 flex items-center justify-center"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        {/* Forgot Password Link */}
        <div className="flex items-center justify-end text-sm">
          <a href="#" className="font-medium text-blue-600 hover:underline">
            Forgot password?
          </a>
        </div>

        {/* Submit Buttons */}
        <div className="space-y-4 pt-2">
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="w-full text-base h-12 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-xs font-medium text-gray-400">
              OR
            </span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <button
            type="button"
            onClick={onGuestLogin}
            className="w-full text-base h-12 bg-white text-gray-700 font-bold rounded-lg border-2 border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-300"
          >
            Continue as Guest
          </button>
        </div>
      </form>
    </div>
  );
}


function SignupView({ onSignupSuccess, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    email: '', full_name: '', organization: '', department: '',
    role: '', password: '', allowed_domains: '',
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
        is_active: true, is_verified: false, is_superuser: false,
    };
    
    try {
        const response = await fetch('https://api.getadaapt.com/api/v1/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Account</h1>
        <p className="text-gray-600 text-sm">
            Already a member?{' '}
            <button type="button" onClick={onSwitchToLogin} className="font-semibold text-blue-600 hover:underline">
                Log In
            </button>
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Full Name" required className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
            <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email Address" required className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
            <input name="organization" value={formData.organization} onChange={handleChange} placeholder="Organization" required className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
            <input name="department" value={formData.department} onChange={handleChange} placeholder="Department" required className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
            <input name="role" value={formData.role} onChange={handleChange} placeholder="Your Role" required className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
            <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" required className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
        </div>
        <div className="pt-2">
            <button type="submit" disabled={isLoading} className="w-full text-base h-12 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-300">
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
        </div>
      </form>
    </>
  );
}
