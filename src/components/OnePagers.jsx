import React, { useState } from 'react';
import Collapse from '@material-ui/core/Collapse';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import { useTranslation } from 'react-i18next';

const onePager = [
  {
    language: 'German',
    original: 'Deutsch',
    signUp: 'Aushang',
    signUpFileName: 'signUp/quarantaenehelden_a_deutsch.pdf',
    poster: 'One Pager',
    posterFileName: 'poster/quarantaenehelden_b_deutsch.pdf',
  },
  {
    language: 'Russian',
    original: 'Русский',
    signUp: 'Объявление',
    signUpFileName: 'signUp/quarantaenehelden_a_russian.pdf',
    poster: 'плакат',
    posterFileName: 'poster/quarantaenehelden_b_russian.pdf',
  },
  {
    language: 'English',
    original: 'English',
    signUp: 'sign up',
    signUpFileName: 'signUp/quarantaenehelden_a_english.pdf',
    poster: 'one pager',
    posterFileName: 'poster/quarantaenehelden_b_english.pdf',
  },
  {
    language: 'Turkish',
    original: 'Türkçe',
    signUp: 'iletişim kayıt formu',
    signUpFileName: 'signUp/quarantaenehelden_a_turkish.pdf',
    poster: 'bilgi afişi',
    posterFileName: 'poster/quarantaenehelden_b_turkish.pdf',
  },
  {
    language: 'Arabic',
    original: 'العربية',
    signUp: 'ورقة التسجيل',
    signUpFileName: 'signUp/quarantaenehelden_a_arabic.pdf',
    poster: 'ورقة المعلومات',
    posterFileName: 'poster/quarantaenehelden_b_arabic.pdf',
  },
  {
    language: 'Italian',
    original: 'Italiano',
    signUp: 'foglio d\'iscrizione',
    signUpFileName: 'signUp/quarantaenehelden_a_italian.pdf',
    poster: 'poster informativo',
    posterFileName: 'poster/quarantaenehelden_b_italian.pdf',
  },
  {
    language: 'French',
    original: 'Français',
    signUp: 'Affichage solidaire',
    signUpFileName: 'signUp/quarantaenehelden_a_french.pdf',
    poster: 'affiche d’information',
    posterFileName: 'poster/quarantaenehelden_b_french.pdf',
  },
  {
    language: 'Spanish',
    original: 'Español',
    signUp: 'Hoja de inscripción',
    signUpFileName: 'signUp/quarantaenehelden_a_spanish.pdf',
    poster: 'póster informativo',
    posterFileName: 'poster/quarantaenehelden_b_spanish.pdf',
  },
  {
    language: 'Romanian',
    original: 'Românește',
    signUp: 'semnează foaia',
    signUpFileName: 'signUp/quarantaenehelden_a_romanian.pdf',
    poster: 'anunț',
    posterFileName: 'poster/quarantaenehelden_b_romanian.pdf',
  },
  {
    language: 'Polish',
    original: 'Polski',
    signUp: 'karta zapisu',
    signUpFileName: 'signUp/quarantaenehelden_a_polish.pdf',
    poster: 'plakat informacyjny',
    posterFileName: 'poster/quarantaenehelden_b_polish.pdf',
  },
  {
    language: 'Croatian',
    original: 'Hravtski',
    signUp: 'Obrazac za prijavu',
    signUpFileName: 'signUp/quarantaenehelden_a_croatian.pdf',
    poster: 'Info poster',
    posterFileName: 'poster/quarantaenehelden_b_croatian.pdf',
  },
  {
    language: 'Greek',
    original: 'ελληνικά',
    signUp: 'Σελίδα εγγραφής',
    signUpFileName: 'signUp/quarantaenehelden_a_greek.pdf',
    poster: 'Ενημερωτικό φυλλάδιο',
    posterFileName: 'poster/quarantaenehelden_b_greek.pdf',
  },
  {
    language: 'Portuguese',
    original: 'Português',
    signUp: 'Ficha de inscrição',
    signUpFileName: 'signUp/quarantaenehelden_a_portuguese.pdf',
    poster: 'Cartaz informativo',
    posterFileName: 'poster/quarantaenehelden_b_portuguese.pdf',
  },
  {
    language: 'Hungarian',
    original: 'Magyar',
    signUp: 'regisztrációs lap',
    signUpFileName: 'signUp/quarantaenehelden_a_hungarian.pdf',
    poster: 'információs plakát',
    posterFileName: 'poster/quarantaenehelden_b_hungarian.pdf',
  },
  {
    language: 'Ukrainian',
    original: 'українська',
    signUp: 'Оголошення',
    signUpFileName: 'signUp/quarantaenehelden_a_ukrainian.pdf',
    poster: 'плакат',
    posterFileName: 'poster/quarantaenehelden_b_ukrainian.pdf',
  },
  {
    language: 'Chinese',
    original: '汉语/漢語',
    signUp: '报名表/報名表',
    signUpFileName: 'signUp/quarantaenehelden_a_chinese_simple.pdf',
    poster: '信息宣传海报/資訊宣傳海報',
    posterFileName: 'poster/quarantaenehelden_b_chinese_simple.pdf',
  },
  {
    language: 'Vietnamese',
    original: 'Tiếng Việt',
    signUp: 'tờ liên lạc',
    signUpFileName: 'signUp/quarantaenehelden_a_vietnamese.pdf',
    poster: 'thông tin poster',
    posterFileName: 'poster/quarantaenehelden_b_vietnamese.pdf',
  },
  {
    language: 'Albanian',
    original: 'Shqip',
    signUp: 'Fletë regjistrimi',
    signUpFileName: 'signUp/quarantaenehelden_a_albanian.pdf',
    poster: 'Broshurë informative',
    posterFileName: 'poster/quarantaenehelden_b_albanian.pdf',
  },
  {
    language: 'Bulgarian',
    original: 'Български',
    signUp: 'Лист за записване',
    signUpFileName: 'signUp/quarantaenehelden_a_bulgarian.pdf',
    poster: 'Информационен плакат',
    posterFileName: 'poster/quarantaenehelden_b_bulgarian.pdf',
  },
];

