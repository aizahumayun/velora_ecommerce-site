import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import {
  removeFromCart,
  updateQuantity,
  setShippingMethod,
  selectCartItems,
  selectCartSubtotal,
  selectCartTotalCount,
} from '../store/slices/cartSlice';
import { showToast } from '../store/slices/uiSlice';
import { INITIAL_PRODUCTS } from '@velora/shared';
import { ProductCard } from '../components/common/ProductCard';

export const CartPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const totalCount = useAppSelector(selectCartTotalCount);
  const shippingMethod = useAppSelector((state) => state.cart.shippingMethod);

  const FREE_SHIPPING_THRESHOLD = 250;
  const isFreeStandard = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = shippingMethod === 'express' ? 25 : isFreeStandard ? 0 : 15;
  const finalTotal = subtotal + shippingCost;

  const recommendations = INITIAL_PRODUCTS.slice(4, 8);

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#EEE9DF] flex flex-col items-center justify-center px-4 sm:px-6 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-[#C9C1B1]/30 flex items-center justify-center text-[#2C3B4D] mb-6">
          <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.2"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
        <h1 className="font-editorial text-3xl text-[#1B2632] mb-3">Your Shopping Bag is Empty</h1>
        <p className="text-xs sm:text-sm text-[#2C3B4D] font-sans max-w-md mx-auto leading-relaxed mb-8">
          Explore our collection of contemporary essentials, crafted from virgin wool, Mongolian cashmere, and architectural silhouettes.
        </p>
        <Link
          to="/shop"
          className="px-8 py-3.5 bg-[#1B2632] text-[#EEE9DF] hover:bg-[#2C3B4D] text-xs tracking-widest uppercase transition-colors"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEE9DF] text-[#1B2632] pb-24">
      {/* Header */}
      <div className="border-b border-[#C9C1B1] bg-[#EEE9DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <h1 className="font-editorial text-3xl text-[#1B2632]">
              Shopping Bag <span className="text-[#2C3B4D] text-xl font-sans">({totalCount})</span>
            </h1>
            <Link to="/shop" className="text-xs text-[#2C3B4D] hover:text-[#1B2632] underline font-sans">
              &larr; Continue Curating
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-8">
        {/* Free Shipping Alert Bar */}
        <div className="bg-[#C9C1B1]/20 p-4 border border-[#C9C1B1] mb-8 text-xs font-sans flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {isFreeStandard ? (
              <strong className="text-[#1B2632] font-semibold flex items-center gap-1.5">
                <span className="text-[#A35139]">&check;</span> You have unlocked complimentary standard delivery
              </strong>
            ) : (
              <span>
                Add <strong className="text-[#1B2632]">${FREE_SHIPPING_THRESHOLD - subtotal}</strong> more to your order for complimentary standard delivery.
              </span>
            )}
          </span>
          <span className="text-[#2C3B4D] font-mono text-[11px]">Free Returns Within 30 Days</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Items Table (Left 8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="border border-[#C9C1B1] bg-[#EEE9DF] divide-y divide-[#C9C1B1]">
              {items.map((item) => (
                <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6">
                  {/* Thumbnail */}
                  <Link to={`/product/${item.productId}`} className="w-24 h-32 shrink-0 bg-[#C9C1B1]/30 overflow-hidden block border border-[#C9C1B1]/40">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top hover:scale-105 transition-transform" />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link to={`/product/${item.productId}`} className="font-editorial text-lg text-[#1B2632] hover:underline">
                          {item.name}
                        </Link>
                        <span className="font-sans font-medium text-base text-[#1B2632]">
                          ${item.price * item.quantity}
                        </span>
                      </div>
                      <p className="text-xs text-[#2C3B4D] font-sans mt-1">
                        Color: <span className="text-[#1B2632]">{item.color}</span> | Size: <span className="text-[#1B2632] font-mono">{item.size}</span>
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-[11px] text-[#2C3B4D] font-sans mt-0.5">
                          ${item.price} each
                        </p>
                      )}
                    </div>

                    {/* Stepper & Actions */}
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#C9C1B1]/60">
                      <div className="flex items-center border border-[#C9C1B1] bg-[#EEE9DF]">
                        <button
                          type="button"
                          onClick={() => dispatch(updateQuantity({ id: item.id, quantity: Math.max(1, item.quantity - 1) }))}
                          className="w-8 h-8 flex items-center justify-center hover:bg-[#C9C1B1]/30 text-[#2C3B4D]"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-sans font-medium text-xs text-[#1B2632]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                          className="w-8 h-8 flex items-center justify-center hover:bg-[#C9C1B1]/30 text-[#2C3B4D]"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          dispatch(removeFromCart(item.id));
                          dispatch(showToast({ message: `Removed ${item.name} from bag` }));
                        }}
                        className="text-xs text-[#A35139] hover:underline font-mono uppercase tracking-wider"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary (Right 4 Cols) */}
          <div className="lg:col-span-4">
            <div className="border border-[#C9C1B1] bg-[#EEE9DF] p-6 sticky top-24 space-y-6">
              <h2 className="font-editorial text-xl text-[#1B2632] pb-3 border-b border-[#C9C1B1]">
                Order Summary
              </h2>

              {/* Shipping Method Choice */}
              <div className="space-y-2 pt-2">
                <p className="text-xs uppercase font-mono tracking-wider text-[#2C3B4D]">Shipping Method</p>
                <div className="space-y-2 text-xs font-sans">
                  <label className="flex items-center justify-between p-2.5 border border-[#C9C1B1] hover:border-[#1B2632] cursor-pointer">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="cartShipping"
                        checked={shippingMethod === 'standard'}
                        onChange={() => dispatch(setShippingMethod('standard'))}
                        className="accent-[#1B2632]"
                      />
                      <span>Standard Courier (3–5 days)</span>
                    </div>
                    <span>{isFreeStandard ? 'Free' : '$15'}</span>
                  </label>

                  <label className="flex items-center justify-between p-2.5 border border-[#C9C1B1] hover:border-[#1B2632] cursor-pointer">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="cartShipping"
                        checked={shippingMethod === 'express'}
                        onChange={() => dispatch(setShippingMethod('express'))}
                        className="accent-[#1B2632]"
                      />
                      <span>Express Air (1–2 days)</span>
                    </div>
                    <span>$25</span>
                  </label>
                </div>
              </div>

              {/* Subtotals & Total */}
              <div className="space-y-2.5 text-xs font-sans pt-2 border-t border-[#C9C1B1]">
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
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-[#1B2632] pt-3 border-t border-[#C9C1B1]">
                  <span>Estimated Total</span>
                  <span>${finalTotal}</span>
                </div>
              </div>

              {/* CTA */}
              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-[#1B2632] text-[#EEE9DF] hover:bg-[#2C3B4D] text-xs tracking-widest uppercase font-medium transition-colors flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <span>&rarr;</span>
              </button>

              <div className="text-[11px] text-[#2C3B4D] font-sans text-center space-y-1">
                <p>Complimentary carbon-neutral packaging</p>
                <p>30-day return policy on all unworn items</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Recommendation */}
        <div className="mt-24 pt-16 border-t border-[#C9C1B1]">
          <h3 className="font-editorial text-2xl text-[#1B2632] mb-8 text-center">
            You May Also Love
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recommendations.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
