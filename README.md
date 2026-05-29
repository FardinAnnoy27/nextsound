<div align="center" >
  <br/>
  <br/>
  <img src="/src/assets/svg/nextsound.svg" alt="NextSound logo" width="80" height="auto" />
  <h1>NextSound</h1>
  <br/>

  <p >
A music discovery app built with React and TypeScript. <br/> Browse tracks, albums, and artists using Spotify's API.
  </p>
</div>

<br/>
<br/>

## How it works

NextSound runs in two modes depending on your setup:

### Demo mode (no API needed)
Without API credentials:
- Curated collection of 2024-2025 chart toppers
- Works immediately after `git clone` and `npm install`
- Real album artwork and track metadata
- Features artists like Billie Eilish, Harry Styles, Morgan Wallen, and more

Benefits:
- Perfect for trying out the app quickly
- No API setup required
- Images load from Spotify CDN
- Shows off the full UI

<br/>


### With Spotify API (recommended)
If you have Spotify API credentials:
- Real-time access to Spotify's music catalog
- Search across millions of tracks, albums, and artists
- Latest trending songs and new releases
- All features available

Requires:
- Spotify API credentials in `.env` file
- Backend server running for CORS handling

<br/>


The app automatically detects which mode to use.

<br/>


## :camera: Screenshots

### Hero Section 
<kbd><img width="800" alt="NextSound Hero Section and Track Grid" src="./src/assets/images/hero.png"></kbd>

<br/>

### Homepage
<kbd><img width="800" alt="NextSound Homepage with Music Content" src="./src/assets/images/all-songs.png"></kbd>


<br/>
<br/>

## Getting started

You need Node.js 18+ and npm.

```bash
# Clone and install
git clone https://github.com/natashaongiscoding/music-app.git
cd music-app
npm install

# Start the app
npm run dev
```

Open `http://localhost:5173` - the app works immediately with demo data.

<br>

### Want live Spotify data?

1. Create a [Spotify Developer Account](https://developer.spotify.com/) and create a new app
2. Get your Client ID and Client Secret from the app dashboard
3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Add your credentials to `.env` (remove the # comments):
   ```env
   VITE_SPOTIFY_CLIENT_ID=your_client_id_here
   VITE_SPOTIFY_CLIENT_SECRET=your_client_secret_here
   ```
5. Start with the backend:
   ```bash
   npm run dev:full
   ```

<br/>

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

<br/>

## Build

```bash
npm run build
npm run preview
```

<br/>

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **State:** Redux Toolkit with RTK Query
- **Routing:** React Router v6
- **Animations:** Framer Motion
- **Backend:** Node.js, Express.js (CORS proxy)
- **API:** Spotify Web API
- **Testing:** Vitest, Playwright

<br>
## 🏗️ Project Architecture & Structure

```text
nextsound/
├── server/
│   └── index.js              # Express proxy: Auth, CORS, and Spotify API forwarding
├── public/
│   └── mockServiceWorker.js  # MSW Service Worker (Optional development mocking)
├── src/
│   ├── main.tsx              # Application bootstrap & global Context Provider tree
│   ├── App.tsx               # Master Layout, routing configurations, global shortcuts
│   ├── pages/                # High-level route views
│   │   ├── Home/             # Landing view featuring Hero section & music shelves
│   │   └── NotFound/         # Fallback 404 error page template
│   ├── common/               # Shared structural layout components (Header, Footer, Sidebar, Loader)
│   ├── components/ui/        # Reusable interface micro-primitives (Player, TrackCard, CommandPalette)
│   ├── context/              # Context Providers (Global UI, Application Theme, AudioPlayer states)
│   ├── hooks/                # Custom React Hooks (useAudioPlayer, useCommandPalette, useLoading)
│   ├── services/             # Core Core Network APIs & Data Access Layer
│   │   ├── MusicAPI.ts       # Unified data facade managing Mock vs Live dynamic routing
│   │   ├── SpotifyAPI.ts     # RTK Query integrations with automatic retry/caching states
│   │   └── MCPAudioService.ts# Audio streaming endpoint parser & preview URL fetchers
│   ├── store/index.ts        # Redux Toolkit global state store configuration
│   ├── data/mockMusicData.ts # Pre-curated music schemas for offline/demo operation modes
│   ├── utils/                # Configuration flags, general helpers, client-side caching scripts
│   ├── constants/            # Application static maps (Navigation configurations, section limits)
│   ├── mocks/                # Mock Service Worker network interception handlers
│   └── types.d.ts            # Global TypeScript definition files (ITrack schema, Spotify API interfaces)
├── .env.example              # Environment variables baseline configuration blueprint
├── vite.config.ts            # Vite compiler adjustments and absolute path (@/) mapping
└── package.json              # Node.js project manifests, runtime controls, and library matrices
```
## Troubleshooting

### Common Issues

**CORS Errors with Spotify API**
- **Problem:** API requests fail due to CORS restrictions
- **Solution:** Ensure the backend server is running (`npm run dev:full` or `npm run server:dev`)
- **Details:** Spotify Web API cannot be called directly from browsers due to CORS policy

**Missing Environment Variables**
- **Problem:** App shows "No music data available" or API errors
- **Solution:** Check that `.env` file exists with valid Spotify credentials
- **Reference:** See `SPOTIFY_SETUP.md` for obtaining API credentials

**Port Conflicts**
- **Frontend (Port 5173):** Check if another Vite/dev server is running
- **Backend (Port 3001):** Check if another Express server is using the port
- **Solution:** Kill existing processes or modify port configuration

**Build/TypeScript Errors**
- **Problem:** TypeScript compilation errors during build
- **Solution:** Run `npm run build` to see specific error details
- **Common fix:** Ensure all dependencies are installed (`npm install`)

<br/>

### Getting Help
- See `SPOTIFY_SETUP.md` for API setup guidance
- [Reach out to the NextWork community to ask your question!](https://community.nextwork.org/c/i-have-a-question/)

---

<div align="center">
  <p>Built with ❤️ for music lovers everywhere</p>
  <p>Discover your next favorite track with NextSound</p>
</div>
Inspired by / [Code base](https://github.com/nextwork-projects/nextsound.git) from natashaongiscoding,CARWHO
,itsnextwork)
