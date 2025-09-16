import React, { useState, useEffect, useMemo } from 'react';
import { Currency } from '../types';
import CurrencyInput from './CurrencyInput';
import { BitcoinIcon } from './icons/BitcoinIcon';
import { UsdIcon } from './icons/UsdIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { EthIcon } from './icons/EthIcon';
import { LtcIcon } from './icons/LtcIcon';
import { XmrIcon } from './icons/XmrIcon';

interface ConverterCardProps {
  cryptoCurrency: Currency;
  initialPrice: number | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const cryptoIcons: Record<Exclude<Currency, Currency.USD>, React.ReactNode> = {
  [Currency.BTC]: <BitcoinIcon />,
  [Currency.ETH]: <EthIcon />,
  [Currency.LTC]: <LtcIcon />,
  [Currency.XMR]: <XmrIcon />,
};

const ConverterCard: React.FC<ConverterCardProps> = ({ cryptoCurrency, initialPrice, isLoading, error, onRefresh }) => {
  const [cryptoValue, setCryptoValue] = useState<string>('1');
  const [usdValue, setUsdValue] = useState<string>('');
  
  const price = useMemo(() => initialPrice ?? 0, [initialPrice]);

  useEffect(() => {
    // Reset inputs when currency changes
    setCryptoValue('1');
    if (price > 0) {
      setUsdValue(price.toFixed(2));
    } else {
      setUsdValue('');
    }
  }, [cryptoCurrency, price]);
  
  const handleCryptoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCryptoValue(value);
    if (value && !isNaN(parseFloat(value)) && price > 0) {
      const convertedUsd = parseFloat(value) * price;
      setUsdValue(convertedUsd.toFixed(2));
    } else {
      setUsdValue('');
    }
  };

  const handleUsdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsdValue(value);
    if (value && !isNaN(parseFloat(value)) && price > 0) {
      const convertedCrypto = parseFloat(value) / price;
      // Use more precision for crypto
      setCryptoValue(convertedCrypto.toFixed(8));
    } else {
      setCryptoValue('');
    }
  };

  const formattedPrice = useMemo(() => {
    if (isLoading && !price) return 'Fetching price...';
    if (error && !price) return 'Price unavailable';
    return price > 0 ? `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A';
  }, [price, isLoading, error]);

  const cryptoIcon = cryptoIcons[cryptoCurrency as Exclude<Currency, Currency.USD>];

  return (
    <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-lg p-6 space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-slate-400">Current Rate (1 {cryptoCurrency})</p>
        <div className="flex items-center gap-2">
          <p className="text-lg font-semibold text-cyan-400">{formattedPrice}</p>
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

      <div className="space-y-4">
        <CurrencyInput
          label="You send"
          currency={cryptoCurrency}
          value={cryptoValue}
          onChange={handleCryptoChange}
          icon={cryptoIcon}
          disabled={isLoading || !!error || !price}
        />
        <CurrencyInput
          label="They receive"
          currency={Currency.USD}
          value={usdValue}
          onChange={handleUsdChange}
          icon={<UsdIcon />}
          disabled={isLoading || !!error || !price}
        />
      </div>

      {error && !price && <p className="text-red-400 text-sm text-center">{error}</p>}
    </div>
  );
};

export default ConverterCard;
