import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/common/ProductCard';
import { INITIAL_PRODUCTS } from '@velora/shared';
import { productService } from '../services/productService';
import type { Product } from '@velora/shared';
import { useAppDispatch } from '../store';
import { showToast } from '../store/slices/uiSlice';

export const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'featured'>('all');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const [curatedProducts, setCuratedProducts] = useState<Product[]>(() => {
    return productService.getProductsSync().filter((product) => {
      if (activeTab === 'new') return product.newArrival;
      if (activeTab === 'featured') return product.featured;
      return true;
    }).slice(0, 8);
  });
  const [totalCatalogCount, setTotalCatalogCount] = useState<number>(INITIAL_PRODUCTS.length);

  useEffect(() => {
    let isCancelled = false;
    productService
      .getProducts()
      .then((allProducts) => {
        if (!isCancelled && Array.isArray(allProducts) && allProducts.length > 0) {
          setTotalCatalogCount(allProducts.length);
          const filtered = allProducts
            .filter((p) => {
              if (activeTab === 'new') return p.newArrival;
              if (activeTab === 'featured') return p.featured;
              return true;
            })
            .slice(0, 8);
          setCuratedProducts(filtered);
        }
      })
      .catch(() => {
        // Fallback remains in place
      });

    return () => {
      isCancelled = true;
    };
  }, [activeTab]);

  const categories = [
    {
      title: 'Outerwear & Coats',
      slug: 'Outerwear',
      image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
      count: '8 Styles',
    },
    {
      title: 'Tailored Blazers',
      slug: 'Blazers',
      image: 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=800&q=80',
      count: '6 Styles',
    },
    {
      title: 'Architectural Knitwear',
      slug: 'Knitwear',
      image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80',
      count: '7 Styles',
    },
    {
      title: 'Draped Dresses',
      slug: 'Dresses',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D',
      count: '5 Styles',
    },
  ];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    setNewsletterSubscribed(true);
    dispatch(showToast({ message: 'Welcome to VELORA. Check your inbox for private access.' }));
  };

  return (
    <div className="min-h-screen bg-[#EEE9DF] text-[#1B2632]">
      {/* Hero Section */}
      <section className="relative h-[88vh] min-h-[580px] max-h-[860px] w-full overflow-hidden bg-[#1B2632] flex items-center">
        {/* Background Image with subtle atmospheric overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85"
            alt="VELORA Autumn Winter 2024 Collection"
            className="w-full h-full object-cover object-top opacity-85 brightness-95"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1B2632]/85 via-[#1B2632]/50 to-transparent" />
          <div className="absolute inset-0 bg-[#1B2632]/20" />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 w-full text-[#EEE9DF]">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1B2632]/70 backdrop-blur-md border border-[#C9C1B1]/40 text-[11px] tracking-widest uppercase font-mono text-[#C9C1B1]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFB162]"></span>
              Autumn / Winter 2024 Collection
            </div>

            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1] text-[#EEE9DF]">
              Modern pieces, thoughtfully designed for everyday life.
            </h1>

            <p className="text-sm sm:text-base text-[#C9C1B1] font-sans font-light leading-relaxed max-w-lg">
              Rooted in structural discipline, fine tailoring, and quiet sophistication. A curated wardrobe crafted from pure cashmere, virgin wool, and structured poplin.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to="/shop"
                className="px-8 py-3.5 bg-[#EEE9DF] text-[#1B2632] hover:bg-[#C9C1B1] text-xs tracking-widest uppercase font-medium transition-all duration-200 shadow-sm"
              >
                Shop The Collection
              </Link>
              <Link
                to="/about"
                className="px-8 py-3.5 bg-transparent border border-[#C9C1B1] text-[#EEE9DF] hover:bg-[#1B2632]/40 text-xs tracking-widest uppercase font-medium backdrop-blur-xs transition-all duration-200"
              >
                Our Philosophy
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Banner Indicators */}
        <div className="absolute bottom-6 right-6 lg:right-12 hidden sm:flex items-center gap-6 text-[11px] text-[#C9C1B1] font-mono tracking-widest">
          <span>01 / 04</span>
          <span>EST. 2022</span>
          <span>MILAN — NEW YORK</span>
        </div>
      </section>

      {/* Brand Values / Value Proposition Bar */}
      <section className="border-b border-[#C9C1B1] bg-[#EEE9DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1B2632]">Noble Fibers</p>
            <p className="text-[11px] text-[#2C3B4D] font-sans">100% cashmere, silk &amp; certified wool</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1B2632]">Architectural Cut</p>
            <p className="text-[11px] text-[#2C3B4D] font-sans">Precise proportions made to drape</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1B2632]">Complimentary Shipping</p>
            <p className="text-[11px] text-[#2C3B4D] font-sans">Orders above $250 worldwide</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1B2632]">Effortless Returns</p>
            <p className="text-[11px] text-[#2C3B4D] font-sans">Prepaid 30-day return label</p>
          </div>
        </div>
      </section>

      {/* Category Exploration */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-[#C9C1B1]">
          <div>
            <span className="text-[11px] font-mono tracking-widest text-[#2C3B4D] uppercase">Categories</span>
            <h2 className="font-editorial text-2xl md:text-3xl text-[#1B2632] mt-1">Explore By Wardrobe Pillar</h2>
          </div>
          <Link
            to="/shop"
            className="text-xs font-sans tracking-widest uppercase text-[#2C3B4D] hover:text-[#1B2632] mt-3 md:mt-0 underline underline-offset-4"
          >
            View All Categories &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/shop?category=${encodeURIComponent(cat.slug)}`}
              className="group block relative overflow-hidden bg-[#C9C1B1]/30 border border-[#C9C1B1]"
            >
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B2632]/85 via-transparent to-transparent flex flex-col justify-end p-5 text-[#EEE9DF]">
                <span className="text-[10px] font-mono tracking-widest text-[#C9C1B1] uppercase">
                  {cat.count}
                </span>
                <h3 className="font-editorial text-lg tracking-wide text-[#EEE9DF] group-hover:underline">
                  {cat.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Curated Products Section */}
      <section className="bg-[#EEE9DF] py-16 md:py-24 border-t border-b border-[#C9C1B1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          {/* Header & Tabs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-[#C9C1B1] gap-4">
            <div>
              <span className="text-[11px] font-mono tracking-widest text-[#2C3B4D] uppercase">The Edit</span>
              <h2 className="font-editorial text-3xl md:text-4xl text-[#1B2632] mt-1">Curated Essentials</h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 text-xs tracking-widest uppercase transition-colors ${
                  activeTab === 'all'
                    ? 'bg-[#1B2632] text-[#EEE9DF]'
                    : 'text-[#2C3B4D] hover:text-[#1B2632] hover:bg-[#C9C1B1]/30'
                }`}
              >
                All Styles
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('new')}
                className={`px-4 py-2 text-xs tracking-widest uppercase transition-colors ${
                  activeTab === 'new'
                    ? 'bg-[#1B2632] text-[#EEE9DF]'
                    : 'text-[#2C3B4D] hover:text-[#1B2632] hover:bg-[#C9C1B1]/30'
                }`}
              >
                New Arrivals
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('featured')}
                className={`px-4 py-2 text-xs tracking-widest uppercase transition-colors ${
                  activeTab === 'featured'
                    ? 'bg-[#1B2632] text-[#EEE9DF]'
                    : 'text-[#2C3B4D] hover:text-[#1B2632] hover:bg-[#C9C1B1]/30'
                }`}
              >
                Bestsellers
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
            {curatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center px-10 py-4 border border-[#1B2632] text-[#1B2632] hover:bg-[#1B2632] hover:text-[#EEE9DF] text-xs tracking-widest uppercase transition-colors duration-200"
            >
              Shop All {totalCatalogCount} Styles
            </Link>
          </div>
        </div>
      </section>

      {/* Editorial Feature ("The Art of Less") */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 relative">
            <div className="aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/3] bg-[#C9C1B1]/30 overflow-hidden shadow-sm border border-[#C9C1B1]">
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=80"
                alt="VELORA Atelier"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 hidden sm:block bg-[#1B2632] text-[#EEE9DF] p-6 max-w-xs shadow-xl border border-[#2C3B4D]">
              <p className="font-editorial text-lg italic leading-snug">
                &ldquo;Simplicity is not a lack of clutter; it is the ultimate expression of purpose.&rdquo;
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6 lg:pl-6">
            <span className="text-[11px] font-mono tracking-widest text-[#2C3B4D] uppercase">
              Atelier Notes
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl text-[#1B2632] leading-tight">
              The Art of Less: Intentional Tailoring
            </h2>
            <p className="text-xs sm:text-sm text-[#2C3B4D] font-sans leading-relaxed">
              At VELORA, we discard the disposable cycles of fast trend forecasting. Every garment is conceived as a long-term companion: sourced from heritage mills in Biella, lined with fine cupro, and constructed with floating horsehair canvas to conform gracefully to your frame over time.
            </p>
            <p className="text-xs sm:text-sm text-[#2C3B4D] font-sans leading-relaxed">
              We design with restrained geometry &mdash; clean shoulders, elongated sleeves, and deliberate drape that effortlessly shifts between morning boardrooms and late evening dinners.
            </p>

            <div className="pt-2">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#1B2632] hover:text-[#A35139] underline underline-offset-8"
              >
                <span>Read The Full Manifesto</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainable Craft Quote Banner */}
      <section className="bg-[#1B2632] text-[#EEE9DF] py-16 md:py-20 px-4 sm:px-6 border-y border-[#2C3B4D]">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-[10px] font-mono tracking-widest text-[#FFB162] uppercase">
            Responsible Modernity
          </span>
          <p className="font-editorial text-2xl sm:text-3xl md:text-4xl leading-relaxed text-[#EEE9DF]">
            &ldquo;Clothes made to outlive seasonal noise. Every seam, dart, and stitch is calculated to move with enduring intention.&rdquo;
          </p>
          <div className="pt-2 text-xs text-[#C9C1B1] font-mono tracking-widest uppercase">
            VELORA Design Ethos &mdash; 100% Renewable Energy Mills
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-20">
        <div className="bg-[#EEE9DF] border border-[#C9C1B1] p-6 sm:p-14 text-center max-w-3xl mx-auto shadow-sm">
          <span className="text-[11px] font-mono tracking-widest text-[#2C3B4D] uppercase">
            Private Access
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl text-[#1B2632] mt-2 mb-3">
            Join The VELORA Circle
          </h2>
          <p className="text-xs sm:text-sm text-[#2C3B4D] font-sans max-w-md mx-auto mb-6 leading-relaxed">
            Receive private capsule invitations, early access to seasonal edits, and 10% off your inaugural order.
          </p>

          {newsletterSubscribed ? (
            <div className="p-4 bg-[#C9C1B1]/30 border border-[#C9C1B1] text-[#1B2632] text-xs font-medium tracking-wide">
              Thank you for subscribing. Use code <strong className="font-mono text-[#1B2632] font-bold">VELORA10</strong> at checkout for 10% off your first order.
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-4 py-3 text-xs bg-[#EEE9DF] border border-[#C9C1B1] focus:outline-none focus:border-[#1B2632] font-sans placeholder:text-[#2C3B4D]/60 text-[#1B2632]"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#1B2632] text-[#EEE9DF] hover:bg-[#2C3B4D] text-xs tracking-widest uppercase font-medium transition-colors"
              >
                Subscribe
              </button>
            </form>
          )}

          <p className="text-[10px] text-[#2C3B4D] font-sans mt-4">
            By joining, you agree to our Privacy Policy. You can unsubscribe at any time.
          </p>
        </div>
      </section>
    </div>
  );
};
