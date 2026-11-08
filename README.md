# Cambridge Chem&Bio website

A responsive Hugo site for the Cambridge Chem&Bio research community. Templates,
styles and scripts live in this repository; no external theme or Node build is
required.

## Local development

Use Hugo Extended 0.126.3 (the version pinned in the deployment workflow):

```sh
hugo server --disableFastRender
```

Before publishing:

```sh
hugo --gc --minify
python scripts/check_site.py
```

Pushing to `main` builds, validates and deploys the site through GitHub Pages.
The public site is https://biobridgechem.co.uk/.

## Updating content

- **Team:** edit `content/about/_index.md`. Keep portrait images in the same folder.
- **Seminars:** add `content/event/<event-slug>/index.md` with `title`, `date`
  (the event date), and `summary` in YAML front matter. Put the poster in the same
  folder and reference it in the body. Events appear automatically in the archive
  and the newest three appear on the homepage. Existing branch-bundle events
  using `_index.md` are also supported.
- **Partners:** edit `content/partnership/index.md`.
- **Contact details:** edit `config/_default/params.yaml`.
- **Registration:** update `registration_url`, `registration_label` and
  `registration_event_date` together in `config/_default/params.yaml` for each
  event. All registration links close at 00:00 Europe/London on the day before
  the event, including on cached or already-open pages. JavaScript is required
  to enable registration links. This closes website entry points; the Google
  Form itself must be closed separately to block previously saved direct links.
- **Navigation:** edit `config/_default/menus.yaml`.
- **Design:** `assets/css/site.css`, `assets/js/site.js` and `layouts/`.

The archive search runs entirely in the browser. All events remain accessible
without JavaScript. Hugo generates optimised WebP thumbnails and portraits;
event images link to the full-size original. No external fonts, analytics or
third-party JavaScript are loaded.
