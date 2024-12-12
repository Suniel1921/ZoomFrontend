import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import { useStore } from '../store';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { clients } = useStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For admin account
    if (email === 'zoom') {
      setStatus('error');
      return;
    }

    // For client accounts
    const client = clients.find(c => c.email === email);
    if (client) {
      // In a real application, you would:
      // 1. Generate a reset token
      // 2. Send an email with a reset link
      // 3. Save the token in the database with an expiration
      
      // For this demo, we'll just show a success message
      setStatus('success');
    } else {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-yellow/10 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-brand-black mb-2">
          Zoom Visa
        </h1>
        <h2 className="text-xl md:text-2xl text-center text-brand-black/80 mb-8">
          Management Portal
        </h2>
        <h3 className="mt-6 text-center text-2xl font-bold tracking-tight text-brand-black">
          Reset Password
        </h3>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-brand-yellow/20">
          {status === 'success' ? (
            <div className="text-center">
              <div className="rounded-md bg-green-50 p-4 mb-4">
                <p className="text-sm text-green-700">
                  If an account exists with this email, you will receive password reset instructions shortly.
                </p>
              </div>
              <Button
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Return to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="border-brand-yellow/30 focus:border-brand-yellow focus:ring-brand-yellow"
                  />
                </div>
              </div>

              {status === 'error' && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-700">
                    No account found with this email address.
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-4">
                <Button 
                  type="submit" 
                  className="w-full bg-brand-black hover:bg-brand-yellow hover:text-brand-black transition-colors"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Reset Instructions
                </Button>

                <Link 
                  to="/login"
                  className="flex items-center justify-center text-sm text-brand-black hover:text-brand-yellow"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}