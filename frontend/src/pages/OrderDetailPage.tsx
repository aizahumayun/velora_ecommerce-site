import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import type { Order } from '@velora/shared';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(id ? orderService.getOrderById(id) : null);

  useEffect(() => {
    if (id) {
      orderService.fetchOrderById(id).then((serverOrder) => {
        if (serverOrder) {
          setOrder(serverOrder);
        }
      });
    }
  }, [id]);

  if (!order) {
    return (
      <div className="min-h-[70vh] bg-[#EEE9DF] flex flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="font-editorial text-2xl text-[#1B2632] mb-2">Order Not Found</h1>
        <p className="text-xs text-[#2C3B4D] font-sans max-w-sm mb-6 leading-relaxed">
          We could not locate this order in our records. Please check the order reference or return to your account.
        </p>
        <Link
          to="/account/orders"
          className="px-6 py-3 bg-[#1B2632] text-[#EEE9DF] text-xs tracking-widest uppercase hover:bg-[#2C3B4D] transition-colors"
        >
          View All Orders
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(order.date || order.createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#EEE9DF] text-[#1B2632] pb-24">
      {/* Header */}
      <div className="border-b border-[#C9C1B1] bg-[#EEE9DF]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 py-10">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-sans text-[#2C3B4D] mb-2">
                <Link to="/account" className="hover:text-[#1B2632]">Account</Link>
                <span>/</span>
                <Link to="/account/orders" className="hover:text-[#1B2632]">Orders</Link>
                <span>/</span>
                <span className="text-[#1B2632] font-medium font-mono">{order.orderNumber || order.id}</span>
              </div>
              <h1 className="font-editorial text-3xl text-[#1B2632]">
                Order Details
              </h1>
              <p className="text-xs text-[#2C3B4D] font-sans mt-1">
                Placed on {formattedDate}
              </p>
            </div>
            <Link
              to="/account/orders"
              className="text-xs font-sans text-[#2C3B4D] hover:text-[#1B2632] underline"
            >
              &larr; All Orders
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 pt-8 space-y-8">
        {/* Order Meta Bar */}
        <div className="bg-[#EEE9DF] border border-[#C9C1B1] p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[#2C3B4D] font-mono text-[11px] uppercase tracking-wider block">
              Order Reference
            </span>
            <span className="font-mono font-bold text-[#1B2632] text-base">
              {order.orderNumber || order.id}
            </span>
          </div>

          <div>
            <span className="text-[#2C3B4D] font-mono text-[11px] uppercase tracking-wider block">
              Status
            </span>
            <span className="inline-block px-3 py-1 bg-[#C9C1B1]/30 text-[#1B2632] text-xs font-mono uppercase tracking-wider font-semibold mt-1 border border-[#C9C1B1]">
              {order.status || 'Confirmed'}
            </span>
          </div>

          <div>
            <span className="text-[#2C3B4D] font-mono text-[11px] uppercase tracking-wider block">
              Total Amount
            </span>
            <span className="font-sans font-bold text-[#1B2632] text-base">
              ${order.total}
            </span>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-[#EEE9DF] border border-[#C9C1B1] p-6 sm:p-8 space-y-4">
          <h2 className="font-editorial text-xl text-[#1B2632] pb-3 border-b border-[#C9C1B1]/60">
            Purchased Garments ({order.items.length})
          </h2>

          <div className="divide-y divide-[#C9C1B1]/40">
            {order.items.map((item) => (
              <div key={item.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-22 bg-[#C9C1B1]/30 overflow-hidden shrink-0 border border-[#C9C1B1]">
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
                    <h3 className="font-editorial text-sm sm:text-base text-[#1B2632]">
                      {item.name}
                    </h3>
                    <p className="text-xs text-[#2C3B4D] font-sans mt-0.5">
                      Color: <span className="text-[#1B2632]">{item.color}</span> &bull; Size:{' '}
                      <span className="text-[#1B2632] font-mono font-medium">{item.size}</span>
                    </p>
                    <p className="text-xs text-[#2C3B4D] font-sans mt-0.5">
                      Quantity: <span className="text-[#1B2632]">{item.quantity}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right sm:self-center">
                  <p className="font-sans font-semibold text-[#1B2632] text-sm">
                    ${item.price * item.quantity}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-[11px] text-[#2C3B4D] font-sans">
                      ${item.price} each
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Totals Breakdown */}
          <div className="pt-4 border-t border-[#C9C1B1] space-y-2 text-xs font-sans text-right max-w-xs ml-auto">
            <div className="flex justify-between text-[#2C3B4D]">
              <span>Subtotal:</span>
              <span className="font-medium text-[#1B2632]">${order.subtotal}</span>
            </div>
            <div className="flex justify-between text-[#2C3B4D]">
              <span>Shipping ({order.shippingMethod === 'express' ? 'Express' : 'Standard'}):</span>
              <span>{order.shippingCost === 0 ? 'Complimentary' : `$${order.shippingCost}`}</span>
            </div>
            {order.tax !== undefined && order.tax > 0 && (
              <div className="flex justify-between text-[#2C3B4D]">
                <span>Estimated Tax:</span>
                <span>${order.tax}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold text-[#1B2632] pt-2 border-t border-[#C9C1B1]">
              <span>Total:</span>
              <span>${order.total}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shipping Address */}
          <div className="bg-[#EEE9DF] border border-[#C9C1B1] p-6 space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#2C3B4D] mb-3">
              Delivery Address
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
            <p className="text-xs text-[#2C3B4D] font-mono pt-2">
              Phone: {order.shippingAddress.phone}
            </p>
          </div>

          {/* Shipping & Payment Meta */}
          <div className="bg-[#EEE9DF] border border-[#C9C1B1] p-6 space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#2C3B4D] mb-3">
              Shipping &amp; Payment
            </h3>
            <div>
              <p className="text-xs text-[#2C3B4D]">Method</p>
              <p className="text-xs font-medium text-[#1B2632] font-sans">
                {order.shippingMethod === 'express' ? 'Express Priority Air (1–2 days)' : 'Standard Insured Courier (3–5 days)'}
              </p>
            </div>
            <div className="pt-2">
              <p className="text-xs text-[#2C3B4D]">Payment</p>
              <p className="text-xs font-medium text-[#1B2632] font-sans">
                {order.paymentMethod || 'Credit / Debit Card'}
              </p>
            </div>
            {order.customerEmail && (
              <div className="pt-2">
                <p className="text-xs text-[#2C3B4D]">Receipt Dispatched To</p>
                <p className="text-xs font-mono text-[#1B2632]">{order.customerEmail}</p>
              </div>
            )}
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center pt-4">
          <Link
            to="/account/orders"
            className="inline-block px-8 py-3 bg-[#1B2632] text-[#EEE9DF] hover:bg-[#2C3B4D] text-xs tracking-widest uppercase transition-colors"
          >
            &larr; Return to Orders
          </Link>
        </div>
      </div>
    </div>
  );
};
