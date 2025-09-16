
import React from 'react';
import type { Currency } from '../types';

interface CurrencyInputProps {
  label: string;
  currency: Currency;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  disabled?: boolean;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({ label, currency, value, onChange, icon, disabled = false }) => {
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-slate-400 mb-1">{label}</label>
      <div className="flex items-center">
        <input
          type="number"
          step="any"
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder="0.00"
          className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 pl-12 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-colors disabled:bg-slate-800 disabled:cursor-not-allowed"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 mt-[0.3rem] text-slate-400 w-6 h-6">
          {icon}
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 mt-[0.3rem] text-sm font-bold text-slate-300">
          {currency}
        </div>
      </div>
    </div>
  );
};

export default CurrencyInput;
