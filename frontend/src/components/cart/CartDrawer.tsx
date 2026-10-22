import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  closeCartDrawer,
  removeFromCart,
  updateQuantity,
  selectCartItems,
  selectCartSubtotal,
  selectCartTotalCount,
} from '../../store/slices/cartSlice';
import { showToast } from '../../store/slices/uiSlice';

export const CartDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isOpen = useAppSelector((state) => state.cart.isDrawerOpen);
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const totalCount = useAppSelector(selectCartTotalCount);

  // Free shipping threshold: $250
  const FREE_SHIPPING_THRESHOLD = 250;
  const progressToFreeShipping = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const amountRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingEstimate = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 15;
  const finalTotal = subtotal + shippingEstimate;

  if (!isOpen) return null;

  const handleCheckoutClick = () => {
    dispatch(closeCartDrawer());
    navigate('/checkout');
  };

  const handleViewBagClick = () => {
    dispatch(closeCartDrawer());
    navigate('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1B2632]/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => dispatch(closeCartDrawer())}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-[#EEE9DF] text-[#1B2632] shadow-2xl flex flex-col border-l border-[#C9C1B1]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-5 border-b border-[#C9C1B1]">
            <div className="flex items-baseline gap-2">
              <h2 className="font-editorial text-lg tracking-widest uppercase text-[#1B2632]">
                Shopping Bag
              </h2>
              <span className="text-xs font-mono text-[#2C3B4D] tracking-wider">
                ({totalCount} {totalCount === 1 ? 'item' : 'items'})
              </span>
            </div>
            <button
              onClick={() => dispatch(closeCartDrawer())}
              className="p-1.5 text-[#2C3B4D] hover:text-[#1B2632] transition-colors rounded-full hover:bg-[#C9C1B1]/30"
              aria-label="Close bag"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Free Shipping Progress Meter */}
          <div className="bg-[#C9C1B1]/20 px-4 sm:px-6 py-3 border-b border-[#C9C1B1]">
            <div className="flex justify-between items-center text-xs tracking-wide text-[#2C3B4D] mb-1.5 font-sans">
              {amountRemaining > 0 ? (
                <span>
                  Add <strong className="font-semibold text-[#1B2632]">${amountRemaining}</strong> more for complimentary delivery
                </span>
              ) : (
                <span className="text-[#1B2632] font-semibold flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#A35139]" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Complimentary shipping unlocked
                </span>
              )}
              <span className="text-[11px] font-mono text-[#2C3B4D]">{progressToFreeShipping}%</span>
            </div>
            <div className="w-full bg-[#C9C1B1]/40 h-1 rounded-full overflow-hidden">
              <div
                className="bg-[#1B2632] h-full transition-all duration-500 ease-out"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Body Content */}
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#C9C1B1]/30 flex items-center justify-center text-[#2C3B4D] mb-4">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <h3 className="font-editorial text-xl tracking-wide mb-2 text-[#1B2632]">Your Bag is Empty</h3>
              <p className="text-xs text-[#2C3B4D] font-sans max-w-xs leading-relaxed mb-6">
                Discover our curated collection of quiet luxury essentials, designed for architectural elegance and daily comfort.
              </p>
              <button
                onClick={() => {
                  dispatch(closeCartDrawer());
                  navigate('/shop');
                }}
                className="px-6 py-3 bg-[#1B2632] text-[#EEE9DF] hover:bg-[#2C3B4D] text-xs font-mono tracking-widest uppercase transition-colors"
              >
                Explore The Edit
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 divide-y divide-[#C9C1B1]/40 space-y-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 pt-4 first:pt-0">
                    {/* Thumbnail */}
                    <div className="relative w-20 h-26 shrink-0 bg-[#C9C1B1]/20 overflow-hidden border border-[#C9C1B1]/40">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          (e.target as HTMLElement).setAttribute(
                            'src',
                            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80'
                          );
                        }}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <Link
                            to={`/product/${item.productId}`}
                            onClick={() => dispatch(closeCartDrawer())}
                            className="font-editorial text-sm tracking-wide text-[#1B2632] hover:text-[#A35139] hover:underline truncate"
                          >
                            {item.name}
                          </Link>
                          <span className="font-sans text-sm font-semibold text-[#1B2632] whitespace-nowrap">
                            ${item.price * item.quantity}
                          </span>
                        </div>
                        <p className="text-xs text-[#2C3B4D] font-sans mt-0.5">
                          {item.color} &bull; Size {item.size}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-[11px] text-[#2C3B4D]/70 font-mono">
                            ${item.price} each
                          </p>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between mt-3 pt-2">
                        {/* Stepper */}
                        <div className="flex items-center border border-[#C9C1B1] text-xs bg-[#EEE9DF]">
                          <button
                            type="button"
                            onClick={() =>
                              dispatch(
                                updateQuantity({
                                  id: item.id,
                                  quantity: Math.max(1, item.quantity - 1),
                                })
                              )
                            }
                            className="w-7 h-7 flex items-center justify-center hover:bg-[#C9C1B1]/30 text-[#1B2632] transition-colors"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-mono font-medium text-[#1B2632]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              dispatch(
                                updateQuantity({
                                  id: item.id,
                                  quantity: item.quantity + 1,
                                })
                              )
                            }
                            className="w-7 h-7 flex items-center justify-center hover:bg-[#C9C1B1]/30 text-[#1B2632] transition-colors"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => {
                            dispatch(removeFromCart(item.id));
                            dispatch(showToast({ message: `Removed ${item.name} from bag` }));
                          }}
                          className="text-xs text-[#A35139] hover:underline font-mono uppercase tracking-wider transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer / Summary */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-[#C9C1B1] bg-[#EEE9DF] space-y-4">
              <div className="space-y-1.5 text-xs font-sans">
                <div className="flex justify-between text-[#2C3B4D]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1B2632]">${subtotal}</span>
                </div>
                <div className="flex justify-between text-[#2C3B4D]">
                  <span>Estimated Shipping</span>
                  <span>{shippingEstimate === 0 ? 'Complimentary' : `$${shippingEstimate}`}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-[#1B2632] pt-2 border-t border-[#C9C1B1]/60">
                  <span>Total</span>
                  <span>${finalTotal}</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleCheckoutClick}
                  className="w-full py-3.5 bg-[#1B2632] text-[#EEE9DF] hover:bg-[#2C3B4D] text-xs font-mono tracking-widest uppercase font-medium transition-colors flex items-center justify-center gap-2 group shadow-xs"
                >
                  <span>Proceed to Checkout</span>
                  <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                </button>
                <button
                  type="button"
                  onClick={handleViewBagClick}
                  className="w-full py-2.5 bg-transparent border border-[#C9C1B1] text-[#1B2632] hover:border-[#1B2632] text-xs font-mono tracking-widest uppercase transition-colors"
                >
                  View Full Bag
                </button>
              </div>

              <div className="flex items-center justify-center gap-4 text-[10px] text-[#2C3B4D] font-mono tracking-wide">
                <span>Free 30-Day Returns</span>
                <span>&bull;</span>
                <span>Carbon Neutral</span>
                <span>&bull;</span>
                <span>Secure Checkout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
