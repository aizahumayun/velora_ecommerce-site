import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import type { Product, ProductColor } from '@velora/shared';
import { useAppDispatch, useAppSelector } from '../store';
import { addToCart, openCartDrawer } from '../store/slices/cartSlice';
import { openSizeGuide, showToast } from '../store/slices/uiSlice';
import { ProductCard } from '../components/common/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [sizeError, setSizeError] = useState<boolean>(false);
  const [openAccordion, setOpenAccordion] = useState<string>('fit');
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (!id) return;

    let isMounted = true;
    const initialSyncProduct = productService.getProductByIdSync(id);
    if (initialSyncProduct) {
      setProduct(initialSyncProduct);
      setSelectedImageIndex(0);
      setSelectedColor(initialSyncProduct.colors[0] || null);
      setSelectedSize('');
      setSizeError(false);
      setQuantity(1);
      setLoading(false);
    } else {
      setLoading(true);
    }

    productService
      .getProductById(id)
      .then((p) => {
        if (!isMounted) return;
        if (p) {
          setProduct(p);
          if (!initialSyncProduct) {
            setSelectedImageIndex(0);
            setSelectedColor(p.colors[0] || null);
            setSelectedSize('');
            setSizeError(false);
            setQuantity(1);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#EEE9DF]">
        <div className="w-8 h-8 border-2 border-[#C9C1B1] border-t-[#1B2632] rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 bg-[#EEE9DF]">
        <h2 className="font-editorial text-2xl text-[#1B2632] mb-2">Garment Not Found</h2>
        <p className="text-xs text-[#2C3B4D] font-sans mb-6">
          The piece you are looking for is no longer in our current catalogue or has moved.
        </p>
        <Link
          to="/shop"
          className="px-6 py-3 bg-[#1B2632] text-[#EEE9DF] text-xs tracking-widest uppercase hover:bg-[#2C3B4D] transition-colors"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      dispatch(showToast({ message: 'Please select a size to proceed', submessage: 'XS to XL available' }));
      return;
    }

    setSizeError(false);
    dispatch(
      addToCart({
        product,
        size: selectedSize,
        color: selectedColor ? selectedColor.name : product.colors[0]?.name || 'Standard',
        quantity,
      })
    );
    dispatch(
      showToast({
        message: `Added ${product.name} to your bag`,
        submessage: `Size ${selectedSize} • ${selectedColor?.name}`,
      })
    );
    dispatch(openCartDrawer());
  };

  const relatedProducts = productService.getRelatedProductsSync(product.id, 4);

  return (
    <div className="min-h-screen bg-[#EEE9DF] text-[#1B2632] pb-24">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-5 text-xs text-[#2C3B4D] font-sans">
        <ol className="flex items-center space-x-2">
          <li>
            <Link to="/" className="hover:text-[#1B2632]">Home</Link>
          </li>
          <li>/</li>
          <li>
            <Link to="/shop" className="hover:text-[#1B2632]">Shop</Link>
          </li>
          <li>/</li>
          <li>
            <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-[#1B2632]">
              {product.category}
            </Link>
          </li>
          <li>/</li>
          <li className="text-[#1B2632] font-medium truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </li>
        </ol>
      </div>

      {/* Main PDP Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          {/* Left: Product Images Gallery */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails strip */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[620px] scrollbar-none shrink-0">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-18 h-24 md:w-20 md:h-28 shrink-0 bg-[#C9C1B1]/30 overflow-hidden border-2 transition-all ${
                    selectedImageIndex === idx ? 'border-[#1B2632]' : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover object-top" />
                </button>
              ))}
            </div>

            {/* Main Stage Image */}
            <div className="flex-1 relative bg-[#C9C1B1]/30 aspect-[3/4] overflow-hidden group border border-[#C9C1B1]">
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.name}
                className={`w-full h-full object-cover object-top transition-transform duration-500 ${
                  isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                {product.newArrival && (
                  <span className="px-2.5 py-1 bg-[#FFB162] text-[#1B2632] text-[10px] font-mono tracking-widest uppercase font-bold shadow-xs">
                    New Season
                  </span>
                )}
                {product.stock <= 4 && (
                  <span className="px-2.5 py-1 bg-[#A35139] text-[#EEE9DF] text-[10px] font-mono tracking-widest uppercase font-bold shadow-xs">
                    Only {product.stock} Left
                  </span>
                )}
              </div>

              {/* Zoom hint */}
              <div className="absolute bottom-4 right-4 bg-[#1B2632]/80 text-[#EEE9DF] px-3 py-1 text-[10px] font-mono tracking-widest uppercase backdrop-blur-xs hidden sm:block pointer-events-none">
                {isZoomed ? 'Click to reset' : 'Click to inspect drape'}
              </div>
            </div>
          </div>

          {/* Right: Product Purchase Form */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
            <div>
              {/* Category & Collection */}
              <div className="flex items-center justify-between text-xs font-mono tracking-widest uppercase text-[#2C3B4D] mb-2">
                <span>{product.collection || 'Contemporary Edit'}</span>
                <span>{product.category}</span>
              </div>

              {/* Title & Price */}
              <h1 className="font-editorial text-3xl sm:text-4xl text-[#1B2632] leading-tight">
                {product.name}
              </h1>

              <div className="mt-3 flex items-baseline gap-4">
                <span className="text-2xl font-sans font-medium text-[#1B2632]">
                  ${product.price}
                </span>
                <span className="text-xs text-[#2C3B4D] font-sans">
                  Includes import duties &amp; VAT
                </span>
              </div>

              {/* Rating */}
              <div className="mt-3 flex items-center gap-2 text-xs text-[#2C3B4D] font-sans">
                <div className="flex text-[#FFB162]">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <span>5.0 (38 client reviews)</span>
              </div>

              {/* Description */}
              <p className="mt-6 text-xs sm:text-sm text-[#2C3B4D] font-sans leading-relaxed">
                {product.description}
              </p>

              <div className="border-t border-[#C9C1B1] my-6" />

              {/* Color Selection */}
              <div>
                <div className="flex justify-between items-center text-xs mb-3 font-sans">
                  <span className="text-[#2C3B4D]">
                    Color: <strong className="text-[#1B2632] font-semibold">{selectedColor?.name || 'Selected'}</strong>
                  </span>
                  <span className="text-[11px] text-[#2C3B4D] font-mono">
                    {product.colors.length} shades available
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {product.colors.map((c) => {
                    const isSelected = selectedColor?.name === c.name;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        title={c.name}
                        className={`w-7 h-7 rounded-full transition-all flex items-center justify-center border border-[#C9C1B1] ${
                          isSelected ? 'ring-2 ring-[#1B2632] ring-offset-2 scale-110' : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      >
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1B2632]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size Selection */}
              <div className="mt-6">
                <div className="flex justify-between items-center text-xs mb-3 font-sans">
                  <span className={sizeError ? 'text-[#A35139] font-bold' : 'text-[#2C3B4D]'}>
                    Select Size: {selectedSize ? <strong className="text-[#1B2632]">{selectedSize}</strong> : <span className="text-[#2C3B4D]">Required</span>}
                  </span>
                  <button
                    type="button"
                    onClick={() => dispatch(openSizeGuide())}
                    className="flex items-center gap-1.5 text-[#2C3B4D] hover:text-[#1B2632] underline font-sans text-xs cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    Size Guide &amp; Measurements
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {product.sizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setSelectedSize(size);
                          setSizeError(false);
                        }}
                        className={`py-3 text-xs font-mono transition-all border ${
                          isSelected
                            ? 'bg-[#1B2632] text-[#EEE9DF] border-[#1B2632] font-semibold shadow-xs'
                            : 'bg-[#EEE9DF] text-[#1B2632] border-[#C9C1B1] hover:border-[#1B2632]'
                        } ${sizeError ? 'border-[#A35139]' : ''}`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>

                {sizeError && (
                  <p className="mt-2 text-xs text-[#A35139] font-sans">
                    Please select a size to add this garment to your bag.
                  </p>
                )}
                <p className="mt-2 text-[11px] text-[#2C3B4D] font-sans">
                  Tailored silhouette. Model is 5'10" (178cm) and wearing size S.
                </p>
              </div>

              {/* Quantity & CTA */}
              <div className="mt-8 flex gap-3">
                {/* Stepper */}
                <div className="flex items-center border border-[#C9C1B1] bg-[#EEE9DF]">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-12 flex items-center justify-center text-[#2C3B4D] hover:bg-[#C9C1B1]/30 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-sans font-medium text-[#1B2632]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-12 flex items-center justify-center text-[#2C3B4D] hover:bg-[#C9C1B1]/30 transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Add to Bag Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 w-full h-12 bg-[#1B2632] text-[#EEE9DF] hover:bg-[#2C3B4D] text-xs tracking-widest uppercase font-medium transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Add to Bag — ${product.price * quantity}</span>
                </button>
              </div>

              {/* Delivery Assurance & Micro-perks */}
              <div className="mt-8 p-4 bg-[#C9C1B1]/20 border border-[#C9C1B1] space-y-2.5 text-xs text-[#2C3B4D] font-sans">
                <div className="flex items-center gap-2.5 text-[#1B2632] font-medium">
                  <svg className="w-4 h-4 text-[#1B2632]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>In Stock &mdash; Dispatched within 24 hours from Milan Atelier</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-[#1B2632]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span>Complimentary express delivery on orders over $250</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-[#1B2632]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Hassle-free 30-day returns with prepaid return packaging</span>
                </div>
              </div>
            </div>

            {/* Accordions */}
            <div className="border-t border-[#C9C1B1] divide-y divide-[#C9C1B1] mt-8">
              {/* Fit & Silhouette */}
              <div>
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === 'fit' ? '' : 'fit')}
                  className="w-full py-4 flex justify-between items-center text-xs uppercase tracking-widest font-semibold text-[#1B2632] text-left cursor-pointer"
                >
                  <span>Fit &amp; Silhouette</span>
                  <span className="text-base font-mono">{openAccordion === 'fit' ? '−' : '+'}</span>
                </button>
                {openAccordion === 'fit' && (
                  <div className="pb-4 text-xs text-[#2C3B4D] font-sans space-y-2">
                    <ul className="list-disc pl-5 space-y-1">
                      {product.specifications?.fit ? (
                        product.specifications.fit.map((point, idx) => (
                          <li key={idx}>{point}</li>
                        ))
                      ) : (
                        <>
                          <li>Tailored silhouette with architectural drape.</li>
                          <li>Designed to fit true to size. Take one size up for an oversized look.</li>
                          <li>Model is 5'10" (178cm) and wears size S.</li>
                        </>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Composition & Care */}
              <div>
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === 'care' ? '' : 'care')}
                  className="w-full py-4 flex justify-between items-center text-xs uppercase tracking-widest font-semibold text-[#1B2632] text-left cursor-pointer"
                >
                  <span>Materials &amp; Care</span>
                  <span className="text-base font-mono">{openAccordion === 'care' ? '−' : '+'}</span>
                </button>
                {openAccordion === 'care' && (
                  <div className="pb-4 text-xs text-[#2C3B4D] font-sans space-y-3">
                    <p>
                      <strong className="text-[#1B2632]">Materials:</strong>{' '}
                      {product.specifications?.materials || '100% fine natural Italian fibers, certified sustainable.'}
                    </p>
                    <p>
                      <strong className="text-[#1B2632]">Care:</strong>{' '}
                      {product.specifications?.care || 'Specialist dry clean only. Cool iron on reverse.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Shipping & Returns */}
              <div>
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === 'shipping' ? '' : 'shipping')}
                  className="w-full py-4 flex justify-between items-center text-xs uppercase tracking-widest font-semibold text-[#1B2632] text-left cursor-pointer"
                >
                  <span>Shipping &amp; Returns</span>
                  <span className="text-base font-mono">{openAccordion === 'shipping' ? '−' : '+'}</span>
                </button>
                {openAccordion === 'shipping' && (
                  <div className="pb-4 text-xs text-[#2C3B4D] font-sans space-y-2">
                    <p>{product.specifications?.shipping || 'Complimentary express delivery on orders over $250.'}</p>
                    <p>{product.specifications?.returns || 'Hassle-free 30-day returns with prepaid return packaging.'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Complete The Wardrobe / Recommendations */}
        <div className="mt-28 pt-16 border-t border-[#C9C1B1]">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-[11px] font-mono tracking-widest text-[#2C3B4D] uppercase">Pairings</span>
              <h2 className="font-editorial text-2xl sm:text-3xl text-[#1B2632] mt-1">Complete The Look</h2>
            </div>
            <Link
              to="/shop"
              className="text-xs font-sans tracking-widest uppercase text-[#2C3B4D] hover:text-[#1B2632] underline underline-offset-4"
            >
              Explore Full Collection &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
