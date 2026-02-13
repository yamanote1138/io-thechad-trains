# Trains Over the Interwebs - Project Guide

This file contains project conventions, architecture decisions, and development standards for maintaining consistency across Claude sessions.

## Project Overview

**Trains Over the Interwebs** is a modern web-based control system for JMRI (Java Model Railroad Interface) operations. It's a single-page application (SPA) that provides real-time control of model railroad equipment through a responsive web interface.

### Tech Stack
- **Vue 3** with Composition API and TypeScript
- **Vite** for fast development and building
- **Bootstrap 5** for responsive UI components
- **jmri-client 3.5+** for WebSocket-based JMRI communication
- **Node.js 20+** required

### Current Version
v3.3.0 - Latest improvements include mobile-first UI refinements, component consolidation, and sticky header controls.

## Architecture Principles

### Pure Frontend SPA
- **No backend server** - The browser communicates directly with JMRI via WebSocket
- **Direct WebSocket connection** - Uses the jmri-client library to connect to JMRI's JSON WebSocket server (port 12080)
- **Network requirement** - Browser and JMRI server must be on the same network
- **Mock mode support** - Can run without hardware using simulated data for testing/demos

### Key Architecture Decisions

1. **jmri-client Browser Bundle**
   - CRITICAL: Use the browser-specific bundle from jmri-client
   - Vite config aliases `jmri-client` to `node_modules/jmri-client/dist/browser/jmri-client.js`
   - This ensures proper WebSocket reconnection handling in the browser
   - DO NOT use the Node.js version of jmri-client

2. **Singleton State Pattern**
   - JMRI connection state is managed as a singleton in `useJmri` composable
   - Single JmriClient instance shared across all components
   - Prevents multiple WebSocket connections
   - State persists across component mounts/unmounts

3. **Power State Management**
   - Uses official PowerState enum from jmri-client (0=UNKNOWN, 1=ON, 2=OFF)
   - Three-state UI: ON (green), OFF (red), UNKNOWN (yellow)
   - Always fetch initial power state on connection
   - Verify power state after setting to handle JMRI quirks

4. **Heartbeat Interval**
   - Set to 15 seconds to prevent idle disconnects
   - JMRI disconnects after 30s of no heartbeat
   - Previous 30s interval was hitting timeout threshold

## Project Structure

