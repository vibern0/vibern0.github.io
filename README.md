# Bernardo Vieira's personal site

The live page is plain HTML and CSS in [`site/`](site/). No build step or Hugo theme is needed. The older Hugo content remains in the repository as an archive and is not included in the GitHub Pages deployment.

To preview locally:

```sh
python3 -m http.server 8000 --directory site
```

Open `http://localhost:8000` in a browser. Pushes to `main` run the Pages workflow in `.github/workflows/pages.yaml`, which publishes only `site/`. Set the repository's Pages source to **GitHub Actions** if it is not already selected.

The site does not reference `vibern.xyz`. The expired custom domain was removed from GitHub Pages so `vibern0.github.io` can serve this page. Once the domain is owned again, configure it in GitHub Pages and at the DNS provider. Add a `CNAME` file to `site/` only after that setup is ready.
