# Palmo Coconut Water

An animated, responsive product website for Palmo Coconut Water. It includes an editorial homepage, product flavors, brand story, benefits, contact page, persistent basket, Three.js product cans, and an interactive fruit-slicing footer game.

## Technology

- React 18
- Vite 5
- React Router
- Three.js
- JavaScript, JSX, and CSS

## Requirements

- Node.js 18 or newer
- npm

## Download the project

### Option 1: Download a ZIP

1. Open the repository page.
2. Select **Code → Download ZIP**.
3. Extract the downloaded ZIP file.
4. Open a terminal in the extracted `3D website` folder.

### Option 2: Clone with Git

```bash
git clone <repository-url>
cd "3D website"
```

Replace `<repository-url>` with this project's Git repository URL.

## Install and run

Install the dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

The development server is available at [http://localhost:5173](http://localhost:5173).

## Available scripts

```bash
npm run dev      # Start the Vite development server
npm run build    # Create an optimized production build in dist/
npm run preview  # Preview the production build locally
```

## Main pages

- `/` — Homepage
- `/flavours` — Complete product collection and nutrition table
- `/story` — Palmo brand story
- `/benefits` — Product benefits
- `/contact` — Contact information and form

## Project structure

```text
public/             Static files, product references, textures, and 3D models
src/
  assets/           Site images, textures, logos, coconuts, and fruit artwork
  components/       Shared UI, navigation, basket, product cards, and footer game
  context/          Shared React state, including the persistent basket
  data/             Products, nutrition, testimonials, benefits, and site copy
  hooks/            Scroll, visibility, motion, title, and animation hooks
  pages/            Route-level page components and their styles
  sections/         Homepage and shared content sections
  styles/           Global styles and design tokens
```

## Features

- Responsive layouts for desktop, tablet, and mobile
- Animated product cards shared between the homepage and Flavors page
- Three-dimensional cans rendered with Three.js
- Scroll-driven transitions and page animations
- Interactive animated navigation menu
- Persistent basket backed by `localStorage`
- Interactive fruit-slicing game with live scoring
- Reduced-motion support through `prefers-reduced-motion`

## Production build

```bash
npm run build
npm run preview
```

The optimized files are generated in `dist/`, which is excluded from Git.

## Prototype notes

- The basket and checkout experience are front-end demonstrations; no payment is processed.
- The contact form validates in the browser but does not submit to a server.
- Product and nutrition content should be verified before using the site commercially.
