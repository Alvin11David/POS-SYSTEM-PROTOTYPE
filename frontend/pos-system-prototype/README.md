# Jambo POS System

A modern, offline-capable point-of-sale system built with React, TypeScript, and Vite.

## Features

- **Progressive Web App (PWA)**: Installable and works offline
- **Offline Support**: Core functionality available without internet connection
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Notifications**: Stay updated with system notifications

## Offline Functionality

This app is designed to work offline:

- **Install as PWA**: Add to home screen for app-like experience
- **Offline Indicator**: Shows connection status in the bottom-right corner
- **Cached Data**: API responses are cached for offline access
- **Install Prompt**: Prompts users to install the app for better offline experience

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## PWA Features

- **Service Worker**: Automatic caching of assets and API responses
- **App Shortcuts**: Quick access to Sales and Products from home screen
- **Offline Page**: Graceful handling of offline scenarios
- **Install Prompt**: Encourages users to install the app

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers with PWA support
