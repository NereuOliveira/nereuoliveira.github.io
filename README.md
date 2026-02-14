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

For the About hero blob image, `hero_image` in `_data/about.yml` works best with a transparent PNG/WebP asset.

## CI checks

Pull requests targeting `main` run the build validation workflow in `.github/workflows/pr-build.yml`.
The required check name is `pr-build`.

When branch protection/ruleset requires `pr-build`, merges into `main` are blocked until this check passes.

## Deployment

Deploy runs automatically via GitHub Actions on every push to `main` using `.github/workflows/deploy-pages.yml`.
