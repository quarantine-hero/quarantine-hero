import React, { useState } from 'react';
import fb from '../firebase';
import LocationInput from '../components/LocationInput';
import Footer from '../components/Footer';
import dems from '../assets/dems.json';

export default function NotifyMe() {

  // TODO: add functionality to all mail places

  const [email, setEmail] = useState('');
  const [signInLinkSent, setSignInLinkSent] = useState(false);
  const [location, setLocation] = useState('');
  const [submitAllowed, setSubmitAllowed] = useState(false);

  const handleSubmit = async () => {
    window.localStorage.setItem('emailForSignIn', email);

    try {
      await fb.auth.sendSignInLinkToEmail(email, {
        url: 'https://quarantaenehelden.org/#/complete-offer-help?location=' + location + '&email=' + email,
        handleCodeInApp: true,
      });
      fb.analytics.logEvent('success_subscribe_region');

      setSignInLinkSent(true);

    } catch (error) {
      // TODO: handle error
    }
  };

  const handleChange = address => {
    setLocation(address);
    setSubmitAllowed(!!(address) && !!(email));
  };

  const handleSelect = address => {
    setLocation(address);
  };

  function checkForDEM(mail) {
    if(mail.includes('@')) {
      var domain = mail.substring(email.lastIndexOf("@") +1);
      // check if the mail address is included in the DEM-list
      if (dems.includes(domain)) {
        // this is a DEM
        // todo: show error
        setSubmitAllowed(false);
      } else {
        // this is not a DEM
        setSubmitAllowed(!!(location) && !!(mail));
        setEmail(mail);
      }
    }
  };

  if (signInLinkSent) {
    return (
      <div  className="p-4">
        <div className="font-teaser my-6">
          Lass Dich benachrichtigen, wenn Jemand in Deiner Umgebung Hilfe braucht.
        </div>
        <div className="border bg-secondary px-4 py-2 rounded text-white flex flex-row items-center border">
          Wir haben dir eine Email gesendet! Bitte überprüfe dein Postfach und klicke auf den Link in unserer Email! Wir
          werden dich dann benachrichtigen, wenn Leute in {location} Hilfe benötigen.
        </div>
      </div>

    )
  } else {
    return (
      <div className="p-4">
        <div className="font-teaser my-6">
          Lass Dich benachrichtigen, wenn Jemand in Deiner Umgebung Hilfe braucht.
        </div>
        <form onSubmit={handleSubmit}>
          <LocationInput required={true} onChange={handleChange} value={location} onSelect={handleSelect}/>
          <input className="input-focus my-6" type="email" placeholder="Deine Emailadresse"
                onChange={(e) => checkForDEM(e.target.value)} value={email} required={true}></input>
          <button className="mt-6 btn-green w-full disabled:opacity-75 disabled:cursor-not-allowed" type="submit" disabled={!submitAllowed}>
            Benachrichtige mich wenn jemand in {location && location !== '' ? `der Nähe von ${location}` : 'meiner Nähe'} Hilfe braucht!
          </button>
        </form>
        <Footer />
      </div>
    );
  }
};
