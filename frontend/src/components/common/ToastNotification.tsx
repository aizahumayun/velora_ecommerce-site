import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { hideToast } from '../../store/slices/uiSlice';

export const ToastNotification: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isOpen, message, submessage } = useAppSelector((state) => state.ui.toast);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        dispatch(hideToast());
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-[110] transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 max-w-[calc(100vw-2rem)]">
      <div className="bg-[#1B2632] text-[#EEE9DF] px-4 py-3 shadow-2xl flex items-center gap-3 max-w-md border-l-4 border-[#FFB162]">
        <svg className="w-5 h-5 text-[#FFB162] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
        <div className="flex flex-col min-w-0">
          <span className="font-mono text-xs uppercase tracking-wider text-[#EEE9DF] font-semibold truncate">
            {message}
          </span>
          {submessage && (
            <span className="font-sans text-[11px] text-[#C9C1B1] truncate">
              {submessage}
            </span>
          )}
        </div>
        <button
          onClick={() => dispatch(hideToast())}
          className="ml-auto text-[#C9C1B1] hover:text-[#EEE9DF] p-1 transition-colors shrink-0"
          aria-label="Dismiss notification"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
