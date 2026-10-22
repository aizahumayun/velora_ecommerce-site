import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store';
import { login } from '../store/slices/authSlice';
import { showToast } from '../store/slices/uiSlice';
import { authService } from '../services/authService';

export const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.register({
        name: fullName,
        email,
        password,
      });

      dispatch(login(response.user));

      dispatch(
        showToast({
          message: 'Account created successfully',
          submessage: `Welcome to VELORA, ${response.user.name}`,
        })
      );

      navigate('/account');
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
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
            Create an Account
          </h1>
          <p className="text-xs text-[#2C3B4D] font-sans mt-2">
            Register for bespoke sizing recommendations, saved pieces, and expedited ordering.
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
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Eleanor Vance"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3.5 py-2.5 text-xs bg-[#EEE9DF] border border-[#C9C1B1] focus:outline-none focus:border-[#1B2632] font-sans text-[#1B2632]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1B2632] mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="e.g. eleanor@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3.5 py-2.5 text-xs bg-[#EEE9DF] border border-[#C9C1B1] focus:outline-none focus:border-[#1B2632] font-sans text-[#1B2632]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1B2632] mb-1">
              Password *
            </label>
            <input
              type="password"
              required
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3.5 py-2.5 text-xs bg-[#EEE9DF] border border-[#C9C1B1] focus:outline-none focus:border-[#1B2632] font-sans text-[#1B2632]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1B2632] mb-1">
              Confirm Password *
            </label>
            <input
              type="password"
              required
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3.5 py-2.5 text-xs bg-[#EEE9DF] border border-[#C9C1B1] focus:outline-none focus:border-[#1B2632] font-sans text-[#1B2632]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#1B2632] text-[#EEE9DF] hover:bg-[#2C3B4D] disabled:opacity-50 disabled:cursor-not-allowed text-xs tracking-widest uppercase font-medium transition-colors mt-2"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Link to Login */}
        <div className="mt-8 pt-6 border-t border-[#C9C1B1] text-center space-y-2">
          <p className="text-xs text-[#2C3B4D] font-sans">
            Already have a VELORA account?
          </p>
          <Link
            to="/login"
            className="inline-block text-xs font-semibold text-[#1B2632] hover:text-[#A35139] underline font-sans tracking-wide"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
