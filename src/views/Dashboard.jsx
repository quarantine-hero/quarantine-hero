import React, { useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionDataOnce } from 'react-firebase-hooks/firestore';
import { useTranslation } from 'react-i18next';
import Popup from 'reactjs-popup';
import * as firebase from 'firebase/app';
import * as Sentry from '@sentry/browser';
import fb from '../firebase';
import Entry from '../components/entry/Entry';
import useQuery from '../util/useQuery';

const askForHelpCollection = fb.store.collection('ask-for-help');
const notificationCollection = fb.store.collection('notifications');
const solvedPostsCollection = fb.store.collection('solved-posts');

function Notification(props) {
  const { t } = useTranslation();
  const {
    location,
  } = props;
  const onDeleteClick = () => {
    notificationCollection.doc(props.id).delete();
  };

  return (
    <div>
      <div className="shadow rounded border mb-4 px-4 py-2 flex justify-between">
        {t('views.dashboard.youWillBeNotified')}
        {' '}
        {location}
        {' '}
        {t('views.dashboard.needsHelp')}
        <button type="button" className="cursor-pointer font-bold" onClick={onDeleteClick}>
          &times;
        </button>
      </div>
    </div>
  );
}

// Commented out until there is a consistent way of showing placeholders on the site
// function DashboardLoading() {
//   const { t } = useTranslation();
//   return <div className="font-open-sans my-8 text-lg text-center">{t('views.dashboard.isLoading')}</div>;
// }

function Dashboard(props) {
  const { user } = props;
  const { t } = useTranslation();

  const [isOpenEntriesView, setIsOpenEntriesView] = useState(true);

  const { solve: attemptingToSolve, delete: attemptingToDelete, entry: entryIdFromUrl } = useQuery();

  const [requestsForHelpUnsorted, isLoadingRequestsForHelp] = useCollectionDataOnce(
    askForHelpCollection.where('d.uid', '==', user.uid),
    { idField: 'id' },
  );
  const requestsForHelp = (requestsForHelpUnsorted || [])
    .map((doc) => ({ ...doc.d, id: doc.id }))
    .sort((a, b) => b.timestamp - a.timestamp);

  const [offersDocs, isLoadingOffers] = useCollectionDataOnce(
    notificationCollection.where('d.uid', '==', user.uid),
    { idField: 'id' },
  );
  const offers = (offersDocs || []).map((doc) => ({ ...doc.d, id: doc.id }));

  const [solvedPostsDocs, isLoadingSolvedPosts] = useCollectionDataOnce(
    solvedPostsCollection.where('d.uid', '==', user.uid),
    { idField: 'id' },
  );
  const solvedPosts = (solvedPostsDocs || [])
    .map((doc) => ({ ...doc.d, id: doc.id }))
    .sort((a, b) => b.timestamp - a.timestamp);

  if (isLoadingRequestsForHelp || isLoadingOffers || isLoadingSolvedPosts) {
    // Commented out until there is a consistent way of showing placeholders on the site
    // return <DashboardLoading />;
  }

  const OpenRequests = () => (
    <div>
      {requestsForHelp.length === 0
        ? (
          <div className="font-open-sans my-4">
            {t('views.dashboard.noRequests')}
            {' '}
            <Link className="text-secondary hover:underline" to="/ask-for-help" onClick={() => fb.analytics.logEvent('button_want_to_help')}>{t('views.dashboard.here')}</Link>
            {' '}
            {t('views.dashboard.create')}
            .
          </div>
        )
        : requestsForHelp.map((entry) => (
          <Entry
            key={entry.id}
            location={entry.location}
            id={entry.id}
            request={entry.request}
            timestamp={entry.timestamp}
            responses={entry.responses}
            reportedBy={entry.reportedBy}
            uid={entry.uid}
            showSolveHint={attemptingToSolve && !attemptingToDelete && entry.responses > 0 && entryIdFromUrl === entry.id}
            showDeleteHint={!attemptingToSolve && attemptingToDelete && entryIdFromUrl === entry.id}
            owner
          />
        ))}
    </div>
  );

  const ResolvedRequests = () => (
    <div>
      {solvedPosts.length === 0
        ? (
          <div className="font-open-sans my-4">
            {t('views.dashboard.noResolvedRequests')}
            {' '}
            <Link className="text-secondary hover:underline" to="/ask-for-help" onClick={() => fb.analytics.logEvent('button_want_to_help')}>{t('views.dashboard.here')}</Link>
            {' '}
            {t('views.dashboard.create')}
            .
          </div>
        )
        : solvedPosts.map((entry) => (
          <Entry
            key={entry.id}
            location={entry.location}
            id={entry.id}
            request={entry.request}
            timestamp={entry.timestamp}
            responses={entry.responses}
            reportedBy={entry.reportedBy}
            uid={entry.uid}
            showAsSolved
            owner
          />
        ))}
    </div>
  );

  return (
    <div className="pt-0 md:pt-4">
      <div className="w-full flex justify-center mt-4">
        <div className="bg-primary -mb-8 rounded-full bg-red-500 w-48 text-center text-xs text-white font-bold py-2 font-open-sans">
          {t('views.dashboard.doYouNeedHelp')}
        </div>
      </div>
      <div className="bg-kaki p-4 mt-3 pt-8 md:mx-0">
        <h1 className="font-teaser">{t('views.dashboard.yourRequests')}</h1>
        <div className="flex flex-row justify-center py-4">
          <button
            type="button"
            data-cy="tabs-open"
            onClick={() => {
              setIsOpenEntriesView(true);
            }}
            className={`text-white items-center rounded-l px-1 py-1 xs:px-6 md:py-2 btn-main
            ${isOpenEntriesView ? 'btn-dark-green' : 'btn-light-green'} hover:opacity-75`}
          >
            {t('views.dashboard.tabs.open')}
          </button>
          <button
            type="button"
            data-cy="tabs-solved"
            onClick={() => {
              setIsOpenEntriesView(false);
            }}
            className={`text-white items-center rounded-r px-1 py-1 xs:px-6 md:py-2 btn-main
             ${isOpenEntriesView ? 'btn-light-green' : 'btn-dark-green'} hover:opacity-75`}
          >
            {t('views.dashboard.tabs.solved')}
          </button>
        </div>

        {isOpenEntriesView ? (
          <OpenRequests data-cy="tabs-open-content" />
        ) : (
          <ResolvedRequests data-cy="tabs-solved-content" />
        )}
      </div>

      <div className="w-full flex justify-center mt-10">
        <div className="bg-primary -mb-8 rounded-full bg-red-500 w-48 text-center text-xs text-white font-bold py-2 font-open-sans">
          {t('views.dashboard.doYouWantToHelp')}
        </div>
      </div>
      <div className="bg-kaki p-4 mt-3 pt-8 md:mx-0">
        <h1 className="font-teaser py-4 pt-0">{t('views.dashboard.yourNotifications')}</h1>

        {
          offers.length === 0
            ? (
              <div className="font-open-sans">
                {t('views.dashboard.noNotificationsSubscribed')}
                {' '}
                <Link className="text-secondary hover:underline" to="/notify-me" onClick={() => fb.analytics.logEvent('button_subscribe_region')}>{t('views.dashboard.here')}</Link>
                {' '}
                {t('views.dashboard.register')}
                .
              </div>
            )
            : offers.map((offer) => <Notification location={offer.location} id={offer.id} key={offer.id} />)
        }
      </div>

      <div className="mt-12">
        <DeleteAccountButton className="rounded text-white p-3 mr-4 md:mr-0 btn-main bg-primary hover:opacity-75 float-right" user={user} />
      </div>
    </div>
  );
}

