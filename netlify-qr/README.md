# SmartRoad Netlify QR Folder

This folder is a standalone static site for the QR section of SmartRoad.

## What it includes

- Public road report page at `/report/:roadId`
- Contractor profile page at `/contractor/:contractorId`
- Contractor QR scanner at `/scan/contractor`
- Netlify SPA routing via `netlify.toml`

## Deploying to Netlify

1. Create a new Netlify site from this folder.
2. Set the site publish directory to this folder.
3. Edit `index.html` and change `window.__SMARTROAD_API_BASE__` to your deployed backend API URL.
4. Deploy the folder.

Example backend URL:

```text
https://your-backend-domain.com/api
```

## Generating QR codes

Use the backend QR endpoints and point them at your Netlify site.

Example for a road QR:

```text
GET /api/roads/ROAD-001/qr?frontendUrl=https://your-netlify-site.netlify.app
```

Example for a contractor QR:

```text
GET /api/contractors/CONTR-001/qr
```

## Local testing

You can open `index.html` directly, but the pages need a reachable backend API URL.
If you want to test locally, set the API base to your backend before refreshing the page.
