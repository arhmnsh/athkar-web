# Athkar Web (Vue)

Responsive Vue app for athkar tracking with:
- Clear-style stacked list UI
- Tap row to increment progress (`readed_count` up to `read_count`)
- Right-side chevron to open athkar details
- Details with Arabic, pronunciation, translation, source, and evening variants when available
- Progress persisted in `localStorage`
- PWA support (installable + cached offline shell)

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Build output will be in `dist`.

## Analytics (PostHog)

Copy `.env.example` to `.env` and set your values:

```bash
cp .env.example .env
```

- `VITE_POSTHOG_PUBLIC_KEY`
- `VITE_POSTHOG_HOST` (default: `https://us.i.posthog.com`)
- `VITE_ANALYTICS_SITE` (default: `athkar`)
- `VITE_ANALYTICS_DOMAIN` (default: `athkar.arhmn.sh`)

## Subdomain deployment

Deploy `dist` to your hosting provider, then map a subdomain DNS record (for example `athkar.arhmn.sh`) to that deployment.

If you host under a path instead of a subdomain root, set Vite `base` in `vite.config.js`.
