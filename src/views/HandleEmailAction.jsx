import React, { useState, useRef, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useTranslation, Trans } from 'react-i18next';
import * as firebase from 'firebase';
import Popup from 'reactjs-popup';
import * as Sentry from '@sentry/browser';
import Loader from '../components/loader/Loader';
import StatusIndicator from '../components/StatusIndicator';
import { baseUrl } from '../appConfig';
import useQuery from '../util/useQuery';

export default function HandleEmailAction() {
  const { t } = useTranslation();
  const queryParams = useQuery();

  if (queryParams) {
    const continueUrl = queryParams.continueUrl && queryParams.continueUrl.split('#')[1];
    switch (queryParams.mode) {
      case 'signIn': return <SignInView continueUrl={continueUrl} />;
      case 'verifyEmail': return <VerifyEmailView continueUrl={continueUrl} actionCode={queryParams.oobCode} />;
      case 'resetPassword': return <ResetPasswordView continueUrl={continueUrl} actionCode={queryParams.oobCode} />;
      case 'recoverEmail': return <RecoverEmailView continueUrl={continueUrl} actionCode={queryParams.oobCode} />;
      default: {
        Sentry.captureException(new Error(`Unknown email handler action: ${queryParams.mode}`));
        return <StatusIndicator success={false} text={t('views.emailActions.unknownAction')} />;
      }
    }
  }

  return <Loader />;
}

function SignInView({ continueUrl }) {
  const { t } = useTranslation();
  const history = useHistory();

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState(window.localStorage.getItem('emailForSignIn'));

  const verifyUrl = () => {
    if (!firebase.auth().isSignInWithEmailLink(window.location.href)) {
      setError(t('views.emailActions.signIn.invalidLink'));
    }
  };

  const finishSignIn = async () => {
    try {
      await firebase.auth().signInWithEmailLink(email, window.location.href);

      // Remove query params in front of hash
      window.history.replaceState(null, null, window.location.pathname);
      history.replace(continueUrl || '/');
    } catch (err) {
      switch (err.code) {
        case 'auth/invalid-action-code': setError(t('views.emailActions.invalidToken')); break;
        case 'auth/invalid-email': setError(t('views.emailActions.signIn.invalidEmail')); break;
        default: setError(err.message);
      }

      Sentry.captureException(err);
    }

    window.localStorage.removeItem('emailForSignIn');
  };

  useEffect(() => {
    verifyUrl();
    setIsLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (email) {
      finishSignIn();
    }
  }, [email]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return <StatusIndicator success={false} text={error} />;
  }

  return (
    <>
      <Popup
        modal
        open={!isLoading && !email}
        lockScroll
        // we cannot set this with classes because the popup library has inline style, which would overwrite the width and padding again
        contentStyle={
          {
            padding: '0',
            width: 'auto',
            borderWidth: '0px',
            maxWidth: '90%',
            minWidth: '30%',
          }
        }
      >
        {(close) => (
          <div className="flex flex-col p-8 bg-kaki">
            <div className="font-teaser mb-6">
              {t('views.emailActions.signIn.mailYouRegistered')}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setEmail(new FormData(e.target).get('email'));
                close();
              }}
            >
              <label className="block text-gray-700 text-sm font-bold mb-1 text font-open-sans" htmlFor="email">
                {t('views.emailActions.signIn.email')}
              </label>
              <input
                className="appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none input-focus"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder={t('views.emailActions.signIn.yourEmail')}
                required="required"
              />
              <button type="submit" className="mt-4 btn-green w-full">{t('views.emailActions.continue')}</button>
            </form>
          </div>
        )}
      </Popup>
      <Loader />
    </>
  );
}

