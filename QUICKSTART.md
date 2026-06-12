# Website Quickstart

## Local Development

Start the Jekyll server with live reload:

```bash
bundle exec jekyll serve -w --livereload
```

Open browser to `http://localhost:4000` — changes to files rebuild automatically.

## File Structure

- `_pages/` — Main content pages (home, about, skills)
- `_sass/layout/_page.scss` — Page styling
- `images/` — Asset images (climbing.png, camera.png, etc.)
- `_config.yml` — Site config & author metadata

## Common Tasks

**Edit about page hobby cards:** `_pages/about.md` — image classes are `.v2-hobby-card__visual--photo`

**Update home core stack:** `_pages/home.md` — edit the `v3-stack` section

**Adjust card/image styling:** `_sass/layout/_page.scss` — look for `.v2-hobby-card` and `.v2-hobby-card__visual`

**Add new images:** Drop in `images/` folder, reference with `{{ '/images/filename.png' | relative_url }}`

## Commit & Push

```bash
git add .
git commit -m "Your message"
git push origin master
```

## Tips

- Live reload auto-refreshes browser on save — no manual refresh needed
- CSS changes visible immediately
- Image changes require Jekyll rebuild (watch mode handles this)
- Use Liquid syntax: `{{ site.author.name }}`, `{{ '/path' | relative_url }}`
