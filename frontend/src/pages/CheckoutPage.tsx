import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import {
  clearCart,
  selectCartItems,
  selectCartSubtotal,
  setShippingMethod,
} from '../store/slices/cartSlice';
import { orderService } from '../services/orderService';
import { cartService } from '../services/cartService';
import type { ShippingAddress } from '@velora/shared';
import { showToast } from '../store/slices/uiSlice';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const shippingMethod = useAppSelector((state) => state.cart.shippingMethod);
  const user = useAppSelector((state) => state.auth.user);

  // Address form state initialized with user profile if available, else empty
  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: user?.name ? user.name.split(' ')[0] : '',
    lastName: user?.name ? user.name.split(' ').slice(1).join(' ') : '',
    address: user?.address?.address || user?.address?.streetAddress || '',
    apartment: user?.address?.apartment || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    postalCode: user?.address?.postalCode || '',
    country: user?.address?.country || 'United States',
    phone: user?.phone || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const isFreeStandard = subtotal >= 250;
  const shippingCost = shippingMethod === 'express' ? 25 : isFreeStandard ? 0 : 15;
  const estimatedTax = Math.round(subtotal * 0.08);
  const grandTotal = subtotal + shippingCost + estimatedTax;

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#EEE9DF] flex flex-col items-center justify-center text-center px-6">
        <h2 className="font-editorial text-2xl text-[#1B2632] mb-2">No Items in Checkout</h2>
        <p className="text-xs text-[#2C3B4D] font-sans mb-6">
          Your shopping bag is empty. Please select garments before proceeding to checkout.
        </p>
        <Link to="/shop" className="px-6 py-3 bg-[#1B2632] text-[#EEE9DF] hover:bg-[#2C3B4D] text-xs tracking-widest uppercase transition-colors">
          Explore Shop
        </Link>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) newErrors.email = 'Email address is required';
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.address.trim()) newErrors.address = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      dispatch(showToast({ message: 'Please complete all required fields' }));
      return;
    }

    setIsProcessing(true);

    try {
      const address: ShippingAddress = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        apartment: formData.apartment,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
        phone: formData.phone,
      };

      const order = await orderService.createOrder({
        items,
        subtotal,
        shippingMethod,
        shippingCost,
        tax: estimatedTax,
        total: grandTotal,
        shippingAddress: address,
        paymentMethod: 'Credit / Debit Card',
        customerEmail: formData.email,
        customerName: `${formData.firstName} ${formData.lastName}`.trim(),
      });

      // Clear Redux Cart & Remote Cart
      dispatch(clearCart());
      cartService.clearRemoteCart().catch(() => {});
      dispatch(showToast({ message: 'Order placed successfully!' }));

      // Navigate to order confirmation
      navigate(`/order-confirmation/${order.orderNumber || order.id}`);
    } catch {
      dispatch(showToast({ message: 'Could not process order. Please try again.' }));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EEE9DF] text-[#1B2632] pb-24">
      {/* Checkout Page Title Bar */}
      <div className="border-b border-[#C9C1B1] bg-[#EEE9DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-sans text-[#2C3B4D] mb-1">
              <Link to="/cart" className="hover:text-[#1B2632]">&larr; Return to Bag</Link>
            </div>
            <h1 className="font-editorial text-3xl text-[#1B2632]">
              Checkout
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-sans text-[#2C3B4D]">
            <svg className="w-4 h-4 text-[#1B2632]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secure 256-Bit SSL Encrypted</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-8">
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Form & Steps */}
          <div className="lg:col-span-7 space-y-10">
            {/* Step 1: Customer Information */}
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <h2 className="font-editorial text-xl text-[#1B2632]">
                  1. Customer Information
                </h2>
                {!user && (
                  <span className="text-xs text-[#2C3B4D] font-sans">
                    Have an account?{' '}
                    <Link to="/login?redirect=/checkout" className="text-[#1B2632] underline font-medium">
                      Sign in
                    </Link>
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1B2632] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. your.email@example.com"
                  className={`w-full px-3.5 py-2.5 text-xs bg-[#EEE9DF] border ${
                    errors.email ? 'border-[#A35139]' : 'border-[#C9C1B1]'
                  } focus:outline-none focus:border-[#1B2632] font-sans text-[#1B2632]`}
                />
                {errors.email && <p className="text-[11px] text-[#A35139] mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Step 2: Shipping Information */}
            <div className="space-y-4 pt-6 border-t border-[#C9C1B1]">
              <h2 className="font-editorial text-xl text-[#1B2632]">
                2. Shipping Information
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#1B2632] mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className={`w-full px-3.5 py-2.5 text-xs bg-[#EEE9DF] border ${
                      errors.firstName ? 'border-[#A35139]' : 'border-[#C9C1B1]'
                    } focus:outline-none focus:border-[#1B2632] font-sans text-[#1B2632]`}
                  />
                  {errors.firstName && <p className="text-[11px] text-[#A35139] mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1B2632] mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className={`w-full px-3.5 py-2.5 text-xs bg-[#EEE9DF] border ${
                      errors.lastName ? 'border-[#A35139]' : 'border-[#C9C1B1]'
                    } focus:outline-none focus:border-[#1B2632] font-sans text-[#1B2632]`}
                  />
                  {errors.lastName && <p className="text-[11px] text-[#A35139] mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1B2632] mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Street and house number"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full px-3.5 py-2.5 text-xs bg-[#EEE9DF] border ${
                    errors.address ? 'border-[#A35139]' : 'border-[#C9C1B1]'
                  } focus:outline-none focus:border-[#1B2632] font-sans text-[#1B2632]`}
                />
                {errors.address && <p className="text-[11px] text-[#A35139] mt-1">{errors.address}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1B2632] mb-1">Apartment, Suite (Optional)</label>
                <input
                  type="text"
                  placeholder="Apartment, unit, suite"
                  value={formData.apartment}
                  onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#EEE9DF] border border-[#C9C1B1] focus:outline-none focus:border-[#1B2632] font-sans text-[#1B2632]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#1B2632] mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={`w-full px-3.5 py-2.5 text-xs bg-[#EEE9DF] border ${
                      errors.city ? 'border-[#A35139]' : 'border-[#C9C1B1]'
                    } focus:outline-none focus:border-[#1B2632] font-sans text-[#1B2632]`}
                  />
                  {errors.city && <p className="text-[11px] text-[#A35139] mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1B2632] mb-1">State / Region</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#EEE9DF] border border-[#C9C1B1] focus:outline-none focus:border-[#1B2632] font-sans text-[#1B2632]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1B2632] mb-1">Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className={`w-full px-3.5 py-2.5 text-xs bg-[#EEE9DF] border ${
                      errors.postalCode ? 'border-[#A35139]' : 'border-[#C9C1B1]'
                    } focus:outline-none focus:border-[#1B2632] font-sans text-[#1B2632]`}
                  />
                  {errors.postalCode && <p className="text-[11px] text-[#A35139] mt-1">{errors.postalCode}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#1B2632] mb-1">Country</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#EEE9DF] border border-[#C9C1B1] focus:outline-none focus:border-[#1B2632] font-sans text-[#1B2632]"
                  >
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="France">France</option>
                    <option value="Italy">Italy</option>
                    <option value="Germany">Germany</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1B2632] mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-3.5 py-2.5 text-xs bg-[#EEE9DF] border ${
                      errors.phone ? 'border-[#A35139]' : 'border-[#C9C1B1]'
                    } focus:outline-none focus:border-[#1B2632] font-sans text-[#1B2632]`}
                  />
                  {errors.phone && <p className="text-[11px] text-[#A35139] mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Step 3: Shipping Method */}
            <div className="space-y-4 pt-6 border-t border-[#C9C1B1]">
              <h2 className="font-editorial text-xl text-[#1B2632]">
                3. Shipping Method
              </h2>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 border border-[#C9C1B1] bg-[#EEE9DF] cursor-pointer hover:border-[#1B2632]">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="checkoutShipping"
                      checked={shippingMethod === 'standard'}
                      onChange={() => dispatch(setShippingMethod('standard'))}
                      className="accent-[#1B2632]"
                    />
                    <div>
                      <p className="text-xs font-medium text-[#1B2632]">Standard Delivery</p>
                      <p className="text-[11px] text-[#2C3B4D] font-sans">3–5 business days</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-[#1B2632]">
                    {isFreeStandard ? 'Free' : '$15'}
                  </span>
                </label>

                <label className="flex items-center justify-between p-4 border border-[#C9C1B1] bg-[#EEE9DF] cursor-pointer hover:border-[#1B2632]">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="checkoutShipping"
                      checked={shippingMethod === 'express'}
                      onChange={() => dispatch(setShippingMethod('express'))}
                      className="accent-[#1B2632]"
                    />
                    <div>
                      <p className="text-xs font-medium text-[#1B2632]">Express Delivery</p>
                      <p className="text-[11px] text-[#2C3B4D] font-sans">1–2 business days</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-[#1B2632]">$25</span>
                </label>
              </div>
            </div>

            {/* Step 4: Payment Placeholder */}
            <div className="space-y-4 pt-6 border-t border-[#C9C1B1]">
              <h2 className="font-editorial text-xl text-[#1B2632]">
                4. Payment Method
              </h2>
              <div className="p-4 border border-[#C9C1B1] bg-[#EEE9DF] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1B2632]"></span>
                    <span className="text-xs font-medium text-[#1B2632]">Credit / Debit Card</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#2C3B4D] text-xs">
                    <span>Visa</span>
                    <span>•</span>
                    <span>Mastercard</span>
                    <span>•</span>
                    <span>Amex</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#2C3B4D] font-sans pt-1">
                  Payment will be processed securely. (Frontend preview mode &bull; no actual charges will be incurred).
                </p>
              </div>
            </div>

            {/* Place Order CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-[#1B2632] text-[#EEE9DF] hover:bg-[#2C3B4D] disabled:opacity-50 text-xs tracking-widest uppercase font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#C9C1B1] border-t-[#EEE9DF] rounded-full animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <span>Place Order — ${grandTotal}</span>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <div className="border border-[#C9C1B1] bg-[#EEE9DF] p-6 sticky top-24 space-y-6">
              <h2 className="font-editorial text-lg text-[#1B2632] pb-3 border-b border-[#C9C1B1]">
                Order Summary ({items.length} {items.length === 1 ? 'Garment' : 'Garments'})
              </h2>

              {/* Items List */}
              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1 divide-y divide-[#C9C1B1]/60">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 pt-3 first:pt-0">
                    <div className="relative w-16 h-20 bg-[#C9C1B1]/30 shrink-0 overflow-hidden border border-[#C9C1B1]">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" />
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#1B2632] text-[#EEE9DF] text-[10px] flex items-center justify-center font-mono">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-editorial text-sm text-[#1B2632] truncate">{item.name}</p>
                      <p className="text-xs text-[#2C3B4D] font-sans mt-0.5">
                        {item.color} / Size {item.size}
                      </p>
                      <p className="text-xs font-semibold text-[#1B2632] font-sans mt-2">
                        ${item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Calculations */}
              <div className="space-y-2 text-xs font-sans pt-2 border-t border-[#C9C1B1]">
                <div className="flex justify-between text-[#2C3B4D]">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#1B2632]">${subtotal}</span>
                </div>
                <div className="flex justify-between text-[#2C3B4D]">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'Complimentary' : `$${shippingCost}`}</span>
                </div>
                <div className="flex justify-between text-[#2C3B4D]">
                  <span>Estimated Tax</span>
                  <span>${estimatedTax}</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-[#1B2632] pt-3 border-t border-[#C9C1B1]">
                  <span>Total Amount</span>
                  <span>${grandTotal}</span>
                </div>
              </div>

              {/* Security and assurance */}
              <div className="pt-4 border-t border-[#C9C1B1] space-y-2 text-[11px] text-[#2C3B4D] font-sans">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#1B2632]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Encrypted checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#1B2632]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Complimentary returns within 30 days</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
