import '@twilio-labs/serverless-runtime-types';
import { Context, ServerlessCallback } from '@twilio-labs/serverless-runtime-types/types';
import { google, sheets_v4 } from 'googleapis';
import { Environment } from '../types/Environment';

// Main entry point for incoming hotline calls
async function handleIncomingCall(context: Context<Environment>, event: { From: string }, callback: ServerlessCallback) {
  // Test for blocked numbers
  const [, ...blockListData] = await getSheetData(context);
  const blockedNumbers = blockListData.map((row) => row[0]);
  if (blockedNumbers.includes(event.From)) {
    const response = new Twilio.twiml.VoiceResponse();
    response.hangup();
    return callback(null, response);
  }

  // Pick up the call and start screening the user about what the hotline is.
  const response = new Twilio.twiml.VoiceResponse();
  response.redirect(`https://${context.DOMAIN_NAME}/screenCaller`);
  return callback(null, response);
};

async function getSheetData(context: Context<Environment>): Promise<string[][]> {
  const { SPREADSHEET_ID, SERVICE_ACCOUNT_EMAIL, BLOCK_LIST_SHEET, PRIVATE_KEY_1, PRIVATE_KEY_2, PRIVATE_KEY_3, PRIVATE_KEY_4, PRIVATE_KEY_5 } = context;
  const PRIVATE_KEY = PRIVATE_KEY_1 + PRIVATE_KEY_2 + PRIVATE_KEY_3 + PRIVATE_KEY_4 + PRIVATE_KEY_5;

  const spreadsheetParams = {
    spreadsheetId: SPREADSHEET_ID,
    range: BLOCK_LIST_SHEET,
  };

  const auth = new google.auth.JWT(SERVICE_ACCOUNT_EMAIL, undefined, PRIVATE_KEY, ['https://www.googleapis.com/auth/spreadsheets']);
  const sheetsApi = google.sheets({ version: 'v4', auth });

  return new Promise<string[][]>((resolve, reject) => {
    sheetsApi.spreadsheets.values.get(spreadsheetParams, (err: Error | null, response?: { data: sheets_v4.Schema$ValueRange } | null) => {
      if (err || !response?.data.values) {
        reject(err || 'No data');
      } else {
        resolve(response?.data.values);
      }
    });
  })
}

export { handleIncomingCall as handler };