```
/
├── src/
│   ├── components/          # Vue components
│   │   ├── ThrottleCard.vue     # Individual locomotive control
│   │   ├── ThrottleList.vue     # List of active throttles
│   │   ├── RosterCard.vue       # Locomotive roster display
│   │   ├── PowerControl.vue     # Track power control
│   │   └── StatusBar.vue        # Connection status
│   ├── composables/         # Reusable composition functions
│   │   ├── useJmri.ts          # Main JMRI client (singleton)
│   │   └── useWebSocket.ts     # WebSocket utilities
│   ├── types/              # TypeScript type definitions
│   │   └── jmri.ts            # JMRI-related types
│   ├── utils/              # Utility functions
│   │   └── logger.ts          # Logging utility
│   ├── config/             # Configuration
│   │   └── index.ts           # Vite env var handling
│   ├── App.vue             # Root component
│   └── main.ts             # Application entry point
├── .env.example            # Template configuration (COMMITTED)
├── .env                    # Local configuration (GITIGNORED)
├── vite.config.ts          # Vite build configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

## Development Conventions

### Vue/TypeScript Style

1. **Composition API Only**
   - Use `<script setup>` syntax for all components
   - Prefer `ref` and `computed` over reactive objects
   - Use TypeScript with proper type annotations

2. **Component Organization**
   ```vue
   <script setup lang="ts">
   // 1. Imports (grouped: vue, external libs, local)
   import { ref, computed, onMounted } from 'vue'
   import { useJmri } from '@/composables/useJmri'

   // 2. Props/Emits
   const props = defineProps<{ ... }>()

   // 3. Composables
   const { state, methods } = useJmri()

   // 4. Local state
   const localState = ref(...)

   // 5. Computed properties
   const computed = computed(() => ...)

   // 6. Methods
   const handleAction = () => { ... }

   // 7. Lifecycle hooks
   onMounted(() => { ... })
   </script>

   <template>
     <!-- Simple, semantic HTML -->
   </template>

   <style scoped>
     /* Component-specific styles */
   </style>
   ```

3. **Import Aliases**
   - Use `@/` for src imports: `import { logger } from '@/utils/logger'`
   - Never use relative paths like `../../utils/logger`

4. **Logging**
   - Use the centralized logger from `@/utils/logger`
   - Available methods: `logger.debug()`, `logger.info()`, `logger.warn()`, `logger.error()`
   - Don't use `console.log()` directly

### Environment Configuration

1. **Environment Variables**
   - ALL browser-accessible variables MUST start with `VITE_`
   - Variables are build-time only (embedded at build, not runtime)
   - Default values should be sensible for local development
   - NEVER commit `.env` - it's gitignored
   - ALWAYS keep `.env.example` up to date

2. **Configuration Structure**
   ```typescript
   // src/config/index.ts handles all env var parsing
   export const config = {
     jmri: {
       host: import.meta.env.VITE_JMRI_HOST || 'raspi-jmri.local',
       port: Number(import.meta.env.VITE_JMRI_PORT) || 12080,
       protocol: import.meta.env.VITE_JMRI_PROTOCOL || 'ws',
       mock: {
         enabled: import.meta.env.VITE_JMRI_MOCK_ENABLED === 'true',
         responseDelay: Number(import.meta.env.VITE_JMRI_MOCK_DELAY) || 50
       }
     },
     app: {
       title: import.meta.env.VITE_APP_TITLE || 'Trains Over the Interwebs'
     }
   }
   ```

### Git Commit Conventions

1. **Commit Message Format**
   - Use clear, descriptive commit messages
   - Focus on the "why" not just the "what"
   - NO AI attribution in commits (see user preferences)

2. **Release Commits**
   - Format: `Release vX.Y.Z: Brief description`
   - Example: `Release v3.2.0: JMRI server compatibility improvements`
   - Include detailed changes in commit body

3. **Feature Commits**
   - Format: `Brief description of change`
   - Examples:
     - `Mobile-first UI improvements`
     - `Fix compatibility with real JMRI servers`
     - `Reduce heartbeat interval to prevent idle disconnects`

4. **Version Updates**
   - Update `package.json` version for releases
   - Update README.md if jmri-client version changes significantly
   - Keep versioning consistent across the project

5. **Using GitHub CLI (gh)**
   - **ALWAYS use `gh` for releases** instead of manual GitHub UI
   - Workflow for new releases:
     ```bash
     # 1. Commit all changes
     git add src/ CLAUDE.md
     git commit -m "Descriptive commit message"

     # 2. Bump version in package.json and commit
     # Edit package.json version
     git add package.json
     git commit -m "Release vX.Y.Z: Brief description"

     # 3. Create annotated tag
     git tag -a vX.Y.Z -m "Release vX.Y.Z: Brief description"

     # 4. Push commits and tags
     git push && git push --tags

     # 5. Create GitHub release with detailed notes
     gh release create vX.Y.Z --title "vX.Y.Z: Title" --notes "Release notes..."
     ```
   - Release notes should include:
     - Summary of changes by category
     - Breaking changes (if any)
     - Full changelog link
   - Use `gh pr` commands for pull request operations when needed

### Code Quality

1. **TypeScript Strictness**
   - Run `npm run type-check` before committing
   - Fix all TypeScript errors - don't use `@ts-ignore`
   - Properly type all function parameters and return values

2. **Build Process**
   - Build command runs type-check automatically: `npm run build`
   - Must pass type-check before successful build
   - Always test production builds with `npm run preview`

3. **Responsive Design**
   - Mobile-first approach (as of v3.1.0)
   - Bootstrap utility classes for responsive layouts
   - Test on mobile, tablet, and desktop viewports
   - Dev server allows network access (`host: true`) for device testing

## Common Tasks

### Starting Development
```bash
# First time setup
cp .env.example .env
nano .env  # Edit for your JMRI server
npm install

