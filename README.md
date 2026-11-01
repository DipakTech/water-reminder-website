# Water Reminder website

The HTML, CSS, and vanilla JavaScript landing page for Water Reminder desktop.

- Website: https://water.oneclickresult.com
- Windows download: https://water.oneclickresult.com/download
- Cloudflare Pages fallback: https://water-reminder-8je.pages.dev
- Source: https://github.com/DipakTech/water-reminder-website

## Architecture

Cloudflare Pages serves the landing page. The `/download` Pages Function streams the Windows ZIP from the private `water-reminder-downloads` R2 bucket. The binary, desktop source, intake history, user profiles, and credentials are **not** stored in this repository. Only the landing page, its real app screenshots, bundled fonts and licenses, and deployment code belong here.

The R2 key is `releases/2.0.0/Water-Reminder-2.0.0-Windows.zip`. Keep the full Electron runtime together when packaging a release; uploading only `Water Reminder.exe` does not produce a working download.

## Local development

Use Node.js 22 or later.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4180. This previews the page; the configured download link points to the production R2-backed endpoint.

```sh
npm run check
npm run build
```

The static build is written to `dist/`. The `functions/` directory and R2 binding are compiled by Wrangler during Pages deployment. Test the download route locally with `npx wrangler pages dev dist`; production R2 storage is separate from the local development bucket.

## GitHub Actions

`.github/workflows/deploy.yml` checks and builds pull requests, and deploys pushes to `main`. Pull requests do not receive production secrets or publish deployments. The desktop archive is never built or uploaded by this workflow.

Set repository secrets:

| Secret | Value |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | A Cloudflare API token with **Account → Cloudflare Pages → Edit**, restricted to the account containing the Pages project. |
| `CLOUDFLARE_ACCOUNT_ID` | The account ID containing `water-reminder`. |

Set repository variables:

| Variable | Value |
| --- | --- |
| `DOWNLOAD_URL` | `https://water.oneclickresult.com/download` |
| `SITE_URL` | `https://water.oneclickresult.com` |

Both secrets and both variables are configured. The token is named `water-reminder-website GitHub Actions`, grants only **Cloudflare Pages: Edit**, and is restricted to the Cloudflare account containing this project. Its value is stored as an encrypted GitHub Actions secret. Wrangler's local OAuth login is separate from this CI credential. To rotate the token, create a replacement in [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens), then save it using GitHub repository Settings → Secrets and variables → Actions, or:

```sh
gh secret set CLOUDFLARE_API_TOKEN --repo DipakTech/water-reminder-website
gh workflow run deploy.yml --repo DipakTech/water-reminder-website
```

The first command prompts for the token without putting it in source. Do not commit it or paste it into `site.config.json`.

This project pins Wrangler 4.156.0. The `--force` Pages flag selects Cloudflare Pages explicitly instead of the newer CLI's Workers delegation. See [Cloudflare's continuous integration guide](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/).

## Manual deployment

```sh
npx wrangler login
npm run deploy
```

`wrangler.toml` declares the existing `water-reminder` Pages project and its `DOWNLOADS` R2 binding. The production custom domain is `water.oneclickresult.com`, with a CNAME pointing to the assigned Pages hostname `water-reminder-8je.pages.dev`. Attach the domain to the Pages project before configuring that DNS record. The built canonical URL, sitemap, and download URL use the custom domain.

## Publishing a new desktop release

From a machine with the prepared Windows ZIP, upload it to R2 using the local filename. The archive should stay outside this repository:

```sh
npx wrangler r2 object put water-reminder-downloads/releases/2.0.0/Water-Reminder-2.0.0-Windows.zip --file /path/to/Water-Reminder-2.0.0-Windows.zip --content-type application/zip --remote
```

For a new version, use a new immutable versioned R2 key, update `functions/download.js` and the version in `site.config.json`, and push the landing page changes. The bucket stays private; the function exposes only the release key declared in source.

## Content and motion

- Screenshots show the real desktop app with explicitly labeled sample data.
- Testimonial cards are clearly marked as illustrative placeholders. Replace them with approved real quotes before presenting them as customer reviews.
- Motion uses CSS transforms and opacity, a demonstration progress ring, and a short screenshot crossfade. System reduced-motion preferences are honored; keyboard tab changes are immediate.
- Fonts are self-hosted and include their SIL Open Font Licenses in `assets/fonts`.
