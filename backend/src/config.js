const path = require('node:path');

module.exports = {
  port: Number(process.env.PORT) || 3000,
  storageDir: process.env.UPLOAD_DIR || path.join(__dirname, '..', 'storage'),
  maxFileSize: Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024,
};
