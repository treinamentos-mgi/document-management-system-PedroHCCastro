// Metadados em memória nesta fase; os arquivos ficam no filesystem local.
const documents = new Map();

function save(metadata) {
  documents.set(metadata.id, metadata);
  return metadata;
}

function findAll() {
  return [...documents.values()];
}

function findById(id) {
  return documents.get(id) ?? null;
}

module.exports = { save, findAll, findById };
