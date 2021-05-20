import axios from 'axios';
import * as functions from 'firebase-functions';
import * as crypto from 'crypto';

import { onAllowHotlineAnswer } from '../domain/onOfferHelpCreate';

import { AskForHelpCollectionEntry } from '../types/interface/collections/AskForHelpCollectionEntry';
import { onDeletePost } from '../domain/onDeletePost';
import { onSolvePost } from '../domain/onSolvePost';

async function postToSlack(snapId: string, snapData: AskForHelpCollectionEntry): Promise<string> {
  const { request, location, isHotline } = snapData.d;

  const url = `https://www.quarantaenehelden.org/#/offer-help/${snapId}`;
  const header = `${location}${isHotline ? ' - (Hotline)' : ''}`;
  const requestText = `>${request.replace(/\n/g, '\n>')}`;
  const text = `${url}\n${header}\n${requestText}`;

  const response = await axios({
    method: 'POST',
    url: 'https://slack.com/api/chat.postMessage',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${functions.config().slack.token}`,
    },
    data: {
      channel: functions.config().slack.channel,
      text,
      unfurl_links: false,
      unfurl_media: false
    },
  });

  return response.data.ts;
}

async function postReplyToSlack(messageRef: string | undefined, message: string, mention = false): Promise<void> {
  if (!messageRef) {
    return;
  }

  const text = `${mention ? `<!subteam^${functions.config().slack.group}> ` : ''}${message}`;

  await axios({
    method: 'POST',
    url: 'https://slack.com/api/chat.postMessage',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${functions.config().slack.token}`,
    },
    data: {
      channel: functions.config().slack.channel,
      thread_ts: messageRef,
      text,
    },
  });
}

async function answerDirectly(message: string, responseUrl: string): Promise<void> {
  await axios({
    method: 'POST',
    url: responseUrl,
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${functions.config().slack.token}`,
    },
    data: {
      text: message
    },
  });
}

async function onSlackInteraction(request: functions.https.Request, response: functions.Response<any>): Promise<void> {
  // validate message is from slack
  const { signing_secret } = functions.config().slack;
  const hmac = crypto.createHmac('sha256', signing_secret);

  const version = 'v0';
  const body = request.rawBody.toString('utf-8');
  const timestamp = request.headers['x-slack-request-timestamp'];
  const signBasestring = `${version}:${timestamp}:${body}`;

  const hash = hmac.update(signBasestring).digest('hex');
  const mySignature = `${version}=${hash}`;
  const slackSignature = request.headers['x-slack-signature'];

  if(slackSignature === undefined || mySignature !== slackSignature) {
    console.warn('Slack message signatures did not match');
    response.status(401).send();
    return;
  }

  const actionContent = JSON.parse(request.body.payload);

  const {
    actions,
    callback_id: callbackId,
    response_url: responseUrl,
    message_ts: messageRef,
  } = actionContent;

  console.log('Incoming activity for', callbackId);

  switch (callbackId) {
    case 'allow_hotline_answer': await onAllowHotlineAnswer(actions, responseUrl); break;
    case 'delete_post': await onDeletePost(messageRef, responseUrl); break;
    case 'solve_post': await onSolvePost(messageRef, responseUrl); break;
  }

  response.status(200).send();
}

export { postToSlack, postReplyToSlack, answerDirectly, onSlackInteraction };
