import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ShareButtons() {
  const { t } = useTranslation();

  return (
    <div className="flex item">
      <div className="mr-1 cursor-pointer">
        <a
          href="https://www.paypal.com/donate?hosted_button_id=3YGPKKJWR3YV8"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center rounded-lg h-8 px-2 opacity-50 hover:opacity-100 transition-all duration-200 bg-black"
        >
          <span className="text-xs text-white">{t('App.donate')}</span>
        </a>
      </div>
      <div className="mr-1 cursor-pointer">
        <a href="https://instagram.com/quarantaenehelden" target="_blank" rel="noopener noreferrer">
          <img alt="instagram" src={require('../assets/ig.svg')} className="w-8 opacity-50 hover:opacity-100 transition-all duration-200" />
        </a>
      </div>
      <div className="mx-1 cursor-pointer">
        <a href="https://facebook.com/quarantaenehelden" target="_blank" rel="noopener noreferrer">
          <img alt="facebook" src={require('../assets/fb.svg')} className="w-8 opacity-50 hover:opacity-100 transition-all duration-200" />
        </a>
      </div>
      <div className="mx-1 cursor-pointer">
        <a href="https://twitter.com/QuarantaeneHeld" target="_blank" rel="noopener noreferrer">
          <img alt="twitter" src={require('../assets/tw.svg')} className="w-8 opacity-50 hover:opacity-100 transition-all duration-200" />
        </a>
      </div>
      <div className="ml-1 mr-2 cursor-pointer">
        <a href="https://github.com/quarantine-hero/quarantine-hero" target="_blank" rel="noopener noreferrer">
          <img alt="twitter" src={require('../assets/gh.svg')} className="w-8 opacity-50 hover:opacity-100 transition-all duration-200" />
        </a>
      </div>
    </div>
  );
}
