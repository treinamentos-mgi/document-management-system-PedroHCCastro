import { getDownloadUrl } from '../services/documentApi.js';

export default function DownloadButton({ id }) {
  return <a href={getDownloadUrl(id)} download>Baixar</a>;
}
