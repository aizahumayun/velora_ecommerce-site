import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { closeSizeGuide } from '../../store/slices/uiSlice';

export const SizeGuideModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.sizeGuideModalOpen);
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');

  if (!isOpen) return null;

  const sizeDataInches = [
    { size: 'XS', bust: '32–33"', waist: '24–25"', hip: '34–35"', us: '0–2' },
    { size: 'S', bust: '34–35"', waist: '26–27"', hip: '36–37"', us: '4–6' },
    { size: 'M', bust: '36–37"', waist: '28–29"', hip: '38–39"', us: '8–10' },
    { size: 'L', bust: '38–40"', waist: '30–32"', hip: '40–42"', us: '12–14' },
    { size: 'XL', bust: '41–43"', waist: '33–35"', hip: '43–45"', us: '16' },
  ];

  const sizeDataCm = [
    { size: 'XS', bust: '81–84 cm', waist: '61–64 cm', hip: '86–89 cm', us: '0–2' },
    { size: 'S', bust: '86–89 cm', waist: '66–69 cm', hip: '91–94 cm', us: '4–6' },
    { size: 'M', bust: '91–94 cm', waist: '71–74 cm', hip: '96–99 cm', us: '8–10' },
    { size: 'L', bust: '96–101 cm', waist: '76–81 cm', hip: '101–106 cm', us: '12–14' },
    { size: 'XL', bust: '104–109 cm', waist: '84–89 cm', hip: '109–114 cm', us: '16' },
  ];

  const currentData = unit === 'inches' ? sizeDataInches : sizeDataCm;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1B2632]/60 backdrop-blur-xs transition-opacity"
        onClick={() => dispatch(closeSizeGuide())}
      />

      {/* Modal Dialog */}
      <div className="relative bg-[#EEE9DF] border border-[#C9C1B1] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 flex flex-col gap-6 z-10 text-[#1B2632]">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#2C3B4D]">
              Fit &amp; Sizing
            </span>
            <h3 className="font-editorial text-2xl text-[#1B2632]">
              Women's Size Guide
            </h3>
            <p className="font-sans text-xs text-[#2C3B4D] max-w-md">
              Measurements reference natural body contours. When between sizes, order up for a relaxed drape.
            </p>
          </div>
          <button
            type="button"
            onClick={() => dispatch(closeSizeGuide())}
            className="w-9 h-9 bg-[#C9C1B1]/30 hover:bg-[#C9C1B1]/60 text-[#1B2632] flex items-center justify-center transition-colors p-1"
            aria-label="Close size guide"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Unit Switcher Tabs */}
        <div className="flex items-center justify-between border-b border-[#C9C1B1] pb-3">
          <div className="flex items-center gap-1 bg-[#C9C1B1]/30 p-1">
            <button
              type="button"
              onClick={() => setUnit('inches')}
              className={`px-3.5 py-1 font-mono text-xs uppercase tracking-wider transition-all ${
                unit === 'inches'
                  ? 'bg-[#1B2632] text-[#EEE9DF] font-bold shadow-xs'
                  : 'text-[#2C3B4D] hover:text-[#1B2632]'
              }`}
            >
              Inches
            </button>
            <button
              type="button"
              onClick={() => setUnit('cm')}
              className={`px-3.5 py-1 font-mono text-xs uppercase tracking-wider transition-all ${
                unit === 'cm'
                  ? 'bg-[#1B2632] text-[#EEE9DF] font-bold shadow-xs'
                  : 'text-[#2C3B4D] hover:text-[#1B2632]'
              }`}
            >
              Centimeters
            </button>
          </div>
          <span className="font-sans text-xs text-[#2C3B4D] italic hidden sm:inline">
            Model is 5'10" / 178cm wearing Size S
          </span>
        </div>

        {/* Measurements Table */}
        <div className="overflow-x-auto border border-[#C9C1B1]/50">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#C9C1B1]/30 text-[#1B2632] font-mono text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-4 font-semibold">Size</th>
                <th className="py-2.5 px-4 font-semibold">Bust</th>
                <th className="py-2.5 px-4 font-semibold">Waist</th>
                <th className="py-2.5 px-4 font-semibold">Hip</th>
                <th className="py-2.5 px-4 font-semibold hidden sm:table-cell">Standard US</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9C1B1]/30 text-[#1B2632] font-sans">
              {currentData.map((row, idx) => (
                <tr
                  key={row.size}
                  className={`${
                    idx % 2 === 0 ? 'bg-[#EEE9DF]' : 'bg-[#C9C1B1]/10'
                  } hover:bg-[#C9C1B1]/20 transition-colors`}
                >
                  <td className="py-2.5 px-4 font-mono font-bold text-[#1B2632]">{row.size}</td>
                  <td className="py-2.5 px-4">{row.bust}</td>
                  <td className="py-2.5 px-4">{row.waist}</td>
                  <td className="py-2.5 px-4">{row.hip}</td>
                  <td className="py-2.5 px-4 hidden sm:table-cell text-[#2C3B4D]">
                    {row.us}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* "How to Measure" Instructions */}
        <div className="bg-[#C9C1B1]/20 p-4 border border-[#C9C1B1] text-xs font-sans space-y-2">
          <p className="font-mono text-[11px] uppercase tracking-wider text-[#1B2632] font-semibold">
            How to Measure
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[#2C3B4D]">
            <div>
              <strong className="text-[#1B2632]">1. Bust:</strong> Measure around the fullest part of your chest, keeping tape horizontal.
            </div>
            <div>
              <strong className="text-[#1B2632]">2. Waist:</strong> Measure around the narrowest part of your natural waistline.
            </div>
            <div>
              <strong className="text-[#1B2632]">3. Hips:</strong> Stand with feet together and measure around the fullest point of hips.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
