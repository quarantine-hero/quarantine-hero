import '@twilio-labs/serverless-runtime-types';
import { Context, ServerlessCallback } from '@twilio-labs/serverless-runtime-types/types';
import { Environment } from '../types/Environment';

// Creates a token that can be used by the twilio client to do outgoing calls
async function getToken(context: Context<Environment>, event: { apiKey: string }, callback: ServerlessCallback) {
    if(event.apiKey !== context.API_KEY) {
        callback('Unauthorized');
        return;
    }

    const capability = new Twilio.jwt.ClientCapability({
        accountSid: context.ACCOUNT_SID,
        authToken: context.AUTH_TOKEN,
        ttl: 2000
    });
    capability.addScope(
        new Twilio.jwt.ClientCapability.OutgoingClientScope({ applicationSid: context.TWIML_APP_SID })
    );
    const token = capability.toJwt();

    const response = new Twilio.Response();
    response.appendHeader('Content-Type', 'application/jwt');
    response.setBody(token);

    return callback(null, response);
};

export { getToken as handler };
