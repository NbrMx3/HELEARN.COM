# HELAEARN - Progressive Web App (PWA) Setup

This application is now a Progressive Web App (PWA) and can be installed on desktop and mobile devices as a native app.

## Features

✅ **Installable** - Install on home screen (mobile) or as a desktop app  
✅ **Offline Support** - Basic offline functionality with service worker  
✅ **Fast** - Cached assets load instantly  
✅ **App-like Experience** - Standalone mode, no browser UI  
✅ **Push Notifications Ready** - Foundation for future notifications  

## Installation Instructions

### On Mobile (iOS)

1. Open the app in Safari
2. Tap the **Share** button (bottom menu)
3. Scroll down and tap **"Add to Home Screen"**
4. Choose a name (default: HELAEARN)
5. Tap **"Add"**

The app will now appear as an icon on your home screen!

### On Mobile (Android)

1. Open the app in Chrome or Firefox
2. Tap the **menu** button (three dots, top-right)
3. Tap **"Install app"** or **"Add to Home Screen"**
4. Confirm the installation

The app will now appear as an icon on your home screen!

### On Desktop (Windows/Mac/Linux)

#### Chrome/Edge:
1. Open the app in Chrome or Edge
2. Click the **install icon** in the address bar (or menu → "Install HELAEARN")
3. Confirm the installation

#### Firefox:
1. Open the app in Firefox
2. Click the **menu** button (hamburger icon)
3. Select **"Install HELAEARN"**

The app will appear in your applications menu and launch in standalone mode!

## PWA Configuration Files

### `manifest.json`
- App metadata (name, icons, theme colors)
- App shortcuts (quick actions)
- Display settings (standalone mode)
- Screenshot previews

### `service-worker.js`
- Offline caching strategy
- Asset caching (cache-first for resources)
- API request handling (network-first for API calls)
- Background sync ready

### HTML Meta Tags
- Theme colors for browser UI
- Apple mobile web app support
- Launch screen configurations

## Caching Strategy

**Assets & Pages:** Cache-first (cached version preferred)  
**API Calls:** Network-first (always try network first)  
**Fallback:** Returns offline page if network fails

## Testing PWA Locally

```bash
# Build the production app
npm run build

# Serve the build locally
npx http-server dist -c-1

# Open http://localhost:8080 in your browser
# Install the app using browser UI
```

## Browser Support

| Browser | Desktop | Mobile | Status |
|---------|---------|--------|--------|
| Chrome | ✅ | ✅ | Full Support |
| Edge | ✅ | ✅ | Full Support |
| Firefox | ✅ | ⚠️ | Partial Support |
| Safari | ⚠️ | ✅ | Limited Support |
| Opera | ✅ | ✅ | Full Support |

## What's Included

- ✅ Web App Manifest
- ✅ Service Worker with caching
- ✅ PWA meta tags
- ✅ Apple mobile web app support
- ✅ Offline support
- ✅ App shortcuts
- ✅ Native splash screens

## Future Enhancements

- [ ] Push notifications
- [ ] Background sync
- [ ] Periodic background sync
- [ ] Web Share API integration
- [ ] Payment Request API for PayPal

## Troubleshooting

**App not installing?**
- Ensure you're using HTTPS in production
- Check that service worker is registered (browser console)
- Clear browser cache and reload

**Service Worker not updating?**
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache completely
- Re-register the service worker

**Offline mode not working?**
- Visit the app online first to cache assets
- Check browser console for service worker errors
- Ensure device has internet initially

## Links

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Web App Manifest Spec](https://w3c.github.io/manifest/)
- [Service Worker Guide](https://web.dev/service-workers-cache-storage/)
