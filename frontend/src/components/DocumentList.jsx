import DownloadButton from './DownloadButton.jsx';

export default function DocumentList({ documents }) {
  if (documents.length === 0) {
    return <p>Nenhum documento enviado.</p>;
  }

  return (
    <ul>
      {documents.map((doc) => (
        <li key={doc.id}>
          {doc.originalName} ({(doc.size / 1024).toFixed(1)} KB) - enviado em{' '}
          {new Date(doc.uploadedAt).toLocaleString('pt-BR')} <DownloadButton id={doc.id} />
        </li>
      ))}
    </ul>
  );
}
