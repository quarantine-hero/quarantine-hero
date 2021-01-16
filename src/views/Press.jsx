import React from 'react';
import * as Sentry from '@sentry/browser';
import * as firebase from 'firebase/app';
import { useTranslation } from 'react-i18next';
import Loader from '../components/loader/Loader';
import useCms from '../util/useCms';
import useFirebaseDownload from '../util/useFirebaseDownload';

export default function Press() {
  const [presseLink, errorGeneratingPressLink] = useFirebaseDownload('gs://quarantine-hero-assets/MarketingKit.zip', firebase);
  const [articles] = useCms('press');
  const { t } = useTranslation();

  if (errorGeneratingPressLink) {
    Sentry.captureException(errorGeneratingPressLink);
  }

  const Article = ({ date, title, link, text }) => (
    <div className="bg-kaki p-4 mb-4 mt-4 font-open-sans w-full">
      <div className="text-xs text-gray-700">{date}</div>
      <div className="font-bold">{title}</div>
      {link
        ? (
          <a
            className="text-secondary w-full block truncate"
            href={link}
            target="_blank"
            rel="nofollow noopener noreferrer"
          >
            {link}
          </a>
        ) : (
          <span className="w-full block truncate">{text}</span>
        )}
    </div>
  );

  return (
    <div>
      <div className="mt-4 p-4">
        <div className="font-teaser">
          {t('views.press.newsAndPressKit')}
        </div>
        <div className="font-open-sans mt-4">
          {t('views.press.manyMediaOutletsReported')}
        </div>
        <div className="bg-kaki p-4 mb-10 mt-8 font-open-sans flex">
          <div>
            <img src={require('../assets/clipboard.svg').default} alt="Clipboard" className="w-12 mr-4" />
          </div>
          <div>
            <div className="font-bold">
              {t('views.press.pressInformation')}
            </div>
            {t('views.press.pressKit')}
            <br className="sm:hidden" />
            {' '}
            <a
              href={presseLink}
              className="text-secondary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('views.press.pressKitFilename')}
            </a>
            <div>
              {t('views.press.pressContact')}
              <br className="sm:hidden" />
              {' '}
              <a href={`mailto:${t('views.press.pressMail')}`} className="text-secondary hover:underline">{t('views.press.pressMail')}</a>
            </div>
          </div>
        </div>
        <div className="my-8 flex flex-wrap mb-16">
          <div className="w-1/4 h-auto">
            <img alt="zdf" src={require('../assets/zdf.jpg').default} />
          </div>
          <div className="w-1/4 h-auto">
            <img alt="sueddeutsche_zeitung" src={require('../assets/sueddeutsche_zeitung.jpg').default} />
          </div>
          <div className="w-1/4 h-auto">
            <img alt="sat1" src={require('../assets/sat1.jpg').default} />
          </div>
          <div className="w-1/4 h-auto">
            <img alt="berliner_morgenpost" src={require('../assets/berliner_morgenpost.jpg').default} />
          </div>
          <div className="w-1/4 h-auto">
            <img alt="deutschlandfunk" src={require('../assets/deutschlandfunk.jpg').default} />
          </div>
          <div className="w-1/4 h-auto">
            <img alt="wdr" src={require('../assets/wdr.jpg').default} />
          </div>
          <div className="w-1/4 h-auto">
            <img alt="hr" src={require('../assets/hr.jpg').default} />
          </div>
          <div className="w-1/4 h-auto">
            <img alt="br" src={require('../assets/br.jpg').default} />
          </div>
          <div className="w-1/4 h-auto">
            <img alt="welt" src={require('../assets/welt.jpg').default} />
          </div>
          <div className="w-1/4 h-auto">
            <img alt="focus_online" src={require('../assets/focus_online.jpg').default} />
          </div>
          <div className="w-1/4 h-auto">
            <img alt="greenpeace_magazin" src={require('../assets/greenpeace_magazin.jpg').default} />
          </div>
          <div className="w-1/4 h-auto">
            <img alt="aktion_mensch" src={require('../assets/aktion_mensch.jpg').default} />
          </div>
          <div className="w-1/4 h-auto">
            <img alt="utopia" src={require('../assets/utopia.jpg').default} />
          </div>
          <div className="w-1/4 h-auto">
            <img alt="vogue" src={require('../assets/vogue.jpg').default} />
          </div>
          <div className="w-1/4 h-auto">
            <img alt="cosmopolitan" src={require('../assets/cosmopolitan.jpg').default} />
          </div>
          <div className="w-1/4 h-auto">
            <img alt="bunte_de" src={require('../assets/bunte_de.jpg').default} />
          </div>
        </div>
        <Loader waitOn={articles.length > 0}>
          {articles.map((article) => (
            <Article
              key={article.link || article.text}
              date={article.date}
              title={article.title}
              link={article.link}
              text={article.text}
            />
          ))}
        </Loader>
        <div className="bg-kaki p-4 mb-4 mt-4 font-open-sans w-full text-center">
          <div className="font-bold">{t('views.press.andManyMore')}</div>
        </div>
      </div>
    </div>
  );
}
