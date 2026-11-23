# Especificação - Document Management System

## 1. Objetivo

Entregar um sistema web que permite enviar, listar e baixar documentos, com gestão simples por usuário e armazenamento local.

## 2. Escopo

### Dentro do escopo

- Upload de documentos
- Listagem de documentos
- Download de documentos
- Gestão simples por usuário (cada documento pertence a um dono)

### Fora do escopo

- Armazenamento externo ou em nuvem
- Versionamento de documentos
- Autenticação completa (login, senha, tokens)
- Persistência em banco de dados (metadados ficam em memória nesta fase)
- Exclusão e edição de documentos

## 3. Requisitos funcionais

| ID    | Requisito                                                                                |
| ----- | ---------------------------------------------------------------------------------------- |
| RF-01 | O usuário pode enviar um documento (arquivo único por requisição)                        |
| RF-02 | O sistema registra os metadados do documento no upload (id, nome, tamanho, data, dono)   |
| RF-03 | O usuário pode listar os documentos enviados                                             |
| RF-04 | O usuário pode baixar um documento pelo identificador                                    |
| RF-05 | O sistema retorna erro 400 quando o upload não contém arquivo                            |
| RF-06 | O sistema retorna erro 404 quando o documento solicitado não existe                      |
| RF-07 | A interface exibe a lista de documentos e permite enviar e baixar                        |

## 4. Requisitos não funcionais

| ID     | Requisito                                                                            |
| ------ | ------------------------------------------------------------------------------------ |
| RNF-01 | Arquivos gravados no filesystem local em `backend/storage` via multer `diskStorage`  |
| RNF-02 | Metadados mantidos em memória nesta fase                                             |
| RNF-03 | Configuração via variáveis de ambiente (12-Factor), com valores padrão               |
| RNF-04 | Backend em Node.js + Express (CommonJS), testes com `node:test`                      |
| RNF-05 | Frontend em React + Vite (ESM), comunicação via `fetch` com prefixo `/api`           |
| RNF-06 | Mensagens ao usuário e comentários em português; símbolos de código em inglês        |

## 5. Modelo de dados (metadados do documento)

| Campo        | Tipo   | Descrição                                                      |
| ------------ | ------ | -------------------------------------------------------------- |
| id           | string | Identificador único do documento (UUID)                        |
| originalName | string | Nome original do arquivo enviado                               |
| storedName   | string | Nome do arquivo gravado em `backend/storage`                   |
| mimeType     | string | Tipo MIME informado pelo upload                                |
| size         | number | Tamanho em bytes                                               |
| uploadedAt   | string | Data/hora do upload (ISO 8601)                                 |
| owner        | string | Identificador do usuário dono (valor do cabeçalho `X-User-Id`) |

Os metadados ficam em um Map em memória no repositório. Ao reiniciar o servidor, a lista é perdida, mas os arquivos permanecem em disco.

## 6. Contratos de API

Rotas do backend sem prefixo; o frontend acessa via `/api`, e o proxy do Vite remove o prefixo.

Cabeçalho comum: `X-User-Id` (opcional). Quando ausente, o dono é `anonymous`.

Formato de erro: `{ "error": "mensagem em português" }`.

### POST /upload

- Entrada: campo `file` em `multipart/form-data`
- Sucesso: `201 Created` com os metadados do documento criado
- Erros: `400` se o campo `file` não existir ou se o arquivo exceder o tamanho máximo

Exemplo de resposta:

```json
{
  "id": "3f2a1c4e-0b7d-4c1a-9e2f-6a5b8c9d0e1f",
  "originalName": "contrato.pdf",
  "storedName": "7b1e9d2a-5c4f-4e8a-a1b2-c3d4e5f6a7b8.pdf",
  "mimeType": "application/pdf",
  "size": 20480,
  "uploadedAt": "2026-11-23T12:00:00.000Z",
  "owner": "anonymous"
}
```

### GET /documents

- Sucesso: `200 OK` com um array de metadados (lista vazia quando não há documentos)

### GET /documents/:id/download

- Sucesso: `200 OK` com o conteúdo binário, cabeçalho `Content-Disposition: attachment; filename="<originalName>"` e `Content-Type` igual ao `mimeType`
- Erros: `404` se o `id` não existir ou se o arquivo não estiver mais no disco

## 7. Decisões arquiteturais

- Backend em Clean Architecture simples, com fluxo `routes -> controllers -> services -> repositories`. Camadas internas não conhecem as externas.
- `routes/`: define os endpoints e o middleware de upload (multer), delegando aos controllers.
- `controllers/`: trata entrada e saída HTTP e validação básica.
- `services/`: concentra as regras de negócio (montar os metadados e localizar o documento).
- `repositories/`: guarda os metadados em memória e resolve o caminho dos arquivos.
- Upload via `multer` com `diskStorage` apontando para `backend/storage`. Nenhum serviço externo de armazenamento.
- Frontend baseado em componentes funcionais com Hooks, organizado em `components/`, `pages/` e `services/`.
- Sem TypeScript nesta fase; dependências já presentes nos `package.json`.

### Riscos

- Perda de metadados ao reiniciar o servidor (aceito nesta fase).
- Arquivos órfãos no disco se o registro falhar após a gravação.
- Nomes de arquivo enviados pelo usuário nunca são usados como caminho no disco.
- Limite de tamanho de upload configurável via `MAX_FILE_SIZE`.

## 8. Plano de execução

Cada etapa deve manter as funcionalidades existentes e ter critérios de aceite verificáveis.

### Etapa 1 - Backend base e upload

- Arquivos: `backend/src/app.js`, `backend/src/routes/documentRoutes.js`, `backend/src/routes/uploadMiddleware.js`, `backend/src/controllers/documentController.js`, `backend/src/services/documentService.js`, `backend/src/repositories/documentRepository.js`
- Critérios de aceite:
  - `POST /upload` grava o arquivo em `backend/storage` e retorna `201` com metadados
  - Sem arquivo, retorna `400`
  - Testes em `backend/test` cobrem os casos de sucesso e erro

### Etapa 2 - Listagem de documentos

- Arquivos: rota, controller, service e repository de documentos (`GET /documents`)
- Critérios de aceite:
  - `GET /documents` retorna a lista com os metadados do upload
  - Lista vazia retorna `[]`
  - Testes cobrem lista com itens

### Etapa 3 - Download de documentos

- Arquivos: rota, controller, service e repository (`GET /documents/:id/download`)
- Critérios de aceite:
  - Download devolve o conteúdo idêntico ao enviado, com `Content-Disposition` correto
  - `id` inexistente retorna `404`
  - Testes comparam o conteúdo baixado com o original

### Etapa 4 - Frontend

- Arquivos: `frontend/src/services/documentApi.js`, `frontend/src/components/` (`UploadComponent`, `DocumentList`, `DownloadButton`), `frontend/src/pages/DocumentsPage.jsx`, `frontend/src/App.jsx`
- Critérios de aceite:
  - Usuário envia um arquivo e vê o novo item na lista sem recarregar a página
  - Usuário baixa um documento pela lista
  - Erros de API são exibidos em português

### Etapa 5 - Configuração e revisão final

- Arquivos: variáveis de ambiente documentadas (`PORT`, `UPLOAD_DIR`, `MAX_FILE_SIZE`) e README atualizado
- Critérios de aceite:
  - Aplicação sobe com as variáveis padrão e com variáveis customizadas
  - Todos os testes do backend passam (`npm test` em `backend`)
