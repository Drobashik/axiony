# Axiony Scanner Service

Long-running service that opens public URLs in Playwright, runs axe-core through the existing Axiony CLI scanner, and exposes the job API used by the web app.

## Endpoints

- `GET /health`
- `POST /scans`
- `GET /scans/:jobId`

`/scans` endpoints require:

```txt
Authorization: Bearer <SCANNER_API_KEY>
```

## Local Run

Create a local env file:

```sh
cp scanner/.env.example scanner/.env
```

Set `SCANNER_API_KEY` in `scanner/.env`, then run:

```sh
npm --prefix scanner run dev
```

Then set this in `web/.env.local`:

```txt
AXIONY_SCANNER_API_URL=http://127.0.0.1:4000
AXIONY_SCANNER_API_KEY=dev-secret
```

Useful checks:

```sh
curl http://127.0.0.1:4000/health
curl http://127.0.0.1:3000/api/scans/health
```

The service is TypeScript-first: source lives in `scanner/src`, compiled output lives in
`scanner/dist`.

## Docker

Build from the repository root:

```sh
docker build -f scanner/Dockerfile -t axiony-scanner .
```

Run:

```sh
docker run --rm -p 4000:4000 \
  -e HOST=0.0.0.0 \
  -e PORT=4000 \
  -e SCANNER_API_KEY=dev-secret \
  axiony-scanner
```
