import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function StatusIndicator(props) {
  const {
    success = true,
    text,
    children,
  } = props;

  const { t } = useTranslation();

  const imgSource = success ? require('../assets/success.svg').default : require('../assets/error.svg').default;

  return (
    <div>
      <div className="mt-8 p-1">
        <p className="text-2xl font-teaser mb-8 text-center">{text}</p>
        <div className="flex justify-center flex-col items-center mb-8">
          <img className="h-48 w-48 my-10" src={imgSource} alt="" />
          {children || <Link className="btn-green mt-10" to="/">{t('components.statusIndicator.toHome')}</Link>}
        </div>
      </div>
    </div>
  );
}
