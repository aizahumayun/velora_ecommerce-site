import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import type { Order } from '@velora/shared';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(orderService.getAllOrders());

  useEffect(() => {
    orderService.getOrders().then((serverOrders) => {
      if (Array.isArray(serverOrders)) {
        setOrders(serverOrders);
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#EEE9DF] text-[#1B2632] pb-24">
      {/* Header */}
      <div className="border-b border-[#C9C1B1] bg-[#EEE9DF]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12 py-10">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-sans text-[#2C3B4D] mb-2">
                <Link to="/account" className="hover:text-[#1B2632]">Account</Link>
                <span>/</span>
                <span className="text-[#1B2632] font-medium">Orders</span>
              </div>
              <h1 className="font-editorial text-3xl text-[#1B2632]">
                Order History
              </h1>
              <p className="text-xs text-[#2C3B4D] font-sans mt-1">
                View order receipts, garments, and delivery records.
              </p>
            </div>
            <Link
              to="/account"
              className="text-xs font-sans text-[#2C3B4D] hover:text-[#1B2632] underline"
            >
              &larr; Back to Account
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12 pt-8">
        {orders.length === 0 ? (
          <div className="bg-[#EEE9DF] border border-[#C9C1B1] p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#C9C1B1]/30 flex items-center justify-center mx-auto text-[#2C3B4D]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="font-editorial text-2xl text-[#1B2632]">No Orders Found</h2>
            <p className="text-xs text-[#2C3B4D] font-sans max-w-sm mx-auto leading-relaxed">
              You haven't placed any orders yet. Discover our curated collection of timeless wardrobe essentials.
            </p>
            <Link
              to="/shop"
              className="inline-block px-8 py-3 bg-[#1B2632] text-[#EEE9DF] hover:bg-[#2C3B4D] text-xs tracking-widest uppercase transition-colors"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const formattedDate = new Date(order.date || order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={order.id}
                  className="bg-[#EEE9DF] border border-[#C9C1B1] p-6 space-y-6 shadow-xs hover:border-[#1B2632] transition-colors"
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-baseline justify-between gap-4 pb-4 border-b border-[#C9C1B1]/60 text-xs font-sans">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-[#2C3B4D] font-mono text-[11px] uppercase tracking-wider">
                          Order Number
                        </span>
                        <p className="font-mono font-bold text-[#1B2632] text-sm">
                          {order.orderNumber || order.id}
                        </p>
                      </div>
                      <span className="text-[#C9C1B1]">|</span>
                      <div>
                        <span className="text-[#2C3B4D] font-mono text-[11px] uppercase tracking-wider">
                          Placed On
                        </span>
                        <p className="text-[#1B2632] font-medium">{formattedDate}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-[#C9C1B1]/30 text-[#1B2632] text-[11px] font-mono tracking-wider uppercase border border-[#C9C1B1] font-semibold">
                        {order.status || 'Confirmed'}
                      </span>
                      <Link
                        to={`/account/orders/${order.id}`}
                        className="px-4 py-1.5 bg-[#1B2632] text-[#EEE9DF] hover:bg-[#2C3B4D] text-xs tracking-wider uppercase font-medium transition-colors"
                      >
                        View Order
                      </Link>
                    </div>
                  </div>

                  {/* Products Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex gap-3 items-center">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-20 object-cover object-top bg-[#C9C1B1]/30 border border-[#C9C1B1] shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).setAttribute(
                              'src',
                              'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?auto=format&fit=crop&w=400&q=80'
                            );
                          }}
                        />
                        <div className="min-w-0">
                          <p className="font-editorial text-xs text-[#1B2632] truncate font-medium">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-[#2C3B4D] font-sans mt-0.5">
                            {item.color} &bull; Size {item.size}
                          </p>
                          <p className="text-xs font-semibold text-[#1B2632] font-sans mt-1">
                            ${item.price} &times; {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer Bar */}
                  <div className="pt-4 border-t border-[#C9C1B1]/60 flex flex-wrap justify-between items-baseline text-xs font-sans">
                    <span className="text-[#2C3B4D]">
                      Shipped to: {order.shippingAddress.firstName} {order.shippingAddress.lastName} ({order.shippingAddress.city}, {order.shippingAddress.country})
                    </span>
                    <div className="text-sm font-semibold text-[#1B2632]">
                      <span>Total: </span>
                      <span className="font-sans">${order.total}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
