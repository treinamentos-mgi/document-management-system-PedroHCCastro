const express = require('express');
const upload = require('./uploadMiddleware');
const documentController = require('../controllers/documentController');

const router = express.Router();

router.post('/upload', upload.single('file'), documentController.uploadDocument);
router.get('/documents', documentController.listDocuments);
router.get('/documents/:id/download', documentController.downloadDocument);

module.exports = router;
