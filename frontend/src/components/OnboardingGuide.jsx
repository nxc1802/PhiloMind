import React, { useState } from 'react';

export default function OnboardingGuide({ tabKey, steps }) {
  const [isOpen, setIsOpen] = useState(() => {
    // Show automatically only on first visit to this tab
    return !localStorage.getItem(`onboarded_${tabKey}`);
  });

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(`onboarded_${tabKey}`, 'true');
  };

  const handleReset = () => {
    setIsOpen(true);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={handleReset}
        className="fixed bottom-28 right-6 z-40 bg-white dark:bg-[#002b37] border border-gray-200 dark:border-primary-800 text-slate-700 dark:text-primary-250 hover:text-primary-600 dark:hover:text-primary-300 p-3 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        title="Xem hướng dẫn sử dụng trang này"
      >
        <span className="material-symbols-outlined text-2xl">explore</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-all duration-300">
      <div className="bg-white dark:bg-[#002b37] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-primary-850 relative animate-scaleUp">
        
        {/* Header */}
        <h3 className="text-xl font-bold text-primary-800 dark:text-primary-200 flex items-center gap-2 mb-3" style={{ fontFamily: '"Libre Caslon Text", serif' }}>
          <span className="material-symbols-outlined text-2xl text-primary-600 dark:text-primary-300">explore</span>
          Hướng dẫn nhanh
        </h3>
        
        {/* Subtitle */}
        <p className="text-xs text-slate-400 dark:text-primary-400 mb-4">
          Hãy khám phá cách sử dụng tab này để tối ưu hóa hiệu quả học tập.
        </p>

        {/* Steps List */}
        <div className="space-y-4 my-4 max-h-[50vh] overflow-y-auto pr-1 text-sm text-slate-650 dark:text-slate-200">
          {steps.map((step, idx) => (
            <div key={idx} className="flex gap-3 items-start">
              <span className="h-6 w-6 bg-primary-50 dark:bg-primary-900/40 text-primary-800 dark:text-primary-300 text-xs font-bold rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                {idx + 1}
              </span>
              <p className="leading-relaxed">{step}</p>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handleClose}
          className="w-full bg-primary-600 hover:bg-primary-750 text-white font-bold py-3 rounded-3xl text-sm transition-all duration-200 mt-4 shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          Tôi đã hiểu, bắt đầu học!
        </button>
      </div>
    </div>
  );
}
