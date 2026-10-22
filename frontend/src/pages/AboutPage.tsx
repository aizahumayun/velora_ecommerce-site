import React from 'react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#EEE9DF] text-[#1B2632] pb-24">
      {/* Editorial Hero */}
      <section className="relative h-[70vh] min-h-[500px] bg-[#1B2632] flex items-center justify-center overflow-hidden text-center">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1800&q=80"
          alt="VELORA Atelier"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40 brightness-90"
        />
        <div className="relative z-10 max-w-3xl px-6 text-[#EEE9DF] space-y-4">
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#FFB162]">
            About VELORA
          </span>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl leading-[1.15]">
            The Discipline of Restraint
          </h1>
          <p className="text-xs sm:text-sm text-[#C9C1B1] font-sans max-w-xl mx-auto leading-relaxed">
            Founded on the conviction that true luxury is not excessive ornament, but the quiet perfection of cut, fiber, and form.
          </p>
        </div>
      </section>

      {/* Main Philosophy Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20 space-y-16">
        <div className="text-center space-y-4">
          <p className="font-editorial text-2xl sm:text-3xl text-[#1B2632] leading-relaxed italic">
            &ldquo;We do not design for passing seasons. We build garments that accompany you through decades of purposeful living.&rdquo;
          </p>
          <div className="w-12 h-px bg-[#C9C1B1] mx-auto" />
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-xs sm:text-sm text-[#2C3B4D] font-sans leading-relaxed">
          <div className="space-y-4">
            <h2 className="font-editorial text-xl text-[#1B2632]">Our Philosophy &amp; Brand Story</h2>
            <p>
              VELORA began as a reaction to the relentless acceleration of fashion. Rather than cycling through fleeting trends, we focus on an enduring wardrobe: deliberate pieces that carry an unspoken confidence and effortless elegance.
            </p>
            <p>
              Every pattern is developed with architectural discipline, creating clothing that feels at once structured and weightless on the body.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-editorial text-xl text-[#1B2632]">Design Approach</h2>
            <p>
              Our design process starts with proportion and silhouette. We examine shoulder balance, lapel roll, sleeve length, and hem drop to achieve clean, uncluttered geometry.
            </p>
            <p>
              By minimizing synthetic blends and unnecessary external embellishments, each piece allows natural drape and pure movement to take center stage.
            </p>
          </div>
        </div>

        {/* Fashion / Editorial Imagery Spread */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="aspect-[3/4] bg-[#C9C1B1]/30 overflow-hidden group border border-[#C9C1B1]">
            <img
              src="https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=700&q=80"
              alt="Atelier Tailoring"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="aspect-[3/4] bg-[#C9C1B1]/30 overflow-hidden group border border-[#C9C1B1]">
            <img
              src="https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=700&q=80"
              alt="Fabric Selection"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="aspect-[3/4] bg-[#C9C1B1]/30 overflow-hidden group border border-[#C9C1B1]">
            <img
              src="https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=700&q=80"
              alt="Cashmere Knitwear"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Materials and Craftsmanship Section */}
        <div className="space-y-6 pt-6 border-t border-[#C9C1B1]">
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#2C3B4D]">
            Noble Materials
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl text-[#1B2632]">
            Materials &amp; Conscious Craftsmanship
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs sm:text-sm text-[#2C3B4D] font-sans leading-relaxed">
            <p>
              We partner exclusively with multi-generational family mills in Biella, Italy and Inner Mongolia. Our virgin wools are certified mulesing-free, and our silk crepe de chine is woven on heritage looms to achieve an unmatched dry-touch hand.
            </p>
            <p>
              Production is deliberately capped in limited capsules to ensure zero excess inventory, fair artisanal labor conditions, and meticulous seam-by-seam inspection.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="pt-10 text-center space-y-4">
          <h3 className="font-editorial text-2xl text-[#1B2632]">
            Experience The Permanent Wardrobe
          </h3>
          <p className="text-xs text-[#2C3B4D] font-sans max-w-md mx-auto">
            Discover modern pieces designed with precision and intention.
          </p>
          <div className="pt-2">
            <Link
              to="/shop"
              className="inline-block px-8 py-3.5 bg-[#1B2632] text-[#EEE9DF] hover:bg-[#2C3B4D] text-xs tracking-widest uppercase transition-colors"
            >
              Explore Collection
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
