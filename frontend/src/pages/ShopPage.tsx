import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/common/ProductCard';
import { productService } from '../services/productService';
import type { Product, ProductFilterParams } from '@velora/shared';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters State from URL or local
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || searchParams.get('q') || '';
  const sortParam = (searchParams.get('sort') as ProductFilterParams['sortBy']) || 'featured';

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [searchQuery, setSearchQuery] = useState<string>(searchParam);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<ProductFilterParams['sortBy']>(sortParam);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const [columnLayout, setColumnLayout] = useState<3 | 4>(3);

  // Synchronize with URL searchParams
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory('');
    }
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [categoryParam, searchParam]);

  const allCategories = ['All', 'New Arrivals', 'Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Knitwear', 'Accessories'];
  const allSizes = ['XS', 'S', 'M', 'L', 'XL'];
  const allColors = [
    { name: 'Onyx Black', hex: '#1B2632' },
    { name: 'Warm Taupe', hex: '#2C3B4D' },
    { name: 'Oatmeal', hex: '#C9C1B1' },
    { name: 'Palladian White', hex: '#EEE9DF' },
    { name: 'Truffle Brown', hex: '#A35139' },
    { name: 'Burning Flame', hex: '#FFB162' },
  ];

  // Filter parameters
  const filters: ProductFilterParams = useMemo(() => {
    let minPrice: number | undefined;
    let maxPrice: number | undefined;

    if (priceRange === 'under-150') {
      maxPrice = 149;
    } else if (priceRange === '150-250') {
      minPrice = 150;
      maxPrice = 250;
    } else if (priceRange === '250-400') {
      minPrice = 251;
      maxPrice = 400;
    } else if (priceRange === 'above-400') {
      minPrice = 401;
    }

    return {
      category: selectedCategory === 'All' || !selectedCategory ? undefined : selectedCategory,
      search: searchQuery || undefined,
      sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
      colors: selectedColors.length > 0 ? selectedColors : undefined,
      minPrice,
      maxPrice,
      inStockOnly,
      sortBy,
    };
  }, [selectedCategory, searchQuery, selectedSizes, selectedColors, priceRange, inStockOnly, sortBy]);

  const [apiProducts, setApiProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    let isCancelled = false;
    productService
      .getProducts(filters)
      .then((items) => {
        if (!isCancelled && Array.isArray(items)) {
          setApiProducts(items);
        }
      })
      .catch(() => {
        // Fallback to sync mock products handled internally
      });

    return () => {
      isCancelled = true;
    };
  }, [filters]);

  const filteredProducts = useMemo(() => {
    if (apiProducts) return apiProducts;
    return productService.getProductsSync(filters);
  }, [apiProducts, filters]);

  const handleCategoryClick = (cat: string) => {
    const val = cat === 'All' ? '' : cat;
    setSelectedCategory(val);
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set('category', val);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange('all');
    setInStockOnly(false);
    setSortBy('featured');
    setSearchParams({});
  };

  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    (searchQuery ? 1 : 0) +
    selectedSizes.length +
    selectedColors.length +
    (priceRange !== 'all' ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#EEE9DF] text-[#1B2632] pb-20">
      {/* Page Header */}
      <div className="border-b border-[#C9C1B1] bg-[#EEE9DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-mono tracking-widest text-[#2C3B4D] uppercase">
                {selectedCategory ? `The Edit / ${selectedCategory}` : 'Collection 2024'}
              </p>
              <h1 className="font-editorial text-3xl sm:text-4xl text-[#1B2632] mt-1">
                {selectedCategory ? selectedCategory : 'All Wardrobe Essentials'}
              </h1>
              <p className="text-xs text-[#2C3B4D] font-sans mt-2 max-w-xl">
                Disciplined silhouettes and natural fibers, created for lasting wear and effortless day-to-evening transitions.
              </p>
            </div>

            {/* Quick Search Bar */}
            <div className="w-full md:w-72">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search silhouettes, fabrics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#EEE9DF] border border-[#C9C1B1] focus:outline-none focus:border-[#1B2632] font-sans placeholder:text-[#2C3B4D]/60 text-[#1B2632]"
                />
                <svg
                  className="w-4 h-4 text-[#2C3B4D] absolute left-3 top-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-xs text-[#2C3B4D] hover:text-[#1B2632]"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Category Tabs Pill Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pt-6 scrollbar-none pb-1">
            {allCategories.map((cat) => {
              const isActive = (!selectedCategory && cat === 'All') || selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-4 py-1.5 text-xs tracking-wider uppercase whitespace-nowrap transition-colors rounded-none border border-[#C9C1B1]/40 ${
                    isActive
                      ? 'bg-[#1B2632] text-[#EEE9DF] font-medium border-[#1B2632]'
                      : 'bg-[#C9C1B1]/30 text-[#2C3B4D] hover:bg-[#C9C1B1]/60 hover:text-[#1B2632]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-8">
        {/* Sub-bar: Filter Toggle / Results Count / Sort */}
        <div className="flex flex-wrap items-center justify-between pb-6 border-b border-[#C9C1B1] gap-4">
          <div className="flex items-center gap-4">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3.5 py-2 border border-[#C9C1B1] text-xs tracking-wider uppercase text-[#1B2632] hover:bg-[#C9C1B1]/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filter ({activeFilterCount})</span>
            </button>

            <span className="text-xs font-sans text-[#2C3B4D]">
              Showing <strong className="font-semibold text-[#1B2632]">{filteredProducts.length}</strong> styles
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Column Layout Selector for Desktop */}
            <div className="hidden lg:flex items-center gap-1 border border-[#C9C1B1] p-0.5 bg-[#C9C1B1]/30">
              <button
                type="button"
                onClick={() => setColumnLayout(3)}
                className={`p-1.5 transition-colors ${columnLayout === 3 ? 'bg-[#EEE9DF] shadow-xs text-[#1B2632]' : 'text-[#2C3B4D] hover:text-[#1B2632]'}`}
                title="3 Columns"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h2A1.5 1.5 0 0 1 6 2.5v11A1.5 1.5 0 0 1 4.5 15h-2A1.5 1.5 0 0 1 1 13.5v-11zM6 2.5A1.5 1.5 0 0 1 7.5 1h1A1.5 1.5 0 0 1 10 2.5v11A1.5 1.5 0 0 1 8.5 15h-1A1.5 1.5 0 0 1 6 13.5v-11zM10 2.5A1.5 1.5 0 0 1 11.5 1h2A1.5 1.5 0 0 1 15 2.5v11a1.5 1.5 0 0 1-1.5 1.5h-2a1.5 1.5 0 0 1-1.5-1.5v-11z"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setColumnLayout(4)}
                className={`p-1.5 transition-colors ${columnLayout === 4 ? 'bg-[#EEE9DF] shadow-xs text-[#1B2632]' : 'text-[#2C3B4D] hover:text-[#1B2632]'}`}
                title="4 Columns"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h1A1.5 1.5 0 0 1 5 2.5v11A1.5 1.5 0 0 1 3.5 15h-1A1.5 1.5 0 0 1 1 13.5v-11zM5 2.5A1.5 1.5 0 0 1 6.5 1h1A1.5 1.5 0 0 1 9 2.5v11A1.5 1.5 0 0 1 7.5 15h-1A1.5 1.5 0 0 1 5 13.5v-11zM9 2.5A1.5 1.5 0 0 1 10.5 1h1a1.5 1.5 0 0 1 1.5 2.5v11a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5v-11zM13 2.5A1.5 1.5 0 0 1 14.5 1h.5a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-.5a1.5 1.5 0 0 1-1.5-1.5v-11z"/>
                </svg>
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="sortSelect" className="text-xs text-[#2C3B4D] uppercase font-mono tracking-wider">
                Sort:
              </label>
              <select
                id="sortSelect"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as ProductFilterParams['sortBy'])}
                className="px-3 py-1.5 text-xs bg-[#EEE9DF] border border-[#C9C1B1] focus:outline-none focus:border-[#1B2632] font-sans text-[#1B2632]"
              >
                <option value="featured">Curated &amp; Featured</option>
                <option value="newest">New Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 py-4 border-b border-[#C9C1B1]">
            <span className="text-xs text-[#2C3B4D] font-sans">Active Filters:</span>
            {selectedCategory && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#C9C1B1]/40 text-[#1B2632] text-xs border border-[#C9C1B1]">
                Category: {selectedCategory}
                <button onClick={() => handleCategoryClick('All')} className="text-[#2C3B4D] hover:text-[#1B2632]">×</button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#C9C1B1]/40 text-[#1B2632] text-xs border border-[#C9C1B1]">
                Keyword: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="text-[#2C3B4D] hover:text-[#1B2632]">×</button>
              </span>
            )}
            {selectedSizes.map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#C9C1B1]/40 text-[#1B2632] text-xs border border-[#C9C1B1]">
                Size {s}
                <button onClick={() => toggleSize(s)} className="text-[#2C3B4D] hover:text-[#1B2632]">×</button>
              </span>
            ))}
            {selectedColors.map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#C9C1B1]/40 text-[#1B2632] text-xs border border-[#C9C1B1]">
                Color: {c}
                <button onClick={() => toggleColor(c)} className="text-[#2C3B4D] hover:text-[#1B2632]">×</button>
              </span>
            ))}
            {priceRange !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#C9C1B1]/40 text-[#1B2632] text-xs border border-[#C9C1B1]">
                Price: {priceRange}
                <button onClick={() => setPriceRange('all')} className="text-[#2C3B4D] hover:text-[#1B2632]">×</button>
              </span>
            )}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#C9C1B1]/40 text-[#1B2632] text-xs border border-[#C9C1B1]">
                In Stock Only
                <button onClick={() => setInStockOnly(false)} className="text-[#2C3B4D] hover:text-[#1B2632]">×</button>
              </span>
            )}

            <button
              onClick={clearAllFilters}
              className="text-xs text-[#A35139] hover:underline font-mono uppercase tracking-wider ml-2"
            >
              Reset all
            </button>
          </div>
        )}

        {/* Content Layout: Sidebar + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 space-y-8 pr-6 border-r border-[#C9C1B1]">
            {/* Sizes */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[#1B2632] mb-3">
                Size Selection
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {allSizes.map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`h-9 flex items-center justify-center text-xs font-mono transition-colors border ${
                        isSelected
                          ? 'bg-[#1B2632] text-[#EEE9DF] border-[#1B2632] font-semibold'
                          : 'bg-[#EEE9DF] text-[#1B2632] border-[#C9C1B1] hover:border-[#1B2632]'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colors */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[#1B2632] mb-3">
                Color Palette
              </h3>
              <div className="space-y-2">
                {allColors.map((col) => {
                  const isSelected = selectedColors.includes(col.name);
                  return (
                    <button
                      key={col.name}
                      type="button"
                      onClick={() => toggleColor(col.name)}
                      className="w-full flex items-center justify-between text-xs py-1 text-[#2C3B4D] hover:text-[#1B2632] group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-4 h-4 rounded-full border border-[#C9C1B1] shadow-2xs"
                          style={{ backgroundColor: col.hex }}
                        />
                        <span className={isSelected ? 'font-semibold text-[#1B2632]' : ''}>
                          {col.name}
                        </span>
                      </div>
                      {isSelected && (
                        <svg className="w-3.5 h-3.5 text-[#1B2632]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[#1B2632] mb-3">
                Price Point
              </h3>
              <div className="space-y-2 text-xs text-[#2C3B4D]">
                {[
                  { id: 'all', label: 'All Prices' },
                  { id: 'under-150', label: 'Under $150' },
                  { id: '150-250', label: '$150 – $250' },
                  { id: '250-400', label: '$250 – $400' },
                  { id: 'above-400', label: '$400 & Above' },
                ].map((p) => (
                  <label key={p.id} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="priceRange"
                      checked={priceRange === p.id}
                      onChange={() => setPriceRange(p.id)}
                      className="accent-[#1B2632]"
                    />
                    <span>{p.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* In stock toggle */}
            <div className="pt-2 border-t border-[#C9C1B1]">
              <label className="flex items-center gap-2.5 text-xs text-[#1B2632] cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="accent-[#1B2632]"
                />
                <span>Ready to Ship (In Stock)</span>
              </label>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center space-y-4 bg-[#EEE9DF] border border-[#C9C1B1] p-8">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#C9C1B1]/30 flex items-center justify-center text-[#2C3B4D]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="font-editorial text-xl text-[#1B2632]">No Silhouettes Found</h3>
                <p className="text-xs text-[#2C3B4D] max-w-sm mx-auto font-sans leading-relaxed">
                  We could not find any garments matching your current filter selection. Try clearing specific filters or browse our full collection.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 bg-[#1B2632] text-[#EEE9DF] hover:bg-[#2C3B4D] text-xs tracking-widest uppercase transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div
                className={`grid grid-cols-2 ${
                  columnLayout === 3 ? 'md:grid-cols-3' : 'md:grid-cols-3 xl:grid-cols-4'
                } gap-x-4 gap-y-10 sm:gap-x-6`}
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Slide-Over Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div
            className="absolute inset-0 bg-[#1B2632]/60 backdrop-blur-xs"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-xs bg-[#EEE9DF] p-6 flex flex-col justify-between shadow-2xl border-l border-[#C9C1B1]">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#C9C1B1] mb-6">
                  <h3 className="font-editorial text-lg tracking-wide text-[#1B2632]">Filter Pieces</h3>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-1 text-[#2C3B4D] hover:text-[#1B2632]"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-2">
                  {/* Category */}
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#1B2632] mb-2">Category</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {allCategories.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleCategoryClick(c)}
                          className={`px-3 py-1 text-xs border ${
                            (!selectedCategory && c === 'All') || selectedCategory === c
                              ? 'bg-[#1B2632] text-[#EEE9DF] border-[#1B2632]'
                              : 'bg-[#C9C1B1]/30 text-[#1B2632] border-[#C9C1B1]'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sizes */}
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#1B2632] mb-2">Sizes</h4>
                    <div className="grid grid-cols-5 gap-1.5">
                      {allSizes.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSize(s)}
                          className={`py-2 text-xs font-mono border ${
                            selectedSizes.includes(s)
                              ? 'bg-[#1B2632] text-[#EEE9DF] border-[#1B2632]'
                              : 'bg-[#EEE9DF] text-[#1B2632] border-[#C9C1B1]'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#1B2632] mb-2">Colors</h4>
                    <div className="space-y-1.5">
                      {allColors.map((col) => (
                        <button
                          key={col.name}
                          type="button"
                          onClick={() => toggleColor(col.name)}
                          className="flex items-center gap-2 text-xs py-1 text-[#2C3B4D] w-full"
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-[#C9C1B1]"
                            style={{ backgroundColor: col.hex }}
                          />
                          <span className={selectedColors.includes(col.name) ? 'font-bold text-[#1B2632]' : ''}>
                            {col.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#C9C1B1] space-y-2">
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3 bg-[#1B2632] text-[#EEE9DF] text-xs tracking-widest uppercase font-medium hover:bg-[#2C3B4D] transition-colors"
                >
                  View {filteredProducts.length} Results
                </button>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="w-full py-2 text-xs text-[#2C3B4D] uppercase tracking-wider hover:text-[#1B2632]"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
