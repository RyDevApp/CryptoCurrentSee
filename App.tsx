import React, { useState, useEffect, useCallback } from 'react';
import { fetchCryptoPrice } from './services/geminiService';
import ConverterCard from './components/ConverterCard';
import { Currency } from './types';
import { BitcoinIcon } from './components/icons/BitcoinIcon';
import { EthIcon } from './components/icons/EthIcon';
import { LtcIcon } from './components/icons/LtcIcon';
import { XmrIcon } from './components/icons/XmrIcon';
import { UsdIcon } from './components/icons/UsdIcon';

export const supportedCurrencies = [
  { currency: Currency.BTC, name: 'Bitcoin', icon: <BitcoinIcon className="w-6 h-6" /> },
  { currency: Currency.ETH, name: 'Ethereum', icon: <EthIcon className="w-6 h-6" /> },
  { currency: Currency.LTC, name: 'Litecoin', icon: <LtcIcon className="w-6 h-6" /> },
  { currency: Currency.XMR, name: 'Monero', icon: <XmrIcon className="w-6 h-6" /> },
  { currency: Currency.USD, name: 'US Dollar', icon: <UsdIcon className="w-6 h-6" /> },
];

const App: React.FC = () => {
  const [fromCurrency, setFromCurrency] = useState<Currency>(Currency.BTC);
  const [toCurrency, setToCurrency] = useState<Currency>(Currency.USD);
  const [prices, setPrices] = useState<Partial<Record<Currency, number>>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleFetchPrices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const cryptoList = [Currency.BTC, Currency.ETH, Currency.LTC, Currency.XMR];
      const pricePromises = cryptoList.map(crypto => fetchCryptoPrice(crypto));
      const results = await Promise.allSettled(pricePromises);
      
      const newPrices: Partial<Record<Currency, number>> = {};
      let hasError = false;
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          newPrices[cryptoList[index]] = result.value;
        } else {
          console.error(`Failed to fetch price for ${cryptoList[index]}`, result.reason);
          hasError = true;
        }
      });

      setPrices(newPrices);
      if (hasError) {
        setError('Could not fetch all crypto prices. Some conversions may not be available.');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setPrices({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    handleFetchPrices();
  }, [handleFetchPrices]);

  const handleSelectFromCurrency = (currency: Currency) => {
    if (currency === toCurrency) {
      // If user selects the same currency as the 'to' currency, swap them
      setToCurrency(fromCurrency);
    }
    setFromCurrency(currency);
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 text-white flex flex-col items-center justify-center p-4 font-serif relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-slate-800 [mask-image:linear-gradient(to_bottom,white_20%,transparent_100%)]"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-900/40"></div>
      <main className="z-10 flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-orange-200 to-green-300">
          Crypto Converter
        </h1>
        <p className="text-slate-400 text-center mb-8 max-w-md">
          Instantly convert between cryptocurrencies and USD with the latest exchange rates.
        </p>
        
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {supportedCurrencies.filter(c => c.currency !== toCurrency).map(({ currency, name, icon }) => (
            <button
              key={currency}
              onClick={() => handleSelectFromCurrency(currency)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 border-2 ${
                fromCurrency === currency
                  ? 'bg-orange-500/20 border-orange-500 text-white'
                  : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 hover:border-slate-600 text-slate-300'
              }`}
              aria-pressed={fromCurrency === currency}
            >
              {icon}
              {name}
            </button>
          ))}
        </div>

        <ConverterCard
          fromCurrency={fromCurrency}
          toCurrency={toCurrency}
          setFromCurrency={setFromCurrency}
          setToCurrency={setToCurrency}
          prices={prices}
          isLoading={isLoading}
          error={error}
          onRefresh={handleFetchPrices}
        />
         <footer className="mt-8 text-center text-slate-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Crypto Converter. All rights reserved.</p>
            <p>Exchange rates are fetched via Gemini and may have a slight delay.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;