function DeleteAccountButton({ user, className }) {
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const deleteAccount = async (e) => {
    e.preventDefault();

    const pw = new FormData(e.target).get('password');

    try {
      const credentials = await firebase.auth.EmailAuthProvider.credential(user.email, pw);
      await user.reauthenticateWithCredential(credentials);

      user.delete();
    } catch (err) {
      switch (err.code) {
        case 'auth/wrong-password': setError(t('components.deleteAccountButton.wrongPassword')); break;
        default: {
          setError(err.message);
          Sentry.captureException(err);
        }
      }
    }
  };

  return (
    <Popup
      modal
      trigger={<button type="button" className={className}>{t('components.deleteAccountButton.deleteAccount')}</button>}
      onClose={() => setError('')}
      // we cannot set this with classes because the popup library has inline style, which would overwrite the width and padding again
      contentStyle={
        {
          padding: '0',
          width: 'auto',
          maxWidth: '90%',
          minWidth: '30%',
          borderWidth: '0px',
        }
      }
    >
      {(close) => (
        <div className="flex flex-col p-8 bg-kaki">
          <div className="font-teaser mb-6">
            {t('components.deleteAccountButton.confirmDeletion')}
          </div>
          <form onSubmit={deleteAccount}>
            <label className="block text-gray-700 text-sm font-bold mb-1 text font-open-sans" htmlFor="password_repeat">
              {t('components.deleteAccountButton.password')}
            </label>
            <input
              className="appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none input-focus"
              id="password_repeat"
              name="password"
              type="password"
              autoComplete="password"
              placeholder={t('components.deleteAccountButton.repeatePassword')}
              required="required"
            />
            {error && <div data-cy="error-label" className="text-red-500">{error}</div>}
            <button type="submit" className="mt-4 rounded text-white p-3 btn-main bg-primary hover:opacity-75 float-right w-full">{t('components.deleteAccountButton.deleteFinally')}</button>
          </form>
          <button type="button" className="mt-2 btn-green-secondary" onClick={close}>{t('components.deleteAccountButton.abort')}</button>
        </div>
      )}
    </Popup>
  );
}

export default function DashboardWithAuth() {
  const [user, isAuthLoading] = useAuthState(fb.auth);

  if (isAuthLoading) {
    // Commented out until there is a consistent way of showing placeholders on the site
    // return <DashboardLoading />;
    return null;
  }

  if (!user || !user.email) {
    return <Redirect to="/signin/dashboard" />;
  }

  return <Dashboard user={user} />;
}
