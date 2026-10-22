import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { logout, updateProfile } from '../store/slices/authSlice';
import { orderService } from '../services/orderService';
import { showToast } from '../store/slices/uiSlice';
import type { Order } from '@velora/shared';

export const AccountPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [orders, setOrders] = useState<Order[]>(orderService.getAllOrders());

  useEffect(() => {
    if (isAuthenticated) {
      orderService.getOrders().then((serverOrders) => {
        if (Array.isArray(serverOrders)) {
          setOrders(serverOrders);
        }
      });
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(showToast({ message: 'Signed out of VELORA account' }));
    navigate('/login');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateProfile({ name, phone }));
    setIsEditing(false);
    dispatch(showToast({ message: 'Profile information updated successfully' }));
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#EEE9DF] flex items-center justify-center py-20 px-4 sm:px-6">
        <div className="max-w-md w-full bg-[#EEE9DF] border border-[#C9C1B1] p-8 sm:p-10 text-center space-y-6 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[#C9C1B1]/30 flex items-center justify-center mx-auto text-[#2C3B4D]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#2C3B4D]">
              Client Portal
            </span>
            <h1 className="font-editorial text-2xl text-[#1B2632] mt-1">
              Sign In to Your Account
            </h1>
            <p className="text-xs text-[#2C3B4D] font-sans mt-2 leading-relaxed">
              Please sign in to access your profile information, order receipts, and client preferences.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              to="/login"
              className="block w-full py-3.5 bg-[#1B2632] text-[#EEE9DF] hover:bg-[#2C3B4D] text-xs tracking-widest uppercase font-medium transition-colors text-center"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="block w-full py-3 bg-[#C9C1B1]/30 text-[#1B2632] hover:bg-[#C9C1B1]/60 border border-[#C9C1B1] text-xs tracking-widest uppercase font-medium transition-colors text-center"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEE9DF] text-[#1B2632] pb-24">
      {/* Header */}
      <div className="border-b border-[#C9C1B1] bg-[#EEE9DF]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono tracking-widest text-[#2C3B4D] uppercase">
                Customer Account
              </span>
              <h1 className="font-editorial text-3xl text-[#1B2632] mt-1">
                {user.name}
              </h1>
              <p className="text-xs text-[#2C3B4D] font-sans mt-1">
                {user.email}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="self-start sm:self-auto px-4 py-2 border border-[#C9C1B1] hover:border-[#1B2632] text-xs uppercase tracking-wider text-[#1B2632] transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 pt-8 space-y-8">
        {/* Profile Information Box */}
        <div className="bg-[#EEE9DF] border border-[#C9C1B1] p-6 sm:p-8">
          <div className="flex justify-between items-center pb-4 border-b border-[#C9C1B1]/60 mb-6">
            <h2 className="font-editorial text-xl text-[#1B2632]">
              Profile Information
            </h2>
            <button
              type="button"
              onClick={() => {
                setIsEditing(!isEditing);
                setName(user.name);
                setPhone(user.phone || '');
              }}
              className="text-xs text-[#2C3B4D] hover:text-[#1B2632] underline font-sans cursor-pointer"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-medium text-[#1B2632] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#EEE9DF] border border-[#C9C1B1] focus:outline-none focus:border-[#1B2632] font-sans text-[#1B2632]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1B2632] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-3.5 py-2 text-xs bg-[#C9C1B1]/30 border border-[#C9C1B1] text-[#2C3B4D] cursor-not-allowed font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1B2632] mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2 text-xs bg-[#EEE9DF] border border-[#C9C1B1] focus:outline-none focus:border-[#1B2632] font-sans text-[#1B2632]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1B2632] text-[#EEE9DF] text-xs tracking-widest uppercase hover:bg-[#2C3B4D] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-sans">
              <div>
                <span className="text-[#2C3B4D] font-mono text-[11px] uppercase tracking-wider block mb-1">
                  Name
                </span>
                <p className="font-semibold text-[#1B2632] text-sm">{user.name}</p>
              </div>

              <div>
                <span className="text-[#2C3B4D] font-mono text-[11px] uppercase tracking-wider block mb-1">
                  Email
                </span>
                <p className="font-mono text-[#1B2632] text-sm">{user.email}</p>
              </div>

              <div>
                <span className="text-[#2C3B4D] font-mono text-[11px] uppercase tracking-wider block mb-1">
                  Contact Phone
                </span>
                <p className="text-[#1B2632]">{user.phone || 'Not provided'}</p>
              </div>

              <div>
                <span className="text-[#2C3B4D] font-mono text-[11px] uppercase tracking-wider block mb-1">
                  Primary Destination
                </span>
                <p className="text-[#1B2632]">
                  {user.address?.city ? `${user.address.city}, ${user.address.country}` : 'Default shipping upon checkout'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Orders Overview Box */}
        <div className="bg-[#EEE9DF] border border-[#C9C1B1] p-6 sm:p-8 space-y-6">
          <div className="flex justify-between items-baseline pb-4 border-b border-[#C9C1B1]/60">
            <div>
              <h2 className="font-editorial text-xl text-[#1B2632]">
                Orders ({orders.length})
              </h2>
              <p className="text-xs text-[#2C3B4D] font-sans mt-0.5">
                Review your order details and delivery status.
              </p>
            </div>
            <Link
              to="/account/orders"
              className="text-xs font-sans tracking-wide uppercase text-[#1B2632] hover:text-[#A35139] underline font-semibold"
            >
              View All Orders &rarr;
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#2C3B4D] font-sans space-y-3">
              <p>You have not placed any orders yet.</p>
              <Link
                to="/shop"
                className="inline-block px-6 py-2 bg-[#1B2632] text-[#EEE9DF] text-xs tracking-wider uppercase hover:bg-[#2C3B4D]"
              >
                Start Curating
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 3).map((order) => (
                <div
                  key={order.id}
                  className="p-4 bg-[#C9C1B1]/15 border border-[#C9C1B1] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-sans"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#1B2632]">
                        {order.orderNumber || order.id}
                      </span>
                      <span className="px-2 py-0.5 bg-[#C9C1B1]/50 text-[#1B2632] text-[10px] font-mono uppercase tracking-wider font-semibold">
                        {order.status || 'Confirmed'}
                      </span>
                    </div>
                    <p className="text-[#2C3B4D] text-[11px]">
                      {new Date(order.date || order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      &bull; {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-[#1B2632] font-sans text-sm">
                      ${order.total}
                    </span>
                    <Link
                      to={`/account/orders/${order.id}`}
                      className="px-3 py-1.5 bg-[#EEE9DF] border border-[#C9C1B1] hover:border-[#1B2632] text-[#1B2632] text-xs uppercase tracking-wider transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
