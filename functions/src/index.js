import express from 'express';
import admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import logger from 'firebase-functions/logger';
import { processPrReview } from './services/reviewPipeline.js';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const app = express();
app.use(express.json());

app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.post('/submit-pr-review', async (req, res) => {
  try {
    const result = await processPrReview(req.body, `api-${Date.now()}`);
    res.status(200).json({ status: 'processed', review: result });
  } catch (err) {
    logger.error('submit-pr-review failed', err);
    res.status(400).json({ error: err.message });
  }
});

app.post('/simulate-upload', async (req, res) => {
  try {
    const { pr } = req.body;
    if (!pr) {
      res.status(400).json({ error: 'Request body must include "pr" object' });
      return;
    }

    const docRef = await db.collection('prUploads').add({
      pr,
      createdAt: new Date().toISOString(),
      source: 'api-simulated-pubsub'
    });

    res.status(200).json({ status: 'queued', uploadId: docRef.id });
  } catch (err) {
    logger.error('simulate-upload failed', err);
    res.status(500).json({ error: err.message });
  }
});

export const api = onRequest({ region: 'us-central1' }, app);

export const onPrAttachmentUploaded = onDocumentCreated('prUploads/{uploadId}', async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    logger.warn('Empty Firestore event payload for prUploads trigger');
    return;
  }

  const data = snapshot.data();
  if (!data?.pr) {
    logger.warn('prUploads event missing pr payload', { uploadId: event.params.uploadId });
    return;
  }

  try {
    await processPrReview(data.pr, event.params.uploadId);
    logger.info('PR upload processed', { uploadId: event.params.uploadId, prId: data.pr.prId });
  } catch (err) {
    logger.error('Failed processing PR upload', {
      uploadId: event.params.uploadId,
      error: err.message
    });
    await db.collection('prUploads').doc(event.params.uploadId).set(
      {
        processingError: err.message,
        processedAt: new Date().toISOString()
      },
      { merge: true }
    );
  }
});
