const path = require('node:path');
const { randomUUID } = require('node:crypto');
const config = require('../config');
const documentRepository = require('../repositories/documentRepository');

const DEFAULT_MIME_TYPE = 'application/octet-stream';
const VALID_MIME_TYPE = /^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/i;

function normalizeMimeType(mimeType) {
  return VALID_MIME_TYPE.test(mimeType || '') ? mimeType : DEFAULT_MIME_TYPE;
}

function resolveFilePath(metadata) {
  return path.join(config.storageDir, metadata.storedName);
}

function createDocument(file, owner) {
  const metadata = {
    id: randomUUID(),
    originalName: file.originalname,
    storedName: file.filename,
    mimeType: normalizeMimeType(file.mimetype),
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
  };
  return documentRepository.save(metadata);
}

function listDocuments() {
  return documentRepository.findAll();
}

function getDownloadInfo(id) {
  const metadata = documentRepository.findById(id);
  if (!metadata) return null;
  return { metadata, filePath: resolveFilePath(metadata) };
}

module.exports = { createDocument, listDocuments, getDownloadInfo };
