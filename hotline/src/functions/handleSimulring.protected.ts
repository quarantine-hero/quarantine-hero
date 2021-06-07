import axios from 'axios';
import * as twilio from 'twilio';
import { google, sheets_v4 } from 'googleapis';
import moment from 'moment-timezone';

import '@twilio-labs/serverless-runtime-types';
import { Context, ServerlessCallback } from '@twilio-labs/serverless-runtime-types/types';
import { Environment } from '../types/Environment';

// Main entry point for incoming hotline calls
async function handleIncomingCall(context: Context<Environment>, event: { From: string }, callback: ServerlessCallback) {
  const twilioClient = context.getTwilioClient();

  try {
    // First, get the sheet data that is needed at several places
    const availabilitySheetData = await getSheetData(context);

    // First, check if the call is outside the business hours. If so, play the corresponding message.
    const outsideBusinessHours = await isOutsideBusinessHours(availabilitySheetData);
    if (outsideBusinessHours) {
      const response = new Twilio.twiml.VoiceResponse();
      response.redirect(`https://${context.DOMAIN_NAME}/outsideBusinessHours`);
      return callback(null, response);
    }

    // Second, retrieve all agents that are registered for the current time
    const hotlineAgents = await getAgentsOnDuty(availabilitySheetData, Number.parseInt(context.OFFSET_TOP, 10));
    
    // If there are no agents available, play the corresponding message and hang up
    if (hotlineAgents.length === 0) {
      const response = new Twilio.twiml.VoiceResponse();
      response.redirect(`https://${context.DOMAIN_NAME}/noAgentAvailable`);
      return callback(null, response);
    }
    
    // If there are agents, start our smart simulring process
    const response = await smartSimulring(twilioClient, hotlineAgents, context);
    return callback(null, response);
  } catch (err) {
    const response = new Twilio.twiml.VoiceResponse();
    response.redirect(`https://${context.DOMAIN_NAME}/noAgentAvailable`);

    await axios.post(context.SLACK_WEBHOOK_URL, { text: `An error occurred: ${err}` }).catch(() => { });

    callback(null, response);
  }
};


async function isOutsideBusinessHours(sheetData: string[][]): Promise<boolean> {
  const businessHours = sheetData[0][1];
  const [from, to] = businessHours.split('-').map((data) => data.trim());

  const now = moment().tz('Europe/Berlin');
  const [dateString] = now.toISOString().split('T');
  const startOfBusinessDay = moment.tz(`${dateString}T${from}`, 'Europe/Berlin');
  const endOfBusinessDay = moment.tz(`${dateString}T${to}`, 'Europe/Berlin');

  // Returns true, if the current time is *outside* the business hours, else returns false
  return startOfBusinessDay >= now || endOfBusinessDay <= now;
}

async function getAgentsOnDuty(sheetData: string[][], offsetTop: number): Promise<string[]> {
  const now = moment().tz('Europe/Berlin');
  const dayOfWeek = (now.get('weekday') + 6) % 7; // Convert from sunday=0 to monday=0 
  const hourOfDay = now.get('hour');

  const rowOffset = offsetTop + dayOfWeek * 24 + hourOfDay;
  const row = sheetData[rowOffset];

  console.log(JSON.stringify(sheetData), offsetTop, dayOfWeek, hourOfDay, rowOffset, row);
  const activeAgentsIndices = row.reduce<number[]>((indices, col, index) => {
    if(col === 'TRUE') {
      return [...indices, index];
    }
    
    return [...indices];
  }, []);

  const activeAgentsNumbers = activeAgentsIndices.map((index) => sheetData[offsetTop - 1][index]);

  return activeAgentsNumbers;
}

async function getSheetData(context: Context<Environment>): Promise<string[][]> {
  const { SPREADSHEET_ID, SERVICE_ACCOUNT_EMAIL, AVAILABILITY_SHEET, PRIVATE_KEY_1, PRIVATE_KEY_2, PRIVATE_KEY_3, PRIVATE_KEY_4, PRIVATE_KEY_5 } = context;
  const PRIVATE_KEY = PRIVATE_KEY_1 + PRIVATE_KEY_2 + PRIVATE_KEY_3 + PRIVATE_KEY_4 + PRIVATE_KEY_5;

  const spreadsheetParams = {
    spreadsheetId: SPREADSHEET_ID,
    range: AVAILABILITY_SHEET,
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

async function smartSimulring(twilioClient: twilio.Twilio, hotlineAgents: Array<string>, context: Context<Environment>) {
  const response = new Twilio.twiml.VoiceResponse();
  // Enqueue the caller. The caller will be dequeued by the first agent that answers.
  response.enqueue({
    waitUrl: `https://${context.DOMAIN_NAME}/playWaitMusic`
  }, 'hotline');

  // Calls each hotline agent and screens them
  for (const hotlineAgent of hotlineAgents) {
    try {
      await twilioClient.calls.create({
        url: `https://${context.DOMAIN_NAME}/screenAgent`,
        to: hotlineAgent,
        from: context.CALLER_ID,
      });
    } catch (err) {
      console.log(err);
    }
  }

  // If no agent picked up, play no agent available message
  response.redirect(`https://${context.DOMAIN_NAME}/noAgentAvailable`);

  return response;
}

export { handleIncomingCall as handler };
