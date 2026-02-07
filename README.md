# Trains Over the Interwebs

Modern web-based control system for JMRI model railroad operations.

## Tech Stack

- **Vue 3** - Composition API with TypeScript
- **Vite** - Fast build tool
- **Bootstrap 5** - Modern CSS framework
- **jmri-client 3.0** - WebSocket-based JMRI communication

## Requirements

- Node.js 20+
- JMRI server running with JSON WebSocket enabled
- Browser on same network as JMRI server

## Configuration

The application is configured using environment variables in a `.env` file. This file is **gitignored** and contains your local JMRI server settings.

### Initial Setup

1. **Copy the example configuration:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` to match your setup:**
   ```bash
   nano .env
   # or
   code .env
   ```

3. **Restart the dev server** after making changes:
   ```bash
   npm run dev
   ```

### Configuration Options

#### JMRI Server Connection

**`VITE_JMRI_HOST`** (default: `raspi-jmri.local`)
- Hostname or IP address of your JMRI server
- Examples:
  - `raspi-jmri.local` - mDNS hostname (recommended)
  - `192.168.1.100` - Static IP address
  - `jmri.local` - Custom hostname
  - `localhost` - Running JMRI on same machine

**`VITE_JMRI_PORT`** (default: `12080`)
- WebSocket port configured in JMRI
- Default JMRI JSON WebSocket port is `12080`
- Check JMRI preferences if using a different port

**`VITE_JMRI_PROTOCOL`** (default: `ws`)
- WebSocket protocol
- Options:
  - `ws` - Standard WebSocket (default)
  - `wss` - Secure WebSocket (if JMRI has SSL configured)

#### Mock Mode (Testing Without Hardware)

**`VITE_JMRI_MOCK_ENABLED`** (default: `false`)
- Enable mock mode to test without JMRI hardware
- Values: `true` or `false`
- When enabled, uses simulated data instead of real JMRI connection

**`VITE_JMRI_MOCK_DELAY`** (default: `50`)
- Simulated network latency in milliseconds
- Only applies when mock mode is enabled
- Use `0` for instant responses, or higher values to simulate slow networks

#### Application Settings

**`VITE_APP_TITLE`** (default: `Trains Over the Interwebs`)
- Application title displayed in the header
- Customize to your railroad name

### Example Configurations

**Local development with JMRI on Raspberry Pi:**
```env
VITE_JMRI_HOST=raspi-jmri.local
VITE_JMRI_PORT=12080
VITE_JMRI_PROTOCOL=ws
VITE_JMRI_MOCK_ENABLED=false
```

**Testing/demo mode without hardware:**
```env
VITE_JMRI_HOST=localhost
VITE_JMRI_PORT=12080
VITE_JMRI_PROTOCOL=ws
VITE_JMRI_MOCK_ENABLED=true
VITE_JMRI_MOCK_DELAY=50
```

**JMRI on same machine:**
```env
VITE_JMRI_HOST=localhost
VITE_JMRI_PORT=12080
VITE_JMRI_PROTOCOL=ws
VITE_JMRI_MOCK_ENABLED=false
```

**Production with custom title:**
```env
VITE_JMRI_HOST=trains.example.com
VITE_JMRI_PORT=12080
VITE_JMRI_PROTOCOL=wss
VITE_JMRI_MOCK_ENABLED=false
VITE_APP_TITLE=Pacific Northwestern Railway
```

### Important Notes

- **Never commit `.env` to git** - It's automatically ignored
- **`.env.example` is committed** - This serves as a template for others
- **Changes require restart** - Restart `npm run dev` after editing `.env`
- **Build-time only** - Environment variables are embedded at build time, not runtime
- **Prefix required** - All variables must start with `VITE_` to be accessible in the browser

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type-check
npm run type-check
```

The dev server will start at http://localhost:5173

## Mock Mode

Mock mode allows you to test and demo the application without JMRI hardware. When enabled, all responses are generated from mock data instead of connecting to a real JMRI server.

**To enable mock mode:**

1. Edit `.env` and set:
   ```env
   VITE_JMRI_MOCK_ENABLED=true
   ```

2. Optionally adjust the response delay (simulates network latency):
   ```env
   VITE_JMRI_MOCK_DELAY=50
   ```

3. Restart the dev server

Mock mode provides:
- Simulated locomotives from a sample roster
- Realistic power state changes
- Functional throttle controls (speed, direction, functions)
- Sample turnouts
- Connection state simulation

This is perfect for:
- Testing UI changes without hardware
- Demonstrations and screenshots
- Development when JMRI is not available

## Deployment

Build the app and serve the `dist/` folder from any static web server:

```bash
npm run build
npx serve dist
```

Or use GitHub Pages, Netlify, Vercel, etc.

## Features

- **Power Control** - Track power on/off
- **Throttle Control** - Speed, direction, and functions for locomotives
- **Turnout Control** - Switch turnout positions
- **Real-time Updates** - WebSocket connection for instant feedback
- **Responsive Design** - Works on desktop, tablet, and mobile

## Architecture

This is a pure frontend single-page application (SPA) that connects directly to JMRI via WebSocket. There is no backend server required - the browser communicates directly with JMRI since they're on the same network.

```
┌─────────────────────┐
│   Browser (Vue 3)   │
│                     │
│  - Train controls   │
│  - Power controls   │
│  - Turnout controls │
│  - Throttle UI      │
└──────────┬──────────┘
           │ WebSocket
           │ (jmri-client)
           ▼
┌─────────────────────┐
│   JMRI Server       │
│  astrotrain.local   │
│     :12080          │
└─────────────────────┘
```

## Troubleshooting

**"Disconnected from JMRI" error:**
- Verify JMRI is running
- Check that the WebSocket server is enabled in JMRI preferences
- Ensure JMRI host/port in `.env` is correct
- Verify browser and JMRI are on the same network

**Locomotives not showing:**
- Make sure locomotives are configured in JMRI roster
- Check browser console for errors
- Try refreshing the page

**Turnouts not showing:**
- Verify turnouts are configured in JMRI
- Check browser console for errors

## License

Private use only
