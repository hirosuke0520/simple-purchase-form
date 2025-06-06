import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency: string = 'USD'): string {
  // Currencies that don't use decimal places (zero-decimal currencies)
  const zeroDecimalCurrencies = [
    'jpy', 'krw', 'pyg', 'clp', 'gnf', 'kmf', 'mga', 'rwf', 'ugx', 'vnd', 
    'vuv', 'xaf', 'xof', 'xpf', 'bif', 'djf'
  ];
  
  const currencyLower = currency.toLowerCase();
  const isZeroDecimal = zeroDecimalCurrencies.includes(currencyLower);
  
  // For zero-decimal currencies, use the amount as-is
  // For other currencies, divide by 100 (cents to dollars)
  const actualAmount = isZeroDecimal ? amount : amount / 100;
  
  // Use appropriate locale based on currency
  let locale = 'en-US';
  if (currencyLower === 'jpy') {
    locale = 'ja-JP';
  } else if (currencyLower === 'eur') {
    locale = 'de-DE';
  } else if (currencyLower === 'gbp') {
    locale = 'en-GB';
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: isZeroDecimal ? 0 : 2,
    maximumFractionDigits: isZeroDecimal ? 0 : 2,
  }).format(actualAmount);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateName(name: string): boolean {
  return name.trim().length >= 2;
}