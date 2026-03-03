# Athkar Web (Vue)

Responsive Vue app for athkar tracking with:
- Clear-style stacked list UI
- Tap row to increment progress (`readed_count` up to `read_count`)
- Right-side chevron to open athkar details
- Details with Arabic, pronunciation, translation, source, and evening variants when available
- Progress persisted in `localStorage`

## Run locally

```bash
cd web
npm install
npm run dev
```

## Build

```bash
cd web
npm run build
```

Build output will be in `web/dist`.

## Subdomain deployment

Deploy `web/dist` to your hosting provider, then map a subdomain DNS record (for example `athkar.arhmn.sh`) to that deployment.

If you host under a path instead of a subdomain root, set Vite `base` in `web/vite.config.js`.
