'use client';
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import pt from '@/locales/pt.json';
import en from '@/locales/en.json';
import es from '@/locales/es.json';

type Locale = 'pt' | 'en' | 'es';

type Translations = { [key: string]: any };

const translations: { [key in Locale]: Translations } = { pt, en, es };

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>('pt');
  const [messages, setMessages] = useState<Translations>(translations.pt);

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0] as Locale;
    const initialLocale = ['pt', 'en', 'es'].includes(browserLang) ? browserLang : 'pt';
    setLocale(initialLocale);
    setMessages(translations[initialLocale]);
  }, []);

  const handleSetLocale = (newLocale: Locale) => {
    if (translations[newLocale]) {
      setLocale(newLocale);
      setMessages(translations[newLocale]);
    }
  };

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let result = messages;
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key; // Return the key itself if translation is not found
      }
    }
    return typeof result === 'string' ? result : key;
  }, [messages]);

  return (
    <I18nContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};