export default function OnePagers() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div
        className="mt-4 md:ml-0 md:mr-0 mb-1 p-4 flex flex-row md:flex-row justify-start items-center bg-kaki"
      >
        <div>
          <img className="w-30 h-10 md:h-16 mr-4" src={require('../assets/aushang.svg').default} alt="" />
        </div>

        <div className="px-4 w-full">
          <div className="font-semibold">Poster / ورقة المعلومات / bilgi afişi / плакат</div>
          {t('views.main.noInternet.preOptionalBreak')}
          {' '}
          <br className="hidden sm:block" />
          {t('views.main.noInternet.postOptionalBreak')}
        </div>
        {isOpen
          ? (
            <ExpandLessIcon
              className="cursor-pointer hover:opacity-50"
              style={{ fontSize: '40px' }}
              onClick={() => {
                setIsOpen((current) => !current);
              }}
            />
          ) : (
            <ExpandMoreIcon
              className="cursor-pointer hover:opacity-50"
              style={{ fontSize: '40px' }}
              onClick={() => {
                setIsOpen((current) => !current);
              }}
            />
          )}
      </div>
      <Collapse in={isOpen}>
        {onePager.map((element) => (
          <OnePager
            key={element.language}
            original={element.original}
            signUpFileName={element.signUpFileName}
            signUp={element.signUp}
            posterFileName={element.posterFileName}
            poster={element.poster}
          />
        ))}
      </Collapse>
    </>
  );
}

const OnePager = (props) => {
  const {
    original,
    signUp,
    signUpFileName,
    posterFileName,
    poster,
  } = props;

  return (
    <div className="md:ml-0 md:mr-0 p-4 mb-1 bg-gray-custom">
      <span className="font-semibold">
        {original}
      </span>
      {' | '}
      <a
        className="text-secondary hover:underline"
        href={`../assets/${signUpFileName}`}
        download={`../assets/${signUpFileName}`}
      >
        {signUp}
      </a>
      {' | '}
      <a
        className="text-secondary hover:underline"
        href={`../assets/${posterFileName}`}
        download={`../assets/${posterFileName}`}
      >
        {poster}
      </a>
    </div>
  );
};
