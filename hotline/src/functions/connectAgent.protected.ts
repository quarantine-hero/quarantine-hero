import '@twilio-labs/serverless-runtime-types';
import { Context, ServerlessCallback } from '@twilio-labs/serverless-runtime-types/types';
import { Environment } from '../types/Environment';

// Connects the agent to the first caller in queue
async function connectAgent(context: Context<Environment>, event: {}, callback: ServerlessCallback) {
  const response = new Twilio.twiml.VoiceResponse();

  // Signal that you are now connected
  response.say({ language: 'de-DE' }, 'Du wirst verbunden in 3, 2, 1');

  const dial = response.dial({
    timeout: 1 // Prevent hotline agent from waiting if there is no caller in the queue
  });

  // Connect hotline agent with caller in queue
  dial.queue({
    url: `https://${context.DOMAIN_NAME}/handleConnectedCall`
  }, 'hotline');

  response.say({ language: 'de-DE' }, 'Entweder jemand anderes hat den Anruf entgegen genommen oder dein Anruf ist vorbei. Tschüss.');

  return callback(null, response);
};

export { connectAgent as handler };
