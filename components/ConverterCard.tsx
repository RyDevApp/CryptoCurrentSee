import React, { useState, useEffect, useMemo } from 'react';
import { Currency } from '../types';
import CurrencyInput from './CurrencyInput';
import { RefreshIcon } from './icons/RefreshIcon';
import { SwapIcon } from './icons/SwapIcon';
import { supportedCurrencies } from '../App';

interface ConverterCardProps {
  fromCurrency: Currency;
  toCurrency: Currency;
  setFromCurrency: (c: Currency) => void;
  setToCurrency: (c: Currency) => void;
  prices: Partial<Record<Currency, number>>;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

/**
 * Formats a number to a string with high precision, stripping insignificant trailing zeros.
 * @param num The number to format.
 * @returns A string representing the number with high precision.
 */
const formatPreciseNumber = (num: number): string => {
  if (isNaN(num) || !isFinite(num)) return '';
  // Use toFixed for high precision, then strip trailing zeros and any trailing decimal point.
  return num.toFixed(18).replace(/0+$/, '').replace(/\.$/, '');
};

const ConverterCard: React.FC<ConverterCardProps> = ({ 
  fromCurrency, 
  toCurrency, 
  setFromCurrency,
  setToCurrency,
  prices, 
  isLoading, 
  error, 
  onRefresh 
}) => {
  const [fromValue, setFromValue] = useState<string>('1');
  const [toValue, setToValue] = useState<string>('');
  
  const rate = useMemo(() => {
    const fromPrice = fromCurrency === Currency.USD ? 1 : prices[fromCurrency];
    const toPrice = toCurrency === Currency.USD ? 1 : prices[toCurrency];

    if (!fromPrice || !toPrice || fromPrice === 0 || toPrice === 0) return 0;

    return fromPrice / toPrice;
  }, [fromCurrency, toCurrency, prices]);

  const isDataReady = !isLoading && !error && rate > 0;

  useEffect(() => {
    const numericFromValue = parseFloat(fromValue);
    if (rate > 0 && !isNaN(numericFromValue)) {
      const newToValue = numericFromValue * rate;
      setToValue(formatPreciseNumber(newToValue));
    } else {
      setToValue('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromCurrency, toCurrency, rate]);

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFromValue(value);
    const numericValue = parseFloat(value);
    if (value && !isNaN(numericValue) && rate > 0) {
      const converted = numericValue * rate;
      setToValue(formatPreciseNumber(converted));
    } else {
      setToValue('');
    }
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setToValue(value);
    const numericValue = parseFloat(value);
    if (value && !isNaN(numericValue) && rate > 0) {
      const converted = numericValue / rate;
      setFromValue(formatPreciseNumber(converted));
    } else {
      setFromValue('');
    }
  };

  const handleSwap = () => {
    const oldFromValue = fromValue;
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromValue(toValue);
    setToValue(oldFromValue);
  };

  const formattedRate = useMemo(() => {
    if (isLoading && rate === 0) return 'Fetching rate...';
    if (error && rate === 0) return 'Rate unavailable';
    return rate > 0 ? `1 ${fromCurrency} ≈ ${rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${toCurrency}` : 'N/A';
  }, [rate, isLoading, error, fromCurrency, toCurrency]);

  const fromCurrencyInfo = supportedCurrencies.find(c => c.currency === fromCurrency);
  const toCurrencyInfo = supportedCurrencies.find(c => c.currency === toCurrency);

  const availableToCurrencies = supportedCurrencies.filter(c => c.currency !== fromCurrency);

  return (
    <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-lg p-6 space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-slate-400 text-sm">Current Rate</p>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-orange-400">{formattedRate}</p>
          <button 
            onClick={onRefresh} 
            disabled={isLoading} 
            className="text-slate-400 hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
            aria-label="Refresh prices"
          >
            <RefreshIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-center space-y-2">
        <CurrencyInput
          label="You send"
          currency={fromCurrency}
          value={fromValue}
          onChange={handleFromChange}
          icon={fromCurrencyInfo?.icon}
          disabled={!isDataReady}
        />
        
        <div className="w-full flex justify-center py-1">
          <button 
            onClick={handleSwap} 
            className="p-2 rounded-full bg-slate-700/50 border border-slate-600 hover:bg-slate-600/50 transition-all text-slate-300 hover:text-white"
            aria-label="Swap currencies"
          >
            <SwapIcon className="w-5 h-5" />
          </button>
        </div>

        <CurrencyInput
          label="They receive"
          currency={toCurrency}
          value={toValue}
          onChange={handleToChange}
          icon={toCurrencyInfo?.icon}
          disabled={!isDataReady}
          availableCurrencies={availableToCurrencies}
          onCurrencyChange={setToCurrency}
        />
      </div>

      {error && rate === 0 && <p className="text-red-400 text-sm text-center pt-2">{error}</p>}
    </div>
  );
};

export default ConverterCard;