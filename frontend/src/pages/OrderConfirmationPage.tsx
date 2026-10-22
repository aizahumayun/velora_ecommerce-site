import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import type { Order } from '@velora/shared';

export const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      const found = orderService.getOrderById(id);
      if (found) {
        setOrder(found);
      }
      orderService.fetchOrderById(id).then((serverOrder) => {
        if (serverOrder) {
          setOrder(serverOrder);
        }
      });
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-[#EEE9DF] text-[#1B2632] pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-12 py-14">
        {/* Order Confirmed Banner */}
        <div className="text-center space-y-4 pb-10 border-b border-[#C9C1B1]">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#1B2632] text-[#EEE9DF] flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <span className="text-[11px] font-mono uppercase tracking-widest text-[#2C3B4D] block">
            Order Confirmed
          </span>

          <h1 className="font-editorial text-3xl sm:text-4xl text-[#1B2632]">
            Thank you for your order
          </h1>

          <p className="text-xs sm:text-sm text-[#2C3B4D] font-sans max-w-md mx-auto leading-relaxed">
            Your order has been recorded. Email confirmation status is not available here.{' '}
            {order?.customerEmail && (
            <strong className="text-[#1B2632] font-mono">
              {order.customerEmail}
            </strong>
            )}
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9C1B1]/30 border border-[#C9C1B1] font-mono text-xs">
            <span className="text-[#2C3B4D]">Order Number:</span>
            <strong className="text-[#1B2632] font-bold">
              {order?.orderNumber || order?.id || id}
            </strong>
          </div>
        </div>

        {/* Order Summary & Products */}
        <div className="mt-8 bg-[#EEE9DF] border border-[#C9C1B1] p-6 sm:p-8 space-y-6">
          <h2 className="font-editorial text-xl text-[#1B2632] pb-3 border-b border-[#C9C1B1]/60">
            Order Summary
          </h2>

          {/* Products List */}
          <div className="divide-y divide-[#C9C1B1]/40">
            {order?.items.map((item) => (
              <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 bg-[#C9C1B1]/30 overflow-hidden shrink-0 border border-[#C9C1B1]">
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
                  <div>
                    <h3 className="font-editorial text-sm text-[#1B2632]">{item.name}</h3>
                    <p className="text-xs text-[#2C3B4D] font-sans mt-0.5">
                      Color: <span className="text-[#1B2632]">{item.color}</span> &bull; Size:{' '}
                      <span className="text-[#1B2632] font-mono font-medium">{item.size}</span>
                    </p>
                    <p className="text-xs text-[#2C3B4D] font-sans mt-0.5">
                      Quantity: <span className="text-[#1B2632]">{item.quantity}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-[#1B2632] font-sans">
                    ${item.price * item.quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="pt-4 border-t border-[#C9C1B1] space-y-2 text-xs font-sans text-right max-w-xs ml-auto">
            <div className="flex justify-between text-[#2C3B4D]">
              <span>Subtotal:</span>
              <span className="font-medium text-[#1B2632]">${order?.subtotal || 0}</span>
            </div>
            <div className="flex justify-between text-[#2C3B4D]">
              <span>Shipping:</span>
              <span>{order?.shippingCost === 0 ? 'Complimentary' : `$${order?.shippingCost}`}</span>
            </div>
            {order?.tax !== undefined && order.tax > 0 && (
              <div className="flex justify-between text-[#2C3B4D]">
                <span>Estimated Tax:</span>
                <span>${order.tax}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold text-[#1B2632] pt-2 border-t border-[#C9C1B1]">
              <span>Total:</span>
              <span>${order?.total || 0}</span>
            </div>
          </div>
        </div>

        {/* Shipping Information Card */}
        {order?.shippingAddress && (
          <div className="mt-6 bg-[#EEE9DF] border border-[#C9C1B1] p-6 sm:p-8 space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#2C3B4D] mb-3">
              Shipping Destination
            </h3>
            <p className="text-sm font-medium text-[#1B2632]">
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            </p>
            <p className="text-xs text-[#2C3B4D] font-sans">
              {order.shippingAddress.address || order.shippingAddress.streetAddress}
              {order.shippingAddress.apartment ? `, ${order.shippingAddress.apartment}` : ''}
            </p>
            <p className="text-xs text-[#2C3B4D] font-sans">
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </p>
            <p className="text-xs text-[#2C3B4D] font-sans">
              {order.shippingAddress.country}
            </p>
            {order.shippingAddress.phone && (
              <p className="text-xs text-[#2C3B4D] font-mono pt-1">
                Phone: {order.shippingAddress.phone}
              </p>
            )}
          </div>
        )}

        {/* Bottom Actions: Continue Shopping & View Order */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/shop"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#1B2632] text-[#EEE9DF] hover:bg-[#2C3B4D] text-xs tracking-widest uppercase transition-colors text-center font-medium"
          >
            Continue Shopping
          </Link>
          <Link
            to={`/account/orders/${order?.id || id}`}
            className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-[#C9C1B1] hover:border-[#1B2632] text-[#1B2632] text-xs tracking-widest uppercase transition-colors text-center font-medium"
          >
            View Order
          </Link>
        </div>
      </div>
    </div>
  );
};
