import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';

export default async function isEmailVerified(user) {
  if (!user) {
    return false;
  }

  const token = await user.getIdTokenResult();
  const emailVerifiedStateFromToken = token.claims.email_verified;

  if (emailVerifiedStateFromToken !== user.emailVerified) {
    // eslint-disable-next-line no-console
    console.log('Tokens out of sync. Refreshing');
    const newToken = await user.getIdTokenResult(true);
    if (newToken.claims.email_verified !== user.emailVerified) {
      throw new Error('The state of the idToken and user.emailVerified is out of sync even after a refresh');
    }

    return newToken.claims.emailVerified;
  }

  return emailVerifiedStateFromToken;
}

export function useEmailVerified(auth) {
  const [user, isAuthLoading] = useAuthState(auth);

  const [state, setState] = useState({
    loading: true,
    emailVerified: false,
  });

  useEffect(() => {
    async function run() {
      setState({
        loading: true,
        emailVerified: false,
      });
      const isVerified = await isEmailVerified(user);
      setState({
        loading: false,
        emailVerified: isVerified,
      });
    }
    run();
  }, [user, isAuthLoading]);

  return [state.emailVerified, state.loading];
}
