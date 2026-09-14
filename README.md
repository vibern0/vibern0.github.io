# Bernardo Vieira's personal site

The live page is plain HTML and CSS in [`site/`](site/). No build step or Hugo theme is needed. The older Hugo content remains in the repository as an archive and is not included in the GitHub Pages deployment.

To preview locally:

```sh
python3 -m http.server 8000 --directory site
```

Open `http://localhost:8000` in a browser. Pushes to `main` run the Pages workflow in `.github/workflows/pages.yaml`, which publishes only `site/`. Set the repository's Pages source to **GitHub Actions** if it is not already selected.

The GitHub Pages custom domain is `vibern.xyz`. GoDaddy DNS points the apex to GitHub Pages with four A records (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, and `185.199.111.153`), and `www` is a CNAME to `vibern0.github.io`. The domain is configured in the repository's **Settings → Pages**. Since this site is published through GitHub Actions, the domain is managed in Pages settings rather than a `site/CNAME` file.
