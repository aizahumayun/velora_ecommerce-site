import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../store';
import { login } from '../store/slices/authSlice';
import { showToast } from '../store/slices/uiSlice';
import { authService } from '../services/authService';

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if there was a redirect query parameter
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('redirect') || '/account';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.login({
        email,
        password,
      });

      dispatch(login(response.user));

      dispatch(
        showToast({
          message: 'Welcome to your VELORA account',
          submessage: `Signed in as ${response.user.email}`,
        })
      );

      navigate(redirectTo);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    authService.logout();
    dispatch(
      login({
        id: 'usr_demo_client',
        name: 'Eleanor Vance',
        email: 'eleanor.vance@editorial.com',
        phone: '+1 (555) 392-1849',
        address: {
          firstName: 'Eleanor',
          lastName: 'Vance',
          email: 'eleanor.vance@editorial.com',
          phone: '+1 (555) 392-1849',
          address: '420 Madison Avenue',
          streetAddress: '420 Madison Avenue',
          apartment: 'Suite 12A',
          city: 'New York',
          state: 'NY',
          postalCode: '10017',
          country: 'United States',
        },
      })
    );

    dispatch(
      showToast({
        message: 'Signed in to VELORA Client Portal',
        submessage: 'Welcome, Eleanor Vance',
      })
    );

    navigate(redirectTo);
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Enter your email address above to receive a password reset link.');
      return;
    }
    dispatch(
      showToast({
        message: 'Password reset link sent',
        submessage: `Instructions dispatched to ${email}`,
      })
    );
  };

  return (
    <div className="min-h-screen bg-[#EEE9DF] flex items-center justify-center py-16 px-4 sm:px-6">
      <div className="w-full max-w-md bg-[#EEE9DF] border border-[#C9C1B1] p-8 sm:p-10 shadow-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="font-editorial text-2xl tracking-widest uppercase text-[#1B2632] inline-block mb-3">
            VELORA
          </Link>
          <h1 className="font-editorial text-xl sm:text-2xl text-[#1B2632]">
            Sign In to Your Account
          </h1>
          <p className="text-xs text-[#2C3B4D] font-sans mt-2">
            Access your order history, saved pieces, and client details.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-[#A35139]/10 border border-[#A35139] text-[#A35139] text-xs font-sans">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#1B2632] mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. name@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3.5 py-2.5 text-xs bg-[#EEE9DF] border border-[#C9C1B1] focus:outline-none focus:border-[#1B2632] font-sans text-[#1B2632]"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-[#1B2632]">Password</label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[11px] text-[#2C3B4D] hover:text-[#1B2632] underline font-sans"
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3.5 py-2.5 text-xs bg-[#EEE9DF] border border-[#C9C1B1] focus:outline-none focus:border-[#1B2632] font-sans text-[#1B2632]"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-[#2C3B4D] cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-[#1B2632]"
              />
              <span>Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#1B2632] text-[#EEE9DF] hover:bg-[#2C3B4D] disabled:opacity-50 disabled:cursor-not-allowed text-xs tracking-widest uppercase font-medium transition-colors mt-2"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Fast Sign-In */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleDemoSignIn}
            className="w-full py-2.5 bg-[#C9C1B1]/30 hover:bg-[#C9C1B1]/60 border border-[#C9C1B1] text-[#1B2632] text-xs tracking-wider uppercase transition-colors"
          >
            Demo Sign In (Preview Mode)
          </button>
        </div>

        {/* Link to Register */}
        <div className="mt-8 pt-6 border-t border-[#C9C1B1] text-center space-y-2">
          <p className="text-xs text-[#2C3B4D] font-sans">
            Don't have an account yet?
          </p>
          <Link
            to="/register"
            className="inline-block text-xs font-semibold text-[#1B2632] hover:text-[#A35139] underline font-sans tracking-wide"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};
