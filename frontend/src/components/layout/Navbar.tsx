import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { openCartDrawer } from '../../store/slices/cartSlice';
import { productService } from '../../services/productService';
import type { Product } from '@velora/shared';

export const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const cartItems = useAppSelector((state) => state.cart.items);
  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname, location.search]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isSearchOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isSearchOpen) setIsSearchOpen(false);
        if (mobileMenuOpen) setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, mobileMenuOpen]);

  // Live search results
  const [liveSearchResults, setLiveSearchResults] = useState<Product[]>([]);

  useEffect(() => {
    const query = localSearch.trim();
    if (!query) {
      setLiveSearchResults([]);
      return;
    }

    let isCancelled = false;
    productService
      .getProducts({ search: query })
      .then((items) => {
        if (!isCancelled && Array.isArray(items)) {
          setLiveSearchResults(items.slice(0, 4));
        }
      })
      .catch(() => {
        // Fallback handled gracefully
      });

    return () => {
      isCancelled = true;
    };
  }, [localSearch]);

  const searchResults: Product[] = useMemo(() => {
    const query = localSearch.trim();
    if (!query) return [];
    if (liveSearchResults.length > 0) return liveSearchResults;
    return productService.getProductsSync({ search: query }).slice(0, 4);
  }, [localSearch, liveSearchResults]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      const q = localSearch.trim();
      setIsSearchOpen(false);
      navigate(`/shop?search=${encodeURIComponent(q)}`);
      setLocalSearch('');
    }
  };

  const handleSelectProduct = (productId: string) => {
    setIsSearchOpen(false);
    setLocalSearch('');
    navigate(`/product/${productId}`);
  };

  const handleQuickTagClick = (tag: string) => {
    setIsSearchOpen(false);
    setLocalSearch('');
    navigate(`/shop?search=${encodeURIComponent(tag)}`);
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname === path) return true;
    return false;
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 select-none">
      {/* Top Announcement Bar - Responsive on 320px to Desktop */}
      <aside className="w-full bg-[#1B2632] text-[#EEE9DF] py-2 px-2 text-center border-b border-[#2C3B4D]/40">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <p className="font-mono text-[10px] sm:text-[11px] tracking-wider sm:tracking-widest uppercase opacity-95 truncate">
            Complimentary delivery on orders over $250 &bull; 30-Day Returns
          </p>
        </div>
      </aside>

      {/* Main Navigation Bar */}
      <div className="w-full bg-[#EEE9DF]/95 backdrop-blur-md border-b border-[#C9C1B1] relative">
        <div className="h-16 sm:h-20 max-w-7xl mx-auto px-2 sm:px-6 lg:px-12 flex items-center justify-between relative">
          
          {/* LEFT: Mobile Menu Hamburger & Desktop Logo */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0 relative z-10">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                if (isSearchOpen) setIsSearchOpen(false);
              }}
              className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-[#1B2632] hover:text-[#2C3B4D] active:scale-95 transition-transform"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>

            {/* Desktop Brand Logo */}
            <Link
              to="/"
              className="hidden lg:flex items-baseline gap-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#1B2632]"
            >
              <span className="font-editorial text-2xl sm:text-3xl tracking-[0.2em] uppercase text-[#1B2632] font-semibold">
                VELORA
              </span>
            </Link>
          </div>

          {/* CENTER: Centered Logo on Mobile (320px - 1023px) */}
          <div className="lg:hidden absolute left-1/2 -translate-x-1/2 pointer-events-auto max-w-[130px] sm:max-w-none text-center">
            <Link
              to="/"
              className="font-editorial text-lg sm:text-2xl tracking-[0.16em] sm:tracking-[0.18em] uppercase text-[#1B2632] font-semibold block truncate focus:outline-none"
            >
              VELORA
            </Link>
          </div>

          {/* CENTER: Desktop Nav Links (1024px+) */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              to="/"
              className={`font-sans text-xs tracking-widest uppercase py-2 transition-colors ${
                isActive('/')
                  ? 'text-[#1B2632] font-bold border-b-2 border-[#1B2632]'
                  : 'text-[#2C3B4D] hover:text-[#1B2632]'
              }`}
            >
              Home
            </Link>

            <Link
              to="/shop?category=new-arrivals"
              className={`font-sans text-xs tracking-widest uppercase py-2 transition-colors ${
                location.pathname === '/shop' && location.search.includes('new-arrivals')
                  ? 'text-[#1B2632] font-bold border-b-2 border-[#1B2632]'
                  : 'text-[#2C3B4D] hover:text-[#1B2632]'
              }`}
            >
              New Arrivals
            </Link>

            <Link
              to="/shop"
              className={`font-sans text-xs tracking-widest uppercase py-2 transition-colors ${
                isActive('/shop') && !location.search.includes('new-arrivals')
                  ? 'text-[#1B2632] font-bold border-b-2 border-[#1B2632]'
                  : 'text-[#2C3B4D] hover:text-[#1B2632]'
              }`}
            >
              Shop
            </Link>

            <Link
              to="/shop?collection=The Everyday Edit"
              className={`font-sans text-xs tracking-widest uppercase py-2 transition-colors ${
                location.search.includes('collection')
                  ? 'text-[#1B2632] font-bold border-b-2 border-[#1B2632]'
                  : 'text-[#2C3B4D] hover:text-[#1B2632]'
              }`}
            >
              Collections
            </Link>

            <Link
              to="/about"
              className={`font-sans text-xs tracking-widest uppercase py-2 transition-colors ${
                isActive('/about') || isActive('/story')
                  ? 'text-[#1B2632] font-bold border-b-2 border-[#1B2632]'
                  : 'text-[#2C3B4D] hover:text-[#1B2632]'
              }`}
            >
              About
            </Link>
          </nav>

          {/* RIGHT: Search, Account, Bag */}
          <div className="flex items-center gap-0.5 sm:gap-3 shrink-0 relative z-10">
            {/* Search Trigger Button */}
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                if (mobileMenuOpen) setMobileMenuOpen(false);
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-[#2C3B4D] hover:text-[#1B2632] transition-colors p-1"
              aria-label="Search collection"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden xl:inline ml-1 font-mono text-[11px] uppercase tracking-wider text-[#2C3B4D]">
                Search
              </span>
            </button>

            {/* Account Icon */}
            <Link
              to={isAuthenticated ? '/account' : '/login'}
              className="hidden sm:flex w-9 h-9 sm:w-10 sm:h-10 items-center justify-center text-[#2C3B4D] hover:text-[#1B2632] transition-colors p-1"
              aria-label="Account"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <span className="hidden xl:inline ml-1 font-mono text-[11px] uppercase tracking-wider text-[#2C3B4D]">
                {isAuthenticated && user?.name ? user.name.split(' ')[0] : 'Account'}
              </span>
            </Link>

            {/* Bag Icon Trigger */}
            <button
              type="button"
              onClick={() => dispatch(openCartDrawer())}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-[#1B2632] hover:text-[#2C3B4D] transition-colors p-1 relative"
              aria-label="Shopping Bag"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.669 0-1.189-.578-1.119-1.243l1.263-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {totalItemCount > 0 && (
                <span className="absolute top-1 right-0.5 sm:top-1.5 sm:right-1 w-4 h-4 rounded-full bg-[#A35139] text-[#EEE9DF] text-[10px] font-mono font-bold flex items-center justify-center">
                  {totalItemCount}
                </span>
              )}
            </button>
          </div>

          {/* RESPONSIVE SEARCH OVERLAY & RESULTS DRAWER (320px to Desktop) */}
          {isSearchOpen && (
            <div className="absolute inset-x-0 top-0 bg-[#EEE9DF] z-50 border-b border-[#C9C1B1] shadow-xl animate-in fade-in duration-150">
              {/* Input Header Row */}
              <div className="h-16 sm:h-20 max-w-7xl mx-auto px-2 sm:px-6 lg:px-12 flex items-center gap-2 sm:gap-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#2C3B4D] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                
                <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <input
                    ref={searchInputRef}
                    type="search"
                    placeholder="Search silhouettes, fabrics..."
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    className="w-full h-9 sm:h-11 bg-transparent font-sans text-base sm:text-sm text-[#1B2632] placeholder-[#2C3B4D]/60 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-2.5 sm:px-3.5 py-1.5 bg-[#1B2632] text-[#EEE9DF] hover:bg-[#2C3B4D] font-mono text-[10px] sm:text-[11px] uppercase tracking-wider shrink-0 transition-colors"
                  >
                    Search
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-[#2C3B4D] hover:text-[#1B2632] shrink-0"
                  aria-label="Close search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Live Search Results / Quick Suggestions Drawer */}
              <div className="w-full max-h-[60vh] sm:max-h-[420px] overflow-y-auto px-3 sm:px-6 lg:px-12 py-3 border-t border-[#C9C1B1]/50 bg-[#EEE9DF]">
                {localSearch.trim() ? (
                  <div>
                    <div className="flex items-center justify-between mb-3 pb-1 border-b border-[#C9C1B1]/30">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[#2C3B4D]">
                        Matching Silhouettes ({searchResults.length})
                      </span>
                      {searchResults.length > 0 && (
                        <button
                          type="button"
                          onClick={handleSearchSubmit}
                          className="font-mono text-[10px] text-[#A35139] hover:text-[#1B2632] uppercase tracking-wider underline cursor-pointer"
                        >
                          View all in shop &rarr;
                        </button>
                      )}
                    </div>

                    {searchResults.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                        {searchResults.map((product) => (
                          <div
                            key={product.id}
                            onClick={() => handleSelectProduct(product.id)}
                            className="flex items-center gap-3 p-2 bg-[#EEE9DF] hover:bg-[#C9C1B1]/20 border border-[#C9C1B1]/40 cursor-pointer transition-colors text-left"
                            role="button"
                            tabIndex={0}
                          >
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-12 h-14 object-cover object-top shrink-0 bg-[#C9C1B1]/20"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-editorial text-xs text-[#1B2632] truncate font-medium">
                                {product.name}
                              </p>
                              <p className="text-[10px] text-[#2C3B4D] font-mono uppercase tracking-wider mt-0.5">
                                {product.category}
                              </p>
                              <p className="text-xs font-semibold text-[#1B2632] font-mono mt-0.5">
                                ${product.price}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center">
                        <p className="font-editorial text-sm text-[#1B2632] mb-1">
                          No silhouettes found for "{localSearch}"
                        </p>
                        <p className="text-xs text-[#2C3B4D] font-sans mb-3">
                          Explore our signature categories or try a different term.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                          {['Dresses', 'Outerwear', 'Cashmere', 'Silk', 'Blazer'].map((term) => (
                            <button
                              key={term}
                              type="button"
                              onClick={() => handleQuickTagClick(term)}
                              className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider bg-[#C9C1B1]/30 hover:bg-[#C9C1B1]/60 text-[#1B2632] transition-colors"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#2C3B4D] mb-2">
                      Suggested Searches &amp; Categories
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {['The Everyday Edit', 'New Arrivals', 'Cashmere Knitwear', 'Silk Evening', 'Tailored Outerwear', 'Pleated Trouser'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleQuickTagClick(tag)}
                          className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider bg-[#C9C1B1]/30 hover:bg-[#C9C1B1]/60 text-[#1B2632] transition-colors cursor-pointer"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SEARCH BACKDROP OVERLAY */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 top-[calc(2rem+4rem)] sm:top-[calc(2rem+5rem)] bg-[#1B2632]/40 backdrop-blur-xs z-40 transition-opacity"
          onClick={() => setIsSearchOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* MOBILE NAVIGATION FLYOUT (320px - 1023px) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed top-[calc(2rem+4rem)] sm:top-[calc(2rem+5rem)] inset-x-0 bottom-0 bg-[#EEE9DF] z-40 border-b border-[#C9C1B1] overflow-y-auto overflow-x-hidden shadow-2xl flex flex-col justify-between p-4 sm:p-6 pb-12">
          <nav className="flex flex-col space-y-1 w-full">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-[44px] py-2 text-sm font-sans tracking-widest uppercase text-[#1B2632] font-semibold border-b border-[#C9C1B1]/40 flex items-center justify-between"
            >
              <span>Home</span>
              <span className="text-xs text-[#2C3B4D]">&rarr;</span>
            </Link>

            <Link
              to="/shop?category=new-arrivals"
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-[44px] py-2 text-sm font-sans tracking-widest uppercase text-[#A35139] font-medium border-b border-[#C9C1B1]/40 flex items-center justify-between"
            >
              <span>New Arrivals</span>
              <span className="text-[10px] font-mono bg-[#FFB162] text-[#1B2632] px-2 py-0.5 font-bold">AW24</span>
            </Link>

            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-[44px] py-2 text-sm font-sans tracking-widest uppercase text-[#1B2632] font-medium border-b border-[#C9C1B1]/40 flex items-center justify-between"
            >
              <span>Shop All Clothing</span>
              <span className="text-xs text-[#2C3B4D]">&rarr;</span>
            </Link>

            {/* Categories Sub-links */}
            <div className="pl-4 py-2 flex flex-col space-y-1 border-l-2 border-[#C9C1B1] my-1 text-xs text-[#2C3B4D]">
              <Link to="/shop?category=Dresses" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-[#1B2632]">
                Dresses
              </Link>
              <Link to="/shop?category=Tops" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-[#1B2632]">
                Tops &amp; Blouses
              </Link>
              <Link to="/shop?category=Bottoms" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-[#1B2632]">
                Bottoms &amp; Trousers
              </Link>
              <Link to="/shop?category=Outerwear" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-[#1B2632]">
                Outerwear &amp; Coats
              </Link>
              <Link to="/shop?category=Knitwear" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-[#1B2632]">
                Architectural Knitwear
              </Link>
              <Link to="/shop?category=Accessories" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-[#1B2632]">
                Minimal Accessories
              </Link>
            </div>

            <Link
              to="/shop?collection=The Everyday Edit"
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-[44px] py-2 text-sm font-sans tracking-widest uppercase text-[#1B2632] font-medium border-b border-[#C9C1B1]/40 flex items-center justify-between"
            >
              <span>Collections</span>
              <span className="text-xs text-[#2C3B4D]">&rarr;</span>
            </Link>

            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-[44px] py-2 text-sm font-sans tracking-widest uppercase text-[#1B2632] font-medium border-b border-[#C9C1B1]/40 flex items-center justify-between"
            >
              <span>About VELORA</span>
              <span className="text-xs text-[#2C3B4D]">&rarr;</span>
            </Link>

            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-[44px] py-2 text-sm font-sans tracking-widest uppercase text-[#1B2632] font-medium border-b border-[#C9C1B1]/40 flex items-center justify-between"
            >
              <span>Contact Concierge</span>
              <span className="text-xs text-[#2C3B4D]">&rarr;</span>
            </Link>

            <Link
              to={isAuthenticated ? '/account' : '/login'}
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-[44px] py-2 text-sm font-sans tracking-widest uppercase text-[#1B2632] font-medium flex items-center justify-between"
            >
              <span>{isAuthenticated ? 'Client Account' : 'Sign In / Register'}</span>
              <span className="text-xs text-[#2C3B4D]">&rarr;</span>
            </Link>
          </nav>

          <div className="pt-6 border-t border-[#C9C1B1] text-center space-y-2 shrink-0">
            <p className="font-mono text-[10px] tracking-wider text-[#2C3B4D] uppercase">
              Milan &bull; New York Atelier
            </p>
            <p className="text-[11px] text-[#2C3B4D]/70 font-sans">
              concierge@velora-studio.com &bull; +1 (800) 835-6721
            </p>
          </div>
        </div>
      )}
    </header>
  );
};
