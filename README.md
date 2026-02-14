# Nereu Oliveira - Resume Site

This site is built with Jekyll and deployed automatically to GitHub Pages.

## Local development

```bash
bundle install
bundle exec jekyll serve
```

Open `http://127.0.0.1:4000`.

## Production build

```bash
bundle exec jekyll build
```

The generated site is written to `_site/`.

## Content editing

Edit the data files under `_data/`:

- `_data/about.yml`
- `_data/experience.yml`
- `_data/education.yml`
- `_data/skills.yml`

## Deployment

Deploy runs automatically via GitHub Actions on every push to `main` using `.github/workflows/deploy-pages.yml`.
