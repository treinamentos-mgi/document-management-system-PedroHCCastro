const documentService = require('../services/documentService');

const DEFAULT_OWNER = 'anonymous';

function uploadDocument(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado. Use o campo "file".' });
  }
  const owner = req.get('X-User-Id') || DEFAULT_OWNER;
  const document = documentService.createDocument(req.file, owner);
  return res.status(201).json(document);
}

function listDocuments(req, res) {
  res.json(documentService.listDocuments());
}

function downloadDocument(req, res) {
  const download = documentService.getDownloadInfo(req.params.id);
  if (!download) {
    return res.status(404).json({ error: 'Documento não encontrado.' });
  }

  const { metadata, filePath } = download;
  res.set('Content-Type', metadata.mimeType);
  res.download(filePath, metadata.originalName, (err) => {
    if (!err || res.headersSent) return;
    res.removeHeader('Content-Type');
    res.removeHeader('Content-Disposition');
    res.status(404).json({ error: 'Arquivo não encontrado no armazenamento.' });
  });
}

module.exports = { uploadDocument, listDocuments, downloadDocument };
