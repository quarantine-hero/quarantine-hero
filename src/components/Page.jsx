import React, { useState } from 'react';
import ScrollUpButton from 'react-scroll-up-button';
import MenuIcon from '@material-ui/icons/Menu';
import { useAuthState } from 'react-firebase-hooks/auth';
import * as firebase from 'firebase';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import ShareButtons from './ShareButtons';
import useScrollToTop from '../util/scrollToTop';
import DesktopLowerNavigation from './DesktopMenu';
import Footer from './Footer';
import arrowUpIcon from '../assets/arrows_up.svg';
import Sidebar from './Sidebar';

function DesktopTopNavigation({ isAuthLoading, user, signOut }) {
  const { t } = useTranslation();

  // Depending on the user auth status, show different elements in the top navigation
  return (
    <div className="hidden md:flex md:mt-12 w-full phone-width flex-col items-end">
      <div className="mb-2">
        <ShareButtons />
      </div>
      <div className="flex justify-end items-center">
        {isAuthLoading || !user
          ? (
            <Link
              className="mr-4 font-open-sans text-gray-700"
              to="/signin/dashboard"
            >
              {t('App.login')}
            </Link>
          ) : (
            <>
              <Link
                data-cy="nav-my-overview"
                className="mr-4 font-open-sans text-gray-700"
                to="/dashboard"
              >
                {t('components.desktopMenu.myOverview')}
              </Link>
              <button
                type="button"
                data-cy="btn-sign-out"
                className="mr-4 font-open-sans text-gray-700"
                onClick={signOut}
              >
                {t('components.desktopMenu.signOut')}
              </button>
            </>
          )}
        <Link
          className="mr-4 font-open-sans text-gray-700"
          to="/faq"
        >
          {t('components.desktopMenu.FAQs')}
        </Link>
        <Link
          className="mr-4 font-open-sans text-gray-700"
          to="/press"
        >
          {t('App.press')}
        </Link>
        <Link
          className="mr-2 font-open-sans text-gray-700"
          to="/partners"
        >
          {t('App.partners')}
        </Link>
      </div>
    </div>
  );
}

function MobileTopNavigation({ onMenuIconClick }) {
  return (
    <div className="w-full visible md:invisible">
      <div
        style={{ zIndex: 101 }}
        className="h-16 w-full fixed top-0 bg-white flex flex-row justify-between items-center pr-5"
      >
        <Link
          to="/"
          className="font-main ml-4"
          style={{ fontWeight: '600' }}
        >
          <img alt="logo" src={require('../assets/logo_invert.svg').default} className="h-10" />
        </Link>
        <div>
          <MenuIcon style={{ fontSize: '40px' }} className="text-gray-600" onClick={onMenuIconClick} data-cy="mobile-menu-icon" />
        </div>
      </div>
    </div>
  );
}

export default function Page({ children }) {
  // always scroll page to top when changing the pathname
  useScrollToTop();

  const [user, isAuthLoading] = useAuthState(firebase.auth());
  const [menuOpen, setMenuOpen] = useState(false);

  const signOut = () => firebase.auth().signOut();

  return (
    <>
      <div className="flex items-center min-h-screen flex-col bg-kaki">

        <DesktopTopNavigation user={user} isAuthLoading={isAuthLoading} signOut={signOut} />
        <MobileTopNavigation onMenuIconClick={() => setMenuOpen(true)} />

        <div className="phone-width bg-white shadow-xl min-h-screen md:mt-2">
          <DesktopLowerNavigation />
          <div className="md:px-16 mt-20 md:mt-0 overflow-hidden">
            {children}
          </div>
          <Footer />
        </div>

        <ScrollUpButton
          ContainerClassName="scroll-up-btn"
          TransitionClassName="scroll-up-btn-fade"
        >
          <img alt="arrow-down" className="arrow-down" src={arrowUpIcon} />
        </ScrollUpButton>

        <Sidebar
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          isLoggedIn={user}
          signOut={signOut}
        />
      </div>
    </>
  );
}
