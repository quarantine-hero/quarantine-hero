import '@twilio-labs/serverless-runtime-types';
import { Context, ServerlessCallback } from '@twilio-labs/serverless-runtime-types/types';
import { Environment } from '../types/Environment';

// Check whether we are actually connected to a human and not to an answering machine.
function screenAgent(context: Context<Environment>, event: {}, callback: ServerlessCallback) {
  const response = new Twilio.twiml.VoiceResponse();

  // Gather waits for any digit to be pressed
  const gather = response.gather({
    action: `https://${context.DOMAIN_NAME}/connectAgent`, // If a digit is pressed, continue here
    numDigits: 1,
    timeout: 5
  });
  gather.pause({ length: 1 });
  gather.say({ language: 'de-DE' }, 'Hier ist die QH Hotline. Drücke eine beliebige Taste um verbunden zu werden.');

  // If there was no input, hangup
  response.say({ language: 'de-DE' }, 'Keine Antwort erhalten. Tschüss.');
  response.hangup();

  return callback(null, response);
};

export { screenAgent as handler };
