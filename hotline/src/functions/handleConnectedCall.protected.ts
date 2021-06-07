import axios from 'axios';

import '@twilio-labs/serverless-runtime-types';
import { Context, ServerlessCallback } from '@twilio-labs/serverless-runtime-types/types';
import { Environment } from '../types/Environment';

// Handler that gets called whenever a user gets dequeued
async function handleConnectedCall(context: Context<Environment>, event: { From: string }, callback: ServerlessCallback) {
  await axios.post(context.SLACK_WEBHOOK_URL, { text: `Anruf von ${event.From} wurde entgegen genommen.` }).catch(() => {});

  // Instead of returning nothing, we could return a message for the caller here
  return callback(null, '');
};

export { handleConnectedCall as handler };
