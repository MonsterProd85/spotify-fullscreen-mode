# Spotify Fullscreen Mode

[![JavaScript](https://img.shields.io/badge/JavaScript-80.1%25-yellow)](https://github.com/MonsterProd85/spotify-videos-extension)
[![CSS](https://img.shields.io/badge/CSS-10.6%25-blue)](https://github.com/MonsterProd85/spotify-videos-extension)
[![HTML](https://img.shields.io/badge/HTML-9.3%25-orange)](https://github.com/MonsterProd85/spotify-videos-extension)

A Chrome extension that transforms your Spotify Web Player into a beautiful fullscreen experience. Enjoy your music with enhanced visuals, including album artwork, dynamic backgrounds, and Spotify Canvas videos.

## ✨ Features

- **Immersive Fullscreen Mode**: Transform Spotify Web Player into a distraction-free experience
- **Dynamic Canvas Support**: Displays Spotify's Canvas videos when available
- **Beautiful Visuals**: Blurred album art background when no Canvas video is available
- **Elegant Animations**: Smooth transitions between songs and play states
- **Play/Pause Visual Effects**: 
  - Album art slightly shrinks when paused, and becomes slightly monochrome
  - Text reacts accordingly with smooth animations
  - Background darkens
  - Ambient light patterns pause
- **Minimal UI**: Hide cursor and use ESC key to exit fullscreen

## 📥 Installation

### Chrome Web Store
*(Coming Soon)*

### Manual Installation
1. [Download](https://github.com/MonsterProd85/spotify-videos-extension/archive/refs/heads/main.zip) or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked" and select the extension directory
5. The extension icon should appear in your browser toolbar

## 🚀 Usage

1. Go to [Spotify Web Player](https://open.spotify.com/)
2. Click the extension icon in your toolbar
3. Click "Enable Fullscreen Mode"
4. Enjoy your music in a beautiful fullscreen interface
5. Press ESC key once to exit fullscreen
6. Press ESC key a second time to disable the extension

## 📷 Screenshots
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/f6ff1a13-b4f8-479f-958e-efae97c8ac1f" />
<img width="1920" height="998" alt="image" src="https://github.com/user-attachments/assets/c038c669-55a8-47e2-ad25-bf118508f700" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/e87310f8-661b-4617-873a-e938e4a1223e" />
(screenshots may be out of sync, as we are making a lot of changes, and don't update the screenshots often)

## ⌨️ Keyboard Controls

- **ESC**: Exit fullscreen mode

## 🔧 Technical Details

This extension enhances the Spotify Web Player by:
- Detecting and displaying currently playing tracks
- Utilizing Spotify's Canvas videos when available
- Creating dynamic visual effects that respond to music state
- Using elegant animations and transitions for a polished experience

## 🛠️ Development

Want to contribute? Great! Feel free to fork the repository and submit pull requests.

### Project Structure
```
spotify-videos-extension/
├── manifest.json      # Extension configuration
├── content.js         # Main functionality
├── popup.html         # Extension popup interface
├── popup.js           # Popup functionality
├── styles.css         # Styling
└── icons/             # Extension icons
```

## 📄 License

[MIT License](LICENSE) - Feel free to use and modify for your own projects.

## 👏 Credits

- Font: [Montserrat](https://fonts.google.com/specimen/Montserrat) by Google Fonts
- Created by [MonsterProd85](https://github.com/MonsterProd85)

---

*Enjoy your music in style!* 🎵✨
