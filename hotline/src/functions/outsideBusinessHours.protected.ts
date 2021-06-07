import axios from 'axios';

import '@twilio-labs/serverless-runtime-types';
import { Context, ServerlessCallback } from '@twilio-labs/serverless-runtime-types/types';
import { Environment } from '../types/Environment';

// This function plays the outside business hours message.
async function outsideBusinessHours(context: Context<Environment>, event: { From: string }, callback: ServerlessCallback) {
  await axios.post(context.SLACK_WEBHOOK_URL, { text: `Anruf von ${event.From} außerhalb der Hotline-Zeiten.` }).catch(() => {});

  const response = new Twilio.twiml.VoiceResponse();
  response.play({ loop: 1 }, `https://${context.DOMAIN_NAME}/OutsideHours.wav`);

  return callback(null, response);
};

export { outsideBusinessHours as handler };
