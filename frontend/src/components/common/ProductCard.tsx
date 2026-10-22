import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '@velora/shared';
import { useAppDispatch } from '../../store';
import { addToCart, openCartDrawer } from '../../store/slices/cartSlice';
import { showToast } from '../../store/slices/uiSlice';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const dispatch = useAppDispatch();
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  const primaryImage = product.images[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800';
  const hoverImage = product.images[1] || primaryImage;
  const activeColor = product.colors[selectedColorIndex] || { name: 'Default', hex: '#C9C1B1' };

  const handleQuickAddSize = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();

    dispatch(
      addToCart({
        productId: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        image: primaryImage,
        color: activeColor.name,
        size: size,
        quantity: 1,
      })
    );

    dispatch(
      showToast({
        message: 'Item Added to Bag',
        submessage: `${product.name} (${activeColor.name} &bull; Size ${size})`,
      })
    );

    dispatch(openCartDrawer());
  };

  return (
    <article className={`group flex flex-col bg-transparent ${className}`}>
      {/* Visual Image Container with 3:4 Aspect Ratio */}
      <div className="relative w-full aspect-[3/4] bg-[#C9C1B1]/20 overflow-hidden border border-[#C9C1B1]/40">
        {/* Badges */}
        {product.newArrival && (
          <span className="absolute top-2.5 left-2.5 z-10 bg-[#FFB162] text-[#1B2632] font-mono text-[10px] font-bold px-2 py-0.5 tracking-widest uppercase shadow-xs">
            NEW
          </span>
        )}
        {!product.newArrival && product.lowStock && (
          <span className="absolute top-2.5 left-2.5 z-10 bg-[#A35139] text-[#EEE9DF] font-mono text-[10px] px-2 py-0.5 tracking-widest uppercase shadow-xs">
            LOW STOCK
          </span>
        )}

        {/* Image link to detail */}
        <Link to={`/product/${product.id}`} className="block w-full h-full relative">
          <img
            src={primaryImage}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-500 ease-out group-hover:opacity-0"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLElement).setAttribute(
                'src',
                'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80'
              );
            }}
          />
          <img
            src={hoverImage}
            alt={`${product.name} alternate view`}
            className="absolute inset-0 w-full h-full object-cover object-top opacity-0 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Desktop Quick Add Size Flyout Overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-[#EEE9DF]/95 backdrop-blur-md p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out flex flex-col gap-1.5 z-20 border-t border-[#C9C1B1]">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-[#2C3B4D]">
            <span>Quick Add Size</span>
            <span className="font-semibold text-[#A35139]">
              {activeColor.name}
            </span>
          </div>
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={(e) => handleQuickAddSize(e, size)}
                className="min-w-7 h-7 px-1 text-[11px] font-mono bg-[#EEE9DF] border border-[#C9C1B1] hover:bg-[#1B2632] hover:text-[#EEE9DF] hover:border-[#1B2632] transition-colors flex items-center justify-center text-[#1B2632]"
                title={`Add size ${size}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Metadata & Swatches */}
      <div className="pt-2.5 flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#2C3B4D]">
          {product.category}
        </span>
        <div className="flex items-baseline justify-between gap-2">
          <Link
            to={`/product/${product.id}`}
            className="font-editorial text-sm sm:text-base text-[#1B2632] font-medium hover:text-[#A35139] transition-colors truncate"
          >
            {product.name}
          </Link>
          <span className="font-sans text-sm text-[#1B2632] font-semibold flex-shrink-0">
            ${product.price}
          </span>
        </div>

        {/* Color Swatch Dots */}
        <div className="flex items-center gap-1.5 pt-0.5">
          {product.colors.map((color, idx) => (
            <button
              key={color.name}
              onClick={() => setSelectedColorIndex(idx)}
              className={`w-3 h-3 rounded-full transition-all ${
                selectedColorIndex === idx
                  ? 'ring-1 ring-[#1B2632] ring-offset-2 scale-110'
                  : 'hover:scale-105'
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
              aria-label={`Select color ${color.name}`}
            />
          ))}
          {product.colors.length > 1 && (
            <span className="font-mono text-[10px] text-[#2C3B4D]/70 ml-1">
              {product.colors.length} shades
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
