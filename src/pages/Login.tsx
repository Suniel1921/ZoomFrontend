import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
// import { useAuth } from '../App';
import { validateAdminCredentials } from '../services/authService';
import { useAdminStore } from '../store/adminStore';

export default function Login() {
  const navigate = useNavigate();
  // const { login } = useAuth();
  const { setCurrentAdmin } = useAdminStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const admin = validateAdminCredentials(formData.username, formData.password);
      
      if (admin) {
        // login('admin', formData.username);
        setCurrentAdmin(admin);
        navigate('/dashboard');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-yellow/10 to-white">
      {/* Header */}
      <header className="bg-brand-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-brand-yellow">Zoom Creatives</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-black mb-3">
            Welcome Back
          </h1>
          <h2 className="text-xl md:text-2xl text-brand-black/80 mb-16">
            Data Management Portal
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-brand-yellow/20">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-brand-black">
                Administrator Login
              </h3>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="mt-1">
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    className="border-brand-yellow/30 focus:border-brand-yellow focus:ring-brand-yellow"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="border-brand-yellow/30 focus:border-brand-yellow focus:ring-brand-yellow pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    checked={formData.remember}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-brand-yellow/30 text-brand-yellow focus:ring-brand-yellow"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link 
                    to="/forgot-password" 
                    className="font-medium text-brand-black hover:text-brand-yellow"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-brand-black hover:bg-brand-yellow hover:text-brand-black transition-colors"
              >
                <Lock className="h-4 w-4 mr-2" />
                Sign in
              </Button>
            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">Are you a client?</p>
            <Link 
              to="/client-login" 
              className="mt-2 inline-block text-lg font-medium text-brand-black hover:text-brand-yellow"
            >
              Access Client's Hub →
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-brand-black text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">
              © {new Date().getFullYear()} Zoom Creatives. All Rights Reserved.
            </p>
            <a 
              href="https://zoomcreatives.jp/privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white hover:text-brand-yellow"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}