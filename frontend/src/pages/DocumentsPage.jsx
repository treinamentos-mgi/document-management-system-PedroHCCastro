import { useEffect, useState } from 'react';
import UploadComponent from '../components/UploadComponent.jsx';
import DocumentList from '../components/DocumentList.jsx';
import { listDocuments, uploadDocument } from '../services/documentApi.js';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loadError, setLoadError] = useState('');

  async function refresh() {
    try {
      setDocuments(await listDocuments());
      setLoadError('');
    } catch {
      setLoadError('Não foi possível carregar os documentos.');
    }
  }

  useEffect(() => {
    let ignore = false;
    listDocuments()
      .then((docs) => {
        if (ignore) return;
        setDocuments(docs);
        setLoadError('');
      })
      .catch(() => {
        if (!ignore) setLoadError('Não foi possível carregar os documentos.');
      });
    return () => {
      ignore = true;
    };
  }, []);

  async function handleUpload(file) {
    await uploadDocument(file);
    await refresh();
  }

  return (
    <section>
      <UploadComponent onUpload={handleUpload} />
      {loadError && <p role="alert">{loadError}</p>}
      <DocumentList documents={documents} />
    </section>
  );
}