# Daily development
npm run dev  # Starts at http://localhost:5173
```

### Testing Without Hardware
```bash
# Edit .env
VITE_JMRI_MOCK_ENABLED=true
VITE_JMRI_MOCK_DELAY=50

# Restart dev server
npm run dev
```

### Building for Production
```bash
npm run build      # Type-checks and builds
npm run preview    # Preview production build
```

### Updating Dependencies
```bash
npm update                    # Update to latest compatible versions
npm outdated                  # Check for outdated packages
npm install package@version   # Install specific version
```

**IMPORTANT:** If updating `jmri-client`, also update:
- README.md tech stack section
- This CLAUDE.md file
- Test thoroughly with real JMRI hardware if possible

## JMRI Integration Details

### Connection Lifecycle
1. Application initializes JmriClient with config
2. Manual connection triggered (autoConnect: false)
3. On connect: fetch initial power state and roster
4. Maintain 15-second heartbeat to prevent timeout
5. Handle reconnection on disconnect (jmri-client handles this)

### Throttle Management
- Throttles created on-demand when user selects locomotive
- Each throttle mapped by DCC address
- Throttle IDs stored in Map for reuse
- Release throttles when no longer needed (future enhancement)

### Function Buttons
- Dynamic function buttons from JMRI roster
- Parse `functionKeys` array from roster entries
- Display only functions with labels (plus F0 as headlight)
- Icon mapping for common functions (bell, horn, brake, etc.)

### Power Control Quirks
- JMRI power state can be inconsistent immediately after setting
- Always verify state after power on/off
- Handle UNKNOWN state gracefully with yellow indicator
- Fetch fresh state on reconnection

## Troubleshooting Common Issues

### WebSocket Connection Failures
- Check JMRI WebSocket server is enabled in preferences
- Verify correct host/port in `.env`
- Ensure browser and JMRI on same network
- Check browser console for WebSocket errors

### Throttle Control Not Working
- Verify locomotive exists in JMRI roster
- Check DCC address matches roster entry
- Look for throttle acquisition errors in console
- Try releasing and re-acquiring throttle

### Build/Type Errors
- Run `npm run type-check` to isolate TypeScript issues
- Check for outdated type definitions
- Verify all imports are correctly typed
- Make sure tsconfig references are intact

### Mobile Display Issues
- Test responsive breakpoints (576px, 768px, 992px, 1200px)
- Use Bootstrap responsive utilities (d-sm, col-md, etc.)
- Check for fixed-width elements breaking mobile layout
- Test touch interactions on actual mobile devices

## Future Enhancement Ideas

These are NOT committed work, just ideas for consideration:

- [ ] Automatic throttle release when idle
- [ ] Turnout control panel (partially implemented)
- [ ] Route/automation control
- [ ] Consist (multiple unit) control
- [ ] Saved layouts/presets
- [ ] Sound/haptic feedback on mobile
- [ ] PWA (Progressive Web App) for offline capability
- [ ] Multiple railroad profiles

## References

- **JMRI Documentation**: https://www.jmri.org/help/en/html/web/JsonServlet.shtml
- **jmri-client Package**: https://www.npmjs.com/package/jmri-client
- **Vue 3 Composition API**: https://vuejs.org/guide/extras/composition-api-faq.html
- **Vite Environment Variables**: https://vitejs.dev/guide/env-and-mode.html
- **Bootstrap 5 Docs**: https://getbootstrap.com/docs/5.3/

---

*Last Updated: February 2026 (v3.2.0)*
