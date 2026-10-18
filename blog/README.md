# Write a blog post

The blog is currently hidden from the main navigation and footer. Its routes
remain accessible directly at `/blog/` for preview. Uncomment the Blog navbar
and footer entries in `docusaurus.config.ts` when the blog is ready to be promoted.

Add one Markdown or MDX file under `blog/`. The next build automatically adds
published posts to All Posts, Archive, search, date filters and topic pages.
New tags become topics automatically, with updated counts and filter chips.
**No code, JSON, navigation or `tags.yml` edits are required.**

## 1. Copy a template

Use Markdown for ordinary articles. From the repository root:

```bash
mkdir -p blog/2026-10-18-my-post
cp blog/_template.md blog/2026-10-18-my-post/index.md
```

Replace the date with your publication date and `my-post` with a short name.
For React components or PDF previews, copy `_template.mdx` as `index.mdx` instead.
Keep only one `index.md` or `index.mdx` per post folder.

## 2. Fill in the details and write

Edit the fields at the top of the file:

```yaml
---
title: "A useful title for your article"
description: "A short summary for article lists and search results."
slug: my-post
authors: [cradle]
tags: [project, "Experiment design", "Networking"]
draft: true
---
```

- **Title:** the heading readers see. Quotes allow punctuation such as colons.
- **Description:** the summary shown in All Posts and Archive.
- **Slug:** a unique, stable URL name; `my-post` creates `/blog/my-post`.
- **Authors:** use `cradle` for the CRADLE Team, or an existing key in `authors.yml`.
- **Tags (required):** include at least one non-empty tag, such as `tags: [project]`.
  Reuse existing tags or type new names. Readers see these as Topics. Missing or
  empty tags stop preview/build with an error naming the post, including drafts.
- **Draft:** keep `true` while writing; change it to `false` when ready to publish.

Write an introduction, keep the template's truncation marker, and add sections
using `## Heading`. Markdown supports lists, tables, links, images and code blocks.
The post date comes from the `YYYY-MM-DD` folder name, so no date field is needed.

## 3. Preview and publish

```bash
npm run start
```

Open [All Posts](http://localhost:3000/blog/), read the full article, and check its
images, attachments, topics and date. Drafts are visible in the development server.

When ready, set `draft: false`, then run:

```bash
npm run build
npm run serve
```

Check the production preview, then submit a pull request. Merging to `main`
uses the existing website deployment workflow. Drafts are excluded from the
production build, including public search, archive and topics. Future dates do
not schedule publication; keep future posts as drafts until they are ready.

## Add images, PDFs or other attachments

Keep files beside the post:

```text
blog/2026-10-18-my-post/
  index.md
  assets/
    diagram.png
    report.pdf
```

Reference them from the article:

```markdown
![Network diagram showing two connected routers](./assets/diagram.png)

[Read the report (PDF)](./assets/report.pdf)
```

The build bundles these files and rewrites their URLs automatically. Missing
local assets and broken internal links fail the build. Use meaningful image alt
text and include file formats in download labels. External HTTPS links also work.
Keep large downloads at a stable external URL when possible.

## Code snippets

Use fenced blocks with a language name and an optional filename:

````markdown
```json title="settings.json"
{
  "enabled": true
}
```
````

Highlighting is available for `json`, `cradle`, `yaml` (Ansible), `go`, `bash`,
`powershell`, `c` and `java`. `ansible` is an alias for YAML. Code is displayed,
not executed. Blocks support copying, light/dark themes and horizontal scrolling.
Use single backticks for inline code, for example `cxc validate`.

See [the code snippet gallery](demo-posts/2026-10-18-code-snippet-gallery.md)
for all eight examples, or preview `/blog/demo-code-snippets` locally.

## How topics work

`tags: ["Networking", "Experiment design"]` creates both topics on the next
build. The topic page, article counts, filters and search update automatically.
Use the same spelling in later posts to reuse a topic. Topics appear only when
used by a visible post; unused definitions do not create empty cards.

Every post must have tags. The separate `tags.yml` metadata file is **optional**;
use it only when you want a shared display name,
description or stable topic URL. For example, existing `project` displays as
“Project updates”. To customise a new topic:

```yaml
networking:
  label: Networking
  description: Network topology and routing in cyber experiments.
  permalink: networking
```

Then use `tags: [networking]` in posts. Keeping the same permalink preserves URLs
if you later improve a topic's display name. Avoid different spellings or tag
names that produce the same URL. New topics without descriptions get a simple
automatic description on their cards.

To add a named author, add a key to `authors.yml` and use it in `authors`.
Alternatively, define the author directly in a post:

```yaml
authors:
  - name: Your Name
    title: Your role or affiliation
```

## Optional MDX and date overrides

MDX supports React markup and imported components. Use `{/* truncate */}` in MDX.
For an embedded PDF, import its URL and always include a normal link as a fallback:

```mdx
import reportUrl from './assets/report.pdf';

[Open the report (PDF)](./assets/report.pdf)

<iframe src={reportUrl} title="Report PDF preview" width="100%" height="640" loading="lazy" />
```

MDX is compiled code and should be reviewed like other repository code.

To override the folder date, add `date: 2026-10-18` to front matter. For multiple
posts on the same day, use an unquoted timestamp with an offset, for example
`date: 2026-10-18T14:00:00+08:00`. Displayed calendar dates use UTC.

## Browsing and filtering

All Posts and topic article lists show 10 articles per page. Archive groups
matching posts into a year-by-year timeline. Search matches titles, descriptions
and topic names across all posts before pagination. Multiple selected tags match
any selected topic, combined with the year and inclusive From/To dates. Leaving
one date empty gives an open-ended range. Newest/Oldest first also controls year
order in Archive. Filters and sort order are stored in shareable URLs.

## Demo content and excluded files

`demo-posts/` contains 13 labelled sample articles across 2024–2026 for testing
multiple years, overlapping topics and pagination. Remove that folder before
publishing the real site; the samples are not historical project news.

This README, `_template.md`, `_template.mdx` and other files or directories
beginning with `_` are excluded from publication. Blog content is independent
of documentation versions. RSS/feed generation is currently disabled.
