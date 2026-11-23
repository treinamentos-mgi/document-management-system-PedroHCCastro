import DownloadButton from './DownloadButton.jsx';

export default function DocumentList({ documents }) {
  if (documents.length === 0) {
    return <p>Nenhum documento enviado.</p>;
  }

  return (
    <ul>
      {documents.map((document) => (
        <li key={document.id}>
          {document.originalName} ({(document.size / 1024).toFixed(1)} KB) - enviado em{' '}
          {new Date(document.uploadedAt).toLocaleString('pt-BR')} <DownloadButton id={document.id} />
        </li>
      ))}
    </ul>
  );
}
