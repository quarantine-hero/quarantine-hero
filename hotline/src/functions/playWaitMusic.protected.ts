import '@twilio-labs/serverless-runtime-types';
import { Context, ServerlessCallback } from '@twilio-labs/serverless-runtime-types/types';
import { Environment } from '../types/Environment';

// This whole function gets called repeatedly (i.e. as soon as execution is finished, it gets called again) until the caller is dequeued.
function playWaitMusic(context: Context<Environment>, event: { QueueTime: number }, callback: ServerlessCallback) {
  const response = new Twilio.twiml.VoiceResponse();

  // On every execution, we get the current wait time and if it exceeds a threshold, we dequeue the caller.
  const waitTime = event.QueueTime;
  if (waitTime >= 60) {
    // We leave the queue and the control is handed back to the handleIncomingCall function, which will invoke the 'no agent available' function
    response.leave();
    return callback(null, response);
  }

  // IMPORTANT: Use a short audio here as the length of the audio is the lower limit for the waiting time of a user
  response.play({ loop: 1 }, `https://${context.DOMAIN_NAME}/Waiting.wav`);

  return callback(null, response);
};

export { playWaitMusic as handler };
