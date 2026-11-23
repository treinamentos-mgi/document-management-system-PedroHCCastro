const { randomUUID } = require('node:crypto');
const documentRepository = require('../repositories/documentRepository');

function createDocument(file, owner) {
  const metadata = {
    id: randomUUID(),
    originalName: file.originalname,
    storedName: file.filename,
    mimeType: file.mimetype,
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
  return { metadata, filePath: documentRepository.resolveFilePath(metadata) };
}

module.exports = { createDocument, listDocuments, getDownloadInfo };
