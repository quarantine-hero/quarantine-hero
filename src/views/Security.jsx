import React from 'react';
import { useTranslation } from 'react-i18next';
import Rules from '../components/Rules';
import useCms from '../util/useCms';
import Loader from '../components/loader/Loader';
import StyledMarkdown from '../util/StyledMarkdown';

const icons = {
  dont_help: require('../assets/dont_help.svg').default,
  local: require('../assets/lokal.svg').default,
  distanced: require('../assets/distanziert.svg').default,
  consistent: require('../assets/konsistent.svg').default,
};

function ContentBlock({ className, title, text, icon }) {
  return (
    <>
      <div className="flex items-center mt-10 mb-2">
        {icon && <img className="w-8 h-8 mr-2" src={icons[icon]} alt="" />}
        <h3 className="text-xl font-exo2">{title}</h3>
      </div>
      <StyledMarkdown className={className}>{text}</StyledMarkdown>
    </>
  );
}

export default function Security() {
  const { t } = useTranslation();

  const [securityRules] = useCms('security-rules');
  const [furtherInformation] = useCms('security-further-info');

  return (
    <div className="px-5 sm:mt-10">
      <h1 className="text-2xl font-exo2">{t('views.security.securityNotices')}</h1>
      <div className="text-2xl text-primary font-exo2 italic font-semibold">{t('views.security.helpSafeHashtag')}</div>

      <div className="bg-kaki p-4 my-10 font-open-sans">
        <p>
          <span className="font-bold">{t('views.security.stickToAuthorities')}</span>
          &nbsp;
          {t('views.security.stickToMeasures')}
        </p>
        <div className="mt-4 w-full text-right">
          <button
            type="button"
            className="text-secondary hover:underline"
            onClick={() => {
              document.getElementById('current-news').scrollIntoView();
            }}
          >
            {t('views.security.recentLinks')}
            &nbsp;&gt;
          </button>
        </div>
      </div>

      <h2 className="text-2xl font-exo2">{t('views.security.goldenRules')}</h2>
      <Rules />
      <Loader waitOn={securityRules.length > 0}>
        {securityRules.map((r) => <ContentBlock key={r.title} title={r.title} text={r.text} icon={r.icon} />)}
      </Loader>

      <h2 id="current-news" className="text-2xl font-exo2 mt-10">{t('views.security.whereGetInformation')}</h2>
      <Loader waitOn={furtherInformation.length > 0}>
        {furtherInformation.map((i) => <ContentBlock className="leading-relaxed" key={i.title} title={i.title} text={i.text} />)}
      </Loader>

      <div className="p-4 bg-kaki font-open-sans mt-10">
        <div className="font-bold">{t('views.security.note')}</div>
        {t('views.security.disclaimer')}
      </div>
    </div>
  );
}
