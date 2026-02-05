/**
 * @typedef {Object} Attachment
 * @property {string} fileName
 * @property {number} sizeBytes
 * @property {string} mimeType
 */

/**
 * @typedef {Object} PrPayload
 * @property {string} prId
 * @property {string} repository
 * @property {string} author
 * @property {string} title
 * @property {string} description
 * @property {Attachment[]} attachments
 */

export const ReviewDecision = Object.freeze({
  AUTO_APPROVED: 'AUTO_APPROVED',
  NEEDS_REVIEW: 'NEEDS_REVIEW'
});
