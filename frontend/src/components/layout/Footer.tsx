import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { showToast, openSizeGuide } from '../../store/slices/uiSlice';

export const Footer: React.FC = () => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      dispatch(
        showToast({
          message: 'Welcome to the VELORA Circle',
          submessage: 'You have been successfully added to our private editorial dispatch.',
        })
      );
      setEmail('');
    }
  };

  return (
    <footer className="w-full bg-[#1B2632] text-[#EEE9DF] pt-16 pb-12 border-t border-[#2C3B4D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          {/* Brand & Newsletter (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link to="/" className="font-editorial text-2xl tracking-[0.2em] uppercase text-[#EEE9DF] font-semibold inline-block">
              VELORA
            </Link>
            <p className="text-xs text-[#C9C1B1] font-sans max-w-sm leading-relaxed">
              Modern pieces, thoughtfully designed for everyday life. Rooted in structural discipline, fine tailoring, and quiet sophistication.
            </p>
            <div className="mt-2 flex flex-col gap-2">
              <label
                htmlFor="footer-newsletter"
                className="font-mono text-[11px] uppercase tracking-widest text-[#FFB162]"
              >
                Join the Private Salon
              </label>
              <form onSubmit={handleSubscribe} className="flex items-center max-w-md">
                <input
                  id="footer-newsletter"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full h-11 bg-[#2C3B4D] text-[#EEE9DF] placeholder-[#C9C1B1]/60 px-3.5 text-xs font-sans border border-[#C9C1B1]/30 focus:outline-none focus:border-[#FFB162]"
                />
                <button
                  type="submit"
                  className="h-11 px-5 bg-[#EEE9DF] text-[#1B2632] font-mono text-xs uppercase tracking-wider hover:bg-[#C9C1B1] transition-colors flex-shrink-0 font-medium"
                >
                  {isSubscribed ? 'Joined' : 'Subscribe'}
                </button>
              </form>
            </div>
          </div>

          {/* Shop Column */}
          <div className="flex flex-col gap-2.5 text-xs font-sans">
            <span className="font-mono text-[11px] uppercase tracking-widest text-[#C9C1B1] mb-1">
              Shop The Edit
            </span>
            <Link to="/shop" className="text-[#EEE9DF]/80 hover:text-[#FFB162] transition-colors">
              All Clothing
            </Link>
            <Link to="/shop?category=new-arrivals" className="text-[#EEE9DF]/80 hover:text-[#FFB162] transition-colors">
              New Arrivals
            </Link>
            <Link to="/shop?category=Dresses" className="text-[#EEE9DF]/80 hover:text-[#FFB162] transition-colors">
              Dresses
            </Link>
            <Link to="/shop?category=Tops" className="text-[#EEE9DF]/80 hover:text-[#FFB162] transition-colors">
              Tops
            </Link>
            <Link to="/shop?category=Bottoms" className="text-[#EEE9DF]/80 hover:text-[#FFB162] transition-colors">
              Bottoms
            </Link>
            <Link to="/shop?category=Outerwear" className="text-[#EEE9DF]/80 hover:text-[#FFB162] transition-colors">
              Outerwear
            </Link>
            <Link to="/shop?category=Knitwear" className="text-[#EEE9DF]/80 hover:text-[#FFB162] transition-colors">
              Knitwear
            </Link>
            <Link to="/shop?category=Accessories" className="text-[#EEE9DF]/80 hover:text-[#FFB162] transition-colors">
              Accessories
            </Link>
          </div>

          {/* About & Studio Column */}
          <div className="flex flex-col gap-2.5 text-xs font-sans">
            <span className="font-mono text-[11px] uppercase tracking-widest text-[#C9C1B1] mb-1">
              About &amp; Studio
            </span>
            <Link to="/about" className="text-[#EEE9DF]/80 hover:text-[#FFB162] transition-colors">
              About VELORA
            </Link>
            <Link to="/about" className="text-[#EEE9DF]/80 hover:text-[#FFB162] transition-colors">
              Design Philosophy
            </Link>
            <Link to="/about" className="text-[#EEE9DF]/80 hover:text-[#FFB162] transition-colors">
              Noble Materials
            </Link>
            <button
              type="button"
              onClick={() => dispatch(openSizeGuide())}
              className="text-[#EEE9DF]/80 hover:text-[#FFB162] transition-colors text-left"
            >
              Size Guide &amp; Fit
            </button>
            <Link to="/contact" className="text-[#EEE9DF]/80 hover:text-[#FFB162] transition-colors">
              Contact Concierge
            </Link>
          </div>

          {/* Client Care & Account Column */}
          <div className="flex flex-col gap-2.5 text-xs font-sans">
            <span className="font-mono text-[11px] uppercase tracking-widest text-[#C9C1B1] mb-1">
              Client Portal
            </span>
            <Link to="/account" className="text-[#EEE9DF]/80 hover:text-[#FFB162] transition-colors">
              My Account
            </Link>
            <Link to="/account/orders" className="text-[#EEE9DF]/80 hover:text-[#FFB162] transition-colors">
              Order History
            </Link>
            <Link to="/cart" className="text-[#EEE9DF]/80 hover:text-[#FFB162] transition-colors">
              Shopping Bag
            </Link>
            <Link to="/contact" className="text-[#EEE9DF]/80 hover:text-[#FFB162] transition-colors">
              Shipping &amp; Delivery
            </Link>
            <Link to="/contact" className="text-[#EEE9DF]/80 hover:text-[#FFB162] transition-colors">
              Returns &amp; Exchanges
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#C9C1B1]/70 border-t border-[#2C3B4D]">
          <div className="flex items-center gap-6 tracking-wider">
            <p>&copy; VELORA 2025</p>
            <Link to="/about" className="hover:text-[#EEE9DF] transition-colors">
              Ethos
            </Link>
            <Link to="/contact" className="hover:text-[#EEE9DF] transition-colors">
              Customer Support
            </Link>
          </div>
          <div className="flex items-center gap-2 uppercase tracking-wider text-[11px]">
            <span>Milan &bull; New York</span>
            <span>&bull;</span>
            <span className="text-[#FFB162]">USD ($)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
