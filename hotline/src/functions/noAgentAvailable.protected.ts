import axios from 'axios';

import '@twilio-labs/serverless-runtime-types';
import { Context, ServerlessCallback } from '@twilio-labs/serverless-runtime-types/types';
import { Environment } from '../types/Environment';

// This function plays the no agent available message.
async function noAgentAvailable(context: Context<Environment>, event: { From: string }, callback: ServerlessCallback) {
  const callbackLink = `https://${context.DOMAIN_NAME}/index.html?to=${encodeURIComponent(event.From)}&apiKey=${encodeURIComponent(context.API_KEY)}`;
  await axios.post(context.SLACK_WEBHOOK_URL, {
    text: `Anruf von ${event.From} wurde nicht entgegen genommen.\nJetzt zurückrufen: ${callbackLink}`
  }).catch(() => {});

  const response = new Twilio.twiml.VoiceResponse();
  response.play({ loop: 1 }, `https://${context.DOMAIN_NAME}/NoAgentAvailable.wav`);

  return callback(null, response);
};

export { noAgentAvailable as handler };
