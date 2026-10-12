# Christopher Evan Wijaksana — Portfolio

A personal developer portfolio with an interactive 3D avatar, scroll-driven animations and a physics-based tech stack section. Built with Next.js, Three.js and GSAP, and prerendered to static HTML so search engines and link previews see the real content.

## Features

- **3D avatar** built entirely from Three.js primitives (no model files): glasses, cap, side-part hair. The head follows your cursor and the eyes blink.
- **Scroll animations** with GSAP ScrollTrigger: the avatar slides aside for the About section, the bio reveals word by word, the career timeline line fills in, and the work section scrolls horizontally on desktop.
- **Interactive tech stack**: labelled 3D balls drop in, cluster together and scatter away from the cursor.
- **Data-driven content**: every piece of text, project, link and tech ball comes from one typed file, `src/content/portfolio.ts`.
- **SEO-ready**: prerendered HTML, Open Graph / Twitter cards with a generated preview image, `robots.txt`, `sitemap.xml` and schema.org Person data.
- **Hardened**: a strict Content Security Policy and security headers on every response.
- **Responsive and accessible**: stacked layout on phones and tablets, respects `prefers-reduced-motion`, falls back gracefully when WebGL is unavailable.

## Tech stack

| | |
|---|---|
| Framework | [Next.js](https://nextjs.org/) 16 (App Router), React 19, TypeScript |
| 3D | [Three.js](https://threejs.org/) r149 |
| Animation | [GSAP](https://gsap.com/) + ScrollTrigger via `@gsap/react` |
| Fonts & icons | Geist (`next/font`), Font Awesome (tree-shaken SVG) |
| Testing | Vitest + Testing Library, Playwright |
| CI & delivery | GitHub Actions, commitlint, Dependabot, Docker |

## Getting started

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Then visit http://localhost:3000.

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server with Fast Refresh |
| `npm run build` / `npm start` | Build and serve the production site |
| `npm run lint` | ESLint (Next.js core-web-vitals rules) |
| `npm run typecheck` | TypeScript type check |
| `npm test` / `npm run test:coverage` | Unit and component tests (coverage must stay at 80%+) |
| `npm run test:e2e` | Playwright smoke tests against the production build (run `npm run build` first) |

Playwright downloads its own Chromium the first time (`npx playwright install chromium`). To use the Chrome already installed on your machine instead, run `PW_CHANNEL=chrome npm run test:e2e`.

## Project structure

```
├── public/assets/            # Resume PDF and other static files
├── src/
│   ├── app/                  # Next.js routes: page, layout, globals.css,
│   │                         # Open Graph image, icon, robots.txt, sitemap.xml
│   ├── content/
│   │   ├── portfolio.ts      # ✏️ All site content — edit this to update the portfolio
│   │   └── types.ts          # The content's shape
│   ├── components/
│   │   ├── layout/           # Nav and the fixed social/resume rail
│   │   ├── sections/         # Hero, About, What I do, Career, Work, Techstack, Contact
│   │   ├── motion/           # Client components: 3D canvases, cursor, animations
│   │   └── ui/               # Icons, safe links, current year
│   ├── hooks/                # Scroll, visibility and anchor-link hooks
│   └── lib/
│       ├── three/            # Avatar geometry and the two WebGL scenes
│       ├── motion/           # GSAP timelines and ScrollTriggers
│       └── …                 # URL safety, SEO, security headers, formatting
└── e2e/                      # Playwright smoke tests
```

Sections are server components, so the whole page is plain HTML before any JavaScript runs. Only the canvases, the cursor and the animations are client components.

## Customizing

**Content** — edit `src/content/portfolio.ts`: name, hero text, about, skills, career timeline, projects, tech stack balls, socials and contact details. TypeScript and the content tests catch typos such as a missing field, an invalid colour or an unsafe link.

**Project images** — put images in `public/projects/` and set a project's `image` field (e.g. `"/projects/wazuh-dashboard.webp"`). Leave it empty for a gradient placeholder. Set `link` to a URL to make the card clickable.

**Avatar** — the constants at the top of `src/lib/three/avatar-model.ts` control its look:

| Constant | Controls |
|---|---|
| `PALETTE` | Skin, hair, cap, glasses, lips and clothing colours |
| `CAP` | `enabled: false` removes the cap; `brim.y` / `brim.tilt` adjust the visor |
| `HAIR` | `volume` (height of the top), `partX` (side-part position) |
| `HAIRLINE` | How far the hair reaches at the front, sides and back |

## Deployment (Vercel)

1. Import the repository at [vercel.com/new](https://vercel.com/new). The defaults (framework *Next.js*, `npm run build`) work as they are.
2. Every pull request gets its own preview URL; merging to `main` deploys production.
3. **Custom domain:** in the Vercel project go to *Settings → Domains*, add the domain and create the DNS records Vercel shows at your registrar.
4. Set the environment variable `NEXT_PUBLIC_SITE_URL` to the domain (e.g. `https://your-domain.com`) so canonical URLs, the sitemap and link previews use it. Without it, the Vercel production domain is used. See `.env.example`.

## Running with Docker

The repository also ships a production image for self-hosting (a VPS, Docker Swarm or Kubernetes). Vercel ignores these files.

```bash
npm run docker:up      # docker compose up --build --detach --wait
npm run docker:smoke   # check the running container
npm run docker:down
```

The site is then at http://localhost:3000. Configure it through the environment or a `.env` file next to `compose.yaml`:

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Public URL, baked in at build time (canonical URL, Open Graph, sitemap) |
| `PORT` | `3000` | Host port the container is published on |

Without Compose:

```bash
docker build -t portfolio --build-arg NEXT_PUBLIC_SITE_URL=https://your-domain.com .
docker run -p 3000:3000 portfolio
```

About the image:

- **Multi-stage build** on `node:22-alpine`: only Next.js's standalone server, the static assets and `public/` reach the final image (about 45 MB on top of Node).
- **Hardened:** it runs as the unprivileged `node` user, and Compose adds a read-only filesystem, drops all Linux capabilities and sets `no-new-privileges`.
- **Health check:** `docker ps` shows `healthy` once the server answers; `docker compose up --wait` waits for it.
- **HTTPS expected in front:** the CSP includes `upgrade-insecure-requests`, so opening the container over plain `http://` from another device (e.g. `http://192.168.x.x:3000`) breaks the styles and scripts. `localhost` is fine. On a server, put it behind a TLS-terminating proxy such as Traefik, Caddy or an ingress controller.
- CI builds the image and runs the smoke test on every pull request.

## Contributing workflow

`main` always reflects what is deployed. Changes go through a branch and a pull request:

1. Branch from `main`: `feat/…`, `fix/…`, `docs/…`, `chore/…`.
2. Commit in small steps using [Conventional Commits](https://www.conventionalcommits.org/): `feat: add project images`, `fix: …`. Allowed types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`, `style`, `build`, `revert`.
3. Open a pull request. CI runs lint, type check, unit tests (80% coverage gate), the production build, the Playwright smoke tests, the Docker image build and smoke test, and commitlint, and Vercel posts a preview link.
4. Merge with **Rebase and merge** (or a merge commit) to keep each commit in `main`'s history, then delete the branch.

Recommended GitHub settings (*Settings → Branches → Add rule* for `main`): require a pull request, require the CI checks to pass, and require a linear history.

## Contact

- Email: [evanwijaksana@gmail.com](mailto:evanwijaksana@gmail.com)
- LinkedIn: [christopher-evan-w](https://linkedin.com/in/christopher-evan-w)
