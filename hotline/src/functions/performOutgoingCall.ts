import '@twilio-labs/serverless-runtime-types';
import { Context, ServerlessCallback } from '@twilio-labs/serverless-runtime-types/types';
import { Environment } from '../types/Environment';

// Starts an outgoing call for a connection by the twilio web client
async function performOutgoingCall(context: Context<Environment>, event: { To: string }, callback: ServerlessCallback) {
    
    const response = new Twilio.twiml.VoiceResponse();

    if (event.To && isValidPhoneNumber(event.To)) {
        const dial = response.dial({
            answerOnBridge: true,
            callerId: context.CALLER_ID
        });
        dial.number({}, event.To);
    } else {
        response.say("Thanks for calling!");
    }

    return callback(null, response);
};

function isValidPhoneNumber(number: string): boolean {
  return /^[\d\+\-\(\) ]+$/.test(number);
}

export { performOutgoingCall as handler };
