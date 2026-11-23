const { test, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const storageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dms-test-'));
process.env.UPLOAD_DIR = storageDir;

const app = require('../src/app');

let server;
let baseUrl;

before(() => new Promise((resolve) => {
  server = app.listen(0, () => {
    baseUrl = `http://localhost:${server.address().port}`;
    resolve();
  });
}));

after(() => {
  server.close();
  server.closeAllConnections();
  fs.rmSync(storageDir, { recursive: true, force: true });
});

function uploadFile(content, fileName, mimeType, headers = {}) {
  const form = new FormData();
  form.append('file', new Blob([content], { type: mimeType }), fileName);
  return fetch(`${baseUrl}/upload`, { method: 'POST', body: form, headers });
}

test('POST /upload grava o arquivo e retorna os metadados', async () => {
  const response = await uploadFile('conteudo', 'contrato.txt', 'text/plain', { 'X-User-Id': 'maria' });
  assert.strictEqual(response.status, 201);

  const body = await response.json();
  assert.strictEqual(body.originalName, 'contrato.txt');
  assert.strictEqual(body.size, 'conteudo'.length);
  assert.strictEqual(body.owner, 'maria');
  assert.ok(fs.existsSync(path.join(storageDir, body.storedName)));
});

test('POST /upload sem arquivo retorna 400', async () => {
  const response = await fetch(`${baseUrl}/upload`, { method: 'POST', body: new FormData() });
  assert.strictEqual(response.status, 400);
});

test('GET /documents lista os documentos enviados', async () => {
  const response = await fetch(`${baseUrl}/documents`);
  assert.strictEqual(response.status, 200);

  const body = await response.json();
  assert.ok(Array.isArray(body));
  assert.ok(body.some((document) => document.originalName === 'contrato.txt'));
});

test('GET /documents/:id/download devolve o conteúdo original', async () => {
  const [document] = await (await fetch(`${baseUrl}/documents`)).json();
  const response = await fetch(`${baseUrl}/documents/${document.id}/download`);
  assert.strictEqual(response.status, 200);
  assert.strictEqual(await response.text(), 'conteudo');
  assert.match(response.headers.get('content-disposition'), /attachment; filename="contrato.txt"/);
});

test('GET /documents/:id/download com id inexistente retorna 404', async () => {
  const response = await fetch(`${baseUrl}/documents/inexistente/download`);
  assert.strictEqual(response.status, 404);
});
