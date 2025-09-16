import React, { useState, useEffect, useRef } from 'react';
import type { Currency } from '../types';

interface CurrencyInputProps {
  label: string;
  currency: Currency;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  disabled?: boolean;
  onCurrencyChange?: (currency: Currency) => void;
  availableCurrencies?: { currency: Currency; name: string; icon: React.ReactNode }[];
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({ 
  label, 
  currency, 
  value, 
  onChange, 
  icon, 
  disabled = false,
  onCurrencyChange,
  availableCurrencies
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCurrencySelect = (selectedCurrency: Currency) => {
    if(onCurrencyChange) {
      onCurrencyChange(selectedCurrency);
    }
    setIsDropdownOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Allow only numbers and a single decimal point
    const regex = /^[0-9]*\.?[0-9]*$/;
    if (regex.test(value)) {
      onChange(e);
    }
  };

  const CurrencySelector: React.FC = () => (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 mt-[0.3rem] text-sm font-bold text-slate-300">
      {onCurrencyChange && availableCurrencies ? (
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          disabled={disabled}
          className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-600/50 px-3 py-1.5 rounded-md transition-colors"
        >
          {currency}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        </button>
      ) : (
        <span className="px-3">{currency}</span>
      )}
    </div>
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm font-medium text-slate-400 mb-1">{label}</label>
      <div className="relative flex items-center">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          placeholder="0.00"
          className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 pl-12 pr-28 text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-colors disabled:bg-slate-800 disabled:cursor-not-allowed"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 mt-[0.3rem] text-slate-400 w-6 h-6">
          {icon}
        </div>
        <CurrencySelector />
      </div>
      
      {isDropdownOpen && availableCurrencies && (
        <div className="absolute z-20 top-full right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden animate-fade-in-up">
          <ul className="max-h-60 overflow-y-auto">
            {availableCurrencies.map(item => (
              <li key={item.currency}>
                <button
                  onClick={() => handleCurrencySelect(item.currency)}
                  className="w-full text-left flex items-center gap-3 px-4 py-2 text-white hover:bg-orange-500/10 transition-colors"
                >
                  <div className="w-6 h-6">{item.icon}</div>
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
       <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CurrencyInput;