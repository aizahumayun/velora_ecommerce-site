import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { closeQuickAdd, openSizeGuide, showToast } from '../../store/slices/uiSlice';
import { addToCart, openCartDrawer } from '../../store/slices/cartSlice';

export const QuickAddModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isOpen, product, initialColor, initialSize } = useAppSelector(
    (state) => state.ui.quickAddModal
  );

  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [hasError, setHasError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedColor(initialColor || product.colors[0]?.name || '');
      setSelectedSize(initialSize || '');
      setHasError(false);
      setIsSubmitting(false);
    }
  }, [product, initialColor, initialSize]);

  if (!isOpen || !product) return null;

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setHasError(false);
  };

  const handleAdd = () => {
    if (!selectedSize) {
      setHasError(true);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      dispatch(
        addToCart({
          productId: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          image: product.images[0],
          color: selectedColor,
          size: selectedSize,
          quantity: 1,
        })
      );

      dispatch(
        showToast({
          message: 'Item Added to Bag',
          submessage: `${product.name} (${selectedColor} / Size ${selectedSize})`,
        })
      );

      dispatch(closeQuickAdd());
      dispatch(openCartDrawer());
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1B2632]/60 backdrop-blur-xs transition-opacity"
        onClick={() => dispatch(closeQuickAdd())}
      />

      {/* Modal Dialog Content */}
      <div className="relative w-full max-w-md bg-[#EEE9DF] border border-[#C9C1B1] p-6 sm:p-8 shadow-2xl flex flex-col gap-4 z-10 animate-in fade-in zoom-in-95 duration-200 text-[#1B2632]">
        {/* Close Button */}
        <button
          onClick={() => dispatch(closeQuickAdd())}
          className="absolute top-4 right-4 text-[#2C3B4D] hover:text-[#1B2632] transition-colors p-1"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Product Snapshot */}
        <div className="flex gap-4 items-start">
          <div className="w-20 aspect-[3/4] bg-[#C9C1B1]/30 overflow-hidden flex-shrink-0 border border-[#C9C1B1]">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                (e.target as HTMLElement).setAttribute(
                  'src',
                  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80'
                );
              }}
            />
          </div>
          <div className="flex flex-col flex-1 min-w-0 pr-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#2C3B4D]">
              {product.collection || product.category}
            </span>
            <h3 className="font-editorial text-lg text-[#1B2632] truncate mt-0.5 font-medium">
              {product.name}
            </h3>
            <p className="font-sans text-sm text-[#1B2632] font-semibold mt-1">
              ${product.price} USD
            </p>
          </div>
        </div>

        {/* Color Palette Selector */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[#C9C1B1]">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#2C3B4D]">
            Color: <strong className="text-[#1B2632] font-semibold">{selectedColor}</strong>
          </span>
          <div className="flex items-center gap-2">
            {product.colors.map((color) => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color.name)}
                className={`w-7 h-7 rounded-full transition-transform ${
                  selectedColor === color.name
                    ? 'ring-2 ring-[#1B2632] ring-offset-2 scale-110'
                    : 'opacity-85 hover:opacity-100 hover:scale-105'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
                type="button"
              />
            ))}
          </div>
        </div>

        {/* Size Selection (Gated Requirement) */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#2C3B4D]">
              Select Size <span className="text-[#A35139] font-bold">*</span>
            </span>
            <button
              type="button"
              onClick={() => {
                dispatch(openSizeGuide());
              }}
              className="font-mono text-[10px] uppercase tracking-wider text-[#2C3B4D] underline hover:text-[#1B2632] transition-colors cursor-pointer"
            >
              Size Guide
            </button>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handleSizeSelect(size)}
                className={`h-10 font-mono text-xs uppercase transition-colors flex items-center justify-center border ${
                  selectedSize === size
                    ? 'bg-[#1B2632] text-[#EEE9DF] border-[#1B2632] font-bold'
                    : 'bg-[#EEE9DF] text-[#1B2632] border-[#C9C1B1] hover:border-[#1B2632]'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {hasError && (
            <p className="text-[#A35139] text-xs font-sans mt-1">
              Please select a garment size before adding to bag.
            </p>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleAdd}
          disabled={isSubmitting}
          className="w-full h-12 mt-2 bg-[#1B2632] text-[#EEE9DF] hover:bg-[#2C3B4D] font-mono text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 font-medium shadow-xs disabled:opacity-50"
          type="button"
        >
          <span>{isSubmitting ? 'Adding...' : 'Add to Bag'}</span>
        </button>

        <span className="font-mono text-[10px] text-center uppercase tracking-widest text-[#2C3B4D]">
          Complimentary delivery on orders over $250 &bull; 30-Day Returns
        </span>
      </div>
    </div>
  );
};