function VerifyEmailView({ continueUrl, actionCode }) {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [user, isAuthLoading] = useAuthState(firebase.auth());

  const verifyEmail = async () => {
    try {
      const tokenInfo = await firebase.auth().checkActionCode(actionCode);
      if (user && user.email !== tokenInfo.data.email) {
        await firebase.auth().signOut();
      }
      await firebase.auth().applyActionCode(actionCode);
      setLoading(false);
    } catch (err) {
      Sentry.captureException(err);
      setError(true);
    }
  };

  const resendVerificationLink = async () => {
    if (user) {
      try {
        // ContinueURL already contains trailing '/' so we don't need to add it
        await user.sendEmailVerification({ url: `${baseUrl}/#${continueUrl}` });
        setResendSuccess(true);
      } catch (err) {
        Sentry.captureException(err);
      }
    }
  };

  useEffect(() => {
    verifyEmail();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (resendSuccess) {
    return (
      <StatusIndicator success text={t('views.emailActions.verifyEmail.emailResent')}>
        {continueUrl ? <Link className="btn-green mt-10" to={continueUrl}>{t('views.emailActions.continue')}</Link> : null}
      </StatusIndicator>
    );
  }

  if (error) {
    return (
      <StatusIndicator success={false} text={t('views.emailActions.invalidToken')}>
        <div className="flex flex-col">
          {!isAuthLoading && user && <button type="button" className="btn-green mt-10" onClick={resendVerificationLink}>{t('views.emailActions.verifyEmail.resendEmail')}</button>}
          <Link className="btn-green-secondary mt-2" to="/">{t('views.emailActions.verifyEmail.toHome')}</Link>
        </div>
      </StatusIndicator>
    );
  }

  return (
    <Loader waitOn={!loading}>
      <StatusIndicator success text={t('views.emailActions.verifyEmail.verificationSuccess')}>
        {continueUrl ? <Link className="btn-green mt-10" to={continueUrl}>{t('views.emailActions.continue')}</Link> : null}
      </StatusIndicator>
    </Loader>
  );
}

function ResetPasswordView({ continueUrl, actionCode }) {
  const [tokenInvalid, setTokenInvalid] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const [password, setPassword] = useState('');
  const passwordInput = useRef();
  const passwordRepeatInput = useRef();

  const { t } = useTranslation();

  const verifyToken = async () => {
    try {
      await firebase.auth().verifyPasswordResetCode(actionCode);
    } catch (err) {
      setTokenInvalid(true);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();

    await verifyToken();

    if (tokenInvalid) return;

    try {
      await firebase.auth().confirmPasswordReset(actionCode, password);

      setSuccess(true);
    } catch (err) {
      switch (err.code) {
        case 'auth/expired-action-token': setTokenInvalid(true); break;
        case 'auth/invalid-action-token': setTokenInvalid(true); break;
        case 'auth/weak-password': setError(t('views.emailActions.resetPassword.pwTooShort')); break;
        default: setError(err.message);
      }
    }
  };

  const comparePasswords = () => {
    if (passwordInput.current.value !== passwordRepeatInput.current.value) {
      passwordRepeatInput.current.setCustomValidity(t('views.emailActions.resetPassword.pwMismatch'));
    } else {
      passwordRepeatInput.current.setCustomValidity('');
    }
  };

  useEffect(() => {
    const init = async () => {
      await verifyToken();
      setLoading(false);
    };
    init();
  }, [actionCode]); // eslint-disable-line react-hooks/exhaustive-deps

  if (tokenInvalid) {
    return <StatusIndicator success={false} text={t('views.emailActions.invalidToken')} />;
  }

  if (success) {
    return (
      <StatusIndicator success text={t('views.emailActions.resetPassword.success')}>
        {continueUrl ? <Link className="btn-green mt-10" to={continueUrl}>{t('views.emailActions.continue')}</Link> : null}
      </StatusIndicator>
    );
  }

  return (
    <Loader waitOn={!loading}>
      <div className="p-4 mt-8">
        <form onSubmit={resetPassword}>
          <div className="mb-4">
            <div className="font-teaser mb-6">
              {t('views.emailActions.resetPassword.heading')}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-1 text font-open-sans" htmlFor="password">
              {t('views.emailActions.resetPassword.newPassword')}
            </label>
            <input
              ref={passwordInput}
              className="appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none input-focus"
              id="password"
              type="password"
              placeholder={t('views.emailActions.resetPassword.yourPw')}
              value={password}
              required="required"
              minLength="12"
              autoComplete="new-password"
              onChange={(e) => {
                comparePasswords();
                setPassword(e.target.value);
              }}
            />
          </div>
          <div className="mb-8">
            <label className="block text-gray-700 text-sm font-bold mb-1 text font-open-sans" htmlFor="password_repeat">
              {t('views.emailActions.resetPassword.repeatPassword')}
            </label>
            <input
              ref={passwordRepeatInput}
              className="appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none input-focus"
              id="password_repeat"
              type="password"
              autoComplete="new-password"
              placeholder={t('views.emailActions.resetPassword.confirmPassword')}
              required="required"
              onChange={comparePasswords}
            />
          </div>
          {error && <div data-cy="error-label" className="text-red-500">{error}</div>}
          <div className="flex justify-end mt-6">
            <button
              className="btn-green w-full"
              type="submit"
            >
              {t('views.emailActions.resetPassword.changePassword')}
            </button>
          </div>
        </form>
      </div>
    </Loader>
  );
}

function RecoverEmailView({ continueUrl, actionCode }) {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [tokenInvalid, setTokenInvalid] = useState(false);
  const [recoveredEmail, setRecoveredEmail] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [pwResetSent, setPwResetSent] = useState(false);
  const [error, setError] = useState(false);

  const verifyToken = async () => {
    try {
      const tokenInfo = await firebase.auth().checkActionCode(actionCode);
      return tokenInfo.data.email;
    } catch (err) {
      setTokenInvalid(true);
      return null;
    }
  };

  const resetEmail = async () => {
    try {
      await firebase.auth().applyActionCode(actionCode);

      setResetSuccess(true);
    } catch (err) {
      switch (err.code) {
        case 'auth/expired-action-token': setTokenInvalid(true); break;
        case 'auth/invalid-action-token': setTokenInvalid(true); break;
        default: setError(true);
      }
    }
  };

  const sendPwResetLink = async () => {
    try {
      await firebase.auth().sendPasswordResetEmail(recoveredEmail);
    } catch (err) {
      setError(true);
    }

    setPwResetSent(true);
  };

  useEffect(() => {
    const init = async () => {
      setRecoveredEmail(await verifyToken());
      setLoading(false);
    };

    init();
  }, [actionCode]); // eslint-disable-line react-hooks/exhaustive-deps

  if (tokenInvalid) {
    return <StatusIndicator success={false} text={t('views.emailActions.invalidToken')} />;
  }

  if (error) {
    return <StatusIndicator success={false} text={t('views.emailActions.recoverEmail.error')} />;
  }

  if (pwResetSent) {
    return (
      <StatusIndicator success text={t('views.emailActions.recoverEmail.pwResetSent')}>
        {continueUrl ? <Link className="btn-green mt-10" to={continueUrl}>{t('views.emailActions.continue')}</Link> : null}
      </StatusIndicator>
    );
  }

  if (resetSuccess) {
    return (
      <StatusIndicator success text={t('views.emailActions.recoverEmail.resetSuccess')}>
        <div className="flex flex-col w-full mt-10">
          <button className="btn-green w-full mt-2" type="button" onClick={sendPwResetLink}>
            {t('views.emailActions.recoverEmail.resetPassword')}
          </button>
          <Link className="mt-2 btn-green-secondary block w-full" to={continueUrl || '/'}>
            {t('views.emailActions.recoverEmail.continueNoReset')}
          </Link>
        </div>
      </StatusIndicator>
    );
  }

  return (
    <Loader waitOn={!loading}>
      <div className="p-4 mt-8">
        <div className="mb-4">
          <div className="font-teaser mb-6">
            {t('views.emailActions.recoverEmail.heading')}
          </div>
        </div>
        <div className="mb-4">
          <Trans i18nKey="views.emailActions.recoverEmail.wantRecovery">
            text
            <strong>{{ recoveredEmail }}</strong>
            text
          </Trans>
        </div>
        <button className="btn-green w-full mt-2" type="button" onClick={resetEmail}>
          {t('views.emailActions.recoverEmail.resetEmail')}
        </button>
        <Link className="mt-2 btn-green-secondary block w-full" to="/">
          {t('views.emailActions.recoverEmail.abortToHome')}
        </Link>
      </div>
    </Loader>
  );
}
