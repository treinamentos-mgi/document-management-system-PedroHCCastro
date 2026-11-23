import { useState } from 'react';

export default function UploadComponent({ onUpload }) {
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file) {
      setError('Selecione um arquivo antes de enviar.');
      return;
    }

    setSending(true);
    setError('');
    try {
      await onUpload(file);
      setFile(null);
      event.target.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" onChange={(event) => setFile(event.target.files[0] ?? null)} />
      <button type="submit" disabled={sending}>
        {sending ? 'Enviando...' : 'Enviar'}
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
