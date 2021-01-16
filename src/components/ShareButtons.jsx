import React from 'react';

export default function ShareButtons() {
  return (
    <div className="flex item">
      <div className="mr-1 cursor-pointer">
        <a href="https://instagram.com/quarantaenehelden" target="_blank" rel="noopener noreferrer">
          <img alt="instagram" src={require('../assets/ig.svg').default} className="w-8 opacity-50 hover:opacity-100 transition-all duration-200" />
        </a>
      </div>
      <div className="mx-1 cursor-pointer">
        <a href="https://facebook.com/quarantaenehelden" target="_blank" rel="noopener noreferrer">
          <img alt="facebook" src={require('../assets/fb.svg').default} className="w-8 opacity-50 hover:opacity-100 transition-all duration-200" />
        </a>
      </div>
      <div className="mx-1 cursor-pointer">
        <a href="https://twitter.com/QuarantaeneHeld" target="_blank" rel="noopener noreferrer">
          <img alt="twitter" src={require('../assets/tw.svg').default} className="w-8 opacity-50 hover:opacity-100 transition-all duration-200" />
        </a>
      </div>
      <div className="ml-1 mr-2 cursor-pointer">
        <a href="https://github.com/quarantine-hero/quarantine-hero" target="_blank" rel="noopener noreferrer">
          <img alt="twitter" src={require('../assets/gh.svg').default} className="w-8 opacity-50 hover:opacity-100 transition-all duration-200" />
        </a>
      </div>
    </div>
  );
}
