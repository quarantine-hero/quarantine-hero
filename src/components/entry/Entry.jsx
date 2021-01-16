import { Link, useHistory } from 'react-router-dom';
import React, { useRef, useState } from 'react';
import formatDistance from 'date-fns/formatDistance';
import { useTranslation } from 'react-i18next';
import { useAuthState } from 'react-firebase-hooks/auth';

import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import DoneIcon from '@material-ui/icons/Done';

import fb from '../../firebase';
import { adminId } from '../../appConfig';
import getDateFnsLocaleObject from '../../util/getDateFnsLocaleObject';
import Responses from '../Responses';
import PopupOnEntryAction from '../Popup';

import { ReactComponent as QuestionMarkSvg } from '../../assets/questionmark.svg';
import { ReactComponent as FlagRedSvg } from '../../assets/flag_red.svg';
import { ReactComponent as FlagOrangeSvg } from '../../assets/flag_orange.svg';
import { ReactComponent as XSymbolSvg } from '../../assets/x.svg';
import './Entry.css';

export default function Entry(props) {
  const {
    showFullText = false,
    showAsSolved = false,
    location = '',
    id = '',
    request = '',
    timestamp = Date.now(),
    onAddressClick,
    responses = 0,
    highlightLeft = false,
    reportedBy = [],
    report = false,
    uid = '',
    showSolveHint = false,
    showDeleteHint = false,
  } = props;

  const history = useHistory();
  const { t } = useTranslation();
  const [user] = useAuthState(fb.auth);
  const link = useRef(null);

  const date = formatDistance(new Date(timestamp), Date.now(), { locale: getDateFnsLocaleObject(), addSuffix: true });
  const [responsesVisible, setResponsesVisible] = useState(false);

  const [deleted, setDeleted] = useState(false);
  const [solved, setSolved] = useState(false);
  const [attemptingToDelete, setAttemptingToDelete] = useState(showDeleteHint);
  const [attemptingToSolve, setAttemptingToSolve] = useState(showSolveHint);
  const [attemptingToReport, setAttemptingToReport] = useState(report);
  const [popupVisible, setPopupVisible] = useState(showSolveHint || showDeleteHint);

  const userIsLoggedIn = !!user && !!user.uid;
  const userLoggedInAndReportedEntryBefore = userIsLoggedIn && reportedBy.includes(user.uid);
  const [reported, setReported] = useState(userLoggedInAndReportedEntryBefore);
  const entryBelongsToCurrentUser = userIsLoggedIn && user.uid === uid;
  const collectionName = showAsSolved ? 'solved-posts' : 'ask-for-help';

  let textToDisplay;
  if (showFullText) {
    textToDisplay = request;
  } else if (request.length > 300) {
    textToDisplay = `${request.substring(0, 300)}...`;
  } else {
    textToDisplay = request;
  }

  const handleDelete = async (e) => {
    e.preventDefault();
    const doc = await fb.store.collection(collectionName).doc(id).get();
    await fb.store.collection('/deleted').doc(id).set({
      collectionName, ...doc.data(),
    });
    fb.analytics.logEvent('help_request_deleted');
    setDeleted(true);
    setAttemptingToDelete(false);
    setPopupVisible(true); // trigger the deletion confirmation popup
  };

  const handleSolved = async (e) => {
    e.preventDefault();
    const askForHelpDoc = await fb.store.collection('ask-for-help').doc(id).get();
    const data = askForHelpDoc.data();
    await fb.store.collection('solved-posts').doc(id).set(data);
    fb.analytics.logEvent('help_request_solved');
    setSolved(true);
    setAttemptingToDelete(false);
    setPopupVisible(false);
  };

  const handleNewAskForHelp = async (e) => {
    e.preventDefault();
    setPopupVisible(false);
    return history.push('/ask-for-help');
  };

  const initializeDelete = async (e) => {
    e.preventDefault();
    setAttemptingToDelete(true);
    setPopupVisible(true);
  };

  const initializeSolve = async (e) => {
    e.preventDefault();
    setAttemptingToSolve(true);
    setPopupVisible(true);
  };

  const cancelDelete = async (e) => {
    e.preventDefault();
    setAttemptingToDelete(false);
    setPopupVisible(false);
  };

  const backToOverview = async (e) => {
    e.preventDefault();
    setPopupVisible(false);
  };

  const handleAddressClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddressClick) {
      onAddressClick(location);
    } else {
      history.push({
        pathname: '/overview',
        search: `?address=${location}`,
      });
    }
  };

  const reportEntry = async (e) => {
    // prevents redirect to the parent component, as this is clicked on a button within a Link component
    // https://stackoverflow.com/a/53005834/8547462
    e.preventDefault();

    const reportedPostsCollection = fb.store.collection('reported-posts');

    // redirect the user to the login page, as we can only store user ids for logged-in users
    if (!userIsLoggedIn) {
      const pathToOfferHelp = `offer-help/${id}`;
      const pathname = `/signin/${encodeURIComponent(pathToOfferHelp)}`;
      setAttemptingToReport(false);
      return history.push({ pathname, state: { reason_for_registration: t('components.entry.registrationReason') } });
    }

    const data = {
      request,
      askForHelpId: id,
      uid: user.uid,
      timestamp: Date.now(),
    };
    await reportedPostsCollection.add(data);
    fb.analytics.logEvent('help_request_reported');
    setAttemptingToReport(false);
    return setReported(true);
  };

  let numberOfResponsesText = '';

  if (responses === 0) {
    numberOfResponsesText = t('components.entry.noRepliesYet');
  } else if (responses === 1) {
    numberOfResponsesText = t('components.entry.oneReplyReceived');
  } else {
    numberOfResponsesText = `${responses} ${t('components.entry.repliesReceived')}`;
  }

  const popupOnEntryAction = (
    <PopupOnEntryAction
      responses={responses}
      attemptingToDelete={attemptingToDelete}
      attemptingToSolve={attemptingToSolve}
      deleted={deleted}
      popupVisible={popupVisible}
      setPopupVisible={setPopupVisible}
      setAttemptingToDelete={setAttemptingToDelete}
      handleSolved={handleSolved}
      showAsSolved={showAsSolved}
      handleNewAskForHelp={handleNewAskForHelp}
      cancelDelete={cancelDelete}
      handleDelete={handleDelete}
      backToOverview={backToOverview}
    />
  );

  if (deleted || solved) {
    // make popup component available to show the success hint, if the entry was previously deleted
    return <>{popupOnEntryAction}</>;
  }

  // eslint-disable-next-line no-nested-ternary
  const buttonClass = reported ? 'btn-report-flagged' : (attemptingToReport ? 'btn-report-abort' : 'btn-report-unflagged');

  const toggleResponsesVisible = (event) => {
    event.preventDefault();
    setResponsesVisible(!responsesVisible);
  };

  const mayDeleteEntryAndSeeResponses = user && (user.uid === uid || user.uid === adminId);

  const clearReportAttempt = (e) => {
    if (!link.current.contains(e.target)) setAttemptingToReport(false);
    document.body.removeEventListener('click', clearReportAttempt);
  };

  const topRightButtonBar = (() => {
    if (showAsSolved && !entryBelongsToCurrentUser) {
      return (
        <div className="flex justify-center items-center bg-secondary text-white text-xs font-medium rounded px-2">
          {t('components.entry.heroFound')}
          <DoneIcon className="ml-1 inline-block" />
        </div>
      );
    }

    return (
      <div>
        {!entryBelongsToCurrentUser
          ? (
            <button
              type="button"
              className={`btn-round ${!reported && 'hover:opacity-75'} my-2 ml-2 flex items-center justify-center ${buttonClass} z-10 relative`}
              disabled={reported}
              onClick={(e) => {
                e.preventDefault();
                const prevValue = attemptingToReport;
                setAttemptingToReport((curr) => !curr);
                if (!reported && !prevValue) document.body.addEventListener('click', clearReportAttempt);
              }}
            >
              {reported ? <FlagOrangeSvg className="flag" alt="" /> : null}
              {!reported && !attemptingToReport ? <FlagRedSvg className="flag" alt="" /> : null}
              {!reported && attemptingToReport ? <XSymbolSvg className="cross" alt="" /> : null}
            </button>
          ) : null}
        {attemptingToReport
          ? (
            <div
              role="button"
              tabIndex="0"
              className="absolute inset-0 bg-white-75"
              onClick={(e) => {
                e.preventDefault();
                setAttemptingToReport((curr) => !curr);
              }}
              onKeyDown={(e) => {
                if (e.keyCode === 13) {
                  setAttemptingToReport((curr) => !curr);
                }
              }}
            >
              <button
                type="button"
                className="flex items-center justify-center hover:opacity-75 font-open-sans btn-report-entry z-10 absolute"
                onClick={reportEntry}
              >
                Post melden?
                <img className="ml-2 inline-block" src={require('../../assets/flag_white.svg').default} alt="" />
              </button>
            </div>
          ) : null}
      </div>
    );
  })();

  const bottomButtonBar = (() => {
    if (!mayDeleteEntryAndSeeResponses) {
      return <></>;
    }

    const heroFoundButtonClasses = showAsSolved
      ? 'bg-secondary text-white btn-common'
      : 'bg-tertiary text-secondary hover:bg-secondary hover:text-white btn-common';

    return (
      <div className="flex flex-row mt-2 -mb-2 -mx-4 text-sm rounded-b overflow-hidden">
        {responses === 0
          ? (
            <div className="bg-gray-200 text-gray-700 flex justify-center items-center flex-grow mr-px btn-common">
              <div>{numberOfResponsesText}</div>
            </div>
          ) : (
            <>
              <button type="button" className="bg-secondary hover:opacity-75 text-white flex-1 btn-common flex flex-row items-center justify-center" onClick={toggleResponsesVisible}>
                <div className="hidden xs:block">{t('components.entry.message', { count: responses })}</div>
                <MailOutlineIcon className="ml-2 inline-block" />
                <div className="block xs:hidden font-open-sans font-bold ml-1">{responses}</div>
              </button>
              <button type="button" data-cy="btn-entry-solve" className={`flex items-center justify-center flex-1 sm:flex-grow mx-px ${heroFoundButtonClasses} px-2`} onClick={initializeSolve} disabled={showAsSolved}>
                <div>{t('components.entry.heroFound')}</div>
                {showAsSolved
                  ? <DoneIcon className="ml-1 inline-block" />
                  : <QuestionMarkSvg className="ml-1 inline-block h-4" />}
              </button>
            </>
          )}
        <button type="button" data-cy="btn-entry-delete" className="bg-red-200 text-primary hover:text-white hover:bg-primary flex flex-row item-center md:justify-around max-w-5 md:max-w-full btn-common pl-2 pr-8 md:px-6" onClick={initializeDelete}>
          <div className="hidden md:block">{t('components.entry.deleteRequestForHelp')}</div>
          <DeleteOutlineIcon className="pb-1" />
        </button>
      </div>
    );
  })();

  const requestCard = (
    <>
      <Link
        to={entryBelongsToCurrentUser ? '/dashboard' : `/offer-help/${id}`}
        data-id={id}
        data-cy={`ask-for-help-entry${responses > 0 ? '-with-responses' : ''}`}
        className={`bg-white px-4 py-2 rounded w-full my-3 text-xl block entry hyphens-auto relative ${highlightLeft && 'border-l-4 border-secondary'}`}
        key={id}
        ref={link}
      >
        <div className="flex justify-between">
          <span className="text-xs font-open-sans text-gray-800 mt-2 inline-block">
            {t('components.entry.somebodyAt')}
            {' '}
            <button
              type="button"
              onClick={handleAddressClick}
              className="font-bold address-clickable"
            >
              {location}
            </button>
            {' '}
            {t('components.entry.needsHelp')}
          </span>
          {topRightButtonBar}
        </div>
        <p className="mt-2 mb-2 font-open-sans text-gray-800">{textToDisplay}</p>
        <div className="flex flex-row justify-between items-center mt-4 mb-2">
          <div className="text-xs text-secondary mr-1 font-bold">{mayDeleteEntryAndSeeResponses ? '' : numberOfResponsesText}</div>
          <span className="text-gray-500 inline-block text-right text-xs font-open-sans">{date}</span>
        </div>
        {bottomButtonBar}
      </Link>
      {popupOnEntryAction}
    </>
  );

  return (
    <>
      {requestCard}
      {mayDeleteEntryAndSeeResponses && !deleted && responsesVisible
        ? <div className={responsesVisible ? '' : 'hidden'}><Responses id={id} collectionName={collectionName} /></div>
        : <></>}
    </>
  );
}
