import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import * as Sentry from '@sentry/browser';
import { GeoFirestore } from 'geofirestore';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import fb from '../firebase';
import { getGeodataForPlace, getLatLng } from '../services/GeoService';
import Loader from '../components/loader/Loader';
import buildSha1Hash from '../util/buildHash';
import useQuery from '../util/useQuery';

export default function CompleteNotification() {
  const { t } = useTranslation();
  const queryParams = useQuery();
  const [user] = useAuthState(fb.auth);

  const [isLoading, setLoading] = useState(true);
  const [location, setLocation] = useState('');
  const [success, setSuccess] = useState(false);

  const createNotification = async (loc, placeId, email) => {
    if (!placeId) {
      throw new Error('PlaceId was undefined in ask-for-help');
    }

    const geoData = await getGeodataForPlace(placeId);
    const { plz } = geoData;
    const { lat, lng } = getLatLng(geoData);

    const geofirestore = new GeoFirestore(fb.store);
    const notificationCollection = geofirestore.collection('notifications');

    // Create will work but subsequent updates will fail. This is to prevent duplicates
    await notificationCollection.doc(await buildSha1Hash(`${email}_${plz}`)).set({
      email,
      location: loc,
      plz,
      uid: firebase.auth().currentUser.uid,
      timestamp: Date.now(),
      coordinates: new fb.app.firestore.GeoPoint(lat, lng),
    });

    fb.analytics.logEvent('success_subscribe_region_confirmation');
  };

  useEffect(() => {
    async function completeNotification() {
      const { location: loc, placeId } = queryParams;

      setLocation(loc);
      try {
        await createNotification(loc, placeId, user.email);
        setSuccess(true);
      } catch (err) {
        Sentry.captureException(err);
      }
      setLoading(false);
    }

    if (user) {
      completeNotification();
    }
  }, [queryParams, user]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return <Loader />;
  }

  if (!success) {
    return (
      <>
        <h1 className="text-2xl font-exo2 mt-10 mb-6">{t('views.completeNotification.anErrorOccured')}</h1>
        <p>
          {t('views.completeNotification.error')}
        </p>
        <div className="flex justify-center flex-col items-center mb-8">
          <img className="h-48 w-48 my-10" src={require('../assets/error.svg').default} alt="" />
          <Link className="btn-green mt-10" to="/notify-me">{t('views.completeNotification.tryAgain')}</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-exo2 mt-10 mb-6">{t('views.completeNotification.youAreHero')}</h1>
      <p>
        {t('views.completeNotification.mailVerified')}
        {' '}
        <span className="text-secondary">{location}</span>
        {' '}
        {t('views.completeNotification.needsHelp')}
      </p>
      <div className="flex justify-center flex-col items-center mb-8">
        <img className="h-48 w-48 my-10" src={require('../assets/success.svg').default} alt="" />
        <Link className="btn-green mt-10" to="/dashboard">{t('views.completeNotification.toYourOverview')}</Link>
      </div>
    </>
  );
}
