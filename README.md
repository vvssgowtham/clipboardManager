# Clipboard Manager

A beautiful, lightweight clipboard history manager for macOS built with Electron. Features a modern glassmorphism UI with dark mode support and seamless integration with your workflow.

## ✨ Features

- 🎨 **Modern Glassmorphism UI** - Clean, transparent design that adapts to light/dark mode
- 📋 **Smart Clipboard Tracking** - Automatically saves text and images you copy
- ⚡ **Quick Access** - Toggle with `Cmd+Shift+V` keyboard shortcut
- 🖼️ **Image Support** - Copy and restore images with ease
- 💾 **Auto-Managed Storage** - Keeps your 50 most recent items, auto-cleans on restart
- 🎯 **One-Click Restore** - Click any item to copy it back to your clipboard
- 🚀 **Lightweight** - Minimal resource usage, runs quietly in the background
- 🌓 **Dark Mode Ready** - Automatically adapts to your system theme

## 🖥️ System Requirements

- **macOS** 10.13 or later
- **Node.js** 14.x or higher
- **npm** 6.x or higher

## 📦 Installation

### Option 1: Clone and Run

```bash
# Clone the repository
git clone https://github.com/vvssgowtham/clipboardManager.git
cd clipboardManager

# Install dependencies
npm install

# Start the app
npm start
```

### Option 2: Download Release

1. Download the latest release from the [Releases](https://github.com/yourusername/clipboardManager/releases) page
2. Extract and move to Applications folder
3. Run the app

## 🚀 Usage

### Starting the App

```bash
npm start
```

The app will:

- Launch automatically on startup
- Clear previous clipboard history
- Begin monitoring your clipboard
- Show a floating window you can toggle anytime

### Keyboard Shortcuts

| Shortcut             | Action                             |
| -------------------- | ---------------------------------- |
| `Cmd + Shift + V`    | Toggle clipboard history window    |
| `Click on item`      | Copy to clipboard and close window |
| `Esc` (when focused) | Close window                       |

### How It Works

1. **Copy anything** (text or image) - It's automatically saved
2. **Press `Cmd+Shift+V`** - Opens your clipboard history
3. **Click an item** - It's copied to your clipboard, ready to paste

## 🎨 Design Philosophy

- **Windows-inspired functionality** with macOS aesthetics
- **High contrast** for better readability
- **Low eye strain** color palette
- **Professional feel** suitable for productivity
- **Minimal animations** for performance

## 🏗️ Project Structure

```
clipboardManager/
├── src/
│   ├── index.html       # UI interface
│   ├── main.js          # Electron main process
│   ├── preload.js       # IPC bridge (security layer)
│   ├── db.js            # SQLite database logic
│   ├── images/          # Stored clipboard images
│   └── clipboard.db     # SQLite database file
├── package.json
└── README.md
```

## 🛠️ Technical Stack

- **Electron** - Desktop app framework
- **better-sqlite3** - Fast, synchronous SQLite database
- **Native APIs** - macOS clipboard monitoring
- **Vanilla CSS** - Glassmorphism styling
- **HTML5** - Modern semantic markup

## 🔧 Development

### Prerequisites

```bash
node --version  # Should be 14.x or higher
npm --version   # Should be 6.x or higher
```

### Setup Development Environment

```bash
# Install dependencies
npm install

# Run in development mode
npm start

# The app will auto-reload on file changes (manual restart needed)
```

### Building for Production

```bash
# Package the app (future enhancement)
npm run package
```

## 📊 Database Schema

The app uses SQLite to store clipboard history:

```sql
CREATE TABLE clips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,              -- 'text' or 'image'
    imagePath TEXT,         -- Path to image file (if type=image)
    content TEXT,           -- Text content (if type=text)
    hash TEXT UNIQUE,       -- MD5 hash for duplicate detection
    createdAt INTEGER       -- Timestamp
);
```

## ⚙️ Configuration

### Storage Limits

- **Max Items**: 50 (automatically enforced)
- **Cleanup**: On app restart, all history is cleared
- **Images**: Stored in `src/images/` directory

### Customization

You can modify these in `src/main.js`:

```javascript
// Window dimensions
width: 480,
height: 640,

// Clipboard check interval (milliseconds)
setInterval(..., 1000);
```

## 🐛 Troubleshooting

### App won't start

```bash
# Clear node modules and reinstall
rm -rf node_modules
npm install
npm start
```

### Database errors

```bash
# Remove database and restart (clears all history)
rm src/clipboard.db
npm start
```

### Keyboard shortcut not working

- Check if another app is using `Cmd+Shift+V`
- Restart the app
- Check macOS accessibility permissions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Future Enhancements

- [ ] Search/filter clipboard items
- [ ] Pin favorite items (don't auto-delete)
- [ ] Export/import clipboard history
- [ ] Sync across devices
- [ ] Custom keyboard shortcuts
- [ ] App packaging for distribution
- [ ] Tray icon integration
- [ ] Rich text formatting preview

## 📄 License

This is a personal project. All rights reserved.

For inquiries about usage or collaboration, please contact the author.

## 🙏 Acknowledgments

- Inspired by Windows Clipboard History (Win+V)
- UI design influenced by iOS glassmorphism
- Built with ❤️ using Electron

## 📧 Contact

Your Name - [@vvssgowtham](https://twitter.com/vvssgowtham)

Project Link: [https://github.com/vvssgowtham/clipboardManager](https://github.com/vvssgowtham/clipboardManager)

---

⭐ If you found this project helpful, please give it a star!
