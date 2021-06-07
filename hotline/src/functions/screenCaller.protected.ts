import '@twilio-labs/serverless-runtime-types';
import { Context, ServerlessCallback } from '@twilio-labs/serverless-runtime-types/types';
import { Environment } from '../types/Environment';

// This function is called whenever someone calls the hotline. The caller will be informed about what the hotline is for.
// Then, control will be passed to the main call handler.
function screenCaller(context: Context<Environment>, event: { QueueTime: number }, callback: ServerlessCallback) {
  const response = new Twilio.twiml.VoiceResponse();

  response.play({ loop: 1 }, `https://${context.DOMAIN_NAME}/ScreenCaller.wav`);
  response.redirect(`https://${context.DOMAIN_NAME}/handleSimulring`);

  return callback(null, response);
};

export { screenCaller as handler };
