# Christopher Evan Wijaksana — Portfolio

A personal developer portfolio with an interactive 3D avatar, scroll-driven animations and a physics-based tech stack section. Built with plain HTML, CSS and JavaScript — no build step.

## Features

- **3D avatar** built entirely from Three.js primitives (no model files): glasses, cap, side-part hair. The head follows your cursor and the eyes blink.
- **Scroll animations** with GSAP ScrollTrigger: the avatar slides aside for the About section, the bio reveals word by word, the career timeline line fills in, and the work section scrolls horizontally on desktop.
- **Interactive tech stack**: labelled 3D balls drop in, cluster together and scatter away from the cursor.
- **Data-driven content**: every piece of text, project, link and tech ball comes from a single file, `js/data.js`.
- **Responsive**: stacked layout on phones and tablets; respects `prefers-reduced-motion`; falls back gracefully when WebGL is unavailable.

## Tech stack

| | |
|---|---|
| Markup & styling | HTML5, CSS (custom properties, grid) |
| 3D | [Three.js](https://threejs.org/) r149 |
| Animation | [GSAP](https://gsap.com/) 3.12 + ScrollTrigger |
| Fonts & icons | Geist (Google Fonts), Font Awesome 6 |

All libraries load from CDNs, so there is nothing to install.

## Running locally

Open `index.html` directly in a browser, or serve the folder (recommended, so it behaves like the live site):

```bash
python -m http.server 5173
```

Then visit http://localhost:5173.

## Project structure

```
├── index.html            # Page layout and section markup
├── css/style.css         # Design tokens, layout, responsive rules
├── js/
│   ├── data.js           # ✏️ All site content — edit this to update the portfolio
│   ├── render.js         # Builds the page sections from data.js
│   ├── avatar-model.js   # 3D avatar geometry (head, hair, cap, glasses, face)
│   ├── character.js      # Avatar scene: lighting, cursor tracking, blinking
│   ├── techstack.js      # Tech stack ball physics
│   └── main.js           # Wires everything up: scroll animations, nav, cursor
└── assets/               # Resume PDF and project images
```

## Customizing

**Content** — edit `js/data.js`: name, hero text, about, skills, career timeline, projects, tech stack balls, socials and contact details.

**Project images** — put images in `assets/` and set a project's `image` field (e.g. `"assets/wazuh-dashboard.png"`). Leave it empty for a gradient placeholder. Set `link` to a URL to make the card clickable.

**Avatar** — the constants at the top of `js/avatar-model.js` control its look:

| Constant | Controls |
|---|---|
| `PALETTE` | Skin, hair, cap, glasses, lips and clothing colours |
| `CAP` | `enabled: false` removes the cap; `brim.y` / `brim.tilt` adjust the visor |
| `HAIR` | `volume` (height of the top), `partX` (side-part position) |
| `HAIRLINE` | How far the hair reaches at the front, sides and back |

## Deployment

The site is fully static, so it can be hosted anywhere. With GitHub Pages:

1. Go to **Settings → Pages** in this repository.
2. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
3. The site will be live at `https://ecehceh.github.io/portfolio/` within a minute or two.

It also works on Netlify or Vercel by importing the repository with no build command.

## Contact

- Email: [evanwijaksana@gmail.com](mailto:evanwijaksana@gmail.com)
- LinkedIn: [christopher-evan-w](https://linkedin.com/in/christopher-evan-w)
