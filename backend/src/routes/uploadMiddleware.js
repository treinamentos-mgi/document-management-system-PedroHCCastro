const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const multer = require('multer');
const config = require('../config');

fs.mkdirSync(config.storageDir, { recursive: true });

const SAFE_EXTENSION = /^\.[a-z0-9]{1,10}$/i;

const storage = multer.diskStorage({
  destination: config.storageDir,
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, `${randomUUID()}${SAFE_EXTENSION.test(extension) ? extension : ''}`);
  },
});

module.exports = multer({ storage, limits: { fileSize: config.maxFileSize } });
