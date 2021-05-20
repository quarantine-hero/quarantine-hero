import * as admin from 'firebase-admin';
import { CollectionName } from '../types/enum/CollectionName';
import { answerDirectly, postReplyToSlack } from '../utilities/slack';

export async function onSolvePost(messageRef: string, responseUrl: string) {
    const db = admin.firestore();

    try {
        const snapshot = await db.collection(CollectionName.AskForHelp).where('d.slackMessageRef', '==', messageRef).get();

        if(snapshot.empty) {
            throw new Error('Keine Nachrichten mit dieser Slack-Referenz');
        }

        if(snapshot.docs.length > 1) {
            throw new Error('Mehr als eine Nachricht mit dieser Slack-Referenz');
        }

        // Get the identified post
        const doc = snapshot.docs[0];

        await db.collection(CollectionName.SolvedPosts).doc(doc.id).set({
          collectionName: CollectionName.AskForHelp, ...doc.data(),
        });

        await postReplyToSlack(messageRef, 'Dieser Post wurde manuell als gelöst markiert.', true);

        await answerDirectly('Post wurde erfolgreich als gelöst markiert.', responseUrl);
    } catch (err) {
        await answerDirectly(`Fehler beim Gelöst markieren des Posts: ${err}`, responseUrl);
    }
}